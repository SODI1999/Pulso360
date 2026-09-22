// src/features/notifications/pages/NotificationsPage.jsx
// Centro de Notificaciones y Avisos Operativos (RF-17 / antislop-ui)

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { NotificationItem } from '../components/NotificationItem';
import { ReminderPreferencesCard } from '../components/ReminderPreferencesCard';

import '../../../styles/agent.css';
import '../../../styles/notifications.css';

export function NotificationsPage() {
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'

  // Almacén reactivo
  const storeData = useMemo(() => {
    void version;
    return pulsoStore.get();
  }, [version]);
  const allNotifications = useMemo(() => storeData.notifications || [], [storeData]);

  // Filtrar avisos pertenecientes al rol o usuario actual
  const userNotifications = useMemo(() => {
    return allNotifications.filter(
      (n) => n.role === currentUser?.role || n.userId === currentUser?.id
    );
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
      setReminderActive(localStorage.getItem(reminderStorageKey) === '1');
    }
  }, [isAgent, reminderStorageKey]);

  const handleToggleReminder = (newValue) => {
    const isChecked = typeof newValue === 'boolean' ? newValue : !reminderActive;
    setReminderActive(isChecked);
    localStorage.setItem(reminderStorageKey, isChecked ? '1' : '0');
  };

  // Marcar aviso como leído y navegar a su destino
  const handleNotificationClick = (e, notif) => {
    e.preventDefault();

    if (!notif.read) {
      const data = pulsoStore.get();
      const target = (data.notifications || []).find((item) => item.id === notif.id);
      if (target) {
        target.read = true;
        pulsoStore.save(data);
        setVersion((v) => v + 1);
      }
    }

    if (notif.href) {
      navigate(notif.href);
    }
  };

  // Marcar todas las notificaciones como leídas
  const handleMarkAllRead = () => {
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
      setVersion((v) => v + 1);
    }
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

  const roleHomePath = {
    agente: '/agente/panel',
    supervisor: '/supervisor/dashboard',
    sst: '/sst/analisis',
    admin: '/admin/configuracion',
    auditor: '/auditor/logs'
  }[currentUser?.role] || '/agente/panel';

  const handleBack = () => {
    navigate(roleHomePath);
  };

  return (
    <div className="notif-inbox-layout">
      {/* 1. Barra de Retorno idéntica a las demás vistas */}
      <nav className="notif-top-nav" aria-label="Navegación secundaria">
        <button
          type="button"
          className="notif-back-btn"
          onClick={handleBack}
          aria-label="Volver al panel principal"
        >
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* 2. Cabecera sobria del Centro de Notificaciones */}
      <header className="notif-inbox-header">
        <div className="notif-inbox-title-wrap">
          <h1 className="notif-inbox-title">Avisos y notificaciones</h1>
          <p className="notif-inbox-subtitle">
            Historial de novedades operativas, confirmaciones de solicitudes y alertas de tu jornada.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="notif-inbox-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllRead}
              aria-label="Marcar todas las notificaciones como leídas"
            >
              <Icon name="check" size={15} />
              <span>Marcar todas como leídas</span>
            </button>
          </div>
        )}
      </header>

      {/* 3. Pestañas de Filtro (Bandeja / No leídas) */}
      <div className="notif-filter-bar">
        <div className="notif-tabs" role="tablist" aria-label="Filtro de avisos">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`notif-tab-btn ${activeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span>Todas</span>
            <span className="notif-tab-count">{userNotifications.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'unread'}
            className={`notif-tab-btn ${activeFilter === 'unread' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            <span>Sin leer</span>
            {unreadCount > 0 && (
              <span className="notif-tab-count notif-tab-count--unread">{unreadCount}</span>
            )}
          </button>
        </div>

        <span className="notif-status-summary">
          {unreadCount > 0
            ? `${unreadCount} pendiente${unreadCount > 1 ? 's' : ''} de revisión`
            : 'Todo al día'}
        </span>
      </div>

      {/* 4. Feed de Notificaciones */}
      <section aria-label="Listado de notificaciones">
        <div className="notif-items-feed" role="feed">
          {displayedNotifications.length === 0 ? (
            <div className="notif-empty-inbox">
              <div className="notif-empty-icon-box" aria-hidden="true">
                <Icon name="bell" size={24} />
              </div>
              <h2 className="notif-empty-title">
                {activeFilter === 'unread' ? 'No tienes avisos sin leer' : 'Bandeja al día'}
              </h2>
              <p className="notif-empty-desc">
                {activeFilter === 'unread'
                  ? 'Has revisado todas las notificaciones pendientes. Puedes consultar el histórico completo en la pestaña "Todas".'
                  : 'No hay novedades operativas registradas para tu rol en este momento.'}
              </p>
            </div>
          ) : (
            displayedNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={handleNotificationClick}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </section>

      {/* 5. Ajustes de Turno (Solo para Agentes) */}
      {isAgent && (
        <ReminderPreferencesCard
          reminderActive={reminderActive}
          onToggleReminder={handleToggleReminder}
        />
      )}

      {/* 6. Nota Discreta de Privacidad y Confidencialidad */}
      <footer className="notif-confidentiality-footer" role="contentinfo">
        <Icon name="shield" size={16} />
        <span>
          <strong>Confidencialidad operativa:</strong> Los avisos son de carácter estrictamente individual. El sistema nunca expone reflexiones privadas de bitácora ni respuestas personales de bienestar.
        </span>
      </footer>
    </div>
  );
}
