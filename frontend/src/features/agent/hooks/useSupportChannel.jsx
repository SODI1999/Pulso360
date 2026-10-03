import { getAgentRecords } from '../services/agentQueries';
import { createSupportRequest } from '../services/supportChannelService';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';

export function useSupportChannel() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const data = getAgentRecords(currentUser?.id);
  const consent = data.consents?.[currentUser?.id];

  // Estados del formulario
  const [supportMode, setSupportMode] = useState('anonimo');
  const [reason, setReason] = useState('Sobrecarga percibida');
  const [details, setDetails] = useState('');
  const [urgency, setUrgency] = useState('media');
  const [contactPreference, setContactPreference] = useState('app');
  const [timeWindow, setTimeWindow] = useState('Cualquiera');
  const [feedback, setFeedback] = useState('');

  // Solicitudes del usuario
  const [requestsVersion, setRequestsVersion] = useState(0);

  const userRequests = useMemo(() => {
    void requestsVersion;
    const storeData = getAgentRecords(currentUser?.id);
    return (storeData.supportRequests || []).filter((r) => r.ownerUserId === currentUser?.id);
  }, [currentUser?.id, requestsVersion]);

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
    setRequestsVersion((prev) => prev + 1);
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
