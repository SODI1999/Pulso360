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
import { handleTabNavigation } from '../../../core/components/tabNavigation';

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
    rules,
    reload
  } = useSystemParams();

  if (loading) {
    return (
      <div className="admin-params-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Parámetros institucionales, SLAs y gobernanza</h1>
            <p className="page-subtitle">
              Configuración global de umbrales confidenciales, tiempos máximos de respuesta, versionado de
              políticas y modelos NLP.
            </p>
          </div>
        </div>
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando parámetros institucionales del servidor…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-params-container" role="alert">
        <div className="page-header">
          <div>
            <h1 className="page-title">Parámetros institucionales, SLAs y gobernanza</h1>
            <p className="page-subtitle">
              Configuración global de umbrales confidenciales, tiempos máximos de respuesta, versionado de
              políticas y modelos NLP.
            </p>
          </div>
        </div>
        <div
          className="alert-banner danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <span>No se pudieron cargar los datos: {loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          id="params-tab-privacy"
          aria-controls="params-panel-privacy"
          data-tab-value="privacy"
          tabIndex={activeTab === 'privacy' ? 0 : -1}
          onKeyDown={event => handleTabNavigation(event, setActiveTab)}
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
          id="params-tab-slas"
          aria-controls="params-panel-slas"
          data-tab-value="slas"
          tabIndex={activeTab === 'slas' ? 0 : -1}
          onKeyDown={event => handleTabNavigation(event, setActiveTab)}
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
          id="params-tab-governance"
          aria-controls="params-panel-governance"
          data-tab-value="governance"
          tabIndex={activeTab === 'governance' ? 0 : -1}
          onKeyDown={event => handleTabNavigation(event, setActiveTab)}
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
        <form onSubmit={handleSaveParams} className="params-section" role="tabpanel"
          id="params-panel-privacy" aria-labelledby="params-tab-privacy" tabIndex={0}>
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
        <form onSubmit={handleSaveParams} className="params-section" role="tabpanel"
          id="params-panel-slas" aria-labelledby="params-tab-slas" tabIndex={0}>
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
        <div role="tabpanel" id="params-panel-governance" aria-labelledby="params-tab-governance" tabIndex={0}>
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
