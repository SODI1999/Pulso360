import { fetchAgentRecords, getAgentRecords } from '../services/agentQueries';
import { preferences } from '../../../core/storage/preferences';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

import { formatHour } from '../services/agentDashboardHelpers';

export function useAgentDashboard() {
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState(() => getAgentRecords(currentUser?.id));

  const [loadError,setLoadError] = useState('');
  const [loading,setLoading] = useState(!env.useMockStorage);
  useEffect(() => {
    let mounted = true;
    if (!env.useMockStorage && currentUser?.id) {
      fetchAgentRecords(currentUser.id).then((remoteData) => {
        if (mounted && remoteData) setStoreData(remoteData);
      }).catch(error => { if(mounted) setLoadError(error.message); })
        .finally(() => { if(mounted) setLoading(false); });
    }
    return () => { mounted = false; };
  }, [currentUser?.id]);

  const consent = storeData.consents?.[currentUser?.id] || {};

  // 1. Partes de fecha y hora local en Bogotá
  const { dateParts, currentHourBogota } = useMemo(() => {
    const now = new Date();
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23'
      })
        .formatToParts(now)
        .filter((item) => item.type !== 'literal')
        .map((item) => [item.type, item.value])
    );
    return {
      dateParts: parts,
      currentHourBogota: Number(parts.hour)
    };
  }, []);

  const greeting = useMemo(() => {
    if (currentHourBogota >= 5 && currentHourBogota < 12) return 'Buenos días';
    if (currentHourBogota >= 12 && currentHourBogota < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, [currentHourBogota]);

  // 2. Jornada laboral en Bogotá (lógica inquebrantable compartida con el wizard)
  const shiftStartHour = Number(currentUser?.shiftStartHour ?? 8);

  const journeyKey = useMemo(() => {
    let key = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

    if (currentHourBogota < shiftStartHour) {
      const previousDate = new Date(`${key}T12:00:00Z`);
      previousDate.setUTCDate(previousDate.getUTCDate() - 1);
      key = previousDate.toISOString().slice(0, 10);
    }

    return key;
  }, [dateParts, currentHourBogota, shiftStartHour]);

  // 3. Detección de Desconexión Laboral Activa (Ley 2191 de 2022)
  const isOutsideShift = useMemo(() => {
    const hoursSinceStart = (currentHourBogota - shiftStartHour + 24) % 24;
    return hoursSinceStart >= 9 && hoursSinceStart <= 23;
  }, [currentHourBogota, shiftStartHour]);

  // Persistencia del descarte del aviso de desconexión por jornada
  const [dismissedDisconnect, setDismissedDisconnect] = useState(() => {
    try {
      return preferences.isDisconnectDismissed(journeyKey);
    } catch {
      return false;
    }
  });

  const handleDismissDisconnect = () => {
    try {
      preferences.dismissDisconnect(journeyKey);
    } catch {
      // Manejo seguro ante restricciones de almacenamiento
    }
    setDismissedDisconnect(true);
  };

  // 4. Estado del check-in de la jornada actual
  const todayCheckin = useMemo(() => {
    return (storeData.checkins || []).find(
      (c) => c.userId === currentUser?.id && c.journeyKey === journeyKey
    );
  }, [storeData.checkins, currentUser?.id, journeyKey]);

  // 5. Check-in rápido: el emoji pre-rellena el borrador del wizard usando el
  // MISMO draftKey que CheckinWizardPage lee al montar. No se duplica la
  // persistencia de registros: el wizard sigue siendo quien guarda en el store.
  const draftKey = `pulso360_checkin_draft_${currentUser?.id}_${journeyKey}`;

  const handleQuickEnergy = (value) => {
    try {
      const savedDraft = preferences.readCheckinDraft(draftKey);
      preferences.saveCheckinDraft(draftKey, { ...savedDraft, energia: value });
    } catch {
      // Si el almacenamiento está restringido, el wizard completo sigue disponible.
    }
    navigate('/agente/checkin');
  };

  // 6. Ritmo del turno (pasos de la jornada según hora de inicio)
  const shiftSteps = useMemo(() => {
    const hoursSinceStart = (currentHourBogota - shiftStartHour + 24) % 24;

    return [
      {
        id: 'start',
        time: formatHour(shiftStartHour),
        title: 'Inicio de turno',
        status: hoursSinceStart > 1 ? 'done' : 'active'
      },
      {
        id: 'block1',
        time: formatHour(shiftStartHour + 2),
        title: 'Bloque 1 (Línea)',
        status: hoursSinceStart > 3 ? 'done' : hoursSinceStart >= 2 ? 'active' : 'upcoming'
      },
      {
        id: 'break',
        time: formatHour(shiftStartHour + 4),
        title: 'Pausa Activa',
        status: hoursSinceStart > 5 ? 'done' : hoursSinceStart >= 4 ? 'active' : 'upcoming'
      },
      {
        id: 'block2',
        time: formatHour(shiftStartHour + 6),
        title: 'Bloque 2 (Línea)',
        status: hoursSinceStart > 7 ? 'done' : hoursSinceStart >= 6 ? 'active' : 'upcoming'
      },
      {
        id: 'close',
        time: formatHour(shiftStartHour + 8),
        title: 'Cierre & Desconexión',
        status: hoursSinceStart >= 8 ? 'done' : 'upcoming'
      }
    ];
  }, [shiftStartHour, currentHourBogota]);

  // Hora sugerida de pausa activa dentro del turno
  const breakStep = shiftSteps.find((step) => step.id === 'break');

  // Modales preservados
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPerspectiveModalOpen, setIsPerspectiveModalOpen] = useState(false);

  return { loading,loadError,
    currentUser,
    consent,
    greeting,
    shiftStartHour,
    isOutsideShift,
    dismissedDisconnect,
    handleDismissDisconnect,
    todayCheckin,
    handleQuickEnergy,
    shiftSteps,
    breakStep,
    isResetModalOpen,
    setIsResetModalOpen,
    isPerspectiveModalOpen,
    setIsPerspectiveModalOpen
  };
}
