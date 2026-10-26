import { getSstData, fetchSstInterventions } from '../services/sstQueries';
import { saveIntervention } from '../services/interventionsService';
// src/features/sst/pages/InterventionsPage.jsx
// Gestión macro de intervenciones colectivas y planes de acción preventivos (RF-09)

import { useState, useEffect } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { env } from '../../../core/config/env';
import { Icon } from '../../../core/components/Icon';
import { NewInterventionForm } from '../components/NewInterventionForm';

import '../../../styles/sst.css';

export function InterventionsPage() {
  const minThreshold = getSstData().settings?.umbralMinimo || 5;
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [interventions, setInterventions] = useState(() => getSstData().interventions);
  const [loading, setLoading] = useState(() => !getSstData().interventions.length);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true; if (!getSstData().interventions.length) setLoading(true); setLoadError('');
    fetchSstInterventions().then(rows => { if (active) setInterventions(rows); })
      .catch(error => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [version]);

  const handleSaveIntervention = async (newIntervention) => {
    setFeedback('');
    setErrorMessage('');
    const result = await saveIntervention(newIntervention);

    if (result?.success !== true) {
      setErrorMessage(result.error);
      return { success: false, error: result.error };
    }

    // Registro inmutable de auditoría (RF-09)
    if (env.useMockStorage) pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'CREACION_INTERVENCION',
      target: `${newIntervention.title} · ${newIntervention.campaign}${newIntervention.team ? ' / ' + newIntervention.team : ''} · línea base ${newIntervention.baseline}`
    });

    setFeedback(
      `Intervención "${newIntervention.title}" registrada exitosamente y sincronizada con el módulo de supervisión operativa.`
    );
    setVersion((v) => v + 1);
    return { success: true };
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Planes de acción preventiva</h1>
            <p className="page-subtitle">
              Formulación, seguimiento y evaluación de efectividad sobre indicadores de equipo.
            </p>
          </div>
        </div>
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando planes de acción del servidor…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert">
        <div className="page-header">
          <div>
            <h1 className="page-title">Planes de acción preventiva</h1>
            <p className="page-subtitle">
              Formulación, seguimiento y evaluación de efectividad sobre indicadores de equipo.
            </p>
          </div>
        </div>
        <div
          className="alert-banner danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <span>No se pudieron cargar las intervenciones: {loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVersion((v) => v + 1)}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Planes de acción preventiva</h1>
          <p className="page-subtitle">
            Formulación, seguimiento y evaluación de efectividad sobre indicadores de equipo.
          </p>
        </div>
      </div>

      {/* Mensaje de error si falla la creación */}
      {errorMessage && (
        <div className="alert-banner warn" role="alert" style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name="alertTriangle" size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Formulario de Nueva Intervención */}
      <NewInterventionForm onSaveIntervention={handleSaveIntervention} minThreshold={minThreshold} />

      {/* Tabla de Seguimiento de Intervenciones */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Intervenciones registradas en la organización</h2>
            <p className="card-subtitle">Seguimiento de progreso y comparativa frente a línea base.</p>
          </div>
          <span className="badge badge-info">{interventions.length} intervenciones</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Intervención</th>
                <th>Equipo / Campaña</th>
                <th>Responsable</th>
                <th>Indicador</th>
                <th>Línea Base</th>
                <th>Medición Posterior</th>
                <th>Progreso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {interventions.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--c-texto-suave)' }}
                  >
                    No hay intervenciones registradas en el sistema.
                  </td>
                </tr>
              ) : (
                interventions.map((item) => (
                  <tr key={item.id} className="intervention-table-row">
                    <td className="intervention-cell-main">
                      <div className="intervention-item-title">{item.title}</div>
                      {item.target && <div className="intervention-item-target">{item.target}</div>}
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
                          <span>Requiere acción externa manual</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div><strong>{item.campaign}</strong></div>
                      {item.team && (
                        <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>{item.team}</div>
                      )}
                    </td>
                    <td>{item.assignedName || 'Sin responsable asignado'}</td>
                    <td>
                      <div className="intervention-indicator-name">{item.indicator || 'Recuperación agregada'}</div>
                    </td>
                    <td>
                      <span className="intervention-baseline-score">
                        {item.baseline != null ? `${item.baseline} / 100` : 'No publicable'}
                      </span>
                    </td>
                    <td>
                      {item.after != null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <strong style={{ color: 'var(--c-ok)', fontSize: '13px' }}>{item.after} / 100</strong>
                          {item.baseline != null && (
                            <span className={`badge ${item.after >= item.baseline ? 'badge-ok' : 'badge-warn'}`} style={{ fontSize: '11px', padding: '1px 6px', alignSelf: 'flex-start' }}>
                              {item.after >= item.baseline ? `+${item.after - item.baseline} pts` : `${item.after - item.baseline} pts`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-muted" style={{ fontSize: '11.5px' }}>En curso</span>
                      )}
                    </td>
                    <td>
                      <div className="intervention-progress-wrapper" style={{ minWidth: '110px' }}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
