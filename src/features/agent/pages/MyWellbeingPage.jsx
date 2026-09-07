// src/features/agent/pages/MyWellbeingPage.jsx
// Visualización del histórico de bienestar personal del agente (RF-11)

import { useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

const DIMENSION_DEFINITIONS = [
    ['Energía', 'energia'],
    ['Carga emocional', 'cargaEmocional'],
    ['Recuperación', 'recuperacion'],
    ['Apoyo', 'apoyo'],
    ['Distanciamiento', 'distanciamiento'],
    ['Ineficacia', 'ineficacia']
];

export function MyWellbeingPage() {
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();

    const checkinRecords = useMemo(() => {
        return (data.checkins || []).filter(c => c.userId === currentUser?.id);
    }, [data.checkins, currentUser?.id]);

    const latestCheckin = checkinRecords[0] || {};

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mi tendencia personal</h1>
                    <p className="page-subtitle">
                        Información individual confidencial; no se compara con otras personas ni se comparte con supervisores.
                    </p>
                </div>
            </div>

            {/* Banner Informativo */}
            <div className="alert-banner info" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
                <Icon name="shield" size={20} />
                <div style={{ fontSize: '13.5px', lineHeight: '1.5' }}>
                    <strong>Espacio exclusivo del titular:</strong> Las seis dimensiones de check-in reflejan tu autorreporte en cada jornada.
                </div>
            </div>

            {/* Cuadrícula de KPIs del Último Registro */}
            <div id="wellbeingGrid" className="kpi-grid" style={{ marginBottom: '24px' }}>
                {DIMENSION_DEFINITIONS.map(([label, propKey]) => {
                    const val = latestCheckin[propKey];
                    const displayVal = val != null ? val : 'Sin dato';
                    const suffix = val != null ? ' / 5' : '';

                    return (
                        <div key={propKey} className="kpi-card">
                            <div className="kpi-label">{label}</div>
                            <div className="kpi-value" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--c-texto)' }}>
                                {displayVal}
                                {suffix && <span style={{ fontSize: '13px', color: 'var(--c-texto-mutado)', fontWeight: '400' }}>{suffix}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Histórico Reciente de Check-ins */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Histórico reciente de check-ins</div>
                        <div className="card-subtitle">Últimos registros de bienestar completados en tus jornadas.</div>
                    </div>
                </div>

                <div id="wellbeingHistory" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    {checkinRecords.length === 0 ? (
                        <p style={{ color: 'var(--c-texto-suave)', margin: '16px 0', textAlign: 'center' }}>No tienes registros de check-in previos.</p>
                    ) : (
                        checkinRecords.map(rec => {
                            const formatted = DIMENSION_DEFINITIONS
                                .map(([label, propKey]) => `${label}: ${rec[propKey] ?? '—'}`)
                                .join(' · ');

                            return (
                                <div
                                    key={rec.id}
                                    style={{
                                        padding: '12px 14px',
                                        background: 'var(--c-fondo)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--c-borde-suave)',
                                        fontSize: '13px'
                                    }}
                                >
                                    <strong style={{ color: 'var(--c-primario)' }}>{rec.date}</strong> · <span style={{ color: 'var(--c-texto-suave)' }}>{formatted}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
