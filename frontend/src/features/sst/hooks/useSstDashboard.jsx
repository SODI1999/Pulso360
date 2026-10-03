import { getSstData, fetchSstAlerts, fetchSstSupportRequests } from '../services/sstQueries';
import { useEffect, useMemo, useState } from 'react';

import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';

export function useSstDashboard() {
  const user = authService.getCurrentUser();
  const storeData = getSstData();
  const minThreshold = storeData.settings?.umbralMinimo || 5;

  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSstAlerts(), fetchSstSupportRequests()]).then(([al, req]) => {
      if (active) {
        setAlerts(al || []);
        setRequests(req || []);
      }
    });
    return () => { active = false; };
  }, []);

  // Alertas activas pendientes de atención
  const pendingAlerts = useMemo(() => {
    return alerts.filter((a) => a.status !== 'CERRADA' && a.status !== 'DESCARTADA');
  }, [alerts]);

  // Solicitudes de acompañamiento en gestión
  const activeRequests = useMemo(() => {
    return requests.filter((r) => r.status !== 'Cerrada');
  }, [requests]);

  // Distribución agregada de las 8 categorías léxicas de NLP
  const nlpCategories = useMemo(
    () => [
      { name: 'Sobrecarga percibida', count: 12, percent: 37 },
      { name: 'Recuperación insuficiente', count: 10, percent: 31 },
      { name: 'Exigencia emocional', count: 9, percent: 28 },
      { name: 'Conflicto de rol', count: 7, percent: 19 },
      { name: 'Bajo apoyo organizacional', count: 4, percent: 11 }, // Cuenta < 5 -> supresión primaria
      { name: 'Distanciamiento laboral', count: 8, percent: 23 },
      { name: 'Frustración por métricas operativas', count: 6, percent: 17 },
      { name: 'Percepción de ineficacia', count: 5, percent: 14 }
    ],
    []
  );

  // Registro de auditoría preventiva (RF-07 / RF-11)
  useEffect(() => {
    if (!user) return;
    pulsoStore.audit({
      actor: `${user.name} (${user.role})`,
      action: 'CONSULTA_AGREGADA',
      target: 'SST · Vigilancia epidemiológica y distribución agregada NLP'
    });
  }, [user]);

  return { minThreshold, pendingAlerts, activeRequests, nlpCategories };
}
