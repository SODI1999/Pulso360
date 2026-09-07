// src/features/sst/components/NewInterventionForm.jsx
// Formulario para registro de planes de acción e intervenciones colectivas (RF-09)

import { useState, useMemo } from 'react';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

const SCOPES = {
  'team-alpha-1': { campaign: 'Campaña Soporte Alpha', team: 'Equipo Alpha 1', n: 14, baseline: 58 },
  'team-alpha-2': { campaign: 'Campaña Soporte Alpha', team: 'Equipo Alpha 2', n: 4, baseline: null },
  'team-beta-2': { campaign: 'Campaña Retención Beta', team: 'Equipo Beta 2', n: 22, baseline: 64 },
  'camp-1': { campaign: 'Campaña Soporte Alpha', team: '', n: 18, baseline: 61 },
  'camp-2': { campaign: 'Campaña Retención Beta', team: '', n: 22, baseline: 64 }
};

export function NewInterventionForm({ onSaveIntervention }) {
  const minThreshold = pulsoStore.get().settings?.umbralMinimo || 5;

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Pausas cognitivas');
  const [scopeKey, setScopeKey] = useState('team-alpha-1');
  const [assignedTo, setAssignedTo] = useState('usr-2');
  const [indicator, setIndicator] = useState('Recuperación agregada');
  const [target, setTarget] = useState('Mejorar recuperación percibida y pausas activas');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d.toISOString().substring(0, 10);
  });
  const [externalAction, setExternalAction] = useState(false);
  const [error, setError] = useState('');

  const currentScope = SCOPES[scopeKey] || SCOPES['team-alpha-1'];
  const isAllowed = currentScope.n >= minThreshold && currentScope.baseline != null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isAllowed) {
      setError(`No es posible crear una intervención medible para este ámbito: cuenta con N=${currentScope.n} (menor al umbral de privacidad N ≥ ${minThreshold}).`);
      return;
    }

    if (!startDate || !endDate || endDate < startDate) {
      setError('Verifica las fechas: la fecha de cierre debe ser posterior a la fecha de inicio.');
      return;
    }

    const newIntervention = {
      id: `int-${Date.now()}`,
      title: title.trim(),
      type,
      campaign: currentScope.campaign,
      team: currentScope.team,
      creator: 'usr-3',
      assignedTo,
      status: 'Planeada',
      startDate,
      endDate,
      indicator,
      baseline: currentScope.baseline,
      after: null,
      progress: 0,
      target: target.trim(),
      externalAction
    };

    onSaveIntervention(newIntervention);

    // Limpiar formulario
    setTitle('');
    setTarget('Mejorar recuperación percibida y pausas activas');
    setExternalAction(false);
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">Registrar nuevo plan de intervención preventiva</h2>
          <p className="card-subtitle">
            Asignación coordinada con supervisión operativa bajo línea base estadística preexistente.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="intervention-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="intTitle">Título de la intervención</label>
            <input
              id="intTitle"
              className="form-input"
              placeholder="Ej: Pausas cognitivas escalonadas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intType">Tipo de intervención</label>
            <select
              id="intType"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Pausas cognitivas">Pausas cognitivas</option>
              <option value="Taller de manejo emocional">Taller de manejo emocional</option>
              <option value="Ajuste de distribución operativa">Ajuste de distribución operativa</option>
              <option value="Revisión de turnos">Revisión de turnos</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intScope">Ámbito destinatario</label>
            <select
              id="intScope"
              className="form-select"
              value={scopeKey}
              onChange={(e) => setScopeKey(e.target.value)}
            >
              <option value="team-alpha-1">Equipo Alpha 1 (N=14)</option>
              <option value="team-alpha-2">Equipo Alpha 2 (N=4 · Protegido)</option>
              <option value="team-beta-2">Equipo Beta 2 (N=22)</option>
              <option value="camp-1">Toda Campaña Alpha (N=18)</option>
              <option value="camp-2">Toda Campaña Beta (N=22)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intIndicator">Indicador objetivo</label>
            <select
              id="intIndicator"
              className="form-select"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
            >
              <option value="Recuperación agregada">Recuperación agregada</option>
              <option value="Carga emocional">Carga emocional</option>
              <option value="Apoyo social">Apoyo social</option>
            </select>
          </div>

          {/* Tarjeta de Línea Base */}
          <div className="baseline-preview-box">
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-texto-suave)', textTransform: 'uppercase' }}>
              Línea Base Calculada
            </div>
            <div className="baseline-score" style={{ color: isAllowed ? 'var(--c-primario)' : 'var(--c-alerta)' }}>
              {isAllowed ? `${currentScope.baseline} / 100` : 'No publicable'}
            </div>
            <div className="baseline-note">
              {isAllowed
                ? 'Calculada automáticamente sobre las últimas 4 semanas.'
                : `Muestra insuficiente (N=${currentScope.n} < ${minThreshold}). Privacidad protegida.`}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intAssignedTo">Responsable operativo</label>
            <select
              id="intAssignedTo"
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="usr-2">Supervisor Operativo (Carlos Mendoza)</option>
              <option value="usr-3">Profesional SST (Directo)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intStartDate">Fecha de inicio</label>
            <input
              id="intStartDate"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intEndDate">Fecha de cierre</label>
            <input
              id="intEndDate"
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" htmlFor="intTarget">Objetivo y meta de la intervención</label>
          <input
            id="intTarget"
            className="form-input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', color: 'var(--c-texto)' }}>
            <input
              type="checkbox"
              checked={externalAction}
              onChange={(e) => setExternalAction(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--c-primario)' }}
            />
            <span>Requiere acciones externas manuales (ej: coordinación logística con operaciones de campaña)</span>
          </label>
        </div>

        {error && (
          <div className="alert-banner warn" style={{ marginBottom: '16px' }}>
            <Icon name="alertTriangle" size={18} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isAllowed}
          style={{ opacity: isAllowed ? 1 : 0.6 }}
        >
          <Icon name="plus" size={16} />
          <span>Crear plan de intervención</span>
        </button>
      </form>
    </div>
  );
}
