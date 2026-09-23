import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getOrganizationData() {
  const { organization, settings, users } = pulsoStore.get();
  return { organization, settings, users };
}

export function getUserManagementData() {
  const { users, organization } = pulsoStore.get();
  return { users, organization };
}

export function getSystemParameters() {
  const { settings, rules } = pulsoStore.get();
  return { settings, rules };
}

export function getHabeasData() {
  const { habeasRequests, users } = pulsoStore.get();
  return { habeasRequests, users };
}
