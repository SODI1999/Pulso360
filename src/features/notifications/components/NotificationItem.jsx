// src/features/notifications/components/NotificationItem.jsx
// Elemento interactivo modular de aviso con indicador visual de lectura y navegación (RF-17)

import { Icon } from '../../../core/components/Icon';

export function NotificationItem({
  notification = {},
  onClick = () => {},
  formatDate = () => ''
}) {
  return (
    <div
      className={`notif-item ${!notification.read ? 'unread' : ''}`}
      onClick={(e) => onClick(e, notification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') {
            e.preventDefault();
          }
          onClick(e, notification);
        }
      }}
    >
      <div className={`notif-dot ${notification.read ? 'read' : ''}`} aria-hidden="true" />
      <div className="notif-content">
        <div className="notif-title">{notification.title}</div>
        <div className="notif-context">{notification.context}</div>
        <div className="notif-date">{formatDate(notification.date)}</div>
      </div>
      <Icon name="arrowRight" size={16} style={{ color: 'var(--c-texto-suave)' }} />
    </div>
  );
}
