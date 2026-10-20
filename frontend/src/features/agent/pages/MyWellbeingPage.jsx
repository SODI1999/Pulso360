// src/features/agent/pages/MyWellbeingPage.jsx
// Visualización del histórico de bienestar personal del agente (RF-11 / Paleta Pulso Calma)
// Inspector somático sobrio, interactivo, libre de slop y sin disclaimers redundantes.

import { Link } from 'react-router-dom';
import { WellbeingHistory } from '../components/WellbeingHistory';
import { useMyWellbeing } from '../hooks/useMyWellbeing';
import { DIMENSION_DEFINITIONS, formatShiftTabDate } from '../services/myWellbeingHelpers';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/bienestar.css';

export function MyWellbeingPage() {
  const {
    loading,
    loadError,
    navigate,
    checkinRecords,
    recentShifts,
    setSelectedShiftId,
    activeShift,
    trendData,
    averageEnergy,
    isViewingLatest,
    handleTabKeyDown
  } = useMyWellbeing();

  if (loading) {
    return <p className="agent-page" role="status">Cargando tus registros de bienestar…</p>;
  }

  if (loadError) {
    return <p className="agent-page alert-banner danger" role="alert">{loadError}</p>;
  }

  // Agrupación en dos columnas limpias: Cuerpo & Vitalidad vs. Operación & Entorno
  const bodyDimensions = DIMENSION_DEFINITIONS.filter((d) => d.group === 'body');
  const operationDimensions = DIMENSION_DEFINITIONS.filter((d) => d.group === 'operation');

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

      {/* 2. Cabecera Editorial Limpia (Sin badges decorativos) */}
      <header className="wellbeing-header">
        <div className="wellbeing-header-main">
          <div>
            <h1 className="wellbeing-title">Mi tendencia personal de bienestar</h1>
            <p className="wellbeing-subtitle">
              Historial somático y ritmo de recuperación en tus turnos operativos. Consulta la evolución de tu vitalidad y compara el desgaste entre jornadas.
            </p>
          </div>
          <Link to="/agente/checkin" className="btn btn-secondary wellbeing-header-btn">
            <Icon name="heartPulse" size={16} />
            <span>Nuevo check-in</span>
          </Link>
        </div>
      </header>

      {/* 3. Nivel 1: Gráfico Interactivo Curvo con Curvatura Bezier, Gradiente y Tooltip */}
      {trendData.labels.length >= 2 && (
        <WellbeingHistory
          recentShifts={recentShifts}
          averageEnergy={averageEnergy}
          selectedShiftId={activeShift.id}
          onSelectShift={setSelectedShiftId}
        />
      )}

      {/* 4. Nivel 2: Inspector Somático de Jornada */}
      <section className="wellbeing-section" aria-labelledby="somatic-matrix-heading">
        <div className="wellbeing-section-header">
          <div className="wellbeing-section-title-wrap">
            <h2 id="somatic-matrix-heading" className="wellbeing-section-title">
              <Icon name="ClipboardList" size={18} aria-hidden="true" />
              <span>Desglose somático por jornada</span>
            </h2>
            <p className="wellbeing-section-desc">
              Selecciona una fecha en el gráfico o en las pestañas para inspeccionar los 6 factores autorreportados en ese turno.
            </p>
          </div>
        </div>

        {checkinRecords.length === 0 ? (
          /* Empty State con Fotografía Documental BPO */
          <div className="wellbeing-empty-state">
            <img
              src="/assets/fotos/bpo-agent-pause-completed.jpg"
              alt="Operadora de Contact Center en su puesto de trabajo serena tras completar su pausa"
              className="wellbeing-empty-photo"
              loading="lazy"
            />
            <div className="wellbeing-empty-content">
              <h3 className="wellbeing-empty-title">Aún no tienes registros de bienestar</h3>
              <p className="wellbeing-empty-desc">
                Cada check-in diario al cierre de turno te permite monitorear tu vitalidad, tensión en llamadas y calidad de descanso a lo largo de las semanas.
              </p>
              <Link to="/agente/checkin" className="btn btn-primary wellbeing-empty-cta">
                <Icon name="heartPulse" size={16} />
                <span>Completar mi primer check-in</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Selector Horizontal Compacto de Turnos Recientes con WAI-ARIA */}
            <div className="wellbeing-shift-selector-wrap">
              <div
                className="wellbeing-shift-selector"
                role="tablist"
                aria-label="Seleccionar jornada para inspección somática"
              >
                {recentShifts.map((shift, idx) => {
                  const isActive = activeShift.id === shift.id;
                  const isLatest = idx === 0;
                  const energyVal = shift.energia;
                  const energyTone = energyVal <= 2 ? 'alert' : energyVal === 3 ? 'warm' : 'calm';

                  return (
                    <button
                      key={shift.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="somatic-panel"
                      id={`tab-${shift.id}`}
                      tabIndex={isActive ? 0 : -1}
                      className={`wellbeing-shift-tab ${isActive ? 'is-active' : ''}`}
                      onClick={() => setSelectedShiftId(shift.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, shift.id)}
                    >
                      <div className="wellbeing-shift-tab-top">
                        <span className="wellbeing-shift-tab-date">
                          {formatShiftTabDate(shift.date, isLatest)}
                        </span>
                        {energyVal != null && (
                          <span className={`wellbeing-shift-tab-pill wellbeing-shift-tab-pill--${energyTone}`}>
                            {energyVal}/5
                          </span>
                        )}
                      </div>
                      <span className="wellbeing-shift-tab-type">{shift.shiftType || 'Turno operativo'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha Activa de la Jornada Inspeccionada */}
            <div id="somatic-panel" role="tabpanel" aria-labelledby={`tab-${activeShift.id}`} className="wellbeing-active-panel">
              <div className="wellbeing-shift-active-meta">
                <div className="wellbeing-shift-active-info">
                  <Icon name="calendar" size={15} aria-hidden="true" />
                  <span>
                    Jornada del {activeShift.date} · {activeShift.shiftType || 'Turno operativo'}
                  </span>
                  {isViewingLatest && (
                    <span className="wellbeing-latest-label">· Más reciente</span>
                  )}
                </div>
              </div>

              {/* Matriz Somática en 2 Columnas Equilibradas */}
              <div className="wellbeing-two-col-grid">
                {/* Columna 1: Cuerpo y Vitalidad */}
                <div className="wellbeing-group-card">
                  <h3 className="wellbeing-group-heading">Cuerpo y vitalidad somática</h3>
                  <div className="wellbeing-dim-list">
                    {bodyDimensions.map((dim) => {
                      const val = activeShift[dim.key];
                      const displayVal = val != null ? val : '–';
                      const hasVal = val != null;
                      const interpretation = dim.evaluator(val);

                      return (
                        <div key={dim.key} className="wellbeing-dim-row">
                          <div className="wellbeing-dim-row-top">
                            <div className="wellbeing-dim-name-wrap">
                              <Icon name={dim.icon} size={15} className="wellbeing-dim-icon" aria-hidden="true" />
                              <span className="wellbeing-dim-label">{dim.label}</span>
                            </div>
                            <div className="wellbeing-dim-values">
                              <span className={`wellbeing-dim-status wellbeing-dim-status--${interpretation.tone}`}>
                                {interpretation.text}
                              </span>
                              <span className="wellbeing-dim-score">
                                <strong>{displayVal}</strong>
                                {hasVal && <span className="wellbeing-dim-score-unit">/5</span>}
                              </span>
                            </div>
                          </div>

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

                          <p className="wellbeing-dim-description">{dim.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna 2: Operación y Entorno */}
                <div className="wellbeing-group-card">
                  <h3 className="wellbeing-group-heading">Operación y soporte de línea</h3>
                  <div className="wellbeing-dim-list">
                    {operationDimensions.map((dim) => {
                      const val = activeShift[dim.key];
                      const displayVal = val != null ? val : '–';
                      const hasVal = val != null;
                      const interpretation = dim.evaluator(val);

                      return (
                        <div key={dim.key} className="wellbeing-dim-row">
                          <div className="wellbeing-dim-row-top">
                            <div className="wellbeing-dim-name-wrap">
                              <Icon name={dim.icon} size={15} className="wellbeing-dim-icon" aria-hidden="true" />
                              <span className="wellbeing-dim-label">{dim.label}</span>
                            </div>
                            <div className="wellbeing-dim-values">
                              <span className={`wellbeing-dim-status wellbeing-dim-status--${interpretation.tone}`}>
                                {interpretation.text}
                              </span>
                              <span className="wellbeing-dim-score">
                                <strong>{displayVal}</strong>
                                {hasVal && <span className="wellbeing-dim-score-unit">/5</span>}
                              </span>
                            </div>
                          </div>

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

                          <p className="wellbeing-dim-description">{dim.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pie Discreto de Ventana */}
              {checkinRecords.length > 7 && (
                <footer className="wellbeing-window-note">
                  <span>
                    Mostrando los <strong>{recentShifts.length} turnos más recientes</strong> de tu ciclo de trabajo. Tienes {checkinRecords.length} jornadas registradas.
                  </span>
                </footer>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
