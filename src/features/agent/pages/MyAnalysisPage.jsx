// src/features/agent/pages/MyAnalysisPage.jsx
// Historial analítico de factores detectados por NLP orientativo (RF-05)

import { useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

export function MyAnalysisPage() {
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();

    const analyzedJournals = useMemo(() => {
        return (data.journals || []).filter(j => j.userId === currentUser?.id && j.analysis);
    }, [data.journals, currentUser?.id]);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Análisis de mis textos</h1>
                    <p className="page-subtitle">
                        Resultados orientativos y explicables derivados de tus entradas de bitácora. Visibles únicamente para ti.
                    </p>
                </div>
            </div>

            {/* Aviso de Alcance no Clínico */}
            <div className="alert-banner info" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
                <Icon name="info" size={20} />
                <div style={{ fontSize: '13.5px', lineHeight: '1.5' }}>
                    <strong>Información no clínica:</strong> Este clasificador léxico identifica patrones de lenguaje para apoyar tu autorreflexión. No emite diagnósticos médicos ni psicológicos.
                </div>
            </div>

            {/* Listado de Entradas Analizadas */}
            <div id="analysisList" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analyzedJournals.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--c-texto-suave)' }}>
                        <Icon name="insights" size={36} style={{ margin: '0 auto 12px', color: 'var(--c-texto-mutado)' }} />
                        <p>No tienes análisis disponibles todavía. Escribe en tu bitácora para generar registros orientativos.</p>
                    </div>
                ) : (
                    analyzedJournals.map(journal => {
                        const activeCategories = journal.correctedCategories || journal.analysis.categories.map(c => c.name);
                        const isCorrected = Boolean(journal.correctedCategories);

                        return (
                            <div
                                key={journal.id}
                                className="card"
                                style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '14px', color: 'var(--c-texto)' }}>{journal.date}</strong>
                                    {isCorrected && (
                                        <span className="badge badge-ok">Corregido por ti</span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {activeCategories.length > 0 ? (
                                        activeCategories.map(cat => (
                                            <span key={cat} className="badge badge-info" style={{ fontSize: '12px', padding: '4px 10px' }}>
                                                {cat}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="badge badge-neutral">Ninguna aplica</span>
                                    )}
                                </div>

                                <p style={{ fontSize: '12px', color: 'var(--c-texto-mutado)', margin: 0 }}>
                                    Modelo {journal.analysis.version} · Este análisis no constituye diagnóstico clínico.
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
