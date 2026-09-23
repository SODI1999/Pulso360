// src/core/layout/AppLayout.jsx
// Plantilla maestra de la aplicación con navegación reactiva por roles y consentimientos

import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService, roleLabels, roleHomePaths } from '../auth/authService';
import { pulsoStore } from '../storage/pulsoStore';
import { Icon } from '../components/Icon';
import { InactivityModal } from '../components/InactivityModal';

// Formatea "8" como "08:00" para el bloque de turno del topbar
const formatShiftHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

// Nombre del turno según la hora de inicio registrada por la organización
const shiftLabelFromHour = (start) => (start >= 5 && start < 12 ? 'mañana' : start < 19 ? 'tarde' : 'noche');

export function AppLayout() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Menú de cuenta (estado y referencia deben declararse antes del early return)
  const [accountOpen, setAccountOpen] = useState(false);
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

  // El topbar no repite el nombre de la página: éste vive en el encabezado propio
  // de cada vista y en el destino activo del sidebar. Repetirlo duplicaba
  // información sin añadir orientación (decisión anti-slop sobre duplicación).

  // Si no hay sesión, AppLayout no se renderiza (es controlado por ProtectedRoute)
  if (!user) return null;

  const menuItems = authService.getMenuItems(user);
  const homePath = roleHomePaths[user.role] || '/login';
  const roleLabel = roleLabels[user.role] || user.role;

  // Los grupos de navegación reducen la carga de lectura en menús largos.
  // Sólo se dibujan encabezados cuando el rol tiene más de un grupo (el auditor tiene 1 ítem).
  const menuGroups = [...new Set(menuItems.map((item) => item.group).filter(Boolean))];
  const showGroupHeadings = menuGroups.length > 1;

  // Contexto del rol en el topbar: campaña para perfiles operativos, área institucional
  // para SST, auditoría y administración (ambos campos vienen del registro del usuario).
  const contextLabel = user.campaign || user.teamName || null;

  // Bloque de turno del topbar: sólo el agente tiene horario asignado (shiftStartHour);
  // otros roles no lo tienen y mostrarlo sería inventar un dato inexistente.
  const shiftStart = Number(user.shiftStartHour);
  const shiftInfo =
    user.role === 'agente' && Number.isFinite(shiftStart)
      ? {
          label: `Turno ${shiftLabelFromHour(shiftStart)}`,
          hours: `${formatShiftHour(shiftStart)}–${formatShiftHour(shiftStart + 8)}`
        }
      : null;

  // Calcular notificaciones no leídas para el usuario o su rol
  const notifications = pulsoStore.get().notifications || [];
  const unreadCount = notifications.filter(
    (n) => !n.read && (n.role === user.role || n.userId === user.id)
  ).length;

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* 1. Barra Lateral de Navegación */}
      <aside className="app-sidebar" aria-label="Navegación principal">
        <div className="sidebar-header">
          <Link to={homePath} className="sidebar-brand-link" title="Ir al panel principal">
            <img src="/assets/marca/logo.webp" alt="" className="sidebar-logo" />
            <span className="sidebar-brand-name">Pulso360</span>
          </Link>
        </div>

        <nav className="sidebar-nav" aria-label="Destinos del rol">
          {menuItems.map((item, index) => (
            <Fragment key={item.href}>
              {showGroupHeadings &&
                item.group &&
                (index === 0 || menuItems[index - 1].group !== item.group) && (
                  <span className="sidebar-nav-heading">{item.group}</span>
                )}
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}${item.mobileOnly ? ' nav-item--mobile-only' : ''}`
                }
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon name={item.icon} size={20} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            </Fragment>
          ))}

          {/* Acción prioritaria de emergencia exclusiva para Agentes */}
          {user.role === 'agente' && (
            <>
              <hr
                style={{ margin: '8px 12px', border: 'none', borderTop: '1px solid var(--c-borde-suave)' }}
              />
              <NavLink to="/apoyo-crisis" className="nav-item nav-crisis">
                <span className="nav-icon" aria-hidden="true">
                  <Icon name="support" size={20} />
                </span>
                <span>Apoyo inmediato</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Pie de barra lateral: las acciones de cuenta viven juntas en un menú */}
        <div className="sidebar-footer" ref={accountRef}>
          {accountOpen && (
            <div className="account-menu" role="menu" aria-label="Opciones de cuenta">
              {/* "Mis datos y privacidad" es un módulo exclusivo del rol agente (Habeas Data) */}
              {user.role === 'agente' && (
                <Link
                  to="/agente/mis-datos"
                  className="account-menu-item"
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  <Icon name="fileShield" size={16} />
                  <span>Mis datos y privacidad</span>
                </Link>
              )}
              <button type="button" className="account-menu-item" role="menuitem" onClick={handleLogout}>
                <Icon name="logout" size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
          <button
            type="button"
            className="user-card account-trigger"
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            title="Opciones de cuenta"
          >
            <div className={`user-avatar role-${user.role}`} aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name" title={user.name}>
                {user.name}
              </div>
              <span className={`user-role-badge role-${user.role}`}>{roleLabel}</span>
            </div>
            <span className="account-chevron" aria-hidden="true">
              <Icon name="chevronUp" size={16} />
            </span>
          </button>
        </div>
      </aside>

      {/* 2. Área de Contenido Principal */}
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-heading">
            {/* Contexto del rol (campaña o área). No repite el nombre de la página:
                            ese título ya lo muestra la propia vista como h1 */}
            <span className="topbar-context">{contextLabel || 'Pulso360'}</span>
          </div>

          <div className="topbar-actions">
            {/* Acceso de emergencia visible sin scroll en móvil (auditoría 015,
                            hallazgo 3). En escritorio permanece en el sidebar. */}
            {user.role === 'agente' && (
              <Link to="/apoyo-crisis" className="btn btn-topbar-crisis" aria-label="Apoyo inmediato">
                <Icon name="support" size={16} />
                <span>Apoyo</span>
              </Link>
            )}

            {/* Horario del turno: reduce incertidumbre sobre la jornada que está registrando */}
            {shiftInfo && (
              <div className="topbar-shift">
                <span className="topbar-shift-label">{shiftInfo.label}</span>
                <span className="topbar-shift-hours">{shiftInfo.hours}</span>
              </div>
            )}

            <Link
              to="/notificaciones"
              className={`btn btn-topbar-notifications${unreadCount > 0 ? ' has-unread' : ''}`}
              aria-label={unreadCount > 0 ? `Ver avisos (${unreadCount} sin leer)` : 'Ver avisos'}
            >
              <span className="topbar-bell-icon" aria-hidden="true">
                <Icon name="notifications" size={18} />
              </span>
              <span>Avisos</span>
              {unreadCount > 0 && (
                <span className="topbar-pill-badge" aria-hidden="true">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* En computador el cierre de sesión vive en el menú de cuenta del sidebar.
                            Permanece aquí en móvil porque el pie del sidebar se oculta en pantallas pequeñas. */}
            <button className="btn btn-topbar-logout" onClick={handleLogout} title="Cerrar sesión actual">
              <Icon name="logout" size={16} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* 3. Modal de Inactividad Global */}
      <InactivityModal />
    </div>
  );
}
