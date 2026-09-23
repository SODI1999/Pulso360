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

  // Sentencia en lenguaje natural autogenerada
  const ruleSentence = `Avísame cuando ${metric} ${operator} ${value}% durante ${persistence} semanas en ${scope}, con severidad ${severity}; solo si el grupo supera el umbral de privacidad (N ≥ 5).`;

  const handleSimulate = () => {
    setSimulationResult(
      `Simulación retrospectiva: esta regla habría generado 4 alertas sobre grupos evaluables en los últimos 90 días. No se crean alertas reales durante la simulación.`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const newRule = {
      id: `rule-${Date.now()}`,
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

    onSaveRule(newRule);
    setSubmitting(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Definir nueva regla preventiva</h2>
          <p className="card-subtitle">
            Configura umbrales estadísticos agregados para activar alertas preventivas automáticas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '14px' }}>
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
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
              Valor umbral (%)
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
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
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

        <div className="form-group" style={{ marginBottom: '16px' }}>
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
            <option value="Campaña Soporte Alpha">Campaña Soporte Alpha</option>
            <option value="Campaña Retención Beta">Campaña Retención Beta</option>
          </select>
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

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={handleSimulate}>
            <Icon name="play" size={16} />
            <span>Simular impacto</span>
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
