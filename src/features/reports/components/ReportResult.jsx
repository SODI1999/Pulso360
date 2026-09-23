import { Icon } from '../../../core/components/Icon';

export function ReportResult({ generatedReport, handleDownloadCsv, handleDownloadJson, handlePrintPdf }) {
  return (
    <div className="reports-result-box">
      <div className="reports-result-header">
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--c-texto)' }}>
            Reporte preparado y certificado
          </h3>
          <div style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginTop: '2px' }}>
            {generatedReport.scope} · {generatedReport.format}
          </div>
        </div>
        <span className="badge badge-ok">Hash verificado</span>
      </div>

      <p style={{ fontSize: '13px', margin: 'var(--space-2) 0' }}>
        Hash criptográfico demo: <code className="audit-code-cell">{generatedReport.hash}</code>
      </p>

      <div className="reports-actions-row">
        {generatedReport.format === 'CSV' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={handleDownloadCsv}>
            <Icon name="download" size={14} />
            <span>Descargar archivo CSV</span>
          </button>
        )}
        {generatedReport.format === 'JSON' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={handleDownloadJson}>
            <Icon name="download" size={14} />
            <span>Descargar archivo JSON</span>
          </button>
        )}
        {generatedReport.format === 'PDF' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrintPdf}>
            <Icon name="fileText" size={14} />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        )}
      </div>
    </div>
  );
}
