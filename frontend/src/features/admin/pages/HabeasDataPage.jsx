import { useHabeasData } from '../hooks/useHabeasData';
import { STATUS_WORKFLOW } from '../data/habeasDataData';

// src/features/admin/pages/HabeasDataPage.jsx
// Módulo de Gestión Administrativa de Solicitudes Habeas Data (RF-14 / Ley 1581)

import { Icon } from '../../../core/components/Icon';
import { HabeasAdvanceModal } from '../components/HabeasAdvanceModal';

import '../../../styles/admin.css';

export function HabeasDataPage() {
  const {
    loading, loadError,
    feedback,
    advanceModalState,
    setAdvanceModalState,
    requests,
    users,
    formatDate,
    handleOpenAdvance,
    handleConfirmAdvance
  } = useHabeasData();

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandeja de solicitudes de titulares</h1>
          <p className="page-subtitle">
            Atención de derechos de consulta, rectificación, portabilidad y supresión con trazabilidad
            administrativa (RF-14 / Ley 1581).
          </p>
        </div>
      </div>

      {/* Banner de Plazos Normativos */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Fechas objetivo del trámite:</strong> El cálculo omite fines de semana; los festivos colombianos no están incluidos. Cada cambio de estado registra al administrador que lo realizó; el avance del trámite no modifica automáticamente los datos del titular.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith("Error") ? "danger" : "ok"}`} role={feedback.startsWith("Error") ? "alert" : "status"} style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name={feedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tarjeta con Tabla de Solicitudes */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Solicitudes radicadas</h2>
            <div className="card-subtitle">
              Control de términos, estados de atención y constancias administrativas.
            </div>
          </div>
          <span className="badge badge-info">Toda transición queda auditada</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Radicado</th>
                <th>Titular</th>
                <th>Tipo de Solicitud</th>
                <th>Fecha Radicación</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
                <th>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}
                  >
                    No hay solicitudes de Habeas Data radicadas en el sistema.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const targetUser = users.find((u) => u.id === r.userId);
                  const currentIndex = STATUS_WORKFLOW.indexOf(r.status);
                  const canAdvance = !["Respondida", "Rechazada"].includes(r.status) && currentIndex >= 0 && currentIndex < STATUS_WORKFLOW.length - 1;

                  // Verificación de vencimiento
                  const dueDate = r.deadline ? new Date(`${r.deadline.slice(0,10)}T23:59:59-05:00`) : null;
                  const isOverdue =
                    dueDate &&
                    dueDate.getTime() < Date.now() &&
                    !['Respondida', 'Rechazada'].includes(r.status);

                  let statusBadgeClass = 'badge-info';
                  if (r.status === 'Rechazada') statusBadgeClass = 'badge-danger';
                  else if (r.status === 'En tramite') statusBadgeClass = 'badge-warn';
                  else if (r.status === 'Respondida') statusBadgeClass = 'badge-ok';

                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="audit-code-cell">{r.id}</span>
                        {r.note && (
                          <div className="habeas-note-box">
                            <strong>Nota:</strong> {r.note}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{targetUser?.name || r.userId}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--c-texto-suave)' }}>{r.userId}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{r.type}</span>
                      </td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td>
                        {formatDate(r.deadline)}{' '}
                        {isOverdue && <span className="badge badge-danger">Vencida</span>}
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass}`}>{r.status}</span>
                      </td>
                      <td>
                        {canAdvance ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenAdvance(r)}
                          >
                            <Icon name="arrowRight" size={14} />
                            <span>Avanzar</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>
                            Trámite finalizado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Avance */}
      <HabeasAdvanceModal
        isOpen={advanceModalState.isOpen}
        request={advanceModalState.request}
        nextStatus={advanceModalState.nextStatus}
        onClose={() => setAdvanceModalState({ isOpen: false, request: null, nextStatus: '' })}
        onConfirm={handleConfirmAdvance}
      />
    </div>
  );
}
