import { useCsvImport } from '../hooks/useCsvImport';

// src/features/admin/pages/CsvImportPage.jsx
// Módulo de Importación de Métricas Operativas Agregadas por CSV (RF-15)

import { Icon } from '../../../core/components/Icon';
import { DownloadLink } from '../../../core/components/DownloadLink';
import { CSV_TEMPLATE } from '../data/csvImportData';

import '../../../styles/admin.css';

export function CsvImportPage() {
  const {
    fileInputRef,
    selectedFile,
    isDragOver,
    setIsDragOver,
    validationResult,
    parsedRows,
    isProcessing,
    feedback,
    handleFileSelected,
    handleProcessImport
  } = useCsvImport();

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Carga masiva de indicadores por CSV</h1>
          <p className="page-subtitle">
            Importación de métricas operativas colectivas por campaña (volumen de llamadas, ausentismo,
            tiempos) sin datos individuales de trabajadores (RF-15).
          </p>
        </div>
        <DownloadLink
          className="btn btn-secondary"
          content={CSV_TEMPLATE}
          mimeType="text/csv;charset=utf-8"
          fileName="plantilla-metricas-agregadas-pulso360.csv"
        >
          <Icon name="download" size={16} />
          <span>Descargar plantilla CSV</span>
        </DownloadLink>
      </div>

      {/* Banner de Privacidad por Diseño */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Principio de Agregación Estricta:</strong> El importador rechaza de manera categórica
          cualquier archivo que contenga nombres, cédulas, correos o códigos de agente individual. Las
          métricas deben cargarse únicamente totalizadas a nivel de campaña o semana.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tarjeta de Carga */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Subir archivo de métricas operativas</h2>
            <div className="card-subtitle">Formato estándar CSV delimitado por comas</div>
          </div>
          <span className="badge badge-info">Estructura Agregada</span>
        </div>

        {/* Zona de Dropzone */}
        <div
          className={`csv-upload-container ${isDragOver ? 'dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileSelected(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="csv-upload-icon">
            <Icon name="upload_file" size={48} />
          </div>
          <div className="csv-upload-title">
            {selectedFile ? selectedFile.name : 'Haz clic o arrastra aquí tu archivo CSV'}
          </div>
          <div className="csv-upload-subtitle">
            Columnas requeridas: <code className="audit-code-cell">campana_id, semana</code> · Opcionales:{' '}
            <code className="audit-code-cell">volumen_llamadas, tasa_ausentismo_pct, aht_segundos</code>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="csv-file-input"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Resultado de Validación */}
        {validationResult && (
          <div
            className={`alert-banner ${validationResult.valid ? 'ok' : 'danger'}`}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <Icon name={validationResult.valid ? 'checkCircle' : 'alertTriangle'} size={18} />
            <div>
              <strong>{validationResult.valid ? 'Validación Exitosa:' : 'Validación Rechazada:'}</strong>{' '}
              {validationResult.message}
            </div>
          </div>
        )}

        {/* Botón de Procesamiento */}
        {validationResult?.valid && parsedRows.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isProcessing}
              onClick={handleProcessImport}
            >
              <Icon name="check" size={16} />
              <span>
                {isProcessing
                  ? 'Procesando archivo...'
                  : `Procesar e importar ${parsedRows.length} registros`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Vista Previa de Filas Analizadas */}
      {parsedRows.length > 0 && (
        <div className="card csv-preview-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Vista previa de métricas agregadas</h2>
              <div className="card-subtitle">Primeras filas extraídas del archivo analizado.</div>
            </div>
            <span className="badge badge-ok">{parsedRows.length} filas listas</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(parsedRows[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, cellIdx) => (
                      <td key={cellIdx}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 5 && (
            <p
              style={{
                textAlign: 'center',
                fontSize: '12.5px',
                color: 'var(--c-texto-suave)',
                marginTop: 'var(--space-3)'
              }}
            >
              Mostrando 5 de {parsedRows.length} registros agregados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
