import { pulsoStore } from '../../../core/storage/pulsoStore';

export function markAllRead(currentUser) {
  const data = pulsoStore.get();
  let updated = false;

  (data.notifications || []).forEach((item) => {
    if (item.role === currentUser?.role || item.userId === currentUser?.id) {
      if (!item.read) {
        item.read = true;
        updated = true;
      }
    }
  });

  if (updated) {
    pulsoStore.save(data);
  }

  return updated;
}

export function markNotificationRead(notif) {
  if (!notif.read) {
    const data = pulsoStore.get();
    const target = (data.notifications || []).find((item) => item.id === notif.id);
    if (target) {
      target.read = true;
      pulsoStore.save(data);
      return true;
    }
  }

  return false;
}
