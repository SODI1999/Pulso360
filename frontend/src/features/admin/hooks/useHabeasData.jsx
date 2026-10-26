import { getHabeasData, fetchHabeasData, fetchAdminUsers } from '../services/adminQueries';
import { confirmAdvance } from '../services/habeasDataService';
import { useState, useEffect } from 'react';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

import { STATUS_WORKFLOW } from '../data/habeasDataData';

export function useHabeasData() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(() => {
    if (env.useMockStorage) return false;
    const initial = getHabeasData();
    return !initial?.habeasRequests;
  });
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [advanceModalState, setAdvanceModalState] = useState({
    isOpen: false,
    request: null,
    nextStatus: ''
  });

  const [storeData, setStoreData] = useState(() => getHabeasData());

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const initial = getHabeasData();
      if (!initial?.habeasRequests?.length) setLoading(true);
      setLoadError('');
      if (!env.useMockStorage) {
        try {
          const [reqs, usersData] = await Promise.all([
            fetchHabeasData(),
            fetchAdminUsers()
          ]);
          if (active) {
            setStoreData({
              habeasRequests: reqs,
              users: usersData
            });
          }
        } catch (error) {
          if (active) setLoadError(error.message);
          if (active) setFeedback(`Error: ${error.message}`);
        } finally { if (active) setLoading(false); }
      } else {
        setStoreData(getHabeasData());
        setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [version]);

  const requests = storeData.habeasRequests || [];
  const users = storeData.users || [];

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Formatear fechas
  const formatDate = (value) => {
    if (!value) return '—';
    const dateStr = value.includes('T') ? value : `${value}T12:00:00Z`;
    try {
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(dateStr));
    } catch {
      return value;
    }
  };

  // Abrir modal para avanzar
  const handleOpenAdvance = (request) => {
    if (['Respondida','Rechazada'].includes(request.status)) return;
    const currentIndex = STATUS_WORKFLOW.indexOf(request.status);
    if (currentIndex >= 0 && currentIndex < STATUS_WORKFLOW.length - 1) {
      const nextStatus = STATUS_WORKFLOW[currentIndex + 1];
      setAdvanceModalState({
        isOpen: true,
        request,
        nextStatus
      });
    }
  };

  // Confirmar avance
  const handleConfirmAdvance = async ({ requestId, nextStatus, note }) => {
    const operationResult = await confirmAdvance(requestId, nextStatus, note, actorLabel);
    if (!operationResult) return;
    if (operationResult.success !== true) {
      setFeedback(`Error: ${operationResult.error}`);
      return operationResult;
    }
    const { req } = operationResult;

    setFeedback(`Radicado ${req?.id || requestId} actualizado exitosamente al estado "${nextStatus}".`);
    setAdvanceModalState({ isOpen: false, request: null, nextStatus: '' });
    setVersion((v) => v + 1);
    return operationResult;
  };

  return {
    loading, loadError,
    feedback,
    advanceModalState,
    setAdvanceModalState,
    requests,
    users,
    formatDate,
    handleOpenAdvance,
    handleConfirmAdvance,
    reload: () => setVersion((v) => v + 1)
  };
}
