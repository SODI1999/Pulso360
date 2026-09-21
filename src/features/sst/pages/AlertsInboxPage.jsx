// src/features/sst/pages/AlertsInboxPage.jsx
// Bandeja de gestión del ciclo de vida de alertas tempranas (RF-08)

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { AlertCard } from '../components/AlertCard';
import { DismissAlertModal } from '../components/DismissAlertModal';

import '../../../styles/sst.css';

export function AlertsInboxPage() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [dismissingAlert, setDismissingAlert] = useState(null);
  const [feedback, setFeedback] = useState('');

  const alerts = useMemo(() => {
    void version;
    return pulsoStore.get().alerts || [];
  }, [version]);

  // Actualizar estado general de la alerta
  const handleUpdateStatus = (alertId, newStatus) => {
    const storeData = pulsoStore.get();
    const alertItem = (storeData.alerts || []).find(a => a.id === alertId);
    if (!alertItem) return;

    alertItem.status = newStatus;
    pulsoStore.save(storeData);

    pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'CAMBIO_ESTADO_ALERTA',
      target: `${alertItem.id} (${alertItem.rule}) -> ${newStatus}`
    });

    setFeedback(`La alerta "${alertItem.rule}" pasó a estado "${newStatus.replace('_', ' ')}".`);
    setVersion(v => v + 1);
  };

  // Descartar alerta con justificación técnica obligatoria (RF-08)
  const handleConfirmDismiss = (alertId, reason) => {
    const storeData = pulsoStore.get();
    const alertItem = (storeData.alerts || []).find(a => a.id === alertId);
    if (!alertItem) return;

    alertItem.status = 'DESCARTADA';
    alertItem.dismissReason = reason;
    pulsoStore.save(storeData);

    pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'DESCARTE_ALERTA',
      target: `${alertItem.id} -> DESCARTADA | Justificación: "${reason}"`
    });

    setDismissingAlert(null);
    setFeedback(`Alerta descartada con justificación técnica registrada en auditoría.`);
    setVersion(v => v + 1);
  };

  // Crear intervención colectiva automáticamente desde la alerta
  const handleCreateIntervention = (alertItem) => {
    const storeData = pulsoStore.get();
    const targetAlert = (storeData.alerts || []).find(a => a.id === alertItem.id);
    if (!targetAlert) return;

    const newIntervention = {
      id: `int-${Date.now()}`,
      alertId: targetAlert.id,
      title: `Plan preventivo · ${targetAlert.rule}`,
      type: 'Pausas cognitivas',
      campaign: targetAlert.campaign,
      team: targetAlert.team,
      creator: user?.id || 'usr-3',
      assignedTo: 'usr-2',
      status: 'Planeada',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + (28 * 86400000)).toISOString().substring(0, 10),
      indicator: 'Recuperación agregada',
      baseline: targetAlert.evidence?.slice(-1)[0] || 58,
      after: null,
      progress: 0,
      target: 'Intervención preventiva coordinada con supervisión para mitigar la tendencia de alerta.',
      externalAction: true
    };

    storeData.interventions = storeData.interventions || [];
    storeData.interventions.unshift(newIntervention);

    targetAlert.status = 'INTERVENCION_CREADA';
    targetAlert.interventionId = newIntervention.id;
    pulsoStore.save(storeData);

    pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'CREACION_INTERVENCION_DESDE_ALERTA',
      target: `${newIntervention.title} asignada a ${targetAlert.campaign}`
    });

    setFeedback(`Intervención creada exitosamente. Se asignó el plan al supervisor y la alerta avanzó a "Intervención creada".`);
    setVersion(v => v + 1);
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandeja de alertas tempranas</h1>
          <p className="page-subtitle">
            Detección oportuna de patrones estadísticos de agotamiento y fatiga a nivel colectivo.
          </p>
        </div>

        <Link to="/sst/reglas-alertas" className="btn btn-secondary">
          <Icon name="tune" size={18} />
          <span>Configurar reglas preventivas</span>
        </Link>
      </div>

      {/* Banner de Ciclo de Alertas */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <Icon name="info" size={20} />
        <div>
          <strong>Ciclo de alerta preventiva (RF-08):</strong> Las alertas identifican variaciones agregadas para formular planes de mitigación de grupo. En esta vista no se muestran trabajadores individualizados ni reportes punitivos.
        </div>
      </div>

      {/* Feedback contextual */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Lista de Alertas */}
      <div id="alertsContainer">
        {alerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--c-texto-suave)', margin: 0 }}>No hay alertas registradas en el sistema.</p>
          </div>
        ) : (
          alerts.map(alertItem => (
            <AlertCard
              key={alertItem.id}
              alertItem={alertItem}
              onUpdateStatus={handleUpdateStatus}
              onDismissRequest={(item) => setDismissingAlert(item)}
              onCreateIntervention={handleCreateIntervention}
            />
          ))
        )}
      </div>

      {/* Modal de Descarte */}
      {dismissingAlert && (
        <DismissAlertModal
          alertItem={dismissingAlert}
          onClose={() => setDismissingAlert(null)}
          onConfirm={handleConfirmDismiss}
        />
      )}
    </div>
  );
}
