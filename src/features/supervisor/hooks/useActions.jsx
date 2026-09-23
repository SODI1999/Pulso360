import { getSupervisorData } from '../services/supervisorQueries';
import { saveFollowup } from '../services/actionsService';
import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';

export function useActions() {
  const user = authService.getCurrentUser();
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [version, setVersion] = useState(0);

  // Cargar intervenciones asignadas al supervisor
  const interventions = useMemo(() => {
    void version;
    const data = getSupervisorData();
    return (data.interventions || []).filter(
      (item) => item.assignedTo === user?.id
    );
  }, [user?.id, version]);

  const handleSaveFollowup = ({ interventionId, actionType, notes, progress }) => {
    const message = saveFollowup(interventionId, actionType, notes, progress, user);
    if (message) {
      setFeedback(message);
      setVersion((v) => v + 1);
    }
    setSelectedIntervention(null);
  };

  return { selectedIntervention, setSelectedIntervention, feedback, interventions, handleSaveFollowup };
}
