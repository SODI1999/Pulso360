import { roleHomePaths } from '../../../core/auth/roleNavigation';
import { getNotificationData, fetchNotifications } from '../services/notificationsQueries';
import { markNotificationRead } from '../services/notificationsService';
import { markAllRead } from '../services/notificationsService';
import { preferences } from '../../../core/storage/preferences';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';

export function useNotifications() {
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [loadError,setLoadError] = useState('');
  const [loading,setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const [apiNotifications, setApiNotifications] = useState(null);

  // Almacén reactivo
  const storeData = useMemo(() => {
    void version;
    return getNotificationData();
  }, [version]);

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError('');
    fetchNotifications().then(data => {
      if (active && data) {
        setApiNotifications(data);
      }
    }).catch(error => { if(active) setLoadError(error.message); }).finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  }, [version]);

  const allNotifications = useMemo(() => apiNotifications || storeData.notifications || [], [apiNotifications, storeData]);

  // Filtrar avisos pertenecientes al rol o usuario actual
  const userNotifications = useMemo(() => {
    return allNotifications.filter((n) => n.role === currentUser?.role || n.userId === currentUser?.id);
  }, [allNotifications, currentUser?.role, currentUser?.id]);

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  // Filtrado según pestaña seleccionada
  const displayedNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return userNotifications.filter((n) => !n.read);
    }
    return userNotifications;
  }, [userNotifications, activeFilter]);

  // Preferencia de recordatorio de check-in para agentes (RF-17)
  const isAgent = currentUser?.role === 'agente';
  const reminderStorageKey = `pulso360_reminder_${currentUser?.id || 'usr-1'}`;
  const [reminderActive, setReminderActive] = useState(false);

  useEffect(() => {
    if (isAgent) {
      setReminderActive(preferences.readReminder(reminderStorageKey));
    }
  }, [isAgent, reminderStorageKey]);

  const handleToggleReminder = (newValue) => {
    const isChecked = typeof newValue === 'boolean' ? newValue : !reminderActive;
    setReminderActive(isChecked);
    preferences.saveReminder(reminderStorageKey, isChecked);
  };

  // Marcar aviso como leído y navegar a su destino
  const handleNotificationClick = async (e, notif) => {
    e.preventDefault();

    try { const result = await markNotificationRead(notif); if (result.success !== true) throw new Error(result.error?.message || 'No se pudo actualizar la lectura.'); setVersion((v) => v + 1); }
    catch(error) { setLoadError(error.message); return; }
    if (notif.href) {
      navigate(notif.href);
    }
  };

  // Marcar todas las notificaciones como leídas
  const handleMarkAllRead = async () => {
    try { const result = await markAllRead(currentUser); if (result.success !== true) throw new Error(result.error?.message || 'No se pudo actualizar la lectura.'); setVersion((v) => v + 1); }
    catch(error) { setLoadError(error.message); }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const roleHomePath = roleHomePaths[currentUser?.role] || '/login';

  const handleBack = () => {
    navigate(roleHomePath);
  };

  return { loading,loadError,
    activeFilter,
    setActiveFilter,
    userNotifications,
    unreadCount,
    displayedNotifications,
    isAgent,
    reminderActive,
    handleToggleReminder,
    handleNotificationClick,
    handleMarkAllRead,
    formatDate,
    handleBack,
    reload: () => setVersion((v) => v + 1)
  };
}
