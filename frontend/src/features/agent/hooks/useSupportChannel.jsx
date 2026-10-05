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

  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && currentUser?.id) {
      fetchAgentRecords(currentUser.id).then((remoteData) => {
        if (mounted && remoteData) setData(remoteData);
      });
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

    if (result.error) {
      setFeedback(`Error: ${result.error}`);
      return;
    }

    setDetails('');
    setFeedback(`Solicitud enviada exitosamente. Tu radicado de seguimiento es ${result.code}.`);
    loadData();
  };

  // 1. Caso: Bloqueo pedagógico por falta de consentimiento C5 (Ruta pública de apoyo permanece habilitada)

  return {
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
