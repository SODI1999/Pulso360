import { getConsentData } from '../services/consentQueries';
import { saveConsent, fetchConsent } from '../services/consentService';
import { env } from '../../../core/config/env';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { useModalA11y } from '../../../core/hooks/useModalA11y';

import { CONSENT_PURPOSES } from '../data/consentData';

/**
 * Carga y guarda las finalidades de consentimiento mediante los servicios existentes.
 * Conserva las selecciones ante un fallo y bloquea su edición mientras espera confirmación.
 * @returns {object} Preferencias, historial, acciones y feedback {type, message} de error, advertencia o éxito.
 */
export function useConsent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const comesFromLogin = searchParams.get('origin') === 'login';

  const currentUser = useMemo(() => authService.getCurrentUser(), []);
  const currentUserId = currentUser?.id;

  // Estados de los consentimientos C1 - C5 y de la política general
  const [consents, setConsents] = useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false
  });
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [previouslyAccepted, setPreviouslyAccepted] = useState(false);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    policyVersion: null,
    policyEffectiveDate: null
  });

  // Gestión de foco para el modal accesible (R-26 / R-32)
  const modalCloseBtnRef = useRef(null);
  const backdropRef = useRef(null);

  // Cargar historial inmutable de consentimientos
  const loadConsentHistory = useCallback(() => {
    if (!currentUserId) return;
    if (!env.useMockStorage) return;
    const data = getConsentData(currentUserId);
    const rows = (data.consentHistory || []).filter((item) => item.userId === currentUserId);
    setHistory(rows);
  }, [currentUserId]);

  // Verificar sesión y rol de agente
  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!currentUser || currentUser.role !== 'agente') {
        navigate('/login');
        return;
      }

      try {
        const data = env.useMockStorage ? getConsentData(currentUserId) : null;
        const userConsent = env.useMockStorage ? (data.consents?.[currentUserId] || {}) : await fetchConsent(currentUserId);
        if (!mounted) return;
        const activeVersion = data?.settings?.policyVersion || userConsent?.policy?.version;
        setSettings(data?.settings || {
          policyVersion: activeVersion, policyEffectiveDate: userConsent?.policy?.vigente_desde,
          policyText: userConsent?.policy?.texto_politica, noticeText: userConsent?.policy?.texto_aviso_privacidad
        });
        setConsents(Object.fromEntries(['c1','c2','c3','c4','c5'].map(key => [key, Boolean(userConsent?.[key])])));
        setPolicyAccepted(Boolean(userConsent?.policyAccepted && userConsent.policyVersion === activeVersion));
        setPreviouslyAccepted(Boolean(userConsent?.policyAccepted));
        setHistory(data?.consentHistory || userConsent?.history || []);
        if (!env.useMockStorage) authService.updateConsent(userConsent);
      } catch (error) {
        if (mounted) setFeedback({ type: 'error', message: `No se pudieron cargar tus preferencias: ${error.message}. Vuelve a cargar la página para intentarlo de nuevo.` });
      } finally {
        if (mounted) setLoaded(true);
      }
    }
    
    init();
    return () => { mounted = false; };
  }, [currentUserId, currentUser, navigate, loadConsentHistory]);

  useExpiredFormDraft('consent:preferences', { consents, policyAccepted, policyVersion:settings.policyVersion }, draft => {
    if (draft.policyVersion !== settings.policyVersion) {
      setFeedback({ type: 'warning', message: 'La política cambió. Revisa la versión vigente antes de confirmar tus preferencias.' });
      return;
    }
    setConsents(draft.consents); setPolicyAccepted(draft.policyAccepted);
  }, loaded);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  useModalA11y({ isOpen: isModalOpen, onClose: closeModal, modalRef: backdropRef });

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      closeModal();
    }
  };

  const handleCheckboxChange = (key) => {
    if (savingRef.current) return;
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePolicyAcceptedChange = (value) => {
    if (!savingRef.current) setPolicyAccepted(value);
  };

  // Guardar consentimiento y registrar evento inmutable
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (savingRef.current || !settings.policyVersion || (!policyAccepted && !previouslyAccepted) || !currentUser) return;

    savingRef.current = true;
    setIsSaving(true);
    setFeedback(null);
    try {
      const result = await saveConsent(settings, currentUser, {
        ...consents,
        policyAccepted,
        noticeAccepted: policyAccepted
      });
      if (result.success !== true) {
        setFeedback({ type: 'error', message: `No se confirmó el guardado: ${result.error}. Tus selecciones se conservan; revisa el mensaje y vuelve a intentarlo.` });
        return;
      }

      if (!env.useMockStorage && result.payload) {
        setConsents(Object.fromEntries(['c1','c2','c3','c4','c5'].map(key => [key, Boolean(result.payload[key])])));
        setPolicyAccepted(result.payload.policyAccepted);
        setHistory(result.payload.history || []);
        authService.updateConsent(result.payload);
      }

      loadConsentHistory();
      setFeedback({ type: 'success', message: 'Preferencias guardadas.' });

      if (comesFromLogin) {
        setTimeout(() => {
          navigate('/agente/panel');
        }, 500);
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const activeCount = useMemo(() => {
    return Object.values(consents).filter(Boolean).length;
  }, [consents]);

  const activeCodes = useMemo(() => {
    return CONSENT_PURPOSES.filter((p) => consents[p.key]).map((p) => p.code);
  }, [consents]);

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return {
    navigate,
    comesFromLogin,
    consents,
    policyAccepted,
    canSubmit: Boolean(settings.policyVersion && (policyAccepted || previouslyAccepted)),
    setPolicyAccepted: handlePolicyAcceptedChange,
    history,
    feedback,
    isSaving,
    isModalOpen,
    settings,
    modalCloseBtnRef,
    backdropRef,
    openModal,
    closeModal,
    handleBackdropClick,
    handleCheckboxChange,
    handleSubmit,
    activeCount,
    activeCodes,
    formatDateTime
  };
}
