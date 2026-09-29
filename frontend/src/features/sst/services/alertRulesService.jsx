import { pulsoStore } from '../../../core/storage/pulsoStore';

export function saveRule(newRule) {
  const storeData = pulsoStore.get();
  storeData.rules = storeData.rules || [];
  storeData.rules.unshift(newRule);
  pulsoStore.save(storeData);
  return {};
}
