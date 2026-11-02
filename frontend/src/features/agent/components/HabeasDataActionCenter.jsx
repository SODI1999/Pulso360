import { Icon } from '../../../core/components/Icon';
import { useEffect, useRef } from 'react';
import { DownloadLink } from '../../../core/components/DownloadLink';

/**
 * Centro de Acción de Habeas Data y Portabilidad.
 * Agrupa la descarga estructurada de datos y la gestión ordenada de solicitudes de rectificación y supresión.
 */
export function HabeasDataActionCenter({
  rectificationText,
  setRectificationText,
  handleRectificationSubmit,
  rectificationFeedback,
  isRectifying,
  onOpenSuppressionModal,
  portabilityFiles,
  handleDownloadPortability
}) {
  const rectificationFeedbackRef = useRef(null);
  useEffect(() => {
    if (rectificationFeedback && document.activeElement === document.body) rectificationFeedbackRef.current?.focus();
  }, [rectificationFeedback]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Portabilidad de Datos */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ fontSize: '15px' }}>
              Portabilidad de Datos Propios
            </h2>
            <p className="card-subtitle">
              El JSON incluye tus check-ins, bitácoras, solicitudes de apoyo y consentimiento disponibles en esta página. El CSV contiene un listado de referencias y fechas de esos registros. Los archivos se preparan en tu navegador; no son una copia de todos los datos de la cuenta.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
          <DownloadLink
            className="btn btn-secondary btn-sm"
            content={portabilityFiles.json}
            mimeType="application/json"
            fileName={`${portabilityFiles.fileNameBase}.json`}
            onDownload={() => handleDownloadPortability('json')}
          >
            <Icon name="Download" size={14} />
            <span>Descargar JSON estructurado</span>
          </DownloadLink>

          <DownloadLink
            className="btn btn-secondary btn-sm"
            content={portabilityFiles.csv}
            mimeType="text/csv"
            fileName={`${portabilityFiles.fileNameBase}.csv`}
            onDownload={() => handleDownloadPortability('csv')}
          >
            <Icon name="FileSpreadsheet" size={14} />
            <span>Descargar listado CSV</span>
          </DownloadLink>
        </div>
      </div>

      {/* 2. Grid de Trámites: Rectificación y Supresión */}
      <div className="habeas-actions-grid">
        {/* Formulario de Rectificación */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ fontSize: '14.5px' }}>
                Solicitar Rectificación de Información
              </h2>
              <p className="card-subtitle">
                Si identificas un dato inexacto o desactualizado en tus registros, describe la corrección requerida para iniciar el trámite formal.
              </p>
            </div>
          </div>

          <form onSubmit={handleRectificationSubmit} aria-busy={isRectifying}>
            <label className="form-label" htmlFor="rectification-details">Dato o registro que deseas rectificar</label>
            <textarea
              id="rectification-details"
              className="form-textarea"
              rows={3}
              maxLength={300}
              placeholder="Describe el dato, registro o fecha que consideras que debe ser corregido..."
              value={rectificationText}
              readOnly={isRectifying}
              onChange={(e) => setRectificationText(e.target.value)}
              style={{ width: '100%', marginBottom: '10px' }}
            />

            <div className="habeas-form-actions">
              <span style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)' }}>
                {rectificationText.length}/300 caracteres
              </span>
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                disabled={isRectifying || rectificationText.trim().length < 10}
              >
                <Icon name="Pencil" size={14} />
                <span>{isRectifying ? 'Registrando solicitud…' : 'Radicar solicitud de rectificación'}</span>
              </button>
            </div>
          </form>
          {isRectifying && <p role="status">Esperando confirmación del registro de la solicitud…</p>}

          {rectificationFeedback && (
            <div ref={rectificationFeedbackRef} tabIndex={-1} className={`alert-banner ${rectificationFeedback.type === 'error' ? 'danger' : 'ok'}`}
              role={rectificationFeedback.type === 'error' ? 'alert' : 'status'} style={{ marginTop: '12px' }}>
              <Icon name={rectificationFeedback.type === 'error' ? 'AlertTriangle' : 'CheckCircle2'} size={14} />
              <span>{rectificationFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Zona de Solicitud de Supresión */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ fontSize: '14.5px' }}>
                  Solicitud Formal de Supresión
                </h2>
                <p className="card-subtitle">
                  Ejerce tu derecho a solicitar la eliminación o disociación de tus notas y registros personales conforme a la Ley 1581 de 2012.
                </p>
              </div>
            </div>

            <div
              style={{
                fontSize: '12px',
                color: 'var(--c-texto-suave)',
                background: 'var(--c-fondo)',
                padding: '12px',
                borderRadius: 'var(--radius-card, 8px)',
                marginBottom: '16px',
                border: '1px solid var(--c-borde-suave)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Icon name="Shield" size={15} style={{ color: 'var(--c-primario)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  El trámite se registra para su gestión administrativa. Puedes consultar su alcance antes de confirmar; crearlo no ejecuta un borrado automático.
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenSuppressionModal}
            style={{ alignSelf: 'flex-start' }}
          >
            <Icon name="Scale" size={14} />
            <span>Iniciar trámite de supresión de datos…</span>
          </button>
        </div>
      </div>
    </div>
  );
}
