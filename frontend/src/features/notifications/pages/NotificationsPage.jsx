import { useNotifications } from '../hooks/useNotifications';

// src/features/notifications/pages/NotificationsPage.jsx
// Centro de Notificaciones y Avisos Operativos (RF-17)

import { Icon } from '../../../core/components/Icon';
import { handleTabNavigation } from '../../../core/components/tabNavigation';
import { NotificationItem } from '../components/NotificationItem';
import { ReminderPreferencesCard } from '../components/ReminderPreferencesCard';

import '../../../styles/agent.css';
import '../../../styles/notifications.css';

export function NotificationsPage() {
  const { loading,loadError,
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
    reload
  } = useNotifications();

  return (
    <div className="agent-page notif-inbox-layout">
      {loading && userNotifications.length === 0 && (
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando notificaciones del servidor…</p>
        </div>
      )}
      {loadError && (
        <div
          className="alert-banner danger"
          role="alert"
          style={{
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <span>{loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}
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
            id="notifications-tab-all"
            aria-controls="notifications-panel"
            data-tab-value="all"
            tabIndex={activeFilter === 'all' ? 0 : -1}
            onKeyDown={event => handleTabNavigation(event, setActiveFilter)}
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
            id="notifications-tab-unread"
            aria-controls="notifications-panel"
            data-tab-value="unread"
            tabIndex={activeFilter === 'unread' ? 0 : -1}
            onKeyDown={event => handleTabNavigation(event, setActiveFilter)}
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
      <section role="tabpanel" id="notifications-panel"
        aria-labelledby={`notifications-tab-${activeFilter}`} tabIndex={0}>
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
          <strong>Alcance de los avisos:</strong> Esta vista reúne notificaciones dirigidas a tu cuenta o a tu rol.
          Una notificación compartida por rol puede ser visible para otras personas con ese mismo permiso.
        </span>
      </footer>
    </div>
  );
}
