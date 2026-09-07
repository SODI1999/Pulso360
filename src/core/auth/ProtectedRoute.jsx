// src/core/auth/ProtectedRoute.jsx
// Guardián de seguridad y control de acceso basado en roles (RBAC)

import { Navigate, useLocation } from 'react-router-dom';
import { authService, roleLabels } from './authService';
import { pulsoStore } from '../storage/pulsoStore';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';

export function ProtectedRoute({ allowedRoles, children }) {
    const location = useLocation();
    const user = authService.getCurrentUser();

    // 1. Barrera de Autenticación: ¿Existe una sesión activa?
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 2. Barrera de Privacidad: Si es agente, ¿firmó la versión vigente de la política?
    if (authService.needsConsent(user) && location.pathname !== '/consentimiento') {
        return <Navigate to="/consentimiento" replace />;
    }

    // 3. Barrera de Autorización (RBAC): ¿Tiene el rol requerido para esta ruta?
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Registro inmutable de intento no autorizado en la auditoría del sistema
        pulsoStore.audit({
            actor: `${user.id} (${roleLabels[user.role] || user.role})`,
            action: 'ACCESO_DENEGADO_RBAC',
            target: location.pathname,
            status: 'DENEGADO'
        });

        return (
            <ForbiddenPage
                userRole={user.role}
                allowedRoles={allowedRoles}
            />
        );
    }

    // 4. Acceso Concedido: Renderiza la vista solicitada
    return children;
}
