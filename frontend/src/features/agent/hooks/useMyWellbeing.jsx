// src/features/agent/hooks/useMyWellbeing.jsx
// Hook para gestión de estado del histórico de bienestar personal y navegación accesible por jornadas.

import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

export function useMyWellbeing() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [data, setData] = useState(() => getAgentRecords(currentUser?.id));

  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getAgentRecords(currentUser?.id);
    return !initial?.consents?.[currentUser?.id];
  });

  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && currentUser?.id) {
      fetchAgentRecords(currentUser.id)
        .then((remoteData) => {
          if (mounted && remoteData) setData(remoteData);
        })
        .catch((error) => {
          if (mounted) setLoadError(error.message);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
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
    const values = trendData.values.filter((value) => value != null);
    if (!values.length) return null;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return (sum / values.length).toFixed(1);
  }, [trendData.values]);

  const isViewingLatest = activeShift.id === recentShifts[0]?.id;

  // 5. Manejo de navegación accesible por teclado (WAI-ARIA Tablist)
  const handleTabKeyDown = useCallback(
    (e, currentId) => {
      if (!recentShifts.length) return;
      const currentIndex = recentShifts.findIndex((s) => s.id === currentId);
      if (currentIndex === -1) return;

      let targetIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % recentShifts.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + recentShifts.length) % recentShifts.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = recentShifts.length - 1;
      }

      if (targetIndex != null) {
        const targetShift = recentShifts[targetIndex];
        if (targetShift) {
          setSelectedShiftId(targetShift.id);
          const targetBtn = document.getElementById(`tab-${targetShift.id}`);
          if (targetBtn) targetBtn.focus();
        }
      }
    },
    [recentShifts]
  );

  return {
    loading,
    loadError,
    navigate,
    checkinRecords,
    recentShifts,
    setSelectedShiftId,
    activeShift,
    trendData,
    averageEnergy,
    isViewingLatest,
    handleTabKeyDown
  };
}
