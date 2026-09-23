import { getAgentRecords } from '../services/agentQueries';
// src/features/agent/pages/MyAnalysisPage.jsx
// Historial analítico de factores detectados por clasificador léxico local (RF-05)

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';

import { Icon } from '../../../core/components/Icon';

import '../../../styles/analisis.css';

export function MyAnalysisPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const data = getAgentRecords(currentUser?.id);

  const analyzedJournals = useMemo(() => {
    return (data.journals || []).filter((j) => j.userId === currentUser?.id && j.analysis);
  }, [data.journals, currentUser?.id]);

  return (
    <div className="analysis-editorial-page">
      {/* 1. Barra de Retorno y Acciones Rápidas (Sincronizada con /agente/mi-bienestar y /notificaciones) */}
      <nav className="analysis-top-nav" aria-label="Navegación secundaria">
        <button
          type="button"
          className="analysis-back-btn"
          onClick={() => navigate('/agente/panel')}
          aria-label="Volver al panel principal del agente"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>

        <Link to="/agente/bitacora" className="analysis-action-btn analysis-action-btn--primary">
          <Icon name="edit_note" size={18} />
          <span>Escribir en mi bitácora</span>
        </Link>
      </nav>

      {/* 2. Cabecera Editorial Limpia */}
      <header className="analysis-header">
        <h1 className="analysis-title">Análisis orientativo de mis textos</h1>
        <p className="analysis-subtitle">
          Resultados explicables derivados de tus reflexiones personales en bitácora, disponibles dentro de tu
          espacio de agente.
        </p>
      </header>

      {/* 3. Garantía Institucional de Procesamiento Local */}
      <section className="analysis-scope-banner" aria-label="Garantía de procesamiento local">
        <div className="analysis-scope-icon-wrap" aria-hidden="true">
          <Icon name="shield" size={20} />
        </div>
        <div className="analysis-scope-content">
          <div className="analysis-scope-heading-row">
            <span className="analysis-scope-badge">Procesamiento 100% Local</span>
            <strong className="analysis-scope-title">
              Clasificador léxico determinista en memoria del navegador
            </strong>
          </div>
          <p className="analysis-scope-desc">
            Este clasificador opera <strong>en la memoria de tu dispositivo</strong> mediante concordancia
            determinista de términos clave. En el despliegue actual, tus reflexiones no se envían a servidores
            de IA externos ni a terceros. Los factores identificados son orientativos para tu autorreflexión
            personal; no constituyen un diagnóstico clínico ni una evaluación laboral.
          </p>
        </div>
      </section>

      {/* 4. Histórico de Factores Analizados (Flujo Editorial Continuo - Cero Card-itis) */}
      <section className="analysis-feed-section" aria-label="Histórico de factores analizados">
        <div className="analysis-feed-header">
          <div>
            <h2 className="analysis-feed-title">
              <Icon name="insights" size={18} className="analysis-title-icon" />
              <span>Factores léxicos identificados en tus jornadas</span>
            </h2>
            <p className="analysis-feed-subtitle">
              Términos asociados a sobrecarga, tensión o apoyo detectados en tus notas de bitácora
            </p>
          </div>
        </div>

        <div id="analysisList">
          {analyzedJournals.length === 0 ? (
            <div className="analysis-empty-state">
              <Icon name="insights" size={36} className="analysis-empty-icon" />
              <h3 className="analysis-empty-title">Aún no tienes reflexiones analizadas</h3>
              <p className="analysis-empty-desc">
                Escribe una breve entrada en tu bitácora personal para generar registros orientativos
                explicables.
              </p>
              <Link to="/agente/bitacora" className="btn btn-primary">
                <Icon name="edit_note" size={16} />
                <span>Abrir mi bitácora y redactar entrada</span>
              </Link>
            </div>
          ) : (
            <div className="analysis-entries-list" role="feed">
              {analyzedJournals.map((journal) => {
                const activeCategories =
                  journal.correctedCategories || journal.analysis?.categories?.map((c) => c.name) || [];
                const isCorrected = Boolean(journal.correctedCategories);

                return (
                  <article key={journal.id} className="analysis-entry-item">
                    <div className="analysis-entry-top">
                      <div className="analysis-entry-date-group">
                        <Icon name="clock" size={15} className="analysis-entry-date-icon" />
                        <span>Reflexión de la jornada {journal.date}</span>
                      </div>
                      {isCorrected && (
                        <span className="analysis-entry-adjusted-badge">
                          <Icon name="check" size={12} />
                          <span>Ajustado manualmente por ti</span>
                        </span>
                      )}
                    </div>

                    <div className="analysis-entry-factors-row">
                      <span className="analysis-entry-factors-label">Factores detectados:</span>
                      {activeCategories.length > 0 ? (
                        activeCategories.map((cat) => (
                          <span key={cat} className="analysis-factor-tag">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="analysis-factor-empty-note">
                          Sin señales de alerta léxica registradas
                        </span>
                      )}
                    </div>

                    <div className="analysis-entry-bottom">
                      <span className="analysis-entry-privacy-note">
                        Análisis determinista local · Acceso exclusivo para ti
                      </span>
                      <Link
                        to="/agente/bitacora"
                        className="analysis-entry-action-link"
                        aria-label={`Ver o editar reflexión de ${journal.date} en bitácora`}
                      >
                        <span>Ver o editar en bitácora</span>
                        <Icon name="arrowRight" size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Pie de Confidencialidad Discreto */}
      <footer className="analysis-confidentiality-footer" role="contentinfo">
        <Icon name="shield" size={16} />
        <span>
          <strong>Confidencialidad de bitácora:</strong> Las notas personales y sus factores léxicos son
          privados y de acceso exclusivo para el agente. El sistema nunca expone estas reflexiones ante
          supervisores ni personal de SST.
        </span>
      </footer>
    </div>
  );
}
