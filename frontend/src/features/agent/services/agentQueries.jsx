import { pulsoStore } from '../../../core/storage/pulsoStore';

// Las pantallas personales reciben únicamente los registros del titular.
export function getAgentRecords(userId) {
  const data = pulsoStore.get();
  return {
    settings: data.settings,
    consents: { [userId]: data.consents?.[userId] },
    checkins: (data.checkins || []).filter((row) => row.userId === userId),
    journals: (data.journals || []).filter((row) => row.userId === userId),
    supportRequests: (data.supportRequests || []).filter((row) => row.ownerUserId === userId),
    habeasRequests: (data.habeasRequests || []).filter((row) => row.userId === userId)
  };
}
