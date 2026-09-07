// src/features/admin/pages/CsvImportPage.jsx
// Módulo de Importación de Métricas Operativas Agregadas por CSV (RF-15)

import { useState, useRef } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

import '../../../styles/admin.css';

const PERSONAL_IDENTIFIERS = [
  'nombre',
  'cedula',
  'cédula',
  'documento',
  'correo',
  'email',
  'usuario',
  'user_id',
  'employee_id',
  'agente'
];

const REQUIRED_COLUMNS = ['campana_id', 'semana'];

export function CsvImportPage() {
  const currentUser = authService.getCurrentUser();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Manejador de selección de archivo
  const handleFileSelected = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setValidationResult({
        valid: false,
        type: 'format',
        message: 'El archivo seleccionado debe tener extensión .csv (valores delimitados por comas).'
      });
      setSelectedFile(null);
      setParsedRows([]);
      return;
    }

    setSelectedFile(file);
    setValidationResult(null);
    setParsedRows([]);
    setFeedback('');

    // Leer y validar contenido
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      validateCsvContent(text);
    };
    reader.readAsText(file);
  };

  // Validación de estructura y política de anonimato
  const validateCsvContent = (content) => {
    const lines = content
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      setValidationResult({
        valid: false,
        type: 'empty',
        message: 'El archivo CSV está vacío o contiene solo la cabecera sin filas de datos.'
      });
      return;
    }

    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

    // 1. Detección de datos personales individuales (RF-15 / Privacidad estricta)
    const detectedPersonal = headers.filter((h) => PERSONAL_IDENTIFIERS.includes(h));
    if (detectedPersonal.length > 0) {
      const message = `Archivo rechazado por seguridad: contiene columnas con identificadores individuales (${detectedPersonal.join(', ')}). Pulso360 solo admite métricas operativas agregadas.`;

      setValidationResult({
        valid: false,
        type: 'privacy',
        message
      });

      pulsoStore.audit({
        actor: actorLabel,
        action: 'IMPORTACION_CSV_RECHAZADA',
        target: `Identificadores personales detectados: ${detectedPersonal.join(', ')}`,
        status: 'DENEGADO'
      });
      return;
    }

    // 2. Validación de columnas obligatorias
    const missingRequired = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
    if (missingRequired.length > 0) {
      setValidationResult({
        valid: false,
        type: 'schema',
        message: `Estructura incompleta: faltan las siguientes columnas obligatorias: ${missingRequired.join(', ')}.`
      });
      return;
    }

    // 3. Procesamiento de filas
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/['"]/g, ''));
      if (values.length === headers.length) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx];
        });
        rows.push(rowObj);
      }
    }

    setParsedRows(rows);
    setValidationResult({
      valid: true,
      type: 'ok',
      message: `Estructura válida: ${rows.length} registros agregados analizados correctamente sin datos personales.`
    });
  };

  // Simulación de Ingesta y Guardado
  const handleProcessImport = () => {
    if (!validationResult?.valid || parsedRows.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      // Registrar auditoría de importación
      pulsoStore.audit({
        actor: actorLabel,
        action: 'IMPORTACION_CSV_VALIDADA',
        target: `Archivo "${selectedFile?.name}" · ${parsedRows.length} filas de métricas agregadas`
      });

      setFeedback(`Importación completada con éxito: ${parsedRows.length} registros operativos agregados se incorporaron al almacén.`);
      setIsProcessing(false);
      setSelectedFile(null);
      setParsedRows([]);
      setValidationResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 400);
  };

  // Descarga de Plantilla CSV
  const handleDownloadTemplate = () => {
    const csvContent = 'campana_id,semana,volumen_llamadas,tasa_ausentismo_pct,aht_segundos\ncamp-1,2026-W34,1420,4.5,285\ncamp-1,2026-W35,1510,5.1,290\ncamp-2,2026-W34,890,3.2,310';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-metricas-agregadas-pulso360.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Carga masiva de indicadores por CSV</h1>
          <p className="page-subtitle">
            Importación de métricas operativas colectivas por campaña (volumen de llamadas, ausentismo, tiempos) sin datos individuales de trabajadores (RF-15).
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDownloadTemplate}
        >
          <Icon name="download" size={16} />
          <span>Descargar plantilla CSV</span>
        </button>
      </div>

      {/* Banner de Privacidad por Diseño */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Principio de Agregación Estricta:</strong> El importador rechaza de manera categórica cualquier archivo que contenga nombres, cédulas, correos o códigos de agente individual. Las métricas deben cargarse únicamente totalizadas a nivel de campaña o semana.
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
            Columnas requeridas: <code className="audit-code-cell">campana_id, semana</code> · Opcionales: <code className="audit-code-cell">volumen_llamadas, tasa_ausentismo_pct, aht_segundos</code>
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
              <span>{isProcessing ? 'Procesando archivo...' : `Procesar e importar ${parsedRows.length} registros`}</span>
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
            <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--c-texto-suave)', marginTop: 'var(--space-3)' }}>
              Mostrando 5 de {parsedRows.length} registros agregados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
