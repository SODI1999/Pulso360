// src/features/agent/pages/MyAnalysisPage.jsx
// Historial analítico y temas recurrentes derivados de notas de bitácora privada

import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { env } from '../../../core/config/env';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/analisis.css';

const CATEGORY_ICONS = {
  'Sobrecarga percibida': 'phone',
  'Recuperación insuficiente': 'battery_low',
  'Exigencia emocional': 'shieldAlert',
  'Conflicto de rol': 'sliders',
  'Bajo apoyo organizacional': 'users',
  'Distanciamiento laboral': 'eyeOff',
  'Frustración por métricas operativas': 'lineChart',
  'Percepción de ineficacia': 'alertTriangle'
};

export function MyAnalysisPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [data, setData] = useState(() => getAgentRecords(currentUser?.id));

  const [loadError,setLoadError] = useState('');
  const [loading,setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });
  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && currentUser?.id) {
      fetchAgentRecords(currentUser.id).then((remoteData) => {
        if (mounted && remoteData) setData(remoteData);
      }).catch(error => { if(mounted) setLoadError(error.message); })
        .finally(() => { if(mounted) setLoading(false); });
    }
    return () => { mounted = false; };
  }, [currentUser?.id]);

  const analyzedJournals = useMemo(() => {
    return (data.journals || [])
      .filter((j) => j.userId === currentUser?.id && (j.analysis || j.correctedCategories))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [data.journals, currentUser?.id]);

  const factorSummary = useMemo(() => {
    const counts = {};
    analyzedJournals.forEach((j) => {
      const cats = j.correctedCategories || j.analysis?.categories?.map((c) => c.name) || [];
      cats.forEach((cat) => {
        if (cat !== 'Ninguna aplica') {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [analyzedJournals]);

  if (loading) return <p role="status">Cargando análisis…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">{loadError}</p>;
  return (
    <div className="agent-page analysis-editorial-page">
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

      {/* 2. Cabecera humana y directa */}
      <header className="analysis-header">
        <div className="analysis-header-main">
          <div>
            <h1 className="analysis-title">Temas y factores de mis turnos</h1>
            <p className="analysis-subtitle">
              Revisa qué situaciones operativas y factores de apoyo se han presentado en tus notas privadas de bitácora.
            </p>
          </div>
          <Link to="/agente/bitacora" className="btn btn-secondary analysis-header-btn">
            <Icon name="feather" size={16} />
            <span>Ir a mi bitácora</span>
          </Link>
        </div>
      </header>

      {/* 3. Garantía de privacidad sobria (sin badge estridente ni triple redundancia) */}
      <section className="agent-notice agent-notice--flat analysis-privacy-notice" aria-label="Garantía de privacidad">
        <Icon name="shieldCheck" size={18} className="agent-notice-icon" />
        <div className="agent-notice-text">
          <strong>Espacio personal y procesamiento local:</strong> La clasificación se calcula en tu dispositivo y su resultado se guarda con tu entrada privada. Es confidencial para tu autorreflexión y no se comparte con supervisión ni SST.
        </div>
      </section>

      {/* 4. Síntesis de factores recurrentes ("De un vistazo") */}
      {analyzedJournals.length > 0 && factorSummary.length > 0 && (
        <section className="analysis-summary-section" aria-label="Factores más frecuentes en tus notas recientes">
          <div className="analysis-summary-head">
            <Icon name="compass" size={16} className="analysis-summary-icon" />
            <h2 className="analysis-summary-title">Factores más presentes en tus notas recientes</h2>
          </div>
          <div className="analysis-summary-grid">
            {factorSummary.map(({ name, count }) => (
              <div key={name} className="analysis-summary-card">
                <div className="analysis-summary-card-icon">
                  <Icon name={CATEGORY_ICONS[name] || 'sliders'} size={15} />
                </div>
                <div className="analysis-summary-card-body">
                  <span className="analysis-summary-card-name">{name}</span>
                  <span className="analysis-summary-card-count">
                    Presente en {count} {count === 1 ? 'jornada' : 'jornadas'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Histórico cronológico de jornadas analizadas */}
      <section className="analysis-feed-section" aria-label="Histórico de reflexiones analizadas">
        <div className="analysis-feed-header">
          <div>
            <h2 className="analysis-feed-title">
              <Icon name="clock" size={17} className="analysis-title-icon" />
              <span>Jornadas con reflexión analizada ({analyzedJournals.length})</span>
            </h2>
            <p className="analysis-feed-subtitle">
              Detalle cronológico de factores y términos orientativos identificados en cada nota
            </p>
          </div>
        </div>

        <div id="analysisList">
          {analyzedJournals.length === 0 ? (
            <div className="analysis-empty-state">
              <Icon name="feather" size={36} className="analysis-empty-icon" />
              <h3 className="analysis-empty-title">Aún no tienes notas analizadas en bitácora</h3>
              <p className="analysis-empty-desc">
                Escribe una breve reflexión en tu bitácora personal durante o al finalizar tu turno para reconocer señales de sobrecarga y apoyo.
              </p>
              <Link to="/agente/bitacora" className="btn btn-primary">
                <Icon name="edit_note" size={16} />
                <span>Escribir en mi bitácora</span>
              </Link>
            </div>
          ) : (
            <div className="analysis-entries-list" role="feed">
              {analyzedJournals.map((journal) => {
                const activeCategories =
                  journal.correctedCategories || journal.analysis?.categories?.map((c) => c.name) || [];
                const validCategories = activeCategories.filter((cat) => cat !== 'Ninguna aplica');
                const uniqueEvidence = [
                  ...new Set((journal.analysis?.categories || []).flatMap((c) => c.evidence || []))
                ];
                const isCorrected = Boolean(journal.correctedCategories);

                return (
                  <article key={journal.id} className="analysis-entry-item">
                    <div className="analysis-entry-top">
                      <div className="analysis-entry-meta">
                        <span className="analysis-entry-date">Jornada {journal.date}</span>
                        {journal.contextTag && (
                          <span className="analysis-entry-context-tag">
                            {journal.contextTag}
                          </span>
                        )}
                      </div>
                      {isCorrected && (
                        <span className="analysis-entry-adjusted-badge">
                          <Icon name="check" size={12} />
                          <span>Ajustado por ti</span>
                        </span>
                      )}
                    </div>

                    {/* Extracto sutil de la nota si tiene texto */}
                    {journal.text && (
                      <blockquote className="analysis-entry-snippet">
                        &ldquo;{journal.text.length > 180 ? `${journal.text.slice(0, 180)}…` : journal.text}&rdquo;
                      </blockquote>
                    )}

                    {/* Factores detectados con radio contenido e icono semántico */}
                    <div className="analysis-entry-factors-row">
                      <span className="analysis-entry-factors-label">Factores identificados:</span>
                      <div className="analysis-entry-chips">
                        {validCategories.length > 0 ? (
                          validCategories.map((cat) => (
                            <span key={cat} className="analysis-factor-badge">
                              <Icon name={CATEGORY_ICONS[cat] || 'sliders'} size={13} />
                              <span>{cat}</span>
                            </span>
                          ))
                        ) : (
                          <span className="analysis-factor-empty-note">
                            No se identificaron patrones de sobrecarga o tensión en este registro
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Términos de la nota: texto tipo hashtag sin badge */}
                    {uniqueEvidence.length > 0 && (
                      <div className="analysis-entry-evidence-row">
                        <span className="analysis-entry-evidence-label">Términos guía:</span>
                        <div className="analysis-entry-terms">
                          {uniqueEvidence.map((term) => (
                            <span key={term} className="analysis-term-hash">
                              #{term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="analysis-entry-bottom">
                      <Link
                        to="/agente/bitacora"
                        className="analysis-entry-action-link"
                        aria-label={`Ver o editar nota del ${journal.date} en bitácora`}
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
    </div>
  );
}
