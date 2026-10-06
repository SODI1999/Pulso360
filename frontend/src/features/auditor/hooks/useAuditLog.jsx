import { fetchAuditPage, verifyAudit, exportAudit } from '../services/auditorQueries';
import { useState, useMemo, useEffect } from 'react';

export function useAuditLog() {
  const [searchTerm,setSearchTerm] = useState('');
  const [statusFilter,setStatusFilter] = useState('ALL');
  const [integrityStatus,setIntegrityStatus] = useState({ checked:false,valid:null,message:'Integridad sin comprobar' });
  const [feedback,setFeedback] = useState('');
  const [error,setError] = useState('');
  const [logs,setLogs] = useState([]);
  const [pagination,setPagination] = useState({ hasMore:false,total:0 });
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [exportContent,setExportContent] = useState('');
  useEffect(() => {
    let active = true;
    fetchAuditPage({limit:50,offset:0}).then(result => {
      if (active) { setLogs(result.logs); setPagination(result.pagination); }
    }).catch(e => { if(active) setError(e.response?.data?.error?.message || e.message); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  },[]);
  const filteredLogs = useMemo(() => logs.filter(log => {
    const term = searchTerm.toLowerCase().trim();
    return (statusFilter === 'ALL' || log.status === statusFilter) &&
      (!term || [log.id,log.actor,log.action,log.target,log.ip].some(value => String(value || '').toLowerCase().includes(term)));
  }),[logs,searchTerm,statusFilter]);
  const loadMore = async () => {
    setBusy(true);
    try {
      const result = await fetchAuditPage({ limit:50,offset:logs.length,maxId:pagination.maxId });
      setLogs(previous => [...previous,...result.logs]); setPagination(result.pagination); setError('');
    } catch(e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setBusy(false); }
  };
  const handleVerifyIntegrity = async () => {
    setBusy(true);
    try {
      const result = await verifyAudit();
      const valid = result.chainValid && result.contentValid;
      const message = `${valid ? 'Sin discrepancias dentro de la cobertura' : 'Discrepancias detectadas'}: ${result.totalRecords} registros; ${result.verifiedRecords} con contenido verificable; ${result.legacyUnverifiable} históricos. ${result.coverage}`;
      setIntegrityStatus({ checked:true,valid,message });
      setFeedback(message);
      setError('');
    } catch(e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setBusy(false); }
  };
  const handleExportCrypto = async () => {
    setBusy(true); setExportContent('');
    try {
      const result = await exportAudit({ limit:10000 });
      setExportContent(JSON.stringify(result,null,2));
      setFeedback(`Exportación preparada: ${result.logs.length} registros${result.metadata?.truncated ? ' (límite alcanzado)' : ''}. Incluye cobertura de integridad. La búsqueda de la tabla no filtra esta exportación.`);
      setError('');
    } catch(e) { setError(e.response?.data?.error?.message || e.message); }
    finally { setBusy(false); }
  };
  return { searchTerm,setSearchTerm,statusFilter,setStatusFilter,integrityStatus,feedback,error,
    filteredLogs,exportContent,handleVerifyIntegrity,handleExportCrypto,loading,busy,pagination,loadMore };
}
