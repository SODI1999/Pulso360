// src/features/agent/pages/MyWellbeingPage.jsx
// Visualización del histórico de bienestar personal del agente (RF-11 / Paleta Pulso Calma)

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';
import '../../../styles/agent.css';

const DIMENSION_DEFINITIONS = [
    { key: 'energia', label: 'Batería de turno', desc: 'Vitalidad y energía disponible durante la operación' },
    { key: 'cargaEmocional', label: 'Tensión por usuarios', desc: 'Exigencia emocional en llamadas e interacciones' },
    { key: 'recuperacion', label: 'Recuperación y descanso', desc: 'Calidad de sueño, desconexión y pausas activas' },
    { key: 'apoyo', label: 'Respaldo en línea', desc: 'Acompañamiento percibido del equipo y soporte' },
    { key: 'distanciamiento', label: 'Piloto automático', desc: 'Modo automático o desapego como defensa ante el agotamiento' },
    { key: 'ineficacia', label: 'Eficacia y trabas del sistema', desc: 'Fluidez de herramientas vs fricción técnica y procesos' }
];

export function MyWellbeingPage() {
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();

    const checkinRecords = useMemo(() => {
        return (data.checkins || []).filter(c => c.userId === currentUser?.id);
    }, [data.checkins, currentUser?.id]);

    const latestCheckin = checkinRecords[0] || {};

    // Tendencia de energía de los últimos 7 registros. El gráfico vive en esta
    // página de análisis y no en el panel principal, para no convertir la home
    // del agente en un tablero de analítica (solo datos autorreportados reales).
    const trendData = useMemo(() => {
        const recent = [...checkinRecords].slice(0, 7).reverse();
        return {
            labels: recent.map((c) => {
                const parts = (c.journeyKey || '').split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : 'Turno';
            }),
            values: recent.map((c) => c.energia ?? c.recuperacion ?? 0)
        };
    }, [checkinRecords]);

    return (
        <div className="agent-page agent-page--wellbeing" style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Cabecera Editorial Limpia */}
            <header className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title">Mi tendencia personal de bienestar</h1>
                    <p className="page-subtitle">
                        Espacio individual para revisar tus registros; esta vista no compara tus respuestas con las de otras personas ni las presenta en la supervisión agregada.
                    </p>
                </div>
                <Link to="/agente/checkin" className="btn btn-primary">
                    <Icon name="edit_note" size={18} />
                    <span>Realizar check-in de turno</span>
                </Link>
            </header>

            {/* Banner Informativo con Garantía de Privacidad y Calma */}
            <div className="alert-banner alert-banner--calma" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: 0 }}>
                <Icon name="kAnonymityShield" size={22} style={{ color: 'var(--c-primario)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', lineHeight: '1.55' }}>
                    <strong>Espacio personal:</strong> Las seis dimensiones describen factores del turno de trabajo, no juicios de valor sobre tu persona. Puedes revisar estos registros para reconocer patrones de fatiga y decidir tus próximos pasos.
                </div>
            </div>

            {/* Tendencia de energía (capacidad movida desde el panel principal) */}
            {trendData.labels.length >= 2 && (
                <section aria-label="Tendencia de energía de tus últimos registros">
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--c-texto)', margin: '0 0 12px' }}>
                        Tendencia de energía (últimos registros)
                    </h2>
                    <div className="card" style={{ padding: '18px 18px 8px' }}>
                        <TrendLineChart
                            labels={trendData.labels}
                            values={trendData.values}
                            strokeColor="var(--c-calma-accent)"
                        />
                    </div>
                </section>
            )}

            {/* Matriz Somática del Último Registro (Lista Compacta con Indicadores Visuales) */}
            <section aria-label="Último autorreporte somático">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--c-texto)', margin: 0 }}>
                            Último autorreporte registrado {latestCheckin.date ? `(${latestCheckin.date})` : ''}
                        </h2>
                        <span style={{ fontSize: '12px', color: 'var(--c-texto-mutado)' }}>
                            Dimensiones evaluadas en tu turno más reciente
                        </span>
                    </div>
                    {checkinRecords.length > 0 && (
                        <span className="badge badge-ok" style={{ fontSize: '11.5px' }}>
                            Datos al día
                        </span>
                    )}
                </div>

                <div id="wellbeingGrid" className="somatic-matrix-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
                    {DIMENSION_DEFINITIONS.map(dim => {
                        const val = latestCheckin[dim.key];
                        const displayVal = val != null ? val : '—';
                        const hasVal = val != null;

                        return (
                            <div key={dim.key} className="somatic-matrix-item" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1, paddingRight: '16px' }}>
                                    <div className="somatic-matrix-head">
                                        <span className="somatic-matrix-label">{dim.label}</span>
                                    </div>
                                    <p className="somatic-matrix-desc">{dim.desc}</p>
                                    {hasVal && (
                                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--c-borde-suave)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(val / 5) * 100}%`, height: '100%', backgroundColor: 'var(--c-primario)', borderRadius: '2px' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="somatic-matrix-val" style={{ flexShrink: 0 }}>
                                    <span>{displayVal}</span>
                                    {hasVal && <span className="somatic-matrix-unit">/ 5</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Línea de Tiempo Biográfica Limpia (Sin Tarjeta Perimetral Tosca) */}
            <section className="wellbeing-timeline-section" aria-label="Histórico biográfico de jornadas">
                <div className="wellbeing-timeline-header">
                    <div>
                        <h2 className="wellbeing-timeline-title">
                            <Icon name="monitoring" size={20} style={{ color: 'var(--c-primario)' }} />
                            <span>Histórico detallado de jornadas</span>
                        </h2>
                        <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: '2px 0 0' }}>
                            Registro ordenado cronológicamente de tus estados autorreportados por turno.
                        </p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--c-texto-mutado)' }}>
                        {checkinRecords.length} {checkinRecords.length === 1 ? 'jornada registrada' : 'jornadas registradas'}
                    </span>
                </div>

                <div id="wellbeingHistory" className="wellbeing-timeline-list">
                    {checkinRecords.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--c-superficie)', borderRadius: 'var(--radius-card, 8px)', border: '1px dashed var(--c-borde)' }}>
                            <Icon name="self_improvement" size={38} style={{ margin: '0 auto 12px', color: 'var(--c-primario)' }} />
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--c-texto)', marginBottom: '4px' }}>
                                Aún no tienes registros de bienestar
                            </h3>
                            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-mutado)', margin: '0 0 10px' }}>
                                Aquí verás las 6 dimensiones de tu último turno
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '0 0 16px', maxWidth: '420px', marginInline: 'auto' }}>
                                Cada check-in diario te ayuda a monitorear tu batería y nivel de tensión entre llamadas en total privacidad.
                            </p>
                            <Link to="/agente/checkin" className="btn btn-primary">
                                <Icon name="favorite" size={16} />
                                <span>Completar mi primer check-in</span>
                            </Link>
                        </div>
                    ) : (
                        checkinRecords.map(rec => (
                            <article key={rec.id} className="wellbeing-timeline-item">
                                <div className="wellbeing-timeline-top">
                                    <div className="wellbeing-timeline-date">
                                        <Icon name="clock" size={16} style={{ color: 'var(--c-primario)' }} />
                                        <span>Jornada del {rec.date}</span>
                                    </div>
                                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                                        {rec.shiftType || 'Turno operativo'}
                                    </span>
                                </div>

                                <div className="wellbeing-dimensions-row">
                                    {DIMENSION_DEFINITIONS.map(dim => {
                                        const score = rec[dim.key];
                                        return (
                                            <div key={dim.key} className="wellbeing-dim-chip">
                                                <span className="wellbeing-dim-name">{dim.label}</span>
                                                <span className="wellbeing-dim-score">
                                                    {score != null ? `${score} / 5` : '—'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
