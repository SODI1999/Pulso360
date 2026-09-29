import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getReportData() {
  const { settings, reportHistory } = pulsoStore.get();
  return { settings, reportHistory };
}
