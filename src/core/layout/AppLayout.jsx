// src/core/layout/AppLayout.jsx
// Plantilla maestra de la aplicación con navegación reactiva por roles y consentimientos

import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService, roleLabels, roleHomePaths } from '../auth/authService';
import { pulsoStore } from '../storage/pulsoStore';
import { Icon } from '../components/Icon';
import { InactivityModal } from '../components/InactivityModal';

export function AppLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation(); // debe ir antes del early return (regla de hooks)
    const user = authService.getCurrentUser();

    // Mapa de rutas → nombre de página visible en el topbar (H-03 antislop)
    const PAGE_NAMES = {
        '/agente/panel': 'Panel de turno',
        '/agente/checkin': 'Check-in de bienestar',
        '/agente/bitacora': 'Bitácora personal',
        '/agente/mi-analisis': 'Mi análisis',
        '/agente/mi-bienestar': 'Mi bienestar',
        '/agente/apoyo': 'Canal de apoyo',
        '/agente/mis-datos': 'Mis datos y privacidad',
        '/apoyo-crisis': 'Apoyo inmediato',
        '/supervisor/panel': 'Panel de equipo',
        '/supervisor/acciones': 'Acciones de equipo',
        '/sst/panel': 'Panel SST',
        '/sst/alertas': 'Bandeja de alertas',
        '/sst/reglas-alertas': 'Reglas de alerta',
        '/sst/intervenciones': 'Intervenciones',
        '/sst/buzon': 'Buzón de apoyo',
        '/auditor/auditoria': 'Registro de auditoría',
        '/admin/organizacion': 'Organización',
        '/admin/usuarios-roles': 'Usuarios y roles',
        '/admin/parametros': 'Parámetros del sistema',
        '/admin/importar': 'Importación CSV',
        '/admin/solicitudes': 'Solicitudes Habeas Data',
        '/reportes': 'Reportes',
        '/notificaciones': 'Avisos',
    };

    const currentPageName = PAGE_NAMES[pathname] ?? null;

    // Si no hay sesión, AppLayout no se renderiza (es controlado por ProtectedRoute)
    if (!user) return null;

    const menuItems = authService.getMenuItems(user);
    const homePath = roleHomePaths[user.role] || '/login';
    const roleLabel = roleLabels[user.role] || user.role;

    // Calcular notificaciones no leídas para el usuario o su rol
    const notifications = pulsoStore.get().notifications || [];
    const unreadCount = notifications.filter(n =>
        !n.read && (n.role === user.role || n.userId === user.id)
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
                        <img src="/assets/marca/logo.png" alt="Pulso360 Logo" className="sidebar-logo" />
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon" aria-hidden="true">
                                <Icon name={item.icon} size={20} />
                            </span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    {/* Acción prioritaria de emergencia exclusiva para Agentes */}
                    {user.role === 'agente' && (
                        <>
                            <hr style={{ margin: '8px 12px', border: 'none', borderTop: '1px solid var(--c-borde-suave)' }} />
                            <NavLink to="/apoyo-crisis" className="nav-item nav-crisis">
                                <span className="nav-icon" aria-hidden="true">
                                    <Icon name="support" size={20} />
                                </span>
                                <span>Apoyo inmediato</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Pie de barra lateral con información del usuario autenticado */}
                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className={`user-avatar role-${user.role}`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name" title={user.name}>{user.name}</div>
                            <span className={`user-role-badge role-${user.role}`}>
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 2. Área de Contenido Principal */}
            <div className="app-main">
                <header className="app-topbar">
                    <div className="topbar-title">
                        {/* H-03 antislop: muestra la página actual en vez de datos ya visibles en el sidebar */}
                        {currentPageName
                            ? <span>{currentPageName}</span>
                            : <span className="topbar-brand-fallback">Pulso360</span>
                        }
                    </div>

                    <div className="topbar-actions">
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
