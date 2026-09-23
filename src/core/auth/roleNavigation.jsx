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

// Menús de navegación por rol. El campo `group` rotula secciones temáticas en el
// sidebar (AppLayout sólo muestra encabezados cuando un rol tiene más de un grupo),
// para que cada rol vea la misma estructura con su propio vocabulario de tareas.
export const roleMenus = {
  agente: [
    { label: 'Mi panel', icon: 'dashboard', href: '/agente/panel', group: 'Tu jornada' },
    { label: 'Check-in diario', icon: 'favorite', href: '/agente/checkin', group: 'Tu jornada' },
    { label: 'Bitácora', icon: 'edit_note', href: '/agente/bitacora', group: 'Tu jornada' },
    { label: 'Mi análisis', icon: 'insights', href: '/agente/mi-analisis', group: 'Tu bienestar' },
    { label: 'Mi bienestar', icon: 'monitoring', href: '/agente/mi-bienestar', group: 'Tu bienestar' },
    { label: 'Acompañamiento', icon: 'support_agent', href: '/agente/apoyo', group: 'Tu bienestar' },
    /* En escritorio "Mis datos" vive en el menú de cuenta (pie del sidebar).
           Se conserva en la lista con `mobileOnly` porque en móvil el pie se oculta
           y éste queda como el único acceso a los derechos Habeas Data (auditoría 015). */
    { label: 'Mis datos', icon: 'fileShield', href: '/agente/mis-datos', mobileOnly: true }
  ],
  supervisor: [
    { label: 'Panel de equipo', icon: 'group', href: '/supervisor/panel', group: 'Tu equipo' },
    { label: 'Intervenciones', icon: 'task_alt', href: '/supervisor/acciones', group: 'Tu equipo' },
    { label: 'Reporte de equipo', icon: 'summarize', href: '/reportes', group: 'Reportes' }
  ],
  sst: [
    { label: 'Panel agregado', icon: 'analytics', href: '/sst/panel', group: 'Monitoreo' },
    { label: 'Bandeja de alertas', icon: 'notifications_active', href: '/sst/alertas', group: 'Monitoreo' },
    { label: 'Reglas de alertas', icon: 'tune', href: '/sst/reglas-alertas', group: 'Monitoreo' },
    { label: 'Intervenciones', icon: 'healing', href: '/sst/intervenciones', group: 'Acompañamiento' },
    {
      label: 'Buzón de acompañamiento',
      icon: 'mark_email_unread',
      href: '/sst/buzon',
      group: 'Acompañamiento'
    },
    { label: 'Reportes agregados', icon: 'summarize', href: '/reportes', group: 'Reportes' }
  ],
  auditor: [
    // Un solo destino: sin grupo, el sidebar no dibuja encabezados innecesarios
    { label: 'Registro de auditoría', icon: 'audit', href: '/auditor/auditoria' }
  ],
  admin: [
    { label: 'Organización', icon: 'hierarchy', href: '/admin/organizacion', group: 'Organización' },
    { label: 'Usuarios y roles', icon: 'users', href: '/admin/usuarios-roles', group: 'Organización' },
    { label: 'Parámetros', icon: 'tune', href: '/admin/parametros', group: 'Configuración y datos' },
    { label: 'Importar CSV', icon: 'upload_file', href: '/admin/importar', group: 'Configuración y datos' },
    { label: 'Habeas Data', icon: 'fileShield', href: '/admin/solicitudes', group: 'Configuración y datos' },
    { label: 'Reportes', icon: 'summarize', href: '/reportes', group: 'Reportes' }
  ]
};
