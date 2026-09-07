// src/core/auth/authService.js
// Servicio de autenticación, control de sesiones y permisos por rol (RBAC)

import { pulsoStore } from '../storage/pulsoStore';

const SESSION_KEY = 'pulso360_current_session';
const GUARD_KEY = 'pulso360_login_guard';
const CONTEXT_403 = 'pulso360_403_context';

export const roleLabels = {
    agente: 'Agente',
    supervisor: 'Supervisor',
    sst: 'Profesional SST',
    auditor: 'Auditor',
    admin: 'Administrador'
};

// Rutas base o paneles de bienvenida para cada rol
export const roleHomePaths = {
    agente: '/agente/panel',
    supervisor: '/supervisor/panel',
    sst: '/sst/panel',
    auditor: '/auditor/auditoria',
    admin: '/admin/organizacion'
};

// Menús de navegación por rol
export const roleMenus = {
    agente: [
        { label: 'Mi Panel', icon: 'dashboard', href: '/agente/panel' },
        { label: 'Check-in Diario', icon: 'favorite', href: '/agente/checkin' },
        { label: 'Bitácora & NLP', icon: 'edit_note', href: '/agente/bitacora' },
        { label: 'Mi análisis', icon: 'insights', href: '/agente/mi-analisis' },
        { label: 'Mi bienestar', icon: 'monitoring', href: '/agente/mi-bienestar' },
        { label: 'Acompañamiento', icon: 'support_agent', href: '/agente/apoyo' },
        { label: 'Mis datos', icon: 'fileShield', href: '/agente/mis-datos' }
    ],
    supervisor: [
        { label: 'Panel de Equipo', icon: 'group', href: '/supervisor/panel' },
        { label: 'Intervenciones', icon: 'task_alt', href: '/supervisor/acciones' },
        { label: 'Reporte de Equipo', icon: 'summarize', href: '/reportes' }
    ],
    sst: [
        { label: 'Panel Agregado', icon: 'analytics', href: '/sst/panel' },
        { label: 'Bandeja de Alertas', icon: 'notifications_active', href: '/sst/alertas' },
        { label: 'Reglas de Alertas', icon: 'tune', href: '/sst/reglas-alertas' },
        { label: 'Intervenciones', icon: 'healing', href: '/sst/intervenciones' },
        { label: 'Buzón de Acompañamiento', icon: 'mark_email_unread', href: '/sst/buzon' },
        { label: 'Reportes Agregados', icon: 'summarize', href: '/reportes' }
    ],
    auditor: [
        { label: 'Registro de Auditoría', icon: 'audit', href: '/auditor/auditoria' }
    ],
    admin: [
        { label: 'Organización', icon: 'hierarchy', href: '/admin/organizacion' },
        { label: 'Usuarios y Roles', icon: 'users', href: '/admin/usuarios-roles' },
        { label: 'Parámetros', icon: 'tune', href: '/admin/parametros' },
        { label: 'Importar CSV', icon: 'upload_file', href: '/admin/importar' },
        { label: 'Habeas Data', icon: 'fileShield', href: '/admin/solicitudes' },
        { label: 'Reportes', icon: 'summarize', href: '/reportes' }
    ]
};

// Ayudantes de seguridad contra fuerza bruta
const getGuard = () => {
    try {
        return JSON.parse(localStorage.getItem(GUARD_KEY) || '{}');
    } catch {
        return {};
    }
};

const saveGuard = (guardData) => localStorage.setItem(GUARD_KEY, JSON.stringify(guardData));

export const authService = {
    // Retorna el usuario conectado actualmente o null
    getCurrentUser: () => {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    // Retorna el tiempo en milisegundos que le queda de bloqueo al login
    getRemainingLockMs: () => {
        return Math.max(0, Number(getGuard().blockedUntil || 0) - Date.now());
    },

    // Proceso de inicio de sesión (Asíncrono: preparado para fetch a Express en el futuro)
    login: async (email, password) => {
        // Seguridad: Ante cualquier intento de login, invalidamos cualquier sesión previa residual
        sessionStorage.removeItem(SESSION_KEY);

        // 1. Verificar si está bloqueado por intentos fallidos
        const lockedTime = authService.getRemainingLockMs();
        if (lockedTime > 0) {
            return {
                success: false,
                locked: true,
                remainingMs: lockedTime,
                message: 'Demasiados intentos. Espera a que termine el bloqueo temporal.'
            };
        }

        // 2. Buscar al usuario en la base de datos (hoy pulsoStore, mañana tu API)
        const data = pulsoStore.get();
        const cleanEmail = String(email || '').trim().toLowerCase();
        const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
        const valid = Boolean(user && password === '123456');

        // 3. Si la contraseña no coincide
        if (!valid) {
            const guard = getGuard();
            guard.failed = Number(guard.failed || 0) + 1;

            // Bloqueo de 15 minutos tras 5 intentos fallidos
            if (guard.failed >= 5) {
                guard.blockedUntil = Date.now() + (15 * 60 * 1000);
                guard.failed = 0;
            }
            saveGuard(guard);

            pulsoStore.audit({
                actor: user ? `${user.id} (${roleLabels[user.role] || user.role})` : 'actor-no-identificado',
                action: 'INTENTO_FALLIDO_AUTENTICACION',
                target: 'Inicio de sesión',
                status: 'DENEGADO'
            });

            if (guard.blockedUntil) {
                return {
                    success: false,
                    locked: true,
                    remainingMs: 15 * 60 * 1000,
                    message: 'Demasiados intentos. Se aplicó un bloqueo temporal de 15 minutos.'
                };
            }
            return { success: false, message: 'Las credenciales no son válidas. Verifica tu correo y contraseña.' };
        }

        // 4. Si la cuenta está suspendida
        if (user.status === 'Suspendido') {
            pulsoStore.audit({
                actor: `${user.id} (${roleLabels[user.role] || user.role})`,
                action: 'ACCESO_DENEGADO_CUENTA_SUSPENDIDA',
                target: 'Inicio de sesión bloqueado por estado suspendido',
                status: 'DENEGADO'
            });
            return { success: false, message: 'La cuenta se encuentra suspendida. Contacta al administrador.' };
        }

        // 5. Autenticación exitosa
        saveGuard({ failed: 0, blockedUntil: 0 });
        const session = { ...user, lastActivity: Date.now() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

        pulsoStore.audit({
            actor: `${user.id} (${roleLabels[user.role] || user.role})`,
            action: 'INICIO_SESION',
            target: 'Portal Web'
        });

        return { success: true, user: session };
    },

    // Cierre de sesión
    logout: () => {
        const user = authService.getCurrentUser();
        if (user) {
            pulsoStore.audit({
                actor: `${user.id} (${roleLabels[user.role] || user.role})`,
                action: 'CIERRE_SESION',
                target: 'Portal Web'
            });
        }
        sessionStorage.removeItem(SESSION_KEY);
    },

    // Revisa si un agente debe aceptar la póliza de privacidad antes de entrar
    needsConsent: (user) => {
        if (!user || user.role !== 'agente') return false;
        const data = pulsoStore.get();
        const consent = data.consents?.[user.id];
        return !consent?.policyAccepted || consent?.policyVersion !== data.settings.policyVersion;
    },

    // Filtra los menús del agente según los consentimientos aceptados (C1, C2, C3, C5)
    getMenuItems: (user) => {
        if (!user) return [];
        const baseItems = roleMenus[user.role] || [];
        if (user.role !== 'agente') return baseItems;

        const consent = pulsoStore.get().consents?.[user.id] || {};
        return baseItems.filter(item => {
            if (item.href.includes('checkin')) return Boolean(consent.c1);
            if (item.href.includes('bitacora')) return Boolean(consent.c2);
            if (item.href.includes('mi-analisis')) return Boolean(consent.c2 && consent.c3);
            if (item.href.includes('apoyo')) return Boolean(consent.c5);
            return true;
        });
    }
};
