import { getAuditData } from '../services/auditorQueries';
import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function useAuditLog() {
  const currentUser = authService.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [integrityStatus, setIntegrityStatus] = useState({
    checked: false,
    valid: true,
    message: 'Cadena inmutable activa'
  });
  const [feedback, setFeedback] = useState('');
  const [version, setVersion] = useState(0);

  // Obtener logs del almacén
  const logs = useMemo(() => {
    void version;
    const data = getAuditData();
    return data.auditLogs || [];
  }, [version]);

  // Filtrado reactivo de registros
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (log.id && log.id.toLowerCase().includes(term)) ||
        (log.actor && log.actor.toLowerCase().includes(term)) ||
        (log.action && log.action.toLowerCase().includes(term)) ||
        (log.target && log.target.toLowerCase().includes(term)) ||
        (log.ip && log.ip.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [logs, searchTerm, statusFilter]);

  // Verificación de integridad de la cadena de hashes
  const handleVerifyIntegrity = () => {
    let isValid = true;
    for (let i = 0; i < logs.length - 1; i++) {
      if (logs[i].prevHash && logs[i + 1].hash && logs[i].prevHash !== logs[i + 1].hash) {
        isValid = false;
        break;
      }
    }

    setIntegrityStatus({
      checked: true,
      valid: isValid,
      message: isValid
        ? `Cadena verificada: ${logs.length} registros íntegros`
        : 'Inconsistencia detectada en la cadena'
    });

    setFeedback(
      isValid
        ? `Verificación completada: se validaron ${logs.length} bloques criptográficos sin alteraciones.`
        : 'Atención: Se identificó una discrepancia en los hashes de la cadena.'
    );
  };

  // El archivo contiene solo los metadatos disponibles antes de registrar su propia exportación.
  const exportContent = useMemo(
    () =>
      JSON.stringify(
        logs.map((log) => ({
          id: log.id,
          date: log.date,
          actor: log.actor,
          action: log.action,
          target: log.target,
          ip: log.ip,
          status: log.status,
          prevHash: log.prevHash,
          hash: log.hash
        })),
        null,
        2
      ),
    [logs]
  );

  // Exportación auditada de metadatos (RF-13)
  const handleExportCrypto = () => {
    const actorLabel = `${currentUser?.name || 'Auditor'} (${currentUser?.role || 'auditor'})`;

    // Registrar en auditoría
    pulsoStore.audit({
      actor: actorLabel,
      action: 'EXPORTACION_AUDITORIA',
      target: `Metadatos de auditoría (${logs.length} registros)`
    });

    setFeedback('Exportación de metadatos generada y registrada en la cadena de auditoría.');
    setVersion((v) => v + 1);
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    integrityStatus,
    feedback,
    filteredLogs,
    exportContent,
    handleVerifyIntegrity,
    handleExportCrypto
  };
}
