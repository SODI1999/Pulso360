import { fetchSstAlerts, getSstData } from '../services/sstQueries';
import { updateStatus, confirmDismiss, createIntervention } from '../services/alertsInboxService';
import { useState, useEffect } from 'react';

import { authService } from '../../../core/auth/authService';

export function useAlertsInbox() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [dismissingAlert, setDismissingAlert] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [alerts, setAlerts] = useState(() => getSstData().alerts);
  const [loading, setLoading] = useState(() => !getSstData().alerts.length);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true; if (!getSstData().alerts.length) setLoading(true); setLoadError('');
    fetchSstAlerts().then(rows => { if (active) setAlerts(rows); })
      .catch(error => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [version]);

  // Actualizar estado general de la alerta
  const handleUpdateStatus = async (alertId, newStatus) => {
    const operationResult = await updateStatus(alertId, newStatus, user);
    if (!operationResult) return;
    if (operationResult.success !== true) {
      setFeedback(`Error: ${operationResult.error}`);
      return operationResult;
    }
    const { alertItem } = operationResult;

    setFeedback(`La alerta "${alertItem.rule || alerts.find(item => item.id === alertId)?.rule || alertId}" pasó a estado "${newStatus.replace('_', ' ')}".`);
    setVersion((v) => v + 1);
  };

  // Descartar alerta con justificación técnica obligatoria (RF-08)
  const handleConfirmDismiss = async (alertId, reason) => {
    const operationResult = await confirmDismiss(alertId, reason, user);
    if (!operationResult) return;
    if (operationResult.success !== true) {
      setFeedback(`Error: ${operationResult.error}`);
      return operationResult;
    }

    setDismissingAlert(null);
    setFeedback('Alerta descartada con justificación guardada en su registro. La operación quedó auditada.');
    setVersion((v) => v + 1);
    return operationResult;
  };

  // Crear intervención colectiva automáticamente desde la alerta
  const handleCreateIntervention = async (alertItem) => {
    const operationResult = await createIntervention(alertItem, user);
    if (!operationResult) return;
    if (operationResult.success !== true) {
      setFeedback(`Error: ${operationResult.error}`);
      return;
    }

    setFeedback(
      `Intervención creada en el ámbito de la alerta. La alerta avanzó a "Intervención creada".`
    );
    setVersion((v) => v + 1);
  };

  return {
    loading, loadError,
    dismissingAlert,
    setDismissingAlert,
    feedback,
    alerts,
    handleUpdateStatus,
    handleConfirmDismiss,
    handleCreateIntervention
  };
}
