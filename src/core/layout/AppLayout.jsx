// src/core/layout/AppLayout.jsx
// Plantilla maestra de la aplicación con navegación reactiva por roles y consentimientos

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService, roleLabels, roleHomePaths } from '../auth/authService';
import { pulsoStore } from '../storage/pulsoStore';
import { Icon } from '../components/Icon';
import { InactivityModal } from '../components/InactivityModal';

export function AppLayout() {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

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
                        <img src="/assets/imágenes/logo.png" alt="Pulso360 Logo" className="sidebar-logo" />
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
                        <span>Pulso360</span>
                        <span style={{ color: 'var(--c-texto-mutado)', fontSize: '13px' }}>|</span>
                        <span style={{ fontSize: '13.5px', color: 'var(--c-texto-suave)', fontWeight: '500' }}>
                            {roleLabel}
                        </span>
                    </div>

                    <div className="topbar-actions">
                        <Link to="/notificaciones" className="btn btn-topbar-notifications" aria-label="Ver avisos">
                            <Icon name="notifications" size={18} />
                            <span>Avisos</span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: 'var(--c-critico)',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '1px 7px',
                                    borderRadius: '10px',
                                    marginLeft: '4px'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <button className="btn btn-topbar-logout" onClick={handleLogout} title="Cerrar sesión actual">
                            <Icon name="logout" size={18} />
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
