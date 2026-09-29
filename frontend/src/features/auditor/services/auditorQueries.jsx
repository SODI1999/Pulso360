import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getAuditData() {
  const { auditLogs } = pulsoStore.get();
  return { auditLogs };
}
