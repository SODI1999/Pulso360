import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { createSupportRequest } from '../services/supportChannelService';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

/**
 * Custom hook managing the BPO agent's psychosocial and occupational support channel (SST).
 * Manages request form state, draft recovery, mode selection (anonymous vs confidential identified),
 * remote synchronization, load error tracking with retry capability, and user request history.
 *
 * @returns {Object} Reactive state and operational handlers:
 * @returns {boolean} returns.loading - Indicates data fetch status.
 * @returns {string} returns.loadError - Error message if remote sync fails.
 * @returns {import('react-router-dom').NavigateFunction} returns.navigate - Router navigation function.
 * @returns {Object|undefined} returns.consent - User consent record.
 * @returns {import('react').Dispatch<import('react').SetStateAction<string>>} returns.setSupportMode - UI setter for 'anonimo'|'confidencial'; the service maps identified requests to its API contract.
 * @returns {string} returns.reason - Currently selected motive.
 * @returns {import('react').Dispatch<import('react').SetStateAction<string>>} returns.setReason - Setter for motive.
 * @returns {string} returns.details - Detailed explanation text.
 * @returns {import('react').Dispatch<import('react').SetStateAction<string>>} returns.setDetails - Setter for details.
 * @returns {string} returns.urgency - Selected urgency level ('baja'|'media'|'alta').
 * @returns {import('react').Dispatch<import('react').SetStateAction<string>>} returns.setUrgency - Setter for urgency.
 * @returns {string} returns.contactPreference - Preferred contact method ('app'|'directo'|'llamada').
 * @returns {import('react').Dispatch<import('react').SetStateAction<string>>} returns.setContactPreference - Setter for contact preference.
 * @returns {string} returns.timeWindow - Preferred availability slot.
 * @returns {import('react').Dispatch<import('react').SetStateAction<string>>} returns.setTimeWindow - Setter for time window.
 * @returns {{type: 'success'|'error'|'warning', message: string}|null} returns.feedback - Confirmed submission, failed submission or saved request with stale history.
 * @returns {boolean} returns.isSubmitting - A request is awaiting its save/history result; prevents duplicate submissions.
 * @returns {boolean} returns.isRefreshingHistory - A retry is refreshing already-saved history.
 * @returns {() => Promise<void>} returns.retryHistory - Refreshes history without creating another support request.
 * @returns {Array<Object>} returns.userRequests - List of historical support requests filed by this agent.
 * @returns {boolean} returns.isAnonymous - Boolean flag derived from current support mode.
 * @returns {(e: import('react').FormEvent) => Promise<void>} returns.handleSubmit - Form submission handler.
 * @returns {() => Promise<void>} returns.loadData - Reloads remote/local support records.
 * @returns {() => Promise<void>} returns.reload - Standardized retry function for error boundaries.
 */
export function useSupportChannel() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [data, setData] = useState(() => getAgentRecords(currentUser?.id));
  const [loadError, setLoadError] = useState('');

  const loadData = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      if (!env.useMockStorage) {
        const remoteData = await fetchAgentRecords(currentUser.id);
        if (remoteData) setData(remoteData);
      } else {
        setData(getAgentRecords(currentUser.id));
      }
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
      throw error;
    }
  }, [currentUser?.id]);

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
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);
  const submittingRef = useRef(false);
  const confirmedRequestRef = useRef(false);

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
    if (submittingRef.current || isRefreshingHistory) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    confirmedRequestRef.current = false;
    const submittedDetails = details;
    try {
      const result = await createSupportRequest(
        isAnonymous,
        urgency,
        supportMode,
        currentUser,
        reason,
        submittedDetails,
        contactPreference,
        timeWindow
      );

      if (result.success !== true) {
        setFeedback({
          type: 'error',
          message: `No se confirmó el registro: ${result.error}. Tu texto se conserva; actualiza el historial antes de volver a intentarlo.`
        });
        return;
      }

      confirmedRequestRef.current = true;
      setDetails(previous => previous === submittedDetails ? '' : previous);
      setFeedback({ type: 'success', message: `Solicitud registrada. Tu radicado de seguimiento es ${result.code}.` });
      try {
        await loadData();
      } catch (error) {
        setFeedback({
          type: 'warning',
          message: `La solicitud ${result.code} quedó registrada, pero no se pudo actualizar el historial: ${error.message}. Actualiza el historial sin volver a radicarla.`
        });
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const retryHistory = async () => {
    if (isRefreshingHistory || submittingRef.current) return;
    setIsRefreshingHistory(true);
    try {
      await loadData();
      setFeedback({ type: 'success', message: 'Historial actualizado. Revisa Mis radicados para consultar las solicitudes registradas.' });
    } catch (error) {
      setFeedback({
        type: confirmedRequestRef.current ? 'warning' : 'error',
        message: confirmedRequestRef.current
          ? `No se pudo actualizar el historial: ${error.message}. La solicitud ya registrada no necesita otro envío; puedes volver a actualizar.`
          : `No se pudo actualizar el historial: ${error.message}. El registro sigue sin confirmación y tu texto se conserva; puedes volver a actualizar.`
      });
    } finally {
      setIsRefreshingHistory(false);
    }
  };

  return {
    loading,
    loadError,
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
    isSubmitting,
    isRefreshingHistory,
    retryHistory,
    userRequests,
    isAnonymous,
    handleSubmit,
    loadData,
    reload: loadData
  };
}
