import { getSstData } from '../services/sstQueries';
import { updateStatus, confirmDismiss, createIntervention } from '../services/alertsInboxService';
import { useState, useMemo } from 'react';

import { authService } from '../../../core/auth/authService';

export function useAlertsInbox() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [dismissingAlert, setDismissingAlert] = useState(null);
  const [feedback, setFeedback] = useState('');

  const alerts = useMemo(() => {
    void version;
    return getSstData().alerts || [];
  }, [version]);

  // Actualizar estado general de la alerta
  const handleUpdateStatus = (alertId, newStatus) => {
    const operationResult = updateStatus(alertId, newStatus, user);
    if (!operationResult) return;
    const { alertItem } = operationResult;

    setFeedback(`La alerta "${alertItem.rule}" pasó a estado "${newStatus.replace('_', ' ')}".`);
    setVersion((v) => v + 1);
  };

  // Descartar alerta con justificación técnica obligatoria (RF-08)
  const handleConfirmDismiss = (alertId, reason) => {
    const operationResult = confirmDismiss(alertId, reason, user);
    if (!operationResult) return;

    setDismissingAlert(null);
    setFeedback(`Alerta descartada con justificación técnica registrada en auditoría.`);
    setVersion((v) => v + 1);
  };

  // Crear intervención colectiva automáticamente desde la alerta
  const handleCreateIntervention = (alertItem) => {
    const operationResult = createIntervention(alertItem, user);
    if (!operationResult) return;

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
