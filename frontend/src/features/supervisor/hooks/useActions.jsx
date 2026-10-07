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
  const [loading, setLoading] = useState(() => !getSupervisorData().interventions?.length);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true; if (!getSupervisorData().interventions?.length) setLoading(true); setLoadError('');
    async function load() {
      const result = await fetchSupervisorActions();
      if (mounted) {
        setAsyncInterventions(result || []);
      }
    }
    load().catch(error => { if (mounted) setLoadError(error.message); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [version]);

  // Cargar intervenciones asignadas al supervisor
  const interventions = useMemo(() => {
    void version;
    if (asyncInterventions) {
      return asyncInterventions;
    }
    const data = getSupervisorData();
    return (data.interventions || []).filter(
      (item) => item.assignedTo === user?.id
    );
  }, [user?.id, version, asyncInterventions]);

  const handleSaveFollowup = async ({ interventionId, actionType, notes, progress }) => {
    const message = await saveFollowup(interventionId, actionType, notes, progress, user);
    if (message?.success !== true) { setFeedback(`Error: ${message.error}`); return message; }
    if (message) {
      setFeedback(message.message);
      setVersion((v) => v + 1);
    }
    setSelectedIntervention(null);
    return message;
  };

  return { loading, loadError, selectedIntervention, setSelectedIntervention, feedback, interventions, handleSaveFollowup };
}
