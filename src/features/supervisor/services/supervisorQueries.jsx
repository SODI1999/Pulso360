import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getSupervisorData() {
  const { settings, interventions } = pulsoStore.get();
  return { settings, interventions };
}
