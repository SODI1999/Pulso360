import { pulsoStore } from '../../../core/storage/pulsoStore';

export function saveIntervention(newIntervention) {
  const storeData = pulsoStore.get();
  storeData.interventions = storeData.interventions || [];
  storeData.interventions.unshift(newIntervention);
  pulsoStore.save(storeData);
  return {};
}
