import { getSstData, fetchSstSupportRequests } from '../services/sstQueries';
import { advanceStatus } from '../services/supportInboxService';
import { useState, useEffect } from 'react';

import { WORKFLOW_STATES } from '../data/supportInboxData';

export function useSupportInbox() {
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [requests, setRequests] = useState(() => getSstData().supportRequests);
  const [loading, setLoading] = useState(() => !getSstData().supportRequests.length);
  const [loadError, setLoadError] = useState('');

  const storeData = getSstData();

  useEffect(() => {
    let active = true; if (!getSstData().supportRequests.length) setLoading(true); setLoadError('');
    fetchSstSupportRequests().then(rows => { if (active) setRequests(rows); })
      .catch(error => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [version]);

  // Avanzar estado del caso según flujo predefinido
  const handleAdvanceStatus = async (requestId) => {
    const localReq = requests.find(r => r.id === requestId);
    if (!localReq) return;
    
    const operationResult = await advanceStatus(requestId, WORKFLOW_STATES, localReq.status);
    if (!operationResult) return;
    if (operationResult.success !== true) {
      setFeedback(`Error: ${operationResult.error}`);
      return;
    }
    const { req, nextStatus } = operationResult;

    setFeedback(`Caso ${req.code || req.id} actualizado a estado "${nextStatus}".`);
    setVersion((v) => v + 1);
  };

  const reload = () => setVersion((v) => v + 1);
  return { loading, loadError, feedback, storeData, requests, handleAdvanceStatus, reload };
}
