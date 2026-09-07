// src/features/supervisor/pages/ActionsPage.jsx
// Gestión y seguimiento de planes de acción e intervenciones de SST (RF-09)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { ActionFollowupModal } from '../components/ActionFollowupModal';

import '../../../styles/supervisor.css';

export function ActionsPage() {
    const user = authService.getCurrentUser();
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [version, setVersion] = useState(0);

    // Cargar intervenciones asignadas al supervisor
    const interventions = useMemo(() => {
        void version;
        const data = pulsoStore.get();
        return (data.interventions || []).filter(item => item.assignedTo === user?.id || item.assignedTo === 'usr-2');
    }, [user?.id, version]);

    const handleSaveFollowup = ({ interventionId, actionType, notes, progress }) => {
        const data = pulsoStore.get();
        const intervention = (data.interventions || []).find(i => i.id === interventionId);

        if (intervention) {
            intervention.progress = progress;
            intervention.lastFollowup = {
                date: new Date().toISOString().substring(0, 10),
                actionType,
                notes,
                supervisor: user?.name
            };

            if (progress >= 100) {
                intervention.status = 'Cerrada';
            } else if (intervention.status === 'Pendiente') {
                intervention.status = 'Activa';
            }

            pulsoStore.save(data);

            // Registro inmutable de auditoría (RF-09)
            pulsoStore.audit({
                actor: `${user?.name || 'Supervisor'} (${user?.role || 'supervisor'})`,
                action: 'SEGUIMIENTO_INTERVENCION',
                target: `${intervention.title} · ${actionType} (${progress}% avance)`
            });

            setFeedback(`Seguimiento guardado exitosamente para "${intervention.title}". Avance actualizado al ${progress}%.`);
            setVersion(v => v + 1);
        }

        setSelectedIntervention(null);
    };

    return (
        <div>
            {/* Cabecera */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Planes de acción asignados</h1>
                    <p className="page-subtitle">
                        Seguimiento de intervenciones preventivas propuestas por SST para tu equipo de trabajo.
                    </p>
                </div>
            </div>

            {/* Banner de Corresponsabilidad Preventiva (RF-09) */}
            <div className="alert-banner info" style={{ marginBottom: 'var(--space-6)' }}>
                <Icon name="info" size={20} />
                <div>
                    <strong>Corresponsabilidad preventiva:</strong> las intervenciones buscan mitigar factores de carga u optimizar pausas de forma colectiva, sin focalizaciones punitivas individuales. Pulso360 no modifica enrutadores de telefonía ni turnos de forma automática.
                </div>
            </div>

            {/* Mensaje de Feedback */}
            {feedback && (
                <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-5)' }}>
                    <Icon name="checkCircle" size={18} />
                    <span>{feedback}</span>
                </div>
            )}

            {/* Tarjeta con Tabla de Intervenciones */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h2 className="card-title">Intervenciones en curso para tu equipo</h2>
                        <p className="card-subtitle">Planes coordinados con el área de Seguridad y Salud en el Trabajo.</p>
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
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--c-texto-suave)' }}>
                                        No hay intervenciones asignadas actualmente para tu equipo.
                                    </td>
                                </tr>
                            ) : (
                                interventions.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{item.title}</strong>
                                            {item.externalAction && (
                                                <div style={{ fontSize: '11.5px', color: 'var(--c-texto-mutado)', marginTop: '2px' }}>
                                                    Ejecución manual recomendada
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.type}</td>
                                        <td>{item.indicator}</td>
                                        <td>{item.baseline} / 100</td>
                                        <td>
                                            <div className="intervention-progress-wrapper">
                                                <div className="intervention-progress-track">
                                                    <div
                                                        className="intervention-progress-fill"
                                                        style={{ width: `${item.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="intervention-progress-text">{item.progress || 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${item.status === 'Activa' ? 'ok' : item.status === 'Cerrada' ? 'muted' : 'info'}`}>
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
                                                <span>Registrar avance</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
