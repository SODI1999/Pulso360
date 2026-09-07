// src/features/notifications/pages/NotificationsPage.jsx
// Centro de Notificaciones y Avisos Operativos (RF-17)

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

import '../../../styles/notifications.css';

export function NotificationsPage() {
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

  // Almacén reactivo
  const storeData = useMemo(() => pulsoStore.get(), [version]);
  const allNotifications = storeData.notifications || [];

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
              <div
                key={n.id}
                className={`notif-item ${!n.read ? 'unread' : ''}`}
                onClick={(e) => handleNotificationClick(e, n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNotificationClick(e, n);
                  }
                }}
              >
                <div className={`notif-dot ${n.read ? 'read' : ''}`} aria-hidden="true" />
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-context">{n.context}</div>
                  <div className="notif-date">{formatDate(n.date)}</div>
                </div>
                <Icon name="arrowRight" size={16} style={{ color: 'var(--c-texto-suave)' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferencia de Recordatorio para Agentes (RF-17) */}
      {isAgent && (
        <div className="notif-preferences-card">
          <div className="notif-toggle-row">
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--c-texto)' }}>
                Recordatorio diario de Check-in
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--c-texto-suave)' }}>
                Recibir un aviso en la plataforma al inicio de tu jornada para diligenciar la encuesta de bienestar.
              </p>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}>
              <input
                type="checkbox"
                checked={reminderActive}
                onChange={handleToggleReminder}
              />
              <span>{reminderActive ? 'Recordatorio activo' : 'Recordatorio desactivado'}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
