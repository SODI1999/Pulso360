import { useState, useRef } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

import { PERSONAL_IDENTIFIERS, REQUIRED_COLUMNS } from '../data/csvImportData';

export function useCsvImport() {
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

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

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

      setFeedback(
        `Estructura validada exitosamente: ${parsedRows.length} registros procesados (Sandbox local). La ingesta definitiva en la base de datos remota se habilitará cuando exista el endpoint masivo específico en el backend.`
      );
      setIsProcessing(false);
      setSelectedFile(null);
      setParsedRows([]);
      setValidationResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 400);
  };

  return {
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
  };
}
