import { useNavigate } from 'react-router-dom';
import { RectificationRequestForm } from '../components/RectificationRequestForm';
import { ConsentPreferencesLink } from '../components/ConsentPreferencesLink';
import { PrivacySummary } from '../components/PrivacySummary';
import { useMyDataPrivacy } from '../hooks/useMyDataPrivacy';

// src/features/agent/pages/MyDataPrivacyPage.jsx
// Panel de Habeas Data, inventario, portabilidad y supresión de datos personales (RF-14 / Ley 1581 de 2012)

import { Icon } from '../../../core/components/Icon';
import { DownloadLink } from '../../../core/components/DownloadLink';
import '../../../styles/agent.css';

export function MyDataPrivacyPage() {
  const navigate = useNavigate();
  const { loading,loadError,
    rectificationText,
    setRectificationText,
    rectificationFeedback,
    suppressionConfirmText,
    setSuppressionConfirmText,
    suppressionFeedback,
    formatDate,
    calculateDateRange,
    summary,
    portabilityFiles,
    handleDownloadPortability,
    handleRectificationSubmit,
    handleSuppressionSubmit,
    isSuppressionConfirmed
  } = useMyDataPrivacy();

  if (loading) return <p role="status">Cargando tus datos…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">{loadError}</p>;
  return (
    <div className="agent-page agent-page--privacy">
      {/* Subnavegación unificada */}
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

      <header className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Aquí controlas tus datos personales</h1>
          <p className="page-subtitle">
            Consulta, rectificación, portabilidad y solicitud de supresión de tus datos personales (Ley 1581 de 2012).
          </p>
        </div>
      </header>

      {/* 1. Inventario de Información Propia */}
      <PrivacySummary summary={summary} calculateDateRange={calculateDateRange} formatDate={formatDate} />

      {/* 2. Consentimientos y Solicitud de Rectificación */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        <ConsentPreferencesLink />

        <RectificationRequestForm
          rectificationText={rectificationText}
          setRectificationText={setRectificationText}
          handleRectificationSubmit={handleRectificationSubmit}
          rectificationFeedback={rectificationFeedback}
        />
      </div>

      {/* 3. Portabilidad de Datos */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">Portabilidad de datos propios</div>
        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 16px' }}>
          Descarga una copia estructurada de los registros asociados a tu cuenta. La descarga se prepara en tu navegador.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <DownloadLink
            className="btn btn-secondary btn-sm"
            content={portabilityFiles.json}
            mimeType="application/json"
            fileName={`${portabilityFiles.fileNameBase}.json`}
            onDownload={() => handleDownloadPortability('json')}
          >
            <Icon name="download" size={15} />
            <span>Descargar JSON estructurado</span>
          </DownloadLink>
          <DownloadLink
            className="btn btn-secondary btn-sm"
            content={portabilityFiles.csv}
            mimeType="text/csv"
            fileName={`${portabilityFiles.fileNameBase}.csv`}
            onDownload={() => handleDownloadPortability('csv')}
          >
            <Icon name="download" size={15} />
            <span>Descargar CSV propio</span>
          </DownloadLink>
        </div>
      </div>

      {/* 4. Solicitud Formal de Supresión */}
      <div style={{ marginTop: '32px', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--c-texto-suave)'
          }}
        >
          Zona de gestión de derechos y supresión
        </span>
        <hr style={{ border: 'none', borderTop: '1px solid var(--c-borde-suave)', margin: '8px 0 16px' }} />
      </div>
      <div className="card" style={{ border: '1px solid var(--c-critico-border)', marginBottom: '24px' }}>
        <div className="card-title" style={{ color: 'var(--c-critico)' }}>
          Solicitud formal de supresión de datos
        </div>
        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 16px' }}>
          Esta acción registra una solicitud para revisión administrativa. El registro del trámite no ejecuta automáticamente la supresión o disociación de datos.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            background: 'var(--c-fondo)',
            padding: '14px',
            borderRadius: 'var(--radius-card, 8px)',
            marginBottom: '16px'
          }}
        >
          <div>
            <strong style={{ fontSize: '12.5px', color: 'var(--c-texto)' }}>Información que puedes solicitar revisar:</strong>
            <ul
              style={{
                fontSize: '12px',
                color: 'var(--c-texto-suave)',
                paddingLeft: '18px',
                marginTop: '6px'
              }}
            >
              <li>Textos de tus bitácoras</li>
              <li>Clasificación NLP vinculada a tus textos</li>
              <li>Tus check-ins y solicitudes de apoyo</li>
            </ul>
          </div>
          <div>
            <strong style={{ fontSize: '12.5px', color: 'var(--c-texto)' }}>
              Datos que conserva el radicado:
            </strong>
            <ul
              style={{
                fontSize: '12px',
                color: 'var(--c-texto-suave)',
                paddingLeft: '18px',
                marginTop: '6px'
              }}
            >
              <li>Tipo de solicitud y nota del titular</li>
              <li>Estado del trámite y fecha de vencimiento</li>
              <li>Respuesta administrativa registrada</li>
            </ul>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '10px' }}>
          Para confirmar, escribe la palabra <strong style={{ color: 'var(--c-critico)' }}>SUPRIMIR</strong>{' '}
          en el siguiente campo:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <input
            className="form-input"
            placeholder="Escribe SUPRIMIR..."
            autoComplete="off"
            value={suppressionConfirmText}
            onChange={(e) => setSuppressionConfirmText(e.target.value)}
            style={{ maxWidth: '240px' }}
          />
          <button
            type="button"
            className="btn btn-danger"
            disabled={!isSuppressionConfirmed}
            onClick={handleSuppressionSubmit}
          >
            <span>Crear solicitud de supresión</span>
          </button>
        </div>

        {suppressionFeedback && (
          <div className="form-feedback info" style={{ marginTop: '12px' }}>
            {suppressionFeedback}
          </div>
        )}
      </div>

      {/* 5. Seguimiento de Solicitudes de Habeas Data */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Seguimiento de mis solicitudes de Habeas Data</div>
            <div className="card-subtitle">
              Los festivos colombianos no están incluidos en el cálculo automático de días hábiles.
            </div>
          </div>
        </div>

        <div
          id="requestTimeline"
          style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}
        >
          {summary.requests.length === 0 ? (
            <p style={{ color: 'var(--c-texto-suave)', margin: '16px 0', textAlign: 'center' }}>
              No tienes solicitudes Habeas Data registradas.
            </p>
          ) : (
            summary.requests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: '14px',
                  background: 'var(--c-fondo)',
                  borderRadius: 'var(--radius-card, 8px)',
                  border: '1px solid var(--c-borde-suave)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>
                    {req.id} · {req.type}
                  </strong>
                  <span className="badge badge-info">{req.status}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)', margin: '4px 0' }}>
                  Radicada: {formatDate(req.createdAt)} · Fecha objetivo: {formatDate(req.deadline)}
                </div>
                {req.note && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--c-texto-suave)',
                      fontStyle: 'italic',
                      marginTop: '4px'
                    }}
                  >
                    Nota: {req.note}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
