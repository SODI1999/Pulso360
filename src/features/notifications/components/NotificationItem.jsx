// src/features/notifications/components/NotificationItem.jsx
// Elemento interactivo de aviso con semántica visual sobria (RF-17 / antislop-ui)

import { Icon } from '../../../core/components/Icon';

export function NotificationItem({
  notification = {},
  onClick = () => {},
  formatDate = () => ''
}) {
  const isUnread = !notification.read;

  // Clasificación contextual por tipo de aviso y color semántico (no arbitrario)
  const getNotificationMeta = () => {
    const titleLower = (notification.title || '').toLowerCase();
    const href = notification.href || '';

    if (href.includes('apoyo') || titleLower.includes('solicitud') || titleLower.includes('acompañamiento')) {
      return {
        icon: 'support',
        category: 'Acompañamiento SST',
        colorClass: 'notif-type--support'
      };
    }
    if (notification.role === 'sst' || titleLower.includes('alerta') || titleLower.includes('caída')) {
      return {
        icon: 'alertTriangle',
        category: 'Alerta Operativa',
        colorClass: 'notif-type--alert'
      };
    }
    if (titleLower.includes('turno') || titleLower.includes('check-in') || titleLower.includes('jornada')) {
      return {
        icon: 'clock',
        category: 'Gestión de Turno',
        colorClass: 'notif-type--shift'
      };
    }
    return {
      icon: 'bell',
      category: 'Aviso del Sistema',
      colorClass: 'notif-type--system'
    };
  };

  const { icon, category, colorClass } = getNotificationMeta();

  return (
    <article
      className={`notif-feed-item ${isUnread ? 'is-unread' : 'is-read'} ${colorClass}`}
      onClick={(e) => onClick(e, notification)}
      role="button"
      tabIndex={0}
      aria-label={`Aviso: ${notification.title}. Categoría: ${category}. Estado: ${isUnread ? 'Sin leer' : 'Leído'}.${notification.href ? ' Pulsa para abrir detalle.' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e, notification);
        }
      }}
    >
      <div className="notif-item-glyph" aria-hidden="true">
        <Icon name={icon} size={20} />
      </div>

      <div className="notif-item-main">
        <div className="notif-item-header">
          <div className="notif-item-meta">
            <span className="notif-item-category">{category}</span>
            <span className="notif-item-dot-sep">·</span>
            <span className="notif-item-date">{formatDate(notification.date)}</span>
          </div>

          {isUnread ? (
            <span className="notif-badge-unread">Sin leer</span>
          ) : (
            <span className="badge badge-neutral">Leído</span>
          )}
        </div>

        <h3 className="notif-item-title">{notification.title}</h3>

        {notification.context && (
          <p className="notif-item-context">{notification.context}</p>
        )}

        {notification.href && (
          <div className="notif-item-footer">
            <span className="notif-item-link-text">
              <span>Ver detalle</span>
              <Icon name="arrowRight" size={13} />
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
