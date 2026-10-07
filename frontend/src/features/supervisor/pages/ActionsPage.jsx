import { Link } from 'react-router-dom';
import { useActions } from '../hooks/useActions';
// src/features/supervisor/pages/ActionsPage.jsx
// Gestión y seguimiento de planes de acción e intervenciones de SST (RF-09, Sin Carditis)

import { Icon } from '../../../core/components/Icon';
import { ActionFollowupModal } from '../components/ActionFollowupModal';

import '../../../styles/supervisor.css';

export function ActionsPage() {
  const {
    loading, loadError, selectedIntervention, setSelectedIntervention, feedback, interventions, handleSaveFollowup } =
    useActions();

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div className="supervisor-page">
      {/* Navegación secundaria */}
      <nav className="supervisor-subnav" aria-label="Navegación secundaria">
        <Link to="/supervisor/panel" className="supervisor-back-btn">
          <Icon name="arrow_back" size={16} />
          <span>Volver al panel de equipo</span>
        </Link>
      </nav>

      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Planes de acción asignados</h1>
          <p className="page-subtitle">
            Seguimiento de intervenciones preventivas propuestas por SST para tu equipo de trabajo.
          </p>
        </div>
      </div>

      {/* Mensaje de Feedback */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith("Error") ? "danger" : "ok"}`} role={feedback.startsWith("Error") ? "alert" : "status"}>
          <Icon name={feedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sección Operativa de Intervenciones (Sin envoltorio .card) */}
      <section className="supervisor-section" aria-labelledby="actionsTableTitle">
        <div className="supervisor-section-header">
          <div>
            <h2 id="actionsTableTitle" className="supervisor-section-title">
              Intervenciones en curso para tu equipo
            </h2>
            <p className="supervisor-section-subtitle">
              Planes coordinados con el área de Seguridad y Salud en el Trabajo.
            </p>
          </div>
          <span className="badge badge-info">{interventions.length} asignadas</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Título de la Intervención</th>
                <th scope="col">Tipo</th>
                <th scope="col">Indicador Asociado</th>
                <th scope="col">Línea Base</th>
                <th scope="col">Avance</th>
                <th scope="col">Estado</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {interventions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--c-texto-suave)' }}
                  >
                    No hay intervenciones asignadas actualmente para tu equipo.
                  </td>
                </tr>
              ) : (
                interventions.map((item) => (
                  <tr key={item.id} className="intervention-table-row">
                    <td className="intervention-cell-main">
                      <div className="intervention-item-title">{item.title}</div>
                      {item.target && (
                        <div className="intervention-item-target">{item.target}</div>
                      )}
                      {item.startDate && (
                        <div className="intervention-item-dates">
                          <Icon name="calendar" size={13} />
                          <span>{item.startDate} — {item.endDate || "Sin fecha de cierre"}</span>
                        </div>
                      )}
                      {item.lastFollowup && (
                        <div className="action-followup-preview">
                          <span className="followup-preview-label">Último seguimiento ({item.lastFollowup.date}):</span>
                          <span className="followup-preview-text">
                            {item.lastFollowup.actionType && <strong>{item.lastFollowup.actionType} · </strong>}
                            {item.lastFollowup.note}
                          </span>
                        </div>
                      )}
                      {item.externalAction && (
                        <div className="action-execution-hint">
                          <Icon name="info" size={12} />
                          <span>Ejecución operativa presencial recomendada</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-info">{item.type}</span>
                    </td>
                    <td>
                      <div className="intervention-indicator-name">{item.indicator}</div>
                    </td>
                    <td>
                      <span className="intervention-baseline-score">
                        {item.baseline == null ? "No publicable" : `${item.baseline} / 100`}
                      </span>
                    </td>
                    <td>
                      <div className="intervention-progress-wrapper">
                        <div className="intervention-progress-track" title={`Avance actual: ${item.progress || 0}%`}>
                          <div
                            className="intervention-progress-fill"
                            style={{ width: `${item.progress || 0}%` }}
                          />
                        </div>
                        <span className="intervention-progress-text">{item.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${item.status === 'Activa' ? 'ok' : item.status === 'Cerrada' ? 'muted' : 'info'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedIntervention(item)}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Icon name="edit" size={14} />
                        <span>{item.status === 'Cerrada' ? 'Ver avance' : 'Registrar avance'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Nota Contextual de Corresponsabilidad Preventiva (RF-09) */}
        <div className="supervisor-context-note">
          <strong>Corresponsabilidad preventiva:</strong> Las intervenciones buscan mitigar factores de carga
          u optimizar descansos de forma colectiva, sin focalizaciones punitivas individuales. Pulso360 no
          modifica enrutadores de telefonía ni turnos de forma automática.
        </div>
      </section>

      {/* Modal de Seguimiento */}
      {selectedIntervention && (
        <ActionFollowupModal
          intervention={selectedIntervention}
          onClose={() => setSelectedIntervention(null)}
          onSave={handleSaveFollowup}
        />
      )}
    </div>
  );
}
