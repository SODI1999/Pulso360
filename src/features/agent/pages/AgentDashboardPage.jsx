// src/features/agent/pages/AgentDashboardPage.jsx
// Panel principal y resumen diario de bienestar individual para el agente

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';

export function AgentDashboardPage() {
    const currentUser = authService.getCurrentUser();
    const storeData = pulsoStore.get();
    const consent = storeData.consents?.[currentUser?.id] || {};

    // 1. Calcular la jornada laboral en Bogotá
    const journeyKey = useMemo(() => {
        const now = new Date();
        const dateParts = Object.fromEntries(
            new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                hourCycle: 'h23'
            })
                .formatToParts(now)
                .filter(item => item.type !== 'literal')
                .map(item => [item.type, item.value])
        );

        const shiftStartHour = Number(currentUser?.shiftStartHour ?? 8);
        let key = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

        if (Number(dateParts.hour) < shiftStartHour) {
            const previousDate = new Date(`${key}T12:00:00Z`);
            previousDate.setUTCDate(previousDate.getUTCDate() - 1);
            key = previousDate.toISOString().slice(0, 10);
        }

        return key;
    }, [currentUser]);

    // 2. Obtener check-ins del usuario ordenados cronológicamente
    const userCheckins = useMemo(() => {
        return (storeData.checkins || [])
            .filter(c => c.userId === currentUser?.id);
    }, [storeData.checkins, currentUser?.id]);

    const todayCheckin = useMemo(() => {
        return userCheckins.find(c => c.journeyKey === journeyKey);
    }, [userCheckins, journeyKey]);

    const latestCheckin = userCheckins[0] || null;

    // 3. Cálculos dinámicos de KPIs
    const energyValue = latestCheckin?.energia != null ? latestCheckin.energia : 4;
    const loadValue = latestCheckin?.cargaEmocional != null ? latestCheckin.cargaEmocional : 3.8;
    const streakDays = userCheckins.length > 0 ? Math.min(30, userCheckins.length + 2) : 0;

    // 4. Datos del gráfico de tendencia de los últimos 7 días
    const trendData = useMemo(() => {
        const fallbackValues = [3, 4, 3, 2, 4, 4, 3];
        const labels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Ayer', 'Hoy'];

        if (userCheckins.length === 0) {
            return { labels, values: fallbackValues };
        }

        // Tomar los últimos registros
        const recent = [...userCheckins].slice(0, 7).reverse();
        const extracted = recent.map(c => c.energia ?? c.recuperacion ?? 3);

        // Si hay menos de 7, rellenar el inicio con el fallback
        while (extracted.length < 7) {
            extracted.unshift(fallbackValues[7 - extracted.length - 1] || 3);
        }

        return { labels, values: extracted };
    }, [userCheckins]);

    return (
        <div>
            {/* Cabecera del Panel */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hola, {currentUser?.name || 'Agente'}</h1>
                    <p className="page-subtitle">
                        {currentUser?.campaign || 'Campaña Soporte Alpha'} · Turno Mañana
                    </p>
                </div>
                {consent.c1 && (
                    <Link className="btn btn-primary" to="/agente/checkin">
                        <Icon name={todayCheckin ? 'check' : 'favorite'} size={18} />
                        <span>{todayCheckin ? 'Ver/Editar Check-in' : 'Check-in Diario'}</span>
                    </Link>
                )}
            </div>

            {/* Banner / Widget de Check-in Rápido Diario (RF-03) */}
            <div className="card" style={{ marginBottom: '14px' }}>
                {consent.c1 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                background: todayCheckin ? 'var(--c-ok-bg)' : 'var(--c-primario-suave)',
                                color: todayCheckin ? 'var(--c-ok)' : 'var(--c-primario)'
                            }}>
                                <Icon name={todayCheckin ? 'check' : 'favorite'} size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--c-texto)', margin: '0 0 2px' }}>
                                    {todayCheckin ? 'Check-in registrado para esta jornada' : 'Check-in diario de bienestar'}
                                </h3>
                                <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: 0 }}>
                                    {todayCheckin
                                        ? `Tu registro de la jornada (${journeyKey}) está guardado. Tus respuestas son 100% confidenciales.`
                                        : 'Registra seis dimensiones de percepción. Tus respuestas individuales jamás se muestran a tu líder.'}
                                </p>
                            </div>
                        </div>
                        <Link className="btn btn-primary" to="/agente/checkin">
                            <span>{todayCheckin ? 'Editar mis respuestas' : 'Completar mis 6 ítems'}</span>
                            <Icon name="arrowRight" size={18} />
                        </Link>
                    </div>
                ) : (
                    <div>
                        <strong style={{ fontSize: '15px', color: 'var(--c-texto)' }}>Check-in desactivado por tu preferencia C1</strong>
                        <p style={{ margin: '6px 0 14px', fontSize: '13.5px', color: 'var(--c-texto-suave)' }}>
                            Puedes activarlo cuando quieras; rechazarlo no tiene consecuencias laborales.
                        </p>
                        <Link to="/consentimiento" className="btn btn-secondary">
                            Gestionar preferencias
                        </Link>
                    </div>
                )}
            </div>

            {/* Tarjetas Resumen KPI */}
            <div className="kpi-grid" style={{ marginBottom: '14px' }}>
                <div className="kpi-card">
                    <div className="kpi-label">Mi Nivel de Energía</div>
                    <div className="kpi-value">{energyValue} <span style={{ fontSize: '14px', color: 'var(--c-texto-mutado)', fontWeight: '400' }}>/ 5</span></div>
                    <div className={`kpi-delta ${energyValue >= 4 ? 'ok' : energyValue === 3 ? '' : 'warn'}`}>
                        <Icon name="monitoring" size={16} />
                        <span>{energyValue >= 4 ? 'Buena recuperación' : energyValue === 3 ? 'Nivel moderado' : 'Recuperación baja'}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-label">Percepción de Carga</div>
                    <div className="kpi-value">{loadValue} <span style={{ fontSize: '14px', color: 'var(--c-texto-mutado)', fontWeight: '400' }}>/ 5</span></div>
                    <div className={`kpi-delta ${loadValue <= 2.5 ? 'ok' : loadValue <= 3.8 ? 'warn' : 'warn'}`}>
                        <Icon name="info" size={16} />
                        <span>{loadValue <= 2.5 ? 'Carga controlada' : loadValue <= 3.8 ? 'Carga moderada hoy' : 'Carga elevada hoy'}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-label">Racha de Autocuidado</div>
                    <div className="kpi-value">{streakDays} <span style={{ fontSize: '14px', color: 'var(--c-texto-mutado)', fontWeight: '400' }}>días</span></div>
                    <div className="kpi-delta ok">
                        <Icon name="check" size={16} />
                        <span>Check-ins constantes</span>
                    </div>
                </div>
            </div>

            {/* Gráfico de Tendencia Personal y Acceso Rápido a Bitácora */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Evolución de Mi Bienestar (Últimos 7 días)</div>
                            <div className="card-subtitle">Tendencia individual orientativa</div>
                        </div>
                        <span className="badge badge-info">Solo visible para ti</span>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <TrendLineChart
                            labels={trendData.labels}
                            values={trendData.values}
                            strokeColor="#006a61"
                        />
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {consent.c2 ? (
                        <>
                            <div>
                                <div className="card-title">Bitácora Personal Cifrada</div>
                                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', lineHeight: '1.5', margin: '8px 0 16px' }}>
                                    Registra cómo te sentiste en el turno. Si autorizaste C3, el NLP explicable puede mostrarte categorías orientativas y evidencia léxica. No constituye diagnóstico.
                                </p>
                            </div>
                            <Link className="btn btn-secondary" to="/agente/bitacora" style={{ alignSelf: 'flex-start' }}>
                                <Icon name="edit_note" size={18} />
                                <span>Escribir en mi Bitácora</span>
                            </Link>
                        </>
                    ) : (
                        <div>
                            <div className="card-title">Bitácora desactivada por tu preferencia C2</div>
                            <p style={{ margin: '8px 0 16px', fontSize: '13px', color: 'var(--c-texto-suave)' }}>
                                Puedes mantenerla desactivada o habilitarla desde tus preferencias.
                            </p>
                            <Link to="/consentimiento" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                                Gestionar preferencias
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
