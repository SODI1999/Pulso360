import { ruleScopeLabel } from '../../../core/api/ruleContract';
import { env } from '../../../core/config/env';
import { saveRule, fetchRules } from '../services/alertRulesService';
// src/features/sst/pages/AlertRulesPage.jsx
// Configuración, simulación y propuesta de reglas de alertas tempranas (RF-08)

import { useState, useEffect } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { RuleFormCard } from '../components/RuleFormCard';

import '../../../styles/sst.css';

export function AlertRulesPage() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [rules,setRules] = useState([]);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchRules().then(rows => { if(active) { setRules(rows); setError(''); } })
      .catch(e => { if(active) setError(e.response?.data?.error?.message || e.message); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  },[version]);
  const handleSaveRule = async newRule => {
    const result = await saveRule(newRule);
    if (!result.success) { setError(result.error); return result; }
    if (env.useMockStorage) pulsoStore.audit({ actor:user?.name,action:'PROPUESTA_REGLA_ALERTA',target:newRule.sentence });
    setError('');
    setFeedback('Propuesta guardada, pendiente de aprobación administrativa.');
    setVersion(v => v + 1);
    return result;
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración de reglas preventivas</h1>
          <p className="page-subtitle">
            SST propone umbrales y condiciones estadísticas; la activación oficial requiere autorización
            administrativa (RF-08).
          </p>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <Icon name="info" size={20} />
        <div>
          <strong>Gobernanza de Reglas:</strong> La separación de funciones asegura que ninguna regla se
          active unilateralmente. SST propone; el Administrador aprueba tras verificar la
          pertinencia institucional.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {error && <p className="alert-banner danger" role="alert">{error}</p>}
      {loading && <p role="status">Cargando catálogo…</p>}
      {/* Layout en dos columnas: Formulario y Catálogo */}
      <div className="rule-grid-layout">
        <RuleFormCard onSaveRule={handleSaveRule} />

        {/* Catálogo de reglas vigentes y propuestas */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Catálogo de reglas vigentes y propuestas</h2>
              <p className="card-subtitle">
                Semanas de lunes a domingo. La evaluación de cierres comienza el lunes a las 06:00, hora de Bogotá, cuando está habilitada.
              </p>
            </div>
            <span className="badge badge-info">{rules.length} reglas</span>
          </div>

          <div style={{ marginTop: 'var(--space-2)' }}>
            {loading || error ? null : rules.length === 0 ? (
              <p style={{ color: 'var(--c-texto-suave)', fontSize: '13.5px' }}>No hay reglas registradas.</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="rule-list-item">
                  <div className="rule-list-info">
                    <div className="rule-list-title">
                      <strong>{rule.metric}</strong> {rule.operator} {rule.value}{rule.operator?.startsWith('baje') ? '% respecto a la semana anterior' : ' / 100'}
                    </div>
                    <div className="rule-list-meta">
                      Persistencia: {rule.persistence} {rule.unit || 'semanas'} · Ámbito: {ruleScopeLabel(rule.scope, user?.scopes)} ·
                      Severidad: {rule.severity}
                    </div>
                    {!env.useMockStorage && (
                      <div className="rule-eval-status-pill">
                        <Icon name="info" size={12} />
                        <span>
                          {rule.evaluation_supported === false
                            ? 'Sin evaluación automática: condición no estándar.'
                            : rule.evaluation_enabled
                              ? 'Evaluación semanal habilitada (quórum N ≥ 5).'
                              : 'Evaluación periódica administrada por servidor.'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`badge ${rule.active ? 'badge-ok' : 'badge-warn'}`}>
                    {rule.pendingApproval ? 'Pendiente de aprobación' : 'Aprobada'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
