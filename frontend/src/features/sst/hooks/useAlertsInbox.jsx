import { getSstData, fetchSstAlerts } from '../services/sstQueries';
import { updateStatus, confirmDismiss, createIntervention } from '../services/alertsInboxService';
import { useState, useEffect } from 'react';

import { authService } from '../../../core/auth/authService';
import { env } from '../../../core/config/env';

export function useAlertsInbox() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [dismissingAlert, setDismissingAlert] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!env.useMockStorage) {
      fetchSstAlerts().then(setAlerts).catch(console.error);
    } else {
      setAlerts(getSstData().alerts || []);
    }
  }, [version]);

  // Actualizar estado general de la alerta
  const handleUpdateStatus = async (alertId, newStatus) => {
    const operationResult = await updateStatus(alertId, newStatus, user);
    if (!operationResult) return;
    if (operationResult.error) {
      setFeedback(`Error: ${operationResult.error}`);
      return;
    }
    const { alertItem } = operationResult;

    setFeedback(`La alerta "${alertItem.rule}" pasó a estado "${newStatus.replace('_', ' ')}".`);
    setVersion((v) => v + 1);
  };

  // Descartar alerta con justificación técnica obligatoria (RF-08)
  const handleConfirmDismiss = async (alertId, reason) => {
    const operationResult = await confirmDismiss(alertId, reason, user);
    if (!operationResult) return;
    if (operationResult.error) {
      setFeedback(`Error: ${operationResult.error}`);
      return;
    }

    setDismissingAlert(null);
    setFeedback(`Alerta descartada con justificación técnica registrada en auditoría.`);
    setVersion((v) => v + 1);
  };

  // Crear intervención colectiva automáticamente desde la alerta
  const handleCreateIntervention = async (alertItem) => {
    const operationResult = await createIntervention(alertItem, user);
    if (!operationResult) return;
    if (operationResult.error) {
      setFeedback(`Error: ${operationResult.error}`);
      return;
    }

    setFeedback(
      `Intervención creada exitosamente. Se asignó el plan al supervisor y la alerta avanzó a "Intervención creada".`
    );
    setVersion((v) => v + 1);
  };

  return {
    dismissingAlert,
    setDismissingAlert,
    feedback,
    alerts,
    handleUpdateStatus,
    handleConfirmDismiss,
    handleCreateIntervention
  };
}
