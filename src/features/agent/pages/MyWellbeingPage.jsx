// src/features/agent/pages/MyWellbeingPage.jsx
// Visualización del histórico de bienestar personal del agente (RF-11 / Paleta Pulso Calma)
// Rediseñado bajo pulso360-ui-craft: Blueprint 0 (Flujo Editorial Continuo) y Blueprint 1 (Compañero de Turno)
// Inspector Somático de Turno con Ventana Acotada (Cero redundancia, sin scroll infinito).

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { TrendLineChart } from '../../../core/components/TrendLineChart';
import '../../../styles/bienestar.css';

const DIMENSION_DEFINITIONS = [
    {
        key: 'energia',
        label: 'Batería de turno',
        desc: 'Vitalidad y energía disponible durante la operación telefónica y digital',
        evaluator: (val) => {
            if (val == null) return { text: 'Sin registro', tone: 'neutral' };
            if (val <= 2) return { text: 'Batería baja; prioriza descanso', tone: 'alert' };
            if (val === 3) return { text: 'Energía estándar de turno', tone: 'warm' };
            return { text: 'Buena vitalidad y enfoque', tone: 'calm' };
        }
    },
    {
        key: 'cargaEmocional',
        label: 'Tensión por usuarios',
        desc: 'Exigencia emocional en llamadas e interacciones de alta fricción',
        evaluator: (val) => {
            if (val == null) return { text: 'Sin registro', tone: 'neutral' };
            if (val >= 4) return { text: 'Alta tensión acumulada', tone: 'alert' };
            if (val === 3) return { text: 'Fricción moderada', tone: 'warm' };
            return { text: 'Interacciones serenas', tone: 'calm' };
        }
    },
    {
        key: 'recuperacion',
        label: 'Recuperación y descanso',
        desc: 'Calidad de sueño, desconexión fuera de turno y pausas activas',
        evaluator: (val) => {
            if (val == null) return { text: 'Sin registro', tone: 'neutral' };
            if (val <= 2) return { text: 'Recuperación insuficiente', tone: 'alert' };
            if (val === 3) return { text: 'Descanso intermedio', tone: 'warm' };
            return { text: 'Recuperación adecuada', tone: 'calm' };
        }
    },
    {
        key: 'apoyo',
        label: 'Respaldo en línea',
        desc: 'Acompañamiento percibido del equipo, soporte de piso y supervisión',
        evaluator: (val) => {
            if (val == null) return { text: 'Sin registro', tone: 'neutral' };
            if (val <= 2) return { text: 'Sensación de aislamiento', tone: 'alert' };
            if (val === 3) return { text: 'Respaldo regular en línea', tone: 'warm' };
            return { text: 'Excelente acompañamiento', tone: 'calm' };
        }
    },
    {
        key: 'distanciamiento',
        label: 'Piloto automático',
        desc: 'Modo automático o desapego como barrera defensiva ante el cansancio',
        evaluator: (val) => {
            if (val == null) return { text: 'Sin registro', tone: 'neutral' };
            if (val >= 4) return { text: 'Piloto automático por fatiga', tone: 'alert' };
            if (val === 3) return { text: 'Automatismo ocasional', tone: 'warm' };
            return { text: 'Atención presente y conectada', tone: 'calm' };
        }
    },
    {
        key: 'ineficacia',
        label: 'Eficacia y trabas del sistema',
        desc: 'Fluidez de aplicativos, CRM y telefonía frente a trabas operativas',
        evaluator: (val) => {
            if (val == null) return { text: 'Sin registro', tone: 'neutral' };
            if (val >= 4) return { text: 'Alta fricción por fallas técnicas', tone: 'alert' };
            if (val === 3) return { text: 'Fricciones puntuales', tone: 'warm' };
            return { text: 'Sistemas operando con fluidez', tone: 'calm' };
        }
    }
];

const formatShiftTabDate = (dateStr, isLatest) => {
    if (!dateStr) return 'Turno';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const monthName = months[monthIdx] || parts[1];
    return isLatest ? `${day} ${monthName} (Hoy)` : `${day} ${monthName}`;
};

export function MyWellbeingPage() {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const data = pulsoStore.get();

    // 1. Registros del agente actual (orden cronológico inverso: más reciente primero)
    const checkinRecords = useMemo(() => {
        return (data.checkins || []).filter(c => c.userId === currentUser?.id);
    }, [data.checkins, currentUser?.id]);

    // 2. Ventana acotada de la semana operativa (máximo 7 jornadas recientes)
    const recentShifts = useMemo(() => {
        return checkinRecords.slice(0, 7);
    }, [checkinRecords]);

    // 3. Estado de jornada seleccionada para inspección somática
    const [selectedShiftId, setSelectedShiftId] = useState(null);

    const activeShift = useMemo(() => {
        if (selectedShiftId) {
            const found = recentShifts.find(s => s.id === selectedShiftId);
            if (found) return found;
        }
        return recentShifts[0] || {};
    }, [recentShifts, selectedShiftId]);

    // 4. Tendencia de energía del ciclo reciente (autorreportados reales)
    const trendData = useMemo(() => {
        const recent = [...recentShifts].reverse();
        return {
            labels: recent.map((c) => {
                const parts = (c.journeyKey || '').split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : 'Turno';
            }),
            values: recent.map((c) => c.energia ?? c.recuperacion ?? 0)
        };
    }, [recentShifts]);

    const averageEnergy = useMemo(() => {
        if (!trendData.values.length) return 0;
        const sum = trendData.values.reduce((acc, curr) => acc + curr, 0);
        return (sum / trendData.values.length).toFixed(1);
    }, [trendData.values]);

    const isViewingLatest = activeShift.id === recentShifts[0]?.id;

    return (
        <div className="wellbeing-editorial-page">
            {/* 1. Barra de Retorno y Acciones Rápidas */}
            <nav className="wellbeing-top-nav" aria-label="Navegación secundaria">
                <button
                    type="button"
                    className="wellbeing-back-btn"
                    onClick={() => navigate('/agente/panel')}
                    aria-label="Volver al panel principal del agente"
                >
                    <Icon name="arrowLeft" size={16} />
                    <span>Volver al panel</span>
                </button>

                <div className="wellbeing-nav-actions">
                    <Link
                        to="/agente/checkin"
                        className="wellbeing-action-btn wellbeing-action-btn--primary"
                    >
                        <Icon name="edit_note" size={18} />
                        <span>Realizar check-in de turno</span>
                    </Link>
                </div>
            </nav>

            {/* 2. Cabecera Editorial Limpia */}
            <header className="wellbeing-header">
                <h1 className="wellbeing-title">Mi tendencia personal de bienestar</h1>
                <p className="wellbeing-subtitle">
                    Espacio confidencial para revisar tus registros somáticos y el historial de tus turnos. Esta vista es de uso exclusivo personal; tus respuestas individuales no se exponen en la supervisión colectiva ni se comparan con las de otros compañeros.
                </p>
            </header>

            {/* 3. Preámbulo de Autonomía y Privacidad Integrado */}
            <aside className="wellbeing-preamble" aria-label="Garantías de privacidad y alcance">
                <Icon
                    name="kAnonymityShield"
                    size={22}
                    className="wellbeing-preamble-icon"
                    aria-hidden="true"
                />
                <div className="wellbeing-preamble-text">
                    <strong>Garantía de autonomía y privacidad:</strong> Las seis dimensiones reflejan factores operativos y fisiológicos de tu jornada en el Contact Center, no juicios de valor sobre tu persona ni diagnósticos clínicos. Puedes revisar estos registros para reconocer patrones de fatiga a tiempo y decidir cuándo tomar una pausa de recuperación.
                </div>
            </aside>

            {/* 4. Nivel 1: Tendencia de Batería de Turno del Ciclo Reciente */}
            {trendData.labels.length >= 2 && (
                <section className="wellbeing-section" aria-labelledby="trend-heading">
                    <div className="wellbeing-section-header">
                        <div className="wellbeing-section-title-wrap">
                            <h2 id="trend-heading" className="wellbeing-section-title">
                                <Icon name="monitoring" size={18} aria-hidden="true" />
                                <span>Tendencia de energía y batería de turno</span>
                            </h2>
                            <p className="wellbeing-section-desc">
                                Evolución de vitalidad autorreportada en tus turnos recientes.
                            </p>
                        </div>
                        <span className="wellbeing-section-tag">
                            Ciclo de {trendData.labels.length} turnos
                        </span>
                    </div>

                    <div className="wellbeing-trend-canvas-wrap">
                        <TrendLineChart
                            labels={trendData.labels}
                            values={trendData.values}
                            strokeColor="#0f766e"
                            height={190}
                        />
                        <div className="wellbeing-trend-footer">
                            <span>Escala: 1 (Sin batería) a 5 (Plena y enfocado)</span>
                            <span>Promedio registrado en el ciclo: <strong>{averageEnergy} / 5</strong></span>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Nivel 2: Inspector Somático por Jornada (Cero Choque de Títulos, Cero Duplicación) */}
            <section className="wellbeing-section" aria-labelledby="somatic-matrix-heading">
                <div className="wellbeing-section-header">
                    <div className="wellbeing-section-title-wrap">
                        <h2 id="somatic-matrix-heading" className="wellbeing-section-title">
                            <Icon name="self_improvement" size={18} aria-hidden="true" />
                            <span>Detalle somático por jornada</span>
                        </h2>
                        <p className="wellbeing-section-desc">
                            Selecciona una jornada reciente para inspeccionar sus 6 dimensiones somáticas y recomendaciones ergonómicas.
                        </p>
                    </div>
                    {checkinRecords.length > 0 && (
                        <span className="wellbeing-section-tag">
                            {recentShifts.length} {recentShifts.length === 1 ? 'jornada en ventana' : 'jornadas en ventana'}
                        </span>
                    )}
                </div>

                {checkinRecords.length === 0 ? (
                    <div className="wellbeing-empty-state">
                        <Icon
                            name="self_improvement"
                            size={40}
                            className="wellbeing-empty-icon"
                            aria-hidden="true"
                        />
                        <h3 className="wellbeing-empty-title">
                            Aún no tienes registros de bienestar
                        </h3>
                        <p className="wellbeing-empty-desc">
                            Cada check-in diario te ayuda a monitorear tu batería y nivel de tensión entre llamadas en total privacidad. Al completar tu primer registro podrás inspeccionar aquí tus dimensiones somáticas.
                        </p>
                        <Link
                            to="/agente/checkin"
                            className="wellbeing-action-btn wellbeing-action-btn--primary"
                        >
                            <Icon name="edit_note" size={18} />
                            <span>Completar mi primer check-in</span>
                        </Link>
                    </div>
                ) : (
                    <div>
                        {/* Selector Horizontal de Turnos Recientes */}
                        <div className="wellbeing-shift-selector-wrap">
                            <div
                                className="wellbeing-shift-selector"
                                role="tablist"
                                aria-label="Seleccionar jornada para inspección somática"
                            >
                                {recentShifts.map((shift, idx) => {
                                    const isActive = activeShift.id === shift.id;
                                    const isLatest = idx === 0;

                                    return (
                                        <button
                                            key={shift.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive}
                                            aria-controls="somatic-panel"
                                            id={`tab-${shift.id}`}
                                            className={`wellbeing-shift-tab ${isActive ? 'is-active' : ''}`}
                                            onClick={() => setSelectedShiftId(shift.id)}
                                        >
                                            <span className="wellbeing-shift-tab-date">
                                                {formatShiftTabDate(shift.date, isLatest)}
                                            </span>
                                            <span className="wellbeing-shift-tab-type">
                                                {shift.shiftType || 'Turno operativo'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ficha Activa de la Jornada Inspeccionada */}
                        <div
                            id="somatic-panel"
                            role="tabpanel"
                            aria-labelledby={`tab-${activeShift.id}`}
                        >
                            <div className="wellbeing-shift-active-meta">
                                <div className="wellbeing-shift-active-info">
                                    <Icon name="clock" size={16} aria-hidden="true" />
                                    <span>
                                        Jornada del {activeShift.date} · {activeShift.shiftType || 'Turno operativo'}
                                    </span>
                                </div>
                                <span className="wellbeing-section-tag">
                                    {isViewingLatest ? 'Turno más reciente' : 'Registro de archivo'}
                                </span>
                            </div>

                            {/* Matriz Somática Continua de las 6 Dimensiones */}
                            <div id="wellbeingGrid" className="wellbeing-matrix-list" role="list">
                                {DIMENSION_DEFINITIONS.map(dim => {
                                    const val = activeShift[dim.key];
                                    const displayVal = val != null ? val : '–';
                                    const hasVal = val != null;
                                    const interpretation = dim.evaluator(val);

                                    return (
                                        <div key={dim.key} className="wellbeing-matrix-row" role="listitem">
                                            <div className="wellbeing-matrix-info">
                                                <div className="wellbeing-matrix-heading">
                                                    <span className="wellbeing-matrix-name">{dim.label}</span>
                                                </div>
                                                <p className="wellbeing-matrix-desc">{dim.desc}</p>
                                            </div>

                                            <div className="wellbeing-matrix-gauge">
                                                {hasVal && (
                                                    <div
                                                        className="wellbeing-meter-track"
                                                        role="progressbar"
                                                        aria-valuenow={val}
                                                        aria-valuemin={1}
                                                        aria-valuemax={5}
                                                        aria-label={`${dim.label}: ${val} sobre 5`}
                                                    >
                                                        <div
                                                            className={`wellbeing-meter-fill wellbeing-meter-fill--${interpretation.tone}`}
                                                            style={{ width: `${(val / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="wellbeing-matrix-level-hint">
                                                    <span>{interpretation.text}</span>
                                                </div>
                                            </div>

                                            <div className="wellbeing-matrix-score">
                                                <span className="wellbeing-matrix-val">{displayVal}</span>
                                                {hasVal && <span className="wellbeing-matrix-unit">/ 5</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Nota de Ventana Acotada para Prevenir Crecimiento Infinito */}
                            {checkinRecords.length > 7 && (
                                <footer className="wellbeing-window-note">
                                    <span>
                                        Mostrando la ventana operativa de los <strong>{recentShifts.length} turnos más recientes</strong>. Tienes {checkinRecords.length} jornadas registradas en total.
                                    </span>
                                    <span>Almacenamiento local en tu estación</span>
                                </footer>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
