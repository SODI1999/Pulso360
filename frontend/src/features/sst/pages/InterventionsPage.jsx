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
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true; setLoading(true); setLoadError('');
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

  if (loading) return <p role="status">Cargando intervenciones…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar las intervenciones: {loadError}</p>;

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Planes de acción preventiva</h1>
          <p className="page-subtitle">
            Formulación, seguimiento y evaluación de efectividad sobre indicadores de equipo (RF-09).
          </p>
        </div>
      </div>

      {/* Banner de Trazabilidad Metodológica */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <Icon name="info" size={20} />
        <div>
          <strong>Trazabilidad metodológica:</strong> Las intervenciones definen línea base, indicador
          objetivo y ventana de evaluación. La variación observada en los datos refleja correlación de
          bienestar colectivo, no causalidad clínica directa. Pulso360 no ejecuta cambios automáticos en
          enrutadores ni turnos.
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
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      {item.target && <div className="card-subtitle">{item.target}</div>}
                      {item.startDate && <div className="card-subtitle">{item.startDate} — {item.endDate || "Sin fecha de cierre"}</div>}
                      {item.lastFollowup && <div className="card-subtitle">Último seguimiento ({item.lastFollowup.date}): {item.lastFollowup.actionType && `${item.lastFollowup.actionType} · `}{item.lastFollowup.note} · {item.lastFollowup.progress}%</div>}
                      {item.externalAction && (
                        <div style={{ fontSize: '11.5px', color: 'var(--c-texto-mutado)', marginTop: '2px' }}>
                          Requiere acción externa manual
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{item.campaign}</div>
                      {item.team && (
                        <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>{item.team}</div>
                      )}
                    </td>
                    <td>{item.assignedName || 'Sin responsable asignado'}</td>
                    <td>{item.indicator || 'Recuperación agregada'}</td>
                    <td>{item.baseline != null ? `${item.baseline} / 100` : 'No publicable'}</td>
                    <td>
                      {item.after != null ? (
                        <strong style={{ color: 'var(--c-ok)' }}>{item.after} / 100</strong>
                      ) : (
                        <span style={{ color: 'var(--c-texto-mutado)' }}>En curso</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            background: 'var(--c-fondo)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid var(--c-borde-suave)'
                          }}
                        >
                          <div
                            style={{
                              width: `${item.progress || 0}%`,
                              height: '100%',
                              background: 'var(--c-primario)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{item.progress || 0}%</span>
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
