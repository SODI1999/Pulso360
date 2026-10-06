import { useState, useRef } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { env } from '../../../core/config/env';
import { validateCsvContent } from '../services/csvValidation';

export function useCsvImport() {
  const currentUser = authService.getCurrentUser();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const readSequence = useRef(0);

  const handleFileSelected = (file) => {
    if (!file) return;
    const sequence = ++readSequence.current;
    setFeedback(''); setParsedRows([]); setValidationResult(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(null);
      setValidationResult({ valid:false, message:'Selecciona un archivo con extensión .csv.' });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (sequence !== readSequence.current) return;
      const result = validateCsvContent(String(reader.result || ''));
      setParsedRows(result.rows); setValidationResult(result);
    };
    reader.onerror = () => {
      if (sequence === readSequence.current) setValidationResult({ valid:false, message:'No se pudo leer el archivo. Vuelve a seleccionarlo.' });
    };
    reader.readAsText(file);
  };

  // Solo validación local: no anuncia una escritura ni simula latencia de servidor.
  const handleProcessImport = () => {
    if (!validationResult?.valid || !parsedRows.length) return;
    setIsProcessing(true);
    if (env.useMockStorage) pulsoStore.audit({
      actor:currentUser?.name || 'Administrador de demostración',
      action:'IMPORTACION_CSV_VALIDADA', target:`Simulación local: ${parsedRows.length} filas de estructura validada`
    });
    setFeedback(`Comprobación finalizada: ${parsedRows.length} filas compatibles con la plantilla. No se guardaron indicadores en el servidor.`);
    setIsProcessing(false);
  };

  return { fileInputRef, selectedFile, isDragOver, setIsDragOver, validationResult,
    parsedRows, isProcessing, feedback, handleFileSelected, handleProcessImport };
}
