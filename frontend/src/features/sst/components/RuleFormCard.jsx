import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
import { ruleScopeLabel } from '../../../core/api/ruleContract';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';
// src/features/sst/components/RuleFormCard.jsx
// Formulario y simulador reactivo para configuración de reglas preventivas de alertas (RF-08)

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

export function RuleFormCard({ onSaveRule }) {
  const [metric, setMetric] = useState('Recuperación agregada');
  const [operator, setOperator] = useState('baje más de');
  const [value, setValue] = useState(15);
  const [persistence, setPersistence] = useState(3);
  const [severity, setSeverity] = useState('Alta');
  const [scope, setScope] = useState('cualquier equipo');
  const [simulationResult, setSimulationResult] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useExpiredFormDraft('rule:new', { metric, operator, value, persistence, severity, scope }, draft => {
    setMetric(draft.metric); setOperator(draft.operator); setValue(draft.value); setPersistence(draft.persistence);
    setSeverity(draft.severity); setScope(draft.scope);
  });
  // Sentencia en lenguaje natural autogenerada
  const condition = operator === 'baje más de' ? `desciende más de ${value}% respecto a la semana anterior` : `supera ${value} / 100`;
  const ruleSentence = `Propuesta: observar si ${metric} ${condition} durante ${persistence} semanas en ${ruleScopeLabel(scope, authService.getCurrentUser()?.scopes)}, con severidad ${severity}; solo con al menos 5 participantes por dimensión y semana.`;

  const handleSimulate = () => {
    setSimulationResult(
      `Demostración con datos de muestra: esta regla habría generado 4 alertas sobre grupos evaluables en los últimos 90 días. No se crean alertas reales durante la simulación.`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const newRule = {
      ...(env.useMockStorage ? { id:`rule-${Date.now()}` } : {}),
      metric,
      operator,
      value: Number(value),
      persistence: Number(persistence),
      unit: 'semanas',
      scope,
      severity,
      active: false,
      pendingApproval: true,
      createdAt: new Date().toISOString().substring(0, 10),
      sentence: ruleSentence
    };

    try { await onSaveRule(newRule); } finally { setSubmitting(false); }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Definir nueva regla preventiva</h2>
          <p className="card-subtitle">
            Propón condiciones para revisión administrativa. Las reglas aprobadas pueden evaluarse cuando la evaluación semanal está habilitada.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rule-builder-form">
        {/* Paso 1: Dimensión Psicosocial */}
        <div className="rule-step-container">
          <div className="rule-step-header">
            <span className="rule-step-number">1</span>
            <div>
              <strong className="rule-step-title">Dimensión psicosocial</strong>
              <span className="rule-step-hint">Variable o factor ocupacional monitoreado</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="ruleMetric">
              Métrica o dimensión observada
            </label>
            <select
              id="ruleMetric"
              className="form-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              <option value="Recuperación agregada">Recuperación agregada</option>
              <option value="Carga emocional agregada">Carga emocional agregada</option>
              <option value="Percepción de ineficacia">Percepción de ineficacia</option>
              <option value="Distanciamiento laboral">Distanciamiento laboral</option>
              <option value="Sobrecarga percibida">Sobrecarga percibida</option>
            </select>
            {metric === 'Sobrecarga percibida' && (
              <p role="note" className="rule-metric-warning">
                Esta métrica aún no tiene una fuente definida y no se evaluará automáticamente.
              </p>
            )}
          </div>
        </div>

        {/* Paso 2: Condición Estadística */}
        <div className="rule-step-container">
          <div className="rule-step-header">
            <span className="rule-step-number">2</span>
            <div>
              <strong className="rule-step-title">Condición y persistencia estadística</strong>
              <span className="rule-step-hint">Criterio temporal para activar la alerta</span>
            </div>
          </div>

          <div className="rule-field-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="ruleOperator">
                Condición
              </label>
              <select
                id="ruleOperator"
                className="form-select"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              >
                <option value="baje más de">Descienda más de</option>
                <option value="supere el">Supere el umbral de</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ruleValue">
                Valor umbral
              </label>
              <input
                id="ruleValue"
                type="number"
                className="form-input"
                value={value}
                min="5"
                max="90"
                onChange={(e) => setValue(e.target.value)}
                required
                aria-describedby="ruleThresholdHelp"
              />
              <p id="ruleThresholdHelp" className="rule-input-hint">
                {operator === 'baje más de'
                  ? 'Porcentaje de caída respecto a la semana anterior.'
                  : 'Umbral sobre la escala de 100 de paneles colectivos.'}
              </p>
            </div>
          </div>

          <div className="rule-field-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="rulePersistence">
                Persistencia temporal
              </label>
              <select
                id="rulePersistence"
                className="form-select"
                value={persistence}
                onChange={(e) => setPersistence(Number(e.target.value))}
              >
                <option value={2}>Durante 2 semanas</option>
                <option value={3}>Durante 3 semanas</option>
                <option value={4}>Durante 4 semanas</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ruleSeverity">
                Severidad resultante
              </label>
              <select
                id="ruleSeverity"
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paso 3: Ámbito Organizacional */}
        <div className="rule-step-container">
          <div className="rule-step-header">
            <span className="rule-step-number">3</span>
            <div>
              <strong className="rule-step-title">Ámbito organizacional</strong>
              <span className="rule-step-hint">Sujeto a la regla de confidencialidad N ≥ 5</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="ruleScope">
              Alcance de la regla
            </label>
            <select
              id="ruleScope"
              className="form-select"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option value="cualquier equipo">Cualquier equipo con N ≥ 5</option>
              {env.useMockStorage ? (
                <>
                  <option value="Campaña Soporte Alpha">Campaña Soporte Alpha</option>
                  <option value="Campaña Retención Beta">Campaña Retención Beta</option>
                </>
              ) : (
                <>
                  <optgroup label="Campañas">
                    {[...new Map((authService.getCurrentUser()?.scopes || []).map(t => [t.campana_id,t.campana_nombre])).entries()]
                      .map(([id,name]) => <option key={id} value={id}>{name}</option>)}
                  </optgroup>
                  <optgroup label="Equipos">
                    {(authService.getCurrentUser()?.scopes || []).map(team =>
                      <option key={team.id} value={team.id}>{team.campana_nombre} · {team.nombre}</option>)}
                  </optgroup>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Vista previa en lenguaje natural */}
        <div className="rule-sentence-box">
          <strong
            style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--c-primario)',
              marginBottom: '4px'
            }}
          >
            Vista previa de la regla:
          </strong>
          &ldquo;{ruleSentence}&rdquo;
        </div>

        {simulationResult && (
          <div className="alert-banner info" style={{ marginBottom: '16px' }}>
            <Icon name="info" size={18} />
            <span>{simulationResult}</span>
          </div>
        )}

        <div className="rule-builder-actions">
          <button type="button" className="btn btn-secondary" onClick={handleSimulate} disabled={!env.useMockStorage}>
            <Icon name="play" size={16} />
            <span>{env.useMockStorage ? 'Simular ejemplo de muestra' : 'Simulación no disponible'}</span>
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Icon name="save" size={16} />
            <span>Proponer regla a Administrador</span>
          </button>
        </div>
      </form>
    </div>
  );
}
