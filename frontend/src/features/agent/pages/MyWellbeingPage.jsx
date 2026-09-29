import { WellbeingHistory } from '../components/WellbeingHistory';
import { useMyWellbeing } from '../hooks/useMyWellbeing';
import { DIMENSION_DEFINITIONS, formatShiftTabDate } from '../services/myWellbeingHelpers';
// src/features/agent/pages/MyWellbeingPage.jsx
// Visualización del histórico de bienestar personal del agente (RF-11 / Paleta Pulso Calma)
// Inspector Somático de Turno con Ventana Acotada (Cero redundancia, sin scroll infinito).

import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';

import '../../../styles/bienestar.css';

export function MyWellbeingPage() {
  const {
    navigate,
    checkinRecords,
    recentShifts,
    setSelectedShiftId,
    activeShift,
    trendData,
    averageEnergy,
    isViewingLatest
  } = useMyWellbeing();

  return (
    <div className="agent-page wellbeing-editorial-page">
      {/* 1. Subnavegación secundaria sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button
          type="button"
          className="agent-back-btn"
          onClick={() => navigate('/agente/panel')}
          aria-label="Volver al panel principal del agente"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* 2. Cabecera Editorial Limpia */}
      <header className="wellbeing-header">
        <div className="wellbeing-header-main">
          <div>
            <h1 className="wellbeing-title">Mi tendencia personal de bienestar</h1>
            <p className="wellbeing-subtitle">
              Historial confidencial de tus registros somáticos y ritmo de turnos. Tus respuestas individuales no se
              exponen en la supervisión colectiva.
            </p>
          </div>
          <Link to="/agente/checkin" className="btn btn-secondary wellbeing-header-btn">
            <Icon name="heartPulse" size={16} />
            <span>Nuevo check-in</span>
          </Link>
        </div>
      </header>

      {/* 4. Nivel 1: Tendencia de Batería de Turno del Ciclo Reciente */}
      {trendData.labels.length >= 2 && (
        <WellbeingHistory trendData={trendData} averageEnergy={averageEnergy} />
      )}

      {/* 5. Nivel 2: Inspector Somático por Jornada (Cero Choque de Títulos, Cero Duplicación) */}
      <section className="wellbeing-section" aria-labelledby="somatic-matrix-heading">
        <div className="wellbeing-section-header">
          <div className="wellbeing-section-title-wrap">
            <h2 id="somatic-matrix-heading" className="wellbeing-section-title">
              <Icon name="activity" size={18} aria-hidden="true" />
              <span>Detalle somático por jornada</span>
            </h2>
            <p className="wellbeing-section-desc">
              Selecciona una jornada reciente para inspeccionar sus 6 dimensiones somáticas y recomendaciones
              ergonómicas.
            </p>
          </div>
        </div>

        {checkinRecords.length === 0 ? (
          <div className="wellbeing-empty-state">
            <Icon name="activity" size={40} className="wellbeing-empty-icon" aria-hidden="true" />
            <h3 className="wellbeing-empty-title">Aún no tienes registros de bienestar</h3>
            <p className="wellbeing-empty-desc">
              Cada check-in diario te ayuda a monitorear tu batería y nivel de tensión entre llamadas en total
              privacidad. Al completar tu primer registro podrás inspeccionar aquí tus dimensiones somáticas.
            </p>
            <Link to="/agente/checkin" className="wellbeing-action-btn wellbeing-action-btn--primary">
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
                      <span className="wellbeing-shift-tab-type">{shift.shiftType || 'Turno operativo'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha Activa de la Jornada Inspeccionada */}
            <div id="somatic-panel" role="tabpanel" aria-labelledby={`tab-${activeShift.id}`}>
              <div className="wellbeing-shift-active-meta">
                <div className="wellbeing-shift-active-info">
                  <Icon name="clock" size={16} aria-hidden="true" />
                  <span>
                    Jornada del {activeShift.date} · {activeShift.shiftType || 'Turno operativo'}
                  </span>
                  {isViewingLatest && (
                    <span className="wellbeing-latest-label">· Más reciente</span>
                  )}
                </div>
              </div>

              {/* Matriz Somática Continua de las 6 Dimensiones */}
              <div id="wellbeingGrid" className="wellbeing-matrix-list" role="list">
                {DIMENSION_DEFINITIONS.map((dim) => {
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
                          <span className={!hasVal ? 'wellbeing-hint-empty' : ''}>{interpretation.text}</span>
                        </div>
                      </div>

                      <div className="wellbeing-matrix-score">
                        <span className={`wellbeing-matrix-val ${!hasVal ? 'wellbeing-matrix-val--empty' : ''}`}>
                          {displayVal}
                        </span>
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
                    Mostrando la ventana operativa de los{' '}
                    <strong>{recentShifts.length} turnos más recientes</strong>. Tienes{' '}
                    {checkinRecords.length} jornadas registradas en total.
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
