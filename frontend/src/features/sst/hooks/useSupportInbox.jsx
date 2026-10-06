import { getSstData, fetchSstSupportRequests } from '../services/sstQueries';
import { advanceStatus } from '../services/supportInboxService';
import { useState, useEffect } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { env } from '../../../core/config/env';

import { WORKFLOW_STATES } from '../data/supportInboxData';

export function useSupportInbox() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const storeData = getSstData();

  useEffect(() => {
    let active = true; setLoading(true); setLoadError('');
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

    // Registro inmutable de auditoría (RF-10)
    if (env.useMockStorage) pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'GESTION_CASO_ACOMPANAMIENTO',
      target: `Caso ${req.code || req.id} -> ${nextStatus}`
    });

    setFeedback(`Caso ${req.code || req.id} actualizado a estado "${nextStatus}".`);
    setVersion((v) => v + 1);
  };

  return { loading, loadError, feedback, storeData, requests, handleAdvanceStatus };
}
