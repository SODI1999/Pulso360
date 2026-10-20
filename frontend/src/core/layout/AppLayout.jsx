// src/core/layout/AppLayout.jsx
// Plantilla maestra con sidebar colapsable (expandido con árbol guía / compacto solo iconos) y topbar ergonómico

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService, roleLabels, roleHomePaths } from '../auth/authService';
import { pulsoStore } from '../storage/pulsoStore';
import { preferences } from '../storage/preferences';
import { Icon } from '../components/Icon';
import { InactivityModal } from '../components/InactivityModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { env } from '../config/env';

// Formatea "8" como "08:00" para el bloque de turno del topbar
const formatShiftHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

// Nombre del turno según la hora de inicio registrada por la organización
const shiftLabelFromHour = (start) => (start >= 5 && start < 12 ? 'mañana' : start < 19 ? 'tarde' : 'noche');

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [countsError,setCountsError] = useState('');
  const refreshCounts = useCallback(() => {
    authService.refreshSession().then(() => setCountsError('')).catch(() => {
      setCountsError('No se pudieron actualizar los avisos y pendientes.');
    });
  }, []);
  useEffect(() => {
    const refresh = () => setUser(authService.getCurrentUser());
    window.addEventListener('pulso360-session-changed', refresh);
    return () => window.removeEventListener('pulso360-session-changed', refresh);
  }, []);
  useEffect(() => {
    if (env.useMockStorage) return;
    window.addEventListener('pulso360-api-mutation',refreshCounts);
    return () => window.removeEventListener('pulso360-api-mutation',refreshCounts);
  }, [refreshCounts]);

  // Estado del sidebar colapsable (persiste en preferencias)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => preferences.readSidebarCollapsed(false));

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      preferences.saveSidebarCollapsed(next);
      return next;
    });
  };

  // Menú de cuenta (estado y referencia declarados antes del early return)
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const accountRef = useRef(null);

  // Cierra el menú de cuenta al hacer clic fuera o con Escape (devuelve el foco al botón)
  useEffect(() => {
    if (!accountOpen) return undefined;

    const handlePointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        accountRef.current?.querySelector('.account-trigger')?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  // Si no hay sesión, AppLayout no se renderiza (es controlado por ProtectedRoute)
  if (!user) return null;

  const menuItems = authService.getMenuItems(user);
  const homePath = roleHomePaths[user.role] || '/login';
  const roleLabel = roleLabels[user.role] || user.role;

  // Estructura de navegación: organizar por grupos temáticos para el árbol visual
  const menuGroups = [...new Set(menuItems.map((item) => item.group).filter(Boolean))];
  const showGroupHeadings = menuGroups.length > 1;

  // Organizar ítems en grupos
  const groupedNavigation = [];
  if (showGroupHeadings) {
    menuGroups.forEach((groupName) => {
      const items = menuItems.filter((item) => item.group === groupName);
      if (items.length > 0) {
        groupedNavigation.push({ name: groupName, items });
      }
    });
    // Ítems sin grupo
    const ungrouped = menuItems.filter((item) => !item.group);
    if (ungrouped.length > 0) {
      groupedNavigation.push({ name: null, items: ungrouped });
    }
  } else {
    groupedNavigation.push({ name: null, items: menuItems });
  }

  // Badges discretos en ítems de menú (pastel suave) según datos reales de la operación
  const storeData = env.useMockStorage ? pulsoStore.get() : {};
  const navigationCounts = countsError ? {} : user.navigationCounts || {};
  const pendingAlerts = env.useMockStorage ? (storeData.alerts || []).filter(
    (a) => a.status === 'GENERADA' || a.status === 'EN_REVISION'
  ).length : navigationCounts.alerts;
  const pendingSupport = env.useMockStorage ? (storeData.supportRequests || []).filter(
    (s) => s.status !== 'Cerrada' && s.status !== 'Resuelta'
  ).length : navigationCounts.support;
  const pendingHabeas = env.useMockStorage ? (storeData.habeasRequests || []).filter(
    (h) => h.status === 'En trámite'
  ).length : navigationCounts.habeas;

  const getItemBadge = (href) => {
    if (href === '/sst/alertas' && pendingAlerts > 0) {
      return { count: pendingAlerts, variant: 'alert' };
    }
    if (href === '/sst/buzon' && pendingSupport > 0) {
      return { count: pendingSupport, variant: 'info' };
    }
    if (href === '/admin/solicitudes' && pendingHabeas > 0) {
      return { count: pendingHabeas, variant: 'neutral' };
    }
    return null;
  };

  // Contexto del rol en el topbar: campaña para perfiles operativos, área institucional
  // para SST, auditoría y administración (ambos campos vienen del registro del usuario).
  const contextLabel = user.campaign || user.teamName || null;

  // Bloque de turno del topbar: sólo el agente tiene horario asignado (shiftStartHour)
  const shiftStart = Number(user.shiftStartHour);
  const shiftInfo =
    user.role === 'agente' && Number.isFinite(shiftStart)
      ? {
          label: `Turno ${shiftLabelFromHour(shiftStart)}`,
          hours: `${formatShiftHour(shiftStart)}–${formatShiftHour(shiftStart + 8)}`
        }
      : null;

  // Calcular notificaciones no leídas para el usuario o su rol
  const notifications = storeData.notifications || [];
  const unreadCount = env.useMockStorage ? notifications.filter(
    (n) => !n.read && (n.role === user.role || n.userId === user.id)
  ).length : navigationCounts.unread;

  // Foto de perfil del avatar institucional para roles operativos y de salud ocupacional
  const roleAvatarImg =
    user.avatar ||
    (user.role === 'agente'
      ? '/assets/fotos/bpo-agent-profile.jpg'
      : user.role === 'sst'
        ? '/assets/fotos/bpo-sst-guardian.jpg'
        : user.role === 'supervisor'
          ? '/assets/fotos/bpo-avatar-male-supervisor.webp'
          : null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`app-layout${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
      {/* 1. Barra Lateral de Navegación (Sidebar) */}
      <aside
        className={`app-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar-header">
          <Link
            to={homePath}
            className="sidebar-brand-link"
            title={sidebarCollapsed ? 'Pulso360 (Ir al inicio)' : 'Ir al panel principal de Pulso360'}
            aria-label="Ir al panel principal de Pulso360"
          >
            <img
              src="/assets/marca/symbol.svg"
              alt="Pulso360"
              className="sidebar-logo"
            />
            <span className="sidebar-brand-name" aria-hidden={sidebarCollapsed}>
              Pulso360
            </span>
          </Link>
        </div>

        <nav className="sidebar-nav" aria-label="Destinos del rol">
          {groupedNavigation.map((group, groupIdx) => (
            <div key={group.name || `group-${groupIdx}`} className="sidebar-nav-group">
              {showGroupHeadings && group.name && (
                <div
                  className="sidebar-nav-heading"
                  id={`group-heading-${groupIdx}`}
                  aria-hidden={sidebarCollapsed}
                >
                  {group.name}
                </div>
              )}

              <div
                className={`nav-group-items${showGroupHeadings && group.name ? ' nav-group-tree' : ''}`}
                role={group.name ? 'group' : undefined}
                aria-labelledby={showGroupHeadings && group.name ? `group-heading-${groupIdx}` : undefined}
              >
                {group.items.map((item) => {
                  const badge = getItemBadge(item.href);
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      aria-label={sidebarCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `nav-item${isActive ? ' active' : ''}${item.mobileOnly ? ' nav-item--mobile-only' : ''}`
                      }
                    >
                      <span className="nav-icon" aria-hidden="true">
                        <Icon name={item.icon} size={18} />
                      </span>

                      <span className="nav-item-label" aria-hidden={sidebarCollapsed}>
                        {item.label}
                      </span>

                      {badge && (
                        <span
                          className={`nav-item-badge badge-${badge.variant}`}
                          aria-label={`${badge.count} pendientes`}
                          aria-hidden={sidebarCollapsed}
                        >
                          {badge.count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Acción prioritaria de emergencia exclusiva para Agentes */}
          {user.role === 'agente' && (
            <div className="sidebar-crisis-container">
              <hr className="sidebar-divider" />
              <NavLink
                to="/apoyo-crisis"
                className="nav-item nav-crisis"
                title={sidebarCollapsed ? 'Apoyo inmediato' : undefined}
                aria-label={sidebarCollapsed ? 'Apoyo inmediato' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon name="Siren" size={18} />
                </span>
                <span className="nav-item-label" aria-hidden={sidebarCollapsed}>
                  Apoyo inmediato
                </span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Pie de barra lateral: Ventana sutil y pequeña de usuario */}
        <div className="sidebar-footer" ref={accountRef}>
          {accountOpen && (
            <div
              className={`account-popover account-menu${
                sidebarCollapsed ? ' account-popover--floating account-menu--collapsed' : ' account-popover--embedded'
              }`}
              role="menu"
              aria-label="Opciones de cuenta"
            >
              {/* Cabecera contextual ligera sin duplicar la tarjeta de identidad */}
              <div className="account-popover-context-header">
                <span className="account-popover-email" title={user.email}>
                  {user.email}
                </span>
                <span className="account-popover-shift-badge">
                  <Icon name="Clock" size={11} />
                  <span>{contextLabel || roleLabel}</span>
                </span>
              </div>

              <div className="account-popover-divider" role="separator" />

              {/* Acciones de cuenta */}
              <div className="account-popover-actions">
                <button
                  type="button"
                  className="account-popover-item account-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    setProfileModalOpen(true);
                  }}
                >
                  <Icon name="User" size={15} />
                  <span>Mi perfil y preferencias</span>
                </button>

                {/* "Mis datos y privacidad" es un módulo exclusivo del rol agente (Habeas Data) */}
                {user.role === 'agente' && (
                  <Link
                    to="/agente/mis-datos"
                    className="account-popover-item account-menu-item"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                  >
                    <Icon name="ShieldCheck" size={15} />
                    <span>Mis datos y privacidad</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="account-popover-item account-popover-logout account-menu-item account-menu-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <Icon name="LogOut" size={15} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className={`user-card account-trigger${sidebarCollapsed ? ' is-compact' : ''}`}
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title={sidebarCollapsed ? `Cuenta: ${user.name} (${roleLabel})` : 'Opciones de cuenta'}
            aria-label={sidebarCollapsed ? `Cuenta de ${user.name}` : 'Opciones de cuenta'}
          >
            <div className={`user-avatar role-${user.role}`} aria-hidden="true">
              {roleAvatarImg ? (
                <img
                  src={roleAvatarImg}
                  alt={user.name}
                  className="user-avatar-photo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="user-info" aria-hidden={sidebarCollapsed}>
              <div className="user-name" title={user.name}>
                {user.name}
              </div>
              <span className={`user-role-badge role-${user.role}`}>{roleLabel}</span>
            </div>
            <span className="account-chevron" aria-hidden="true">
              <Icon name="ChevronUp" size={16} />
            </span>
          </button>
        </div>
      </aside>

      {/* 2. Área de Contenido Principal */}
      <div className="app-main">
        {/* Barra Superior (Topbar / Navbar) */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-toggle-btn"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Mostrar menú lateral' : 'Ocultar menú lateral'}
              title={sidebarCollapsed ? 'Mostrar menú lateral' : 'Ocultar menú lateral'}
            >
              <Icon name={sidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={18} />
            </button>

            <div className="topbar-heading">
              {/* Contexto del rol (campaña o área) */}
              <span className="topbar-context">{contextLabel || 'Pulso360'}</span>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Acceso de emergencia visible sin scroll en móvil */}
            {user.role === 'agente' && (
              <Link to="/apoyo-crisis" className="btn btn-topbar-crisis" aria-label="Apoyo inmediato">
                <Icon name="Siren" size={16} />
                <span>Apoyo</span>
              </Link>
            )}

            {/* Horario del turno (sólo agente) */}
            {shiftInfo && (
              <div className="topbar-shift">
                <span className="topbar-shift-label">{shiftInfo.label}</span>
                <span className="topbar-shift-hours">{shiftInfo.hours}</span>
              </div>
            )}

            {/* Botón de avisos / notificaciones con badge tipo píldora limpia */}
            <Link
              to="/notificaciones"
              className={`btn btn-topbar-notifications${unreadCount > 0 ? ' has-unread' : ''}`}
              aria-label={unreadCount > 0 ? `Ver avisos (${unreadCount} sin leer)` : 'Ver avisos'}
            >
              <span className="topbar-bell-icon" aria-hidden="true">
                <Icon name={unreadCount > 0 ? 'BellDot' : 'Bell'} size={18} />
              </span>
              <span>Avisos</span>
              {unreadCount > 0 && (
                <span className="topbar-pill-badge" aria-hidden="true">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Cierre de sesión en topbar para pantallas táctiles/móviles */}
            <button
              type="button"
              className="btn btn-topbar-logout"
              onClick={handleLogout}
              title="Cerrar sesión actual"
            >
              <Icon name="LogOut" size={16} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          {countsError && <div className="alert-banner danger" role="alert">
            <span>{countsError}</span><button type="button" className="btn btn-secondary btn-sm" onClick={refreshCounts}>Reintentar</button>
          </div>}
          <Outlet />
        </main>
      </div>

      {/* 3. Modal de Inactividad Global */}
      <InactivityModal />

      {/* 4. Modal de Perfil de Usuario y Preferencias */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onProfileUpdated={() => setUser(authService.getCurrentUser())}
      />
    </div>
  );
}
