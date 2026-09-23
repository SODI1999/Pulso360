import { getHabeasData } from '../services/adminQueries';
import { confirmAdvance } from '../services/habeasDataService';
import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';

import { STATUS_WORKFLOW } from '../data/habeasDataData';

export function useHabeasData() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [advanceModalState, setAdvanceModalState] = useState({
    isOpen: false,
    request: null,
    nextStatus: ''
  });

  const storeData = useMemo(() => {
    void version;
    return getHabeasData();
  }, [version]);
  const requests = storeData.habeasRequests || [];
  const users = storeData.users || [];

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Formatear fechas
  const formatDate = (value) => {
    if (!value) return '—';
    const dateStr = value.includes('T') ? value : `${value}T12:00:00`;
    try {
      return new Intl.DateTimeFormat('es-CO', {
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
  const handleConfirmAdvance = ({ requestId, nextStatus, note }) => {
    const operationResult = confirmAdvance(requestId, nextStatus, note, actorLabel);
    if (!operationResult) return;
    const { req } = operationResult;

    setFeedback(`Radicado ${req.id} actualizado exitosamente al estado "${nextStatus}".`);
    setAdvanceModalState({ isOpen: false, request: null, nextStatus: '' });
    setVersion((v) => v + 1);
  };

  return {
    feedback,
    advanceModalState,
    setAdvanceModalState,
    requests,
    users,
    formatDate,
    handleOpenAdvance,
    handleConfirmAdvance
  };
}
