import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' | 'slas' | 'governance'

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
    <div className="admin-params-container">
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Parámetros institucionales, SLAs y gobernanza</h1>
          <p className="page-subtitle">
            Configuración global de umbrales confidenciales, tiempos máximos de respuesta, versionado de
            políticas y modelos NLP.
          </p>
        </div>
      </div>

      {/* Navegación por pestañas ejecutivas */}
      <div className="admin-tabs-nav" role="tablist" aria-label="Secciones de configuración de parámetros">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'privacy'}
          className={`admin-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          <Icon name="shield" size={16} />
          <span>Privacidad y K-Anonimato</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'slas'}
          className={`admin-tab-btn ${activeTab === 'slas' ? 'active' : ''}`}
          onClick={() => setActiveTab('slas')}
        >
          <Icon name="clock" size={16} />
          <span>Acuerdos de Nivel de Servicio (SLAs)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'governance'}
          className={`admin-tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          <Icon name="fileText" size={16} />
          <span>Gobernanza NLP y Políticas</span>
          {rules?.filter(r => r.status === 'Propuesta').length > 0 && (
            <span className="badge badge-warn" style={{ fontSize: '11px', padding: '1px 6px' }}>
              {rules.filter(r => r.status === 'Propuesta').length} pendientes
            </span>
          )}
        </button>
      </div>

      {/* Contenido Pestaña 1: Privacidad */}
      {activeTab === 'privacy' && (
        <form onSubmit={handleSaveParams} className="params-section" role="tabpanel" aria-label="Parámetros de Privacidad">
          {!env.useMockStorage && (
            <p role="note" className="alert-banner info" style={{ marginBottom: 'var(--space-4)' }}>
              <Icon name="info" size={16} />
              <span>Solo lectura. Esta versión usa k=5 y dos horas de edición. La retención no ejecuta borrado automático.</span>
            </p>
          )}

          <fieldset disabled={!env.useMockStorage} style={{ border: 0, padding: 0, margin: 0 }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Parámetros de Privacidad y K-Anonimato</h2>
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
                  <span>Guardar Parámetros de Privacidad</span>
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      )}

      {/* Contenido Pestaña 2: SLAs */}
      {activeTab === 'slas' && (
        <form onSubmit={handleSaveParams} className="params-section" role="tabpanel" aria-label="Acuerdos de Nivel de Servicio">
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Acuerdos de Nivel de Servicio (SLAs de Atención)</h2>
                <div className="card-subtitle">
                  Tiempos máximos de respuesta para solicitudes de apoyo emocional, alertas y Habeas Data.
                </div>
              </div>
            </div>

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
                <span>Guardar SLAs de Atención</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Contenido Pestaña 3: Gobernanza NLP y Políticas */}
      {activeTab === 'governance' && (
        <div role="tabpanel" aria-label="Gobernanza NLP y Políticas">
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

          <PendingAlertRules rules={rules} handleApproveRule={handleApproveRule} />
        </div>
      )}
    </div>
  );
}
