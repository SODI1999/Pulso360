// src/features/admin/pages/SystemParamsPage.jsx
// Módulo de Administración de Parámetros Globales, SLAs y Versiones de Política (RF-15)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

import '../../../styles/admin.css';

export function SystemParamsPage() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);

  // Almacén
  const storeData = useMemo(() => pulsoStore.get(), [version]);
  const settings = storeData.settings || {};

  // Estados locales de formularios
  const [umbralN, setUmbralN] = useState(settings.umbralMinimo || 5);
  const [checkinEditHours, setCheckinEditHours] = useState(settings.checkinEditHours || 2);
  const [minGranularity, setMinGranularity] = useState(settings.minGranularity || 'semanal');
  const [auditRetentionYears, setAuditRetentionYears] = useState(settings.auditRetentionYears || 5);

  const [slaAlta, setSlaAlta] = useState(settings.slaAltaHoras || 24);
  const [slaMedia, setSlaMedia] = useState(settings.slaMediaHoras || 48);
  const [slaBaja, setSlaBaja] = useState(settings.slaBajaHoras || 72);
  const [slaSolicitudes, setSlaSolicitudes] = useState(settings.slaSolicitudesHoras || 24);

  const [justification, setJustification] = useState('');
  const [paramFeedback, setParamFeedback] = useState('');
  const [paramError, setParamError] = useState('');

  // Estados de versionado
  const [newPolicyVersion, setNewPolicyVersion] = useState('');
  const [policyFeedback, setPolicyFeedback] = useState('');
  const [newNlpVersion, setNewNlpVersion] = useState('');
  const [nlpFeedback, setNlpFeedback] = useState('');

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Detección reactiva de debilitamiento de protecciones institucionales
  const riskReasons = useMemo(() => {
    const reasons = [];
    if (Number(umbralN) < 5) reasons.push(`Umbral N inferior al estándar institucional (N=${umbralN} < 5)`);
    if (Number(auditRetentionYears) < 5) reasons.push(`Retención de auditoría reducida (${auditRetentionYears} años < 5)`);
    if (Number(checkinEditHours) > 2) reasons.push(`Ventana de edición extendida (${checkinEditHours}h > 2h base)`);
    if (Number(slaAlta) > 24) reasons.push(`SLA Alta dilatado (${slaAlta}h > 24h)`);
    if (Number(slaMedia) > 48) reasons.push(`SLA Media dilatado (${slaMedia}h > 48h)`);
    if (Number(slaBaja) > 72) reasons.push(`SLA Baja dilatado (${slaBaja}h > 72h)`);
    if (Number(slaSolicitudes) > 24) reasons.push(`SLA Solicitudes dilatado (${slaSolicitudes}h > 24h)`);
    return reasons;
  }, [umbralN, auditRetentionYears, checkinEditHours, slaAlta, slaMedia, slaBaja, slaSolicitudes]);

  const isRisky = riskReasons.length > 0;

  // Guardado de Parámetros y SLAs
  const handleSaveParams = (e) => {
    e.preventDefault();
    setParamError('');
    setParamFeedback('');

    const parsedN = Number(umbralN);
    const parsedAudit = Number(auditRetentionYears);
    const parsedAlta = Number(slaAlta);
    const parsedMedia = Number(slaMedia);
    const parsedBaja = Number(slaBaja);
    const parsedSol = Number(slaSolicitudes);

    if (parsedN < 3) {
      setParamError('El umbral N no puede ser inferior al mínimo legal de 3 integrantes.');
      return;
    }

    if (parsedAudit < 5) {
      setParamError('La retención de auditoría debe ser de al menos 5 años según la normativa legal.');
      return;
    }

    if (parsedAlta < 1 || parsedMedia < 1 || parsedBaja < 1 || parsedSol < 1) {
      setParamError('Los tiempos de atención SLA deben ser de al menos 1 hora hábil.');
      return;
    }

    if (isRisky && justification.trim().length < 10) {
      setParamError('Esta configuración debilita parámetros base o dilata SLAs. Debes ingresar una justificación formal de al menos 10 caracteres.');
      return;
    }

    const data = pulsoStore.get();
    data.settings = data.settings || {};
    data.settings.umbralMinimo = parsedN;
    data.settings.checkinEditHours = Number(checkinEditHours);
    data.settings.minGranularity = minGranularity;
    data.settings.auditRetentionYears = parsedAudit;
    data.settings.slaAltaHoras = parsedAlta;
    data.settings.slaMediaHoras = parsedMedia;
    data.settings.slaBajaHoras = parsedBaja;
    data.settings.slaSolicitudesHoras = parsedSol;

    pulsoStore.save(data);

    const justificationText = justification.trim() || 'Ajuste operativo estándar';
    pulsoStore.audit({
      actor: actorLabel,
      action: 'MODIFICACION_PARAMETROS_SISTEMA',
      target: `N=${parsedN}; Granularidad=${minGranularity}; Retención=${parsedAudit}a; SLAs(Alta=${parsedAlta}h, Media=${parsedMedia}h, Baja=${parsedBaja}h, Sol=${parsedSol}h) · Justificación: ${justificationText}`
    });

    setParamFeedback('Parámetros y SLAs guardados y registrados en la cadena de auditoría.');
    setJustification('');
    setVersion((v) => v + 1);
  };

  // Publicación de nueva política (RF-15)
  const handlePublishPolicy = (e) => {
    e.preventDefault();
    setPolicyFeedback('');
    const v = newPolicyVersion.trim();

    if (!/^v\d+\.\d+$/.test(v)) {
      alert('Formato de versión inválido. Usa el estándar "v2.5".');
      return;
    }

    const data = pulsoStore.get();
    data.settings = data.settings || {};
    data.settings.policyVersions = data.settings.policyVersions || [];

    if (!data.settings.policyVersions.includes(v)) {
      data.settings.policyVersions.push(v);
    }

    data.settings.policyVersion = v;
    data.settings.policyEffectiveDate = new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date());

    // Generar notificación a los agentes para re-consentimiento obligatorio
    data.notifications = data.notifications || [];
    data.notifications.unshift({
      id: `not-${Date.now()}`,
      role: 'agente',
      title: `Nueva versión de política de datos (${v})`,
      context: 'Debes revisar y actualizar tus consentimientos para continuar interactuando con módulos protegidos.',
      date: new Date().toISOString(),
      read: false,
      href: '/consentimiento'
    });

    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'PUBLICACION_POLITICA',
      target: `Versión ${v} publicada. Se requiere re-consentimiento de titulares.`
    });

    setPolicyFeedback(`Política ${v} publicada con éxito. Notificación enviada a todos los agentes.`);
    setNewPolicyVersion('');
    setVersion((v) => v + 1);
  };

  // Activación de nuevo léxico NLP (RF-15)
  const handleActivateNlp = (e) => {
    e.preventDefault();
    setNlpFeedback('');
    const v = newNlpVersion.trim();

    if (!/^lexico-v\d+\.\d+$/.test(v)) {
      alert('Formato inválido. Usa el estándar "lexico-v1.3".');
      return;
    }

    const data = pulsoStore.get();
    data.settings = data.settings || {};
    data.settings.nlpVersions = data.settings.nlpVersions || [];

    if (!data.settings.nlpVersions.includes(v)) {
      data.settings.nlpVersions.push(v);
    }

    data.settings.nlpVersion = v;
    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'ACTIVACION_LEXICO_NLP',
      target: `Modelo activo: ${v}`
    });

    setNlpFeedback(`Léxico ${v} activado correctamente. Análisis de bitácoras actualizado.`);
    setNewNlpVersion('');
    setVersion((v) => v + 1);
  };

  // Reversión de modelo NLP
  const handleRevertNlp = () => {
    const data = pulsoStore.get();
    const versions = data.settings?.nlpVersions || [];
    const currentIndex = versions.indexOf(data.settings?.nlpVersion);

    if (currentIndex <= 0) {
      alert('No hay una versión previa registrada a la cual revertir.');
      return;
    }

    const prevVersion = versions[currentIndex - 1];
    data.settings.nlpVersion = prevVersion;
    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'REVERSION_LEXICO_NLP',
      target: `Revertido a versión: ${prevVersion}`
    });

    setNlpFeedback(`Modelo léxico revertido a la versión previa: ${prevVersion}.`);
    setVersion((v) => v + 1);
  };

  // Aprobación de Regla de Alerta SST
  const handleApproveRule = (ruleId) => {
    const data = pulsoStore.get();
    const rule = (data.rules || []).find((r) => r.id === ruleId);
    if (!rule) return;

    rule.active = true;
    rule.pendingApproval = false;
    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'APROBACION_REGLA_ALERTA',
      target: `${rule.id} (${rule.metric} ${rule.operator} ${rule.value}%) aprobada y activada`
    });

    setVersion((v) => v + 1);
  };

  const rules = storeData.rules || [];

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Parámetros institucionales, SLAs y gobernanza</h1>
          <p className="page-subtitle">
            Configuración global de umbrales confidenciales, tiempos máximos de respuesta, versionado de políticas y modelos NLP (RF-15).
          </p>
        </div>
      </div>

      {/* Formulario Principal de Parámetros y SLAs */}
      <form onSubmit={handleSaveParams} className="params-section">
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">1. Parámetros de Privacidad y K-Anonimato</h2>
              <div className="card-subtitle">Variables que regulan la agregación y confidencialidad en los módulos de reportería.</div>
            </div>
          </div>

          <div className="params-grid-4">
            <div className="form-group">
              <label className="form-label" htmlFor="paramUmbralN">
                Umbral mínimo N (k-anonimato)
              </label>
              <input
                id="paramUmbralN"
                type="number"
                min="3"
                max="50"
                className="form-input"
                value={umbralN}
                onChange={(e) => setUmbralN(e.target.value)}
              />
              <span className="form-hint">Mínimo legal: 3. Estándar institucional: 5.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paramEditWindow">
                Ventana de edición check-in (horas)
              </label>
              <input
                id="paramEditWindow"
                type="number"
                min="1"
                max="24"
                className="form-input"
                value={checkinEditHours}
                onChange={(e) => setCheckinEditHours(e.target.value)}
              />
              <span className="form-hint">Base: 2 horas desde el registro inicial.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paramGranularity">
                Granularidad temporal mínima
              </label>
              <select
                id="paramGranularity"
                className="form-select"
                value={minGranularity}
                onChange={(e) => setMinGranularity(e.target.value)}
              >
                <option value="semanal">Semanal (Estándar)</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              <span className="form-hint">Evita correlaciones por turnos diarios.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paramAuditRetention">
                Retención de auditoría (años)
              </label>
              <input
                id="paramAuditRetention"
                type="number"
                min="5"
                max="20"
                className="form-input"
                value={auditRetentionYears}
                onChange={(e) => setAuditRetentionYears(e.target.value)}
              />
              <span className="form-hint">Mínimo obligatorio: 5 años.</span>
            </div>
          </div>

          {/* Sección SLAs */}
          <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--c-borde-suave)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-texto)', marginBottom: 'var(--space-3)' }}>
              2. Acuerdos de Nivel de Servicio (SLAs de Atención)
            </h3>

            <div className="params-grid-4">
              <div className="form-group">
                <label className="form-label" htmlFor="slaAlta">
                  Alerta Severidad Alta (horas)
                </label>
                <input
                  id="slaAlta"
                  type="number"
                  min="1"
                  max="168"
                  className="form-input"
                  value={slaAlta}
                  onChange={(e) => setSlaAlta(e.target.value)}
                />
                <span className="form-hint">Estándar: 24 horas hábiles.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="slaMedia">
                  Alerta Severidad Media (horas)
                </label>
                <input
                  id="slaMedia"
                  type="number"
                  min="1"
                  max="168"
                  className="form-input"
                  value={slaMedia}
                  onChange={(e) => setSlaMedia(e.target.value)}
                />
                <span className="form-hint">Estándar: 48 horas hábiles.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="slaBaja">
                  Alerta Severidad Baja (horas)
                </label>
                <input
                  id="slaBaja"
                  type="number"
                  min="1"
                  max="168"
                  className="form-input"
                  value={slaBaja}
                  onChange={(e) => setSlaBaja(e.target.value)}
                />
                <span className="form-hint">Estándar: 72 horas hábiles.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="slaSol">
                  Solicitudes / Habeas Data (horas)
                </label>
                <input
                  id="slaSol"
                  type="number"
                  min="1"
                  max="168"
                  className="form-input"
                  value={slaSolicitudes}
                  onChange={(e) => setSlaSolicitudes(e.target.value)}
                />
                <span className="form-hint">Estándar: 24 horas hábiles.</span>
              </div>
            </div>
          </div>

          {/* Banner de Riesgo y Justificación Obligatoria */}
          {isRisky && (
            <div className="params-warning-banner">
              <Icon name="alertTriangle" size={20} />
              <div style={{ flex: 1 }}>
                <strong>Atención de Gobernanza:</strong> La configuración propuesta debilita una o más protecciones institucionales:
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  {riskReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <label className="form-label" htmlFor="paramJustification">
                    Justificación formal requerida (mínimo 10 caracteres) <span style={{ color: 'var(--c-critico)' }}>*</span>
                  </label>
                  <textarea
                    id="paramJustification"
                    className="form-textarea"
                    rows={2}
                    placeholder="Describe el motivo técnico u operativo por el cual se modifican los parámetros base..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {paramError && (
            <div className="alert-banner danger" style={{ marginTop: 'var(--space-3)' }}>
              <Icon name="alertTriangle" size={16} />
              <span>{paramError}</span>
            </div>
          )}

          {paramFeedback && (
            <div className="alert-banner ok" role="status" style={{ marginTop: 'var(--space-3)' }}>
              <Icon name="checkCircle" size={16} />
              <span>{paramFeedback}</span>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <Icon name="save" size={16} />
              <span>Guardar Parámetros y SLAs</span>
            </button>
          </div>
        </div>
      </form>

      {/* Grid de Versionado de Políticas y Modelos NLP */}
      <div className="params-grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Políticas de Tratamiento */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Versiones de Política de Privacidad</h2>
              <div className="card-subtitle">Publicación de términos y re-consentimiento obligatorio (RF-15).</div>
            </div>
          </div>

          <div className="version-badges-list">
            {(settings.policyVersions || [settings.policyVersion]).map((v) => {
              const isCurrent = v === settings.policyVersion;
              return (
                <span
                  key={v}
                  className={`badge ${isCurrent ? 'badge-ok' : 'badge-neutral'}`}
                >
                  {isCurrent ? `${v} · Vigente` : v}
                </span>
              );
            })}
          </div>

          <form onSubmit={handlePublishPolicy}>
            <div className="version-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Ej. v2.5"
                value={newPolicyVersion}
                onChange={(e) => setNewPolicyVersion(e.target.value)}
                style={{ maxWidth: '140px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Icon name="policy" size={14} />
                <span>Publicar versión</span>
              </button>
            </div>
          </form>

          {policyFeedback && (
            <div className="alert-banner ok" role="status" style={{ marginTop: 'var(--space-3)' }}>
              <Icon name="checkCircle" size={16} />
              <span>{policyFeedback}</span>
            </div>
          )}
        </div>

        {/* Modelos de Léxico NLP */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Versiones de Léxico NLP</h2>
              <div className="card-subtitle">Control de modelos de análisis semántico para bitácoras (RF-15).</div>
            </div>
          </div>

          <div className="version-badges-list">
            {(settings.nlpVersions || [settings.nlpVersion]).map((v) => {
              const isCurrent = v === settings.nlpVersion;
              return (
                <span
                  key={v}
                  className={`badge ${isCurrent ? 'badge-ok' : 'badge-neutral'}`}
                >
                  {isCurrent ? `${v} · Activo` : v}
                </span>
              );
            })}
          </div>

          <form onSubmit={handleActivateNlp}>
            <div className="version-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Ej. lexico-v1.3"
                value={newNlpVersion}
                onChange={(e) => setNewNlpVersion(e.target.value)}
                style={{ maxWidth: '160px' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <span>Activar modelo</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRevertNlp}
              >
                <span>Revertir</span>
              </button>
            </div>
          </form>

          {nlpFeedback && (
            <div className="alert-banner ok" role="status" style={{ marginTop: 'var(--space-3)' }}>
              <Icon name="checkCircle" size={16} />
              <span>{nlpFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reglas de Alertas Propuestas por SST */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Aprobación Institucional de Reglas de Alerta</h2>
            <div className="card-subtitle">Reglas automáticas propuestas por el equipo de SST pendientes de activación (RF-15).</div>
          </div>
        </div>

        {rules.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
            No hay reglas de alertas configuradas en la plataforma.
          </p>
        ) : (
          rules.map((r) => {
            const isPending = r.pendingApproval || !r.active;

            return (
              <div key={r.id} className="rule-approval-card">
                <div>
                  <strong>{r.metric}</strong> {r.operator} <strong>{r.value}%</strong> durante {r.persistence} {r.unit} · Ámbito: <em>{r.scope}</em> ({r.severity})
                </div>

                <div>
                  {isPending ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApproveRule(r.id)}
                    >
                      <Icon name="check" size={14} />
                      <span>Aprobar y activar</span>
                    </button>
                  ) : (
                    <span className="badge badge-ok">Activa en producción</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
