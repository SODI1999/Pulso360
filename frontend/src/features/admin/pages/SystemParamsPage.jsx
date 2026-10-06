import { PendingAlertRules } from '../components/PendingAlertRules';
import { PolicyAndNlpSettings } from '../components/PolicyAndNlpSettings';
import { SupportParameters } from '../components/SupportParameters';
import { PrivacyParameters } from '../components/PrivacyParameters';
import { useSystemParams } from '../hooks/useSystemParams';

// src/features/admin/pages/SystemParamsPage.jsx
// Módulo de Administración de Parámetros Globales, SLAs y Versiones de Política (RF-15)

import { env } from '../../../core/config/env';
import { Icon } from '../../../core/components/Icon';

import '../../../styles/admin.css';

export function SystemParamsPage() {
  const {
    loading, loadError,
    settings,
    umbralN,
    setUmbralN,
    checkinEditHours,
    setCheckinEditHours,
    minGranularity,
    setMinGranularity,
    auditRetentionYears,
    setAuditRetentionYears,
    slaAlta,
    setSlaAlta,
    slaMedia,
    setSlaMedia,
    slaBaja,
    setSlaBaja,
    slaSolicitudes,
    setSlaSolicitudes,
    justification,
    setJustification,
    paramFeedback,
    paramError,
    newPolicyVersion,
    setNewPolicyVersion,
    policyFeedback,
    newNlpVersion,
    setNewNlpVersion,
    nlpFeedback,
    riskReasons,
    isRisky,
    handleSaveParams,
    handlePublishPolicy,
    handleActivateNlp,
    handleRevertNlp,
    handleApproveRule,
    rules
  } = useSystemParams();

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Parámetros institucionales, SLAs y gobernanza</h1>
          <p className="page-subtitle">
            Configuración global de umbrales confidenciales, tiempos máximos de respuesta, versionado de
            políticas y modelos NLP (RF-15).
          </p>
        </div>
      </div>

      {/* Formulario Principal de Parámetros y SLAs */}
      <form onSubmit={handleSaveParams} className="params-section">
        {!env.useMockStorage && <p role="note">Solo lectura. Esta versión usa k=5 y dos horas de edición. Los SLAs y la granularidad son referencias; la retención no ejecuta borrado automático.</p>}
        <fieldset disabled={!env.useMockStorage} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">1. Parámetros de Privacidad y K-Anonimato</h2>
              <div className="card-subtitle">
                Variables que regulan la agregación y confidencialidad en los módulos de reportería.
              </div>
            </div>
          </div>

          <PrivacyParameters
            umbralN={umbralN}
            setUmbralN={setUmbralN}
            checkinEditHours={checkinEditHours}
            setCheckinEditHours={setCheckinEditHours}
            minGranularity={minGranularity}
            setMinGranularity={setMinGranularity}
            auditRetentionYears={auditRetentionYears}
            setAuditRetentionYears={setAuditRetentionYears}
          />

          {/* Sección SLAs */}
          <div
            style={{
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--c-borde-suave)'
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--c-texto)',
                marginBottom: 'var(--space-3)'
              }}
            >
              2. Acuerdos de Nivel de Servicio (SLAs de Atención)
            </h3>

            <SupportParameters
              slaAlta={slaAlta}
              setSlaAlta={setSlaAlta}
              slaMedia={slaMedia}
              setSlaMedia={setSlaMedia}
              slaBaja={slaBaja}
              setSlaBaja={setSlaBaja}
              slaSolicitudes={slaSolicitudes}
              setSlaSolicitudes={setSlaSolicitudes}
            />
          </div>

          {/* Banner de Riesgo y Justificación Obligatoria */}
          {isRisky && (
            <div className="params-warning-banner">
              <Icon name="alertTriangle" size={20} />
              <div style={{ flex: 1 }}>
                <strong>Atención de Gobernanza:</strong> La configuración propuesta debilita una o más
                protecciones institucionales:
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  {riskReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <label className="form-label" htmlFor="paramJustification">
                    Justificación formal requerida (mínimo 10 caracteres){' '}
                    <span style={{ color: 'var(--c-critico)' }}>*</span>
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
      </fieldset>
      </form>

      {/* Grid de Versionado de Políticas y Modelos NLP */}
      <PolicyAndNlpSettings
        settings={settings}
        handlePublishPolicy={handlePublishPolicy}
        newPolicyVersion={newPolicyVersion}
        setNewPolicyVersion={setNewPolicyVersion}
        policyFeedback={policyFeedback}
        handleActivateNlp={handleActivateNlp}
        newNlpVersion={newNlpVersion}
        setNewNlpVersion={setNewNlpVersion}
        handleRevertNlp={handleRevertNlp}
        nlpFeedback={nlpFeedback}
      />

      {/* Reglas de Alertas Propuestas por SST */}
      <PendingAlertRules rules={rules} handleApproveRule={handleApproveRule} />
    </div>
  );
}
