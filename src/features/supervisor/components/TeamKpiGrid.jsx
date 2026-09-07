// src/features/supervisor/components/TeamKpiGrid.jsx
// Grid de métricas e indicadores colectivos del equipo de trabajo (RF-07 / RF-11)

import { Icon } from '../../../core/components/Icon';

export function TeamKpiGrid({
    energyIndex = 76.2,
    energyDelta = '+2.1% frente a semana previa',
    overloadIndex = 68.5,
    participationRate = '87.5%'
}) {
    return (
        <div className="kpi-grid">
            {/* KPI 1: Energía Agregada */}
            <div className="kpi-card">
                <div className="kpi-label">Índice de Energía Agregado</div>
                <div className="supervisor-kpi-highlight">
                    {energyIndex}
                    <span className="supervisor-kpi-unit">/ 100</span>
                </div>
                <div className="kpi-delta ok">
                    <Icon name="trendingUp" size={16} />
                    <span>{energyDelta}</span>
                </div>
            </div>

            {/* KPI 2: Percepción de Sobrecarga */}
            <div className="kpi-card">
                <div className="kpi-label">Percepción de Sobrecarga</div>
                <div className="supervisor-kpi-highlight" style={{ color: 'var(--c-alerta)' }}>
                    {overloadIndex}
                    <span className="supervisor-kpi-unit">/ 100</span>
                </div>
                <div className="kpi-delta warn">
                    <Icon name="alertTriangle" size={16} />
                    <span>Tendencia por encima del umbral</span>
                </div>
            </div>

            {/* KPI 3: Participación Voluntaria */}
            <div className="kpi-card">
                <div className="kpi-label">Participación voluntaria</div>
                <div className="supervisor-kpi-highlight">
                    {participationRate}
                </div>
                <div className="kpi-delta ok">
                    <Icon name="checkCircle" size={16} />
                    <span>Dato agregado sujeto a C4 y RF-07</span>
                </div>
            </div>
        </div>
    );
}
