// src/core/auth/AccessDenied.jsx
// Vista estándar para respuestas de autorización HTTP 403 (Acceso Denegado por RBAC)

import { useNavigate } from 'react-router-dom';
import { authService, roleLabels, roleHomePaths } from './authService';
import { Icon } from '../components/Icon';

/**
 * Explica una denegación sin cambiar las reglas de acceso de la ruta.
 * @param {object} props Contexto de autorización ya resuelto por ProtectedRoute.
 * @param {string} [props.userRole] Rol de la sesión actual.
 * @param {string[]} [props.allowedRoles] Roles admitidos por la ruta existente.
 * @param {boolean} [props.standalone] Ofrece main cuando la vista no está dentro de AppLayout.
 * @returns {JSX.Element} Estado protegido con regreso al panel del rol o al inicio de sesión.
 */
export function AccessDenied({ userRole, allowedRoles = [], standalone = false }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const effectiveRole = userRole || user?.role || null;

  const currentRoleLabel = roleLabels[effectiveRole] || effectiveRole;
  const allowedLabels = allowedRoles.map((r) => roleLabels[r] || r).join(', ') || 'otros roles autorizados';
  const targetHome = roleHomePaths[effectiveRole] || '/login';
  const Container = standalone ? 'main' : 'section';

  return (
    <Container
      aria-labelledby="access-denied-heading"
      className="page-container"
      style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="card"
        style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px 28px' }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'var(--c-critico-bg)',
            color: 'var(--c-critico)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid var(--c-critico-border)'
          }}
        >
          <Icon name="lock" size={32} />
        </div>

        <h1 id="access-denied-heading" style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: 'var(--c-texto)' }}>
          Acceso no autorizado
        </h1>

        <p
          style={{ fontSize: '14px', color: 'var(--c-texto-suave)', lineHeight: '1.6', marginBottom: '24px' }}
        >
          {effectiveRole ? <>
            Tu rol actual es <strong>{currentRoleLabel}</strong>. Esta sección está reservada exclusivamente
            para: <strong>{allowedLabels}</strong>.
          </> : 'No hay una sesión activa. Inicia sesión con una cuenta autorizada para acceder a esta sección.'}
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(targetHome)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Icon name="arrowLeft" size={18} />
          <span>{effectiveRole ? 'Volver a mi panel' : 'Iniciar sesión'}</span>
        </button>
      </div>
    </Container>
  );
}
