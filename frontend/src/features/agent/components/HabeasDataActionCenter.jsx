import { Icon } from '../../../core/components/Icon';
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
  onOpenSuppressionModal,
  portabilityFiles,
  handleDownloadPortability
}) {
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
              Descarga una copia completa de los registros asociados a tu cuenta. El archivo se genera de forma inmediata y segura en tu navegador.
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
            <span>Descargar CSV propio</span>
          </DownloadLink>
        </div>
      </div>

      {/* 2. Grid de Trámites: Rectificación y Supresión */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
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

          <form onSubmit={handleRectificationSubmit}>
            <textarea
              className="form-textarea"
              rows={3}
              maxLength={300}
              placeholder="Describe el dato, registro o fecha que consideras que debe ser corregido..."
              value={rectificationText}
              onChange={(e) => setRectificationText(e.target.value)}
              style={{ width: '100%', marginBottom: '10px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)' }}>
                {rectificationText.length}/300 caracteres
              </span>
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                disabled={rectificationText.trim().length < 10}
              >
                <Icon name="Pencil" size={14} />
                <span>Radicar solicitud de rectificación</span>
              </button>
            </div>
          </form>

          {rectificationFeedback && (
            <div className="form-feedback info" style={{ marginTop: '12px' }}>
              <Icon name="Info" size={14} />
              <span>{rectificationFeedback}</span>
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
                  El trámite se procesa administrativamente ante el Oficial de Privacidad. Puedes consultar las condiciones y confirmar de forma segura.
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
