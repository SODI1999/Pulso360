import { Icon } from '../../../core/components/Icon';
import { DownloadLink } from '../../../core/components/DownloadLink';

export function ReportResult({
  generatedReport,
  csvContent,
  jsonContent,
  downloadFileBaseName,
  handlePrintPdf
}) {
  return (
    <div className="reports-result-box">
      <div className="reports-result-header">
        <div>
          <h3 className="reports-result-title">
            Reporte preparado y certificado
          </h3>
          <div className="reports-result-meta">
            {generatedReport.scope} · {generatedReport.format}
          </div>
        </div>
        <span className="badge badge-ok">Hash verificado</span>
      </div>

      <p className="reports-result-hash">
        Hash criptográfico demo: <code className="audit-code-cell">{generatedReport.hash}</code>
      </p>

      <div className="reports-actions-row">
        {generatedReport.format === 'CSV' && (
          <DownloadLink
            className="btn btn-primary btn-sm"
            content={csvContent}
            mimeType="text/csv;charset=utf-8"
            fileName={`${downloadFileBaseName}.csv`}
          >
            <Icon name="download" size={14} />
            <span>Descargar archivo CSV</span>
          </DownloadLink>
        )}
        {generatedReport.format === 'JSON' && (
          <DownloadLink
            className="btn btn-primary btn-sm"
            content={jsonContent}
            mimeType="application/json"
            fileName={`${downloadFileBaseName}.json`}
          >
            <Icon name="download" size={14} />
            <span>Descargar archivo JSON</span>
          </DownloadLink>
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
