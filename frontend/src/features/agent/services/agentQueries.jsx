import { pulsoStore } from '../../../core/storage/pulsoStore';

import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

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

export async function fetchAgentRecords(userId) {
  if (!env.useMockStorage && getAuthToken()) {
    try {
      const [checkinsRes, journalsRes, supportsRes, habeasRes] = await Promise.all([
        apiClient.get('/agent/checkin/history').catch(() => ({ data: [] })),
        apiClient.get('/agent/journal').catch(() => ({ data: [] })),
        apiClient.get('/agent/support-requests').catch(() => ({ data: [] })),
        apiClient.get('/agent/habeas-data').catch(() => ({ data: [] }))
      ]);

      const data = pulsoStore.get(); // Para consents y settings locales por ahora

      return {
        settings: data.settings,
        consents: { [userId]: data.consents?.[userId] },
        checkins: checkinsRes.data || checkinsRes || [],
        journals: journalsRes.data || journalsRes || [],
        supportRequests: supportsRes.data || supportsRes || [],
        habeasRequests: habeasRes.data || habeasRes || []
      };
    } catch (err) {
      console.error('Error fetching agent records:', err);
    }
  }

  return getAgentRecords(userId);
}
