import { pulsoStore } from '../../../core/storage/pulsoStore';

export function generateReport(newReportRecord) {
  const data = pulsoStore.get();
  data.reportHistory = data.reportHistory || [];
  data.reportHistory.unshift(newReportRecord);
  pulsoStore.save(data);
  return {};
}
