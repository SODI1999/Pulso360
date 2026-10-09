import { useAlertsInbox } from '../hooks/useAlertsInbox';

// src/features/sst/pages/AlertsInboxPage.jsx
// Bandeja de gestión del ciclo de vida de alertas tempranas

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { AlertCard } from '../components/AlertCard';
import { DismissAlertModal } from '../components/DismissAlertModal';

import '../../../styles/sst.css';

export function AlertsInboxPage() {
  const {
    loading, loadError,
    dismissingAlert,
    setDismissingAlert,
    feedback,
    alerts,
    handleUpdateStatus,
    handleConfirmDismiss,
    handleCreateIntervention
  } = useAlertsInbox();

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandeja de alertas tempranas</h1>
          <p className="page-subtitle">
            Consulta de alertas preventivas registradas y gestión de acciones colectivas.
          </p>
        </div>

        <Link to="/sst/reglas-alertas" className="btn btn-secondary">
          <Icon name="tune" size={18} />
          <span>Configurar reglas preventivas</span>
        </Link>
      </div>

      {/* Feedback contextual */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith("Error") ? "danger" : "ok"}`} role={feedback.startsWith("Error") ? "alert" : "status"} style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name={feedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={18} />
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
