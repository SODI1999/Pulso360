import { getConsentData } from '../services/consentQueries';
import { saveConsent, fetchConsent } from '../services/consentService';
import { env } from '../../../core/config/env';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { useBodyScrollLock } from '../../../core/hooks/useBodyScrollLock';

import { CONSENT_PURPOSES } from '../data/consentData';

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
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useBodyScrollLock(isModalOpen);
  const [settings, setSettings] = useState({
    policyVersion: null,
    policyEffectiveDate: null
  });

  // Gestión de foco para el modal accesible (R-26 / R-32)
  const lastFocusedElementRef = useRef(null);
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
        if (mounted) setStatusMessage(error.message);
      } finally {
        if (mounted) setLoaded(true);
      }
    }
    
    init();
    return () => { mounted = false; };
  }, [currentUserId, currentUser, navigate, loadConsentHistory]);

  useExpiredFormDraft('consent:preferences', { consents, policyAccepted, policyVersion:settings.policyVersion }, draft => {
    if (draft.policyVersion !== settings.policyVersion) {
      setStatusMessage('La política cambió. Revisa la versión vigente antes de confirmar tus preferencias.');
      return;
    }
    setConsents(draft.consents); setPolicyAccepted(draft.policyAccepted);
  }, loaded);

  // Control accesible de tecla Escape en modal
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        modalCloseBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen]);

  const openModal = () => {
    lastFocusedElementRef.current = document.activeElement;
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      lastFocusedElementRef.current?.focus();
    }, 50);
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      closeModal();
    }
  };

  const handleCheckboxChange = (key) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Guardar consentimiento y registrar evento inmutable
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!settings.policyVersion || (!policyAccepted && !previouslyAccepted) || !currentUser) return;

    setIsSaving(true);
    setStatusMessage('');

    const result = await saveConsent(settings, currentUser, {
      ...consents,
      policyAccepted,
      noticeAccepted: policyAccepted
    });
    if (result.success !== true) {
      setIsSaving(false);
      setStatusMessage(`Error: ${result.error}`);
      return;
    }

    if (!env.useMockStorage && result.payload) {
      setConsents(Object.fromEntries(['c1','c2','c3','c4','c5'].map(key => [key, Boolean(result.payload[key])])));
      setPolicyAccepted(result.payload.policyAccepted);
      setHistory(result.payload.history || []);
      authService.updateConsent(result.payload);
    }

    loadConsentHistory();
    setIsSaving(false);
    setStatusMessage('Preferencias guardadas.');

    if (comesFromLogin) {
      setTimeout(() => {
        navigate('/agente/panel');
      }, 500);
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
    setPolicyAccepted,
    history,
    statusMessage,
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
