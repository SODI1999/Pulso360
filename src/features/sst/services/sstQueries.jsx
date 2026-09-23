import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getSstData() {
  const { settings, alerts, supportRequests, users, rules, interventions } = pulsoStore.get();
  return { settings, alerts, supportRequests, users, rules, interventions };
}
