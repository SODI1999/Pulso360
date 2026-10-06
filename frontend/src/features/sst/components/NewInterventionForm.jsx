import { useExpiredFormDraft } from '../../../core/auth/useExpiredFormDraft';
// src/features/sst/components/NewInterventionForm.jsx
// Formulario para registro de planes de acción e intervenciones colectivas (RF-09)

import { useState, useMemo, useEffect } from 'react';
import { authService } from '../../../core/auth/authService';
import { bogotaCalendarDate } from '../../../core/time/calendarDate';
import { env } from '../../../core/config/env';
import { fetchSstMetrics } from '../services/sstQueries';

import { Icon } from '../../../core/components/Icon';

const SCOPES = {
  'team-alpha-1': { campaign: 'Campaña Soporte Alpha', team: 'Equipo Alpha 1', campanaId: 'camp-1', equipoId: 'team-alpha-1', n: 14, baseline: 58 },
  'team-alpha-2': { campaign: 'Campaña Soporte Alpha', team: 'Equipo Alpha 2', campanaId: 'camp-1', equipoId: 'team-alpha-2', n: 4, baseline: null },
  'team-beta-2': { campaign: 'Campaña Retención Beta', team: 'Equipo Beta 2', campanaId: 'camp-2', equipoId: 'team-beta-2', n: 22, baseline: 64 },
  'camp-1': { campaign: 'Campaña Soporte Alpha', team: '', campanaId: 'camp-1', equipoId: null, n: 18, baseline: 61 },
  'camp-2': { campaign: 'Campaña Retención Beta', team: '', campanaId: 'camp-2', equipoId: null, n: 22, baseline: 64 }
};

export function NewInterventionForm({ onSaveIntervention, minThreshold }) {
  const user = authService.getCurrentUser();
  const scopes = useMemo(() => {
    if (env.useMockStorage) return SCOPES;
    const result = {};
    for (const scope of user?.scopes || []) {
      result[scope.id] = { campaign:scope.campana_nombre, team:scope.nombre, campanaId:scope.campana_id, equipoId:scope.id };
      result[scope.campana_id] = { campaign:scope.campana_nombre, team:'', campanaId:scope.campana_id, equipoId:null };
    }
    return result;
  }, [user?.scopes]);
  const [measurement,setMeasurement] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Pausas cognitivas');
  const [scopeKey, setScopeKey] = useState(() => Object.keys(scopes)[0] || '');
  const [assignedTo, setAssignedTo] = useState(user?.id || '');
  const [indicator, setIndicator] = useState('Recuperación agregada');
  const [target, setTarget] = useState('Mejorar recuperación percibida y pausas activas');
  const [startDate, setStartDate] = useState(() => bogotaCalendarDate());
  const [endDate, setEndDate] = useState(() => bogotaCalendarDate(new Date(), 28));
  const [externalAction, setExternalAction] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useExpiredFormDraft('intervention:new', { title, type, scopeKey, assignedTo, indicator, target, startDate, endDate, externalAction }, draft => {
    setTitle(draft.title); setType(draft.type); setScopeKey(draft.scopeKey); setAssignedTo(draft.assignedTo);
    setIndicator(draft.indicator); setTarget(draft.target); setStartDate(draft.startDate); setEndDate(draft.endDate);
    setExternalAction(draft.externalAction);
  });
  const scope = scopes[scopeKey] || {};
  const currentScope = env.useMockStorage ? scope : { ...scope, n:measurement?.cohort_count ?? null,
    baseline:measurement?.metrics?.[{'Recuperación agregada':'recuperacion_avg','Carga emocional':'carga_emocional_avg','Apoyo social':'apoyo_avg'}[indicator]] == null ? null
      : Number(measurement.metrics[{'Recuperación agregada':'recuperacion_avg','Carga emocional':'carga_emocional_avg','Apoyo social':'apoyo_avg'}[indicator]])*20 };
  useEffect(() => {
    if (env.useMockStorage || !scope.campanaId) return;
    let active = true; setMeasurement(null); setError('');
    const now = new Date();
    fetchSstMetrics({ campanaId:scope.campanaId,equipoId:scope.equipoId,desde:bogotaCalendarDate(now,-27),hasta:bogotaCalendarDate(now) })
      .then(result => { if (!active) return; if (result.error) setError(result.error); else setMeasurement(result); })
      .catch(error => { if(active) setError(error.message); });
    return () => { active = false; };
  }, [scope.campanaId,scope.equipoId]);
  const isAllowed = currentScope.n >= minThreshold && currentScope.baseline != null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAllowed) {
      setError(
        currentScope.n == null ? 'Espera la consulta del ámbito o reintenta si hubo un error.' : currentScope.n < minThreshold ? `Muestra protegida: N=${currentScope.n} (mínimo ${minThreshold}).` : 'La dimensión seleccionada no tiene una línea base publicable.'
      );
      return;
    }

    if (!startDate || !endDate || endDate < startDate) {
      setError('Verifica las fechas: la fecha de cierre debe ser posterior a la fecha de inicio.');
      return;
    }

    const newIntervention = {
      ...(env.useMockStorage ? { id: `int-${Date.now()}` } : {}),
      title: title.trim(),
      type,
      campaign: currentScope.campaign,
      team: currentScope.team,
      campanaId: currentScope.campanaId,
      equipoId: currentScope.equipoId,
      campana_id: currentScope.campanaId,
      equipo_id: currentScope.equipoId,
      creator: user.id,
      assignedTo,
      status: 'Activa',
      startDate,
      endDate,
      indicator,
      baseline: currentScope.baseline,
      after: null,
      progress: 0,
      target: target.trim(),
      externalAction
    };

    setSubmitting(true);
    let result;
    try { result = await onSaveIntervention(newIntervention); }
    catch (error) { setError(error.message); return; }
    finally { setSubmitting(false); }
    if (!result?.success) { setError(result?.error || 'No se pudo guardar el plan.'); return; }

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
            <label className="form-label" htmlFor="intTitle">
              Título de la intervención
            </label>
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
            <label className="form-label" htmlFor="intType">
              Tipo de intervención
            </label>
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
            <label className="form-label" htmlFor="intScope">
              Ámbito destinatario
            </label>
            <select
              id="intScope"
              className="form-select"
              value={scopeKey}
              onChange={(e) => setScopeKey(e.target.value)}
            >
              {Object.entries(scopes).map(([key, scope]) => <option key={key} value={key}>{scope.campaign}{scope.team ? ' · '+scope.team : ''}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intIndicator">
              Indicador objetivo
            </label>
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
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--c-texto-suave)',
                textTransform: 'uppercase'
              }}
            >
              Línea Base Calculada
            </div>
            <div
              className="baseline-score"
              style={{ color: isAllowed ? 'var(--c-primario)' : 'var(--c-alerta)' }}
            >
              {isAllowed ? `${currentScope.baseline} / 100` : 'No publicable'}
            </div>
            <div className="baseline-note">
              {isAllowed
                ? 'Calculada automáticamente sobre las últimas 4 semanas.'
                : error ? 'No se pudo consultar la línea base.' : currentScope.n == null ? 'Consultando la línea base…' : currentScope.n < minThreshold ? `Muestra insuficiente (N=${currentScope.n} < ${minThreshold}). Privacidad protegida.` : 'La dimensión seleccionada no tiene una línea base publicable.'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intAssignedTo">
              Responsable operativo
            </label>
            <select
              id="intAssignedTo"
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value={user.id}>{user.name} (SST)</option>
              {(user.supervisors || []).filter(s => !currentScope.equipoId || s.team_ids?.includes(currentScope.equipoId)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intStartDate">
              Fecha de inicio
            </label>
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
            <label className="form-label" htmlFor="intEndDate">
              Fecha de cierre
            </label>
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
          <label className="form-label" htmlFor="intTarget">
            Objetivo y meta de la intervención
          </label>
          <input
            id="intTarget"
            className="form-input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13.5px',
              color: 'var(--c-texto)'
            }}
          >
            <input
              type="checkbox"
              checked={externalAction}
              onChange={(e) => setExternalAction(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--c-primario)' }}
            />
            <span>
              Requiere acciones externas manuales (ej: coordinación logística con operaciones de campaña)
            </span>
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
          disabled={!isAllowed || submitting}
          style={{ opacity: isAllowed ? 1 : 0.6 }}
        >
          <Icon name="plus" size={16} />
          <span>Crear plan de intervención</span>
        </button>
      </form>
    </div>
  );
}
