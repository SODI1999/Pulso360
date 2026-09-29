import { pulsoStore } from '../../../core/storage/pulsoStore';

export function getNotificationData() {
  const { notifications } = pulsoStore.get();
  return { notifications };
}
