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

  const storeData = getSstData();

  useEffect(() => {
    if (!env.useMockStorage) {
      fetchSstSupportRequests().then((data) => {
        // Preservando que las solicitudes con mode === 'anonimo' no expongan la identidad
        setRequests(data);
      }).catch(console.error);
    } else {
      setRequests(getSstData().supportRequests || []);
    }
  }, [version]);

  // Avanzar estado del caso según flujo predefinido
  const handleAdvanceStatus = (requestId) => {
    const operationResult = advanceStatus(requestId, WORKFLOW_STATES);
    if (!operationResult) return;
    const { req, nextStatus } = operationResult;

    // Registro inmutable de auditoría (RF-10)
    pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'GESTION_CASO_ACOMPANAMIENTO',
      target: `Caso ${req.code || req.id} -> ${nextStatus}`
    });

    setFeedback(`Caso ${req.code || req.id} actualizado a estado "${nextStatus}".`);
    setVersion((v) => v + 1);
  };

  return { feedback, storeData, requests, handleAdvanceStatus };
}
