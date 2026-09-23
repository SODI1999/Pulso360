import { useNotifications } from '../hooks/useNotifications';

// src/features/notifications/pages/NotificationsPage.jsx
// Centro de Notificaciones y Avisos Operativos (RF-17)

import { Icon } from '../../../core/components/Icon';
import { NotificationItem } from '../components/NotificationItem';
import { ReminderPreferencesCard } from '../components/ReminderPreferencesCard';

import '../../../styles/agent.css';
import '../../../styles/notifications.css';

export function NotificationsPage() {
  const {
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
    handleBack
  } = useNotifications();

  return (
    <div className="agent-page notif-inbox-layout">
      {/* 1. Subnavegación secundaria sobria */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button
          type="button"
          className="agent-back-btn"
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
        <ReminderPreferencesCard reminderActive={reminderActive} onToggleReminder={handleToggleReminder} />
      )}

      {/* 6. Nota Discreta de Privacidad y Confidencialidad */}
      <footer className="notif-confidentiality-footer" role="contentinfo">
        <Icon name="shield" size={16} />
        <span>
          <strong>Confidencialidad operativa:</strong> Los avisos son de carácter estrictamente individual. El
          sistema nunca expone reflexiones privadas de bitácora ni respuestas personales de bienestar.
        </span>
      </footer>
    </div>
  );
}
