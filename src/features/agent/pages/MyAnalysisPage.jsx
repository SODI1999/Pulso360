// src/features/agent/pages/MyAnalysisPage.jsx
// Historial analítico de factores detectados por clasificador léxico local (RF-05 / Paleta Pulso Calma)

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/bitacora.css';
import '../../../styles/agent.css';

export function MyAnalysisPage() {
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();

    const analyzedJournals = useMemo(() => {
        return (data.journals || []).filter(j => j.userId === currentUser?.id && j.analysis);
    }, [data.journals, currentUser?.id]);

    return (
        <div className="agent-page agent-page--analysis">
            {/* Cabecera Editorial Limpia */}
            <header className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title">Análisis orientativo de mis textos</h1>
                    <p className="page-subtitle">
                        Resultados explicables derivados de tus reflexiones personales en bitácora, disponibles dentro de tu espacio de agente.
                    </p>
                </div>
                <Link to="/agente/bitacora" className="btn btn-primary">
                    <Icon name="edit_note" size={18} />
                    <span>Escribir en mi bitácora</span>
                </Link>
            </header>

            {/* Alcance explícito del análisis local */}
            <div
                style={{
                    padding: '18px 20px',
                    backgroundColor: 'var(--c-calma-surface-subtle)',
                    border: '1px solid var(--c-calma-border)',
                    borderRadius: 'var(--radius-card, 8px)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                }}
            >
                <div
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--c-calma-accent-soft)',
                        color: 'var(--c-primario)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Icon name="kAnonymityShield" size={26} />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-ok" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Procesamiento 100% Local en Navegador
                        </span>
                        <strong style={{ fontSize: '13px', color: 'var(--c-calma-text)' }}>
                            Clasificador léxico local — sin envío a servidores externos
                        </strong>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--c-calma-text-muted)', lineHeight: '1.55', margin: 0 }}>
                        Este clasificador léxico de apoyo opera <strong>dentro de la memoria de tu navegador</strong> mediante concordancia determinista de términos. En el despliegue actual, tus reflexiones no se envían a servidores de IA externos. Los factores se muestran en tu espacio de agente y son orientativos para tu autorreflexión; no constituyen un diagnóstico clínico.
                    </p>
                </div>
            </div>

            {/* Listado de Entradas Analizadas */}
            <section aria-label="Histórico de factores analizados">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--c-texto)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon name="insights" size={20} style={{ color: 'var(--c-primario)' }} />
                            <span>Factores léxicos identificados en tus jornadas</span>
                        </h2>
                        <span style={{ fontSize: '12px', color: 'var(--c-texto-mutado)' }}>
                            Términos asociados a sobrecarga, tensión o apoyo detectados en tus notas de bitácora
                        </span>
                    </div>
                </div>

                <div id="analysisList" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 4px' }}>
                    {analyzedJournals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--c-superficie)', borderRadius: 'var(--radius-card, 8px)', border: '1px dashed var(--c-borde)' }}>
                            <Icon name="insights" size={38} style={{ margin: '0 auto 12px', color: 'var(--c-primario)' }} />
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--c-texto)', marginBottom: '6px' }}>
                                Aún no tienes reflexiones analizadas
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '0 0 16px', maxWidth: '420px', marginInline: 'auto' }}>
                                Escribe una breve entrada en tu bitácora personal para generar registros orientativos explicables.
                            </p>
                            <Link to="/agente/bitacora" className="btn btn-primary">
                                <Icon name="edit_note" size={16} />
                                <span>Abrir mi bitácora y redactar entrada</span>
                            </Link>
                        </div>
                    ) : (
                        analyzedJournals.map(journal => {
                            const activeCategories = journal.correctedCategories || journal.analysis.categories.map(c => c.name);
                            const isCorrected = Boolean(journal.correctedCategories);

                            return (
                                <article
                                    key={journal.id}
                                    style={{
                                        padding: '16px 20px',
                                        backgroundColor: 'var(--c-superficie)',
                                        borderRadius: 'var(--radius-card, 8px)',
                                        border: '1px solid var(--c-calma-border-subtle)',
                                        boxShadow: 'var(--shadow-xs)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Icon name="clock" size={16} style={{ color: 'var(--c-primario)' }} />
                                            <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>
                                                Reflexión del {journal.date}
                                            </strong>
                                        </div>
                                        {isCorrected && (
                                            <span className="badge badge-ok">
                                                <Icon name="check" size={12} />
                                                <span>Ajustado manualmente por ti</span>
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)', fontWeight: '600', marginRight: '4px' }}>
                                            Factores detectados:
                                        </span>
                                        {activeCategories.length > 0 ? (
                                            activeCategories.map(cat => (
                                                <span key={cat} className="analysis-chip">
                                                    {cat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                                                Sin factores de alerta léxica
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--c-borde-suave)' }}>
                                        <span style={{ fontSize: '11.5px', color: 'var(--c-texto-mutado)' }}>
                                            Análisis léxico local · Solo visible para ti
                                        </span>
                                        <Link to="/agente/bitacora" style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--c-primario)' }}>
                                            Ver o editar en bitácora &rarr;
                                        </Link>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
