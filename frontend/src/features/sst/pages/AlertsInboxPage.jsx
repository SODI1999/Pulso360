import { useAlertsInbox } from '../hooks/useAlertsInbox';

// src/features/sst/pages/AlertsInboxPage.jsx
// Bandeja de gestión del ciclo de vida de alertas tempranas (RF-08)

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { AlertCard } from '../components/AlertCard';
import { DismissAlertModal } from '../components/DismissAlertModal';

import '../../../styles/sst.css';

export function AlertsInboxPage() {
  const {
    dismissingAlert,
    setDismissingAlert,
    feedback,
    alerts,
    handleUpdateStatus,
    handleConfirmDismiss,
    handleCreateIntervention
  } = useAlertsInbox();

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
          <strong>Ciclo de alerta preventiva (RF-08):</strong> Las alertas identifican variaciones agregadas
          para formular planes de mitigación de grupo. En esta vista no se muestran trabajadores
          individualizados ni reportes punitivos.
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
            <p style={{ color: 'var(--c-texto-suave)', margin: 0 }}>
              No hay alertas registradas en el sistema.
            </p>
          </div>
        ) : (
          alerts.map((alertItem) => (
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
