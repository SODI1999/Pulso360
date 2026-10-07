import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { createSupportRequest } from '../services/supportChannelService';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

export function useSupportChannel() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [data, setData] = useState(() => getAgentRecords(currentUser?.id));

  const loadData = useCallback(async () => {
    if (!currentUser?.id) return;
    if (!env.useMockStorage) {
      const remoteData = await fetchAgentRecords(currentUser.id);
      if (remoteData) setData(remoteData);
    } else {
      setData(getAgentRecords(currentUser.id));
    }
  }, [currentUser?.id]);

  const [loadError,setLoadError] = useState('');
  const [loading,setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });
  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && currentUser?.id) {
      fetchAgentRecords(currentUser.id).then((remoteData) => {
        if (mounted && remoteData) setData(remoteData);
      }).catch(error => { if(mounted) setLoadError(error.message); })
        .finally(() => { if(mounted) setLoading(false); });
    }
    return () => { mounted = false; };
  }, [currentUser?.id]);

  const consent = data.consents?.[currentUser?.id];

  // Estados del formulario
  const [supportMode, setSupportMode] = useState('anonimo');
  const [reason, setReason] = useState('Sobrecarga percibida');
  const [details, setDetails] = useState('');
  const [urgency, setUrgency] = useState('media');
  const [contactPreference, setContactPreference] = useState('app');
  const [timeWindow, setTimeWindow] = useState('Cualquiera');
  const [feedback, setFeedback] = useState('');


  useExpiredFormDraft('support:new', { supportMode, reason, details, urgency, contactPreference, timeWindow }, draft => {
    setSupportMode(draft.supportMode); setReason(draft.reason); setDetails(draft.details); setUrgency(draft.urgency);
    setContactPreference(draft.contactPreference); setTimeWindow(draft.timeWindow);
  });

  const userRequests = useMemo(() => {
    return (data.supportRequests || []).filter((r) => r.ownerUserId === currentUser?.id);
  }, [data.supportRequests, currentUser?.id]);

  const isAnonymous = supportMode === 'anonimo';

  // Manejo de envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createSupportRequest(
      isAnonymous,
      urgency,
      supportMode,
      currentUser,
      reason,
      details,
      contactPreference,
      timeWindow
    );

    if (result.success !== true) {
      setFeedback(`Error: ${result.error}`);
      return;
    }

    setDetails('');
    setFeedback(`Solicitud enviada exitosamente. Tu radicado de seguimiento es ${result.code}.`);
    loadData().catch(error => setFeedback(`Solicitud guardada; no se pudo actualizar el historial: ${error.message}`));
  };

  // 1. Caso: Bloqueo pedagógico por falta de consentimiento C5 (Ruta pública de apoyo permanece habilitada)

  return { loading,loadError,
    navigate,
    consent,
    setSupportMode,
    reason,
    setReason,
    details,
    setDetails,
    urgency,
    setUrgency,
    contactPreference,
    setContactPreference,
    timeWindow,
    setTimeWindow,
    feedback,
    userRequests,
    isAnonymous,
    handleSubmit
  };
}
