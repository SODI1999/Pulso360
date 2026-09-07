// src/features/notifications/pages/NotificationsPage.jsx
// Centro de Notificaciones y Avisos Operativos (RF-17)

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { NotificationItem } from '../components/NotificationItem';
import { ReminderPreferencesCard } from '../components/ReminderPreferencesCard';

import '../../../styles/notifications.css';

export function NotificationsPage() {
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

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

  // Preferencia de recordatorio de check-in para agentes (RF-17)
  const isAgent = currentUser?.role === 'agente';
  const reminderStorageKey = `pulso360_reminder_${currentUser?.id || 'usr-1'}`;
  const [reminderActive, setReminderActive] = useState(false);

  useEffect(() => {
    if (isAgent) {
      setReminderActive(localStorage.getItem(reminderStorageKey) === '1');
    }
  }, [isAgent, reminderStorageKey]);

  const handleToggleReminder = (e) => {
    const isChecked = e.target.checked;
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

  return (
    <div className="notif-container">
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Centro de notificaciones y avisos</h1>
          <p className="page-subtitle">
            Avisos operativos, confirmaciones de solicitudes y novedades institucionales (RF-17).
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleMarkAllRead}
          >
            <Icon name="check" size={16} />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {/* Banner Informativo */}
      <div className="alert-banner info">
        <Icon name="info" size={18} />
        <div>
          <strong>Principio de Discreción y Privacidad:</strong> Los avisos son contextuales y no exponen contenido de bitácoras ni puntajes individuales de check-ins en las vistas colectivas.
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Avisos recibidos</h2>
            <div className="card-subtitle">
              {unreadCount > 0
                ? `Tienes ${unreadCount} aviso${unreadCount > 1 ? 's' : ''} pendiente${unreadCount > 1 ? 's' : ''} de lectura.`
                : 'No tienes avisos no leídos.'}
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="badge badge-info">{unreadCount} no leídas</span>
          )}
        </div>

        {userNotifications.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
            No tienes avisos registrados en el sistema.
          </p>
        ) : (
          <div className="notif-list">
            {userNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={handleNotificationClick}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preferencia Modular de Recordatorio para Agentes (RF-17) */}
      {isAgent && (
        <ReminderPreferencesCard
          reminderActive={reminderActive}
          onToggleReminder={handleToggleReminder}
        />
      )}
    </div>
  );
}
