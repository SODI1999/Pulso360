import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

export function useMyWellbeing() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [data, setData] = useState(() => getAgentRecords(currentUser?.id));

  const [loadError,setLoadError] = useState('');
  const [loading,setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });
  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && currentUser?.id) {
      fetchAgentRecords(currentUser.id).then((remoteData) => {
        if (mounted && remoteData) setData(remoteData);
      }).catch(error => { if(mounted) setLoadError(error.message); })
        .finally(() => { if(mounted) setLoading(false); });
    }
    return () => { mounted = false; };
  }, [currentUser?.id]);

  // 1. Registros del agente actual (orden cronológico inverso: más reciente primero)
  const checkinRecords = useMemo(() => {
    return (data.checkins || []).filter((c) => c.userId === currentUser?.id);
  }, [data.checkins, currentUser?.id]);

  // 2. Ventana acotada de la semana operativa (máximo 7 jornadas recientes)
  const recentShifts = useMemo(() => {
    return checkinRecords.slice(0, 7);
  }, [checkinRecords]);

  // 3. Estado de jornada seleccionada para inspección somática
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const activeShift = useMemo(() => {
    if (selectedShiftId) {
      const found = recentShifts.find((s) => s.id === selectedShiftId);
      if (found) return found;
    }
    return recentShifts[0] || {};
  }, [recentShifts, selectedShiftId]);

  // 4. Tendencia de energía del ciclo reciente (autorreportados reales)
  const trendData = useMemo(() => {
    const recent = [...recentShifts].reverse();
    return {
      labels: recent.map((c) => {
        const parts = (c.journeyKey || '').split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : 'Turno';
      }),
      values: recent.map((c) => c.energia ?? null)
    };
  }, [recentShifts]);

  const averageEnergy = useMemo(() => {
    const values = trendData.values.filter(value => value != null);
    if (!values.length) return null;
    const sum = values.reduce((acc,curr) => acc + curr,0);
    return (sum / values.length).toFixed(1);
  }, [trendData.values]);

  const isViewingLatest = activeShift.id === recentShifts[0]?.id;

  return { loading,loadError,
    navigate,
    checkinRecords,
    recentShifts,
    setSelectedShiftId,
    activeShift,
    trendData,
    averageEnergy,
    isViewingLatest
  };
}
