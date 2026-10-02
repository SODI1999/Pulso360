import { getSupervisorData, fetchSupervisorActions } from '../services/supervisorQueries';
import { saveFollowup } from '../services/actionsService';
import { useState, useMemo, useEffect } from 'react';
import { authService } from '../../../core/auth/authService';

export function useActions() {
  const user = authService.getCurrentUser();
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [version, setVersion] = useState(0);
  const [asyncInterventions, setAsyncInterventions] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const result = await fetchSupervisorActions();
      if (mounted) {
        setAsyncInterventions(result || []);
      }
    }
    load();
    return () => { mounted = false; };
  }, [version]);

  // Cargar intervenciones asignadas al supervisor
  const interventions = useMemo(() => {
    void version;
    if (asyncInterventions) {
      return asyncInterventions.filter((item) => item.assignedTo === user?.id);
    }
    const data = getSupervisorData();
    return (data.interventions || []).filter(
      (item) => item.assignedTo === user?.id
    );
  }, [user?.id, version, asyncInterventions]);

  const handleSaveFollowup = async ({ interventionId, actionType, notes, progress }) => {
    const message = await saveFollowup(interventionId, actionType, notes, progress, user);
    if (message) {
      setFeedback(message);
      setVersion((v) => v + 1);
    }
    setSelectedIntervention(null);
  };

  return { selectedIntervention, setSelectedIntervention, feedback, interventions, handleSaveFollowup };
}
