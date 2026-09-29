import { getConsentData } from '../services/consentQueries';
import { saveConsent } from '../services/consentService';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
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
  const [history, setHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useBodyScrollLock(isModalOpen);
  const [settings, setSettings] = useState({
    policyVersion: 'v2.4',
    policyEffectiveDate: '15/08/2026'
  });

  // Gestión de foco para el modal accesible (R-26 / R-32)
  const lastFocusedElementRef = useRef(null);
  const modalCloseBtnRef = useRef(null);
  const backdropRef = useRef(null);

  // Cargar historial inmutable de consentimientos
  const loadConsentHistory = useCallback(() => {
    if (!currentUserId) return;
    const data = getConsentData(currentUserId);
    const rows = (data.consentHistory || []).filter((item) => item.userId === currentUserId);
    setHistory(rows);
  }, [currentUserId]);

  // Verificar sesión y rol de agente
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agente') {
      navigate('/login');
      return;
    }

    const data = getConsentData(currentUserId);
    if (data.settings) {
      setSettings(data.settings);
    }

    const userConsent = data.consents?.[currentUserId] || {};
    setConsents({
      c1: Boolean(userConsent.c1),
      c2: Boolean(userConsent.c2),
      c3: Boolean(userConsent.c3),
      c4: Boolean(userConsent.c4),
      c5: Boolean(userConsent.c5)
    });

    const activePolicyVersion = data.settings?.policyVersion || 'v2.4';
    setPolicyAccepted(
      Boolean(userConsent.policyAccepted && userConsent.policyVersion === activePolicyVersion)
    );
    loadConsentHistory();
  }, [currentUserId, currentUser, navigate, loadConsentHistory]);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!policyAccepted || !currentUser) return;

    setIsSaving(true);
    setStatusMessage('');

    saveConsent(settings, currentUser, consents);

    loadConsentHistory();

    setTimeout(() => {
      setIsSaving(false);
      setStatusMessage('Preferencias actualizadas en tu estación de trabajo.');

      if (comesFromLogin) {
        setTimeout(() => {
          navigate('/agente/panel');
        }, 500);
      }
    }, 300);
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
