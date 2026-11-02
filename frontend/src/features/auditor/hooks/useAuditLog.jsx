// src/features/auditor/hooks/useAuditLog.jsx
// Hook para gestión de eventos de auditoría, trazabilidad inmutable y exportación criptográfica (RF-13).

import { useState, useMemo, useEffect, useCallback } from 'react';
import { fetchAuditPage, fetchAuditLogById, verifyAudit, exportAudit, getCachedAuditLogs } from '../services/auditorQueries';

/**
 * Hook personalizado para orquestar la consulta paginada, filtrado, verificación criptográfica
 * y exportación directa de eventos de auditoría.
 *
 * @returns {object} Estado reactivo y controladores de acción del módulo de auditoría.
 */
export function useAuditLog() {
  const cached = getCachedAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [integrityStatus, setIntegrityStatus] = useState({
    checked: false,
    valid: null,
    hasLegacy: false,
    badgeText: 'Integridad pendiente de comprobar',
    badgeType: 'badge-info',
    message: 'Integridad sin comprobar'
  });
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [logs, setLogs] = useState(() => cached?.logs || []);
  const [pagination, setPagination] = useState(() => cached?.pagination || { hasMore: false, total: 0 });
  const [loading, setLoading] = useState(() => !cached);
  const [busy, setBusy] = useState(false);
  const [exportContent, setExportContent] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchAuditPage({ limit: 50, offset: 0 })
      .then((result) => {
        if (active) {
          setLogs(result.logs);
          setPagination(result.pagination);
        }
      })
      .catch((e) => {
        if (active) setError(e.response?.data?.error?.message || e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [version]);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return logs.filter((log) => {
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      const matchesTerm =
        !term ||
        [log.id, log.actor, log.action, log.target, log.ip].some((value) =>
          String(value || '').toLowerCase().includes(term)
        );
      return matchesStatus && matchesTerm;
    });
  }, [logs, searchTerm, statusFilter]);

  const loadMore = useCallback(async () => {
    setBusy(true);
    try {
      const result = await fetchAuditPage({ limit: 50, offset: logs.length, maxId: pagination.maxId });
      setLogs((previous) => [...previous, ...result.logs]);
      setPagination(result.pagination);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error?.message || e.message);
    } finally {
      setBusy(false);
    }
  }, [logs.length, pagination.maxId]);

  const handleVerifyIntegrity = useCallback(async () => {
    setBusy(true);
    try {
      const result = await verifyAudit();
      const valid = result.chainValid;
      const hasLegacy = (result.legacyUnverifiable || 0) > 0;
      const badgeText = !result.chainValid
        ? 'Cadena comprometida'
        : hasLegacy
          ? 'Cadena íntegra (v1 conservada)'
          : 'Cadena íntegra';
      const badgeType = !result.chainValid ? 'badge-danger' : hasLegacy ? 'badge-info' : 'badge-ok';

      const summaryText = result.chainValid
        ? `Integridad criptográfica verificada: ${result.totalRecords} registros analizados (${result.verifiedRecords} con formato v2 verificado; ${result.legacyUnverifiable} históricos conservados con sellado original). ${result.coverage || ''}`
        : `Discrepancias detectadas en la cadena de hashes: se encontraron enlaces rotos en los registros evaluados.`;

      setIntegrityStatus({
        checked: true,
        valid,
        hasLegacy,
        chainValid: result.chainValid,
        contentValid: result.contentValid,
        totalRecords: result.totalRecords,
        verifiedRecords: result.verifiedRecords,
        legacyUnverifiable: result.legacyUnverifiable,
        coverage: result.coverage,
        badgeText,
        badgeType,
        message: summaryText,
        failures: result.failures || []
      });

      setNotification({
        type: result.chainValid ? 'ok' : 'danger',
        message: summaryText
      });
      setError('');
    } catch (e) {
      setError(e.response?.data?.error?.message || e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleExportCrypto = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const result = await exportAudit({ limit: 10000 });
      const jsonContent = JSON.stringify(result, null, 2);
      setExportContent(jsonContent);

      // Descarga directa en un solo clic
      const dateStr = new Date().toISOString().substring(0, 10);
      const fileName = `pulso360-auditoria-${dateStr}.json`;
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = fileName;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);

      setNotification({
        type: 'ok',
        message: `Exportación completada: ${result.logs?.length || 0} registros descargados exitosamente en formato JSON con cobertura criptográfica.`
      });
    } catch (e) {
      setError(e.response?.data?.error?.message || e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  const inspectLogById = useCallback(async (id) => {
    const stringId = String(id);
    const inMemory = logs.find((l) => String(l.id) === stringId);
    if (inMemory) return inMemory;
    try {
      setBusy(true);
      const fetched = await fetchAuditLogById(stringId);
      if (fetched) {
        setLogs((prev) => (prev.some((p) => String(p.id) === String(fetched.id)) ? prev : [fetched, ...prev]));
        return fetched;
      }
    } catch (e) {
      setError(e.response?.data?.error?.message || e.message);
    } finally {
      setBusy(false);
    }
    return null;
  }, [logs]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    integrityStatus,
    notification,
    clearNotification: () => setNotification(null),
    feedback: notification?.message || '',
    error,
    filteredLogs,
    exportContent,
    handleVerifyIntegrity,
    handleExportCrypto,
    inspectLogById,
    loading,
    busy,
    pagination,
    loadMore,
    reload: () => setVersion((v) => v + 1)
  };
}
