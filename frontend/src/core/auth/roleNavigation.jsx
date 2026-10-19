// src/core/auth/roleNavigation.jsx
// Definición de roles, rutas principales y menús semánticos con iconografía de Lucide React

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

// Menús de navegación por rol.
// Los iconos utilizan identificadores semánticos alineados con Lucide React y la operación BPO.
export const roleMenus = {
  agente: [
    { label: 'Mi panel', icon: 'LayoutDashboard', href: '/agente/panel', group: 'Tu jornada' },
    { label: 'Check-in diario', icon: 'HeartPulse', href: '/agente/checkin', group: 'Tu jornada' },
    { label: 'Bitácora', icon: 'BookOpen', href: '/agente/bitacora', group: 'Tu jornada' },
    { label: 'Mi bienestar', icon: 'LineChart', href: '/agente/mi-bienestar', group: 'Tu bienestar' },
    { label: 'Acompañamiento', icon: 'HeartHandshake', href: '/agente/apoyo', group: 'Tu bienestar' },
    /* En escritorio "Mis datos" vive en el menú de cuenta (pie del sidebar).
       Se conserva en la lista con `mobileOnly` para navegación táctil (auditoría 015). */
    { label: 'Mis datos', icon: 'ShieldCheck', href: '/agente/mis-datos', mobileOnly: true }
  ],
  supervisor: [
    { label: 'Panel de equipo', icon: 'Users', href: '/supervisor/panel', group: 'Tu equipo' },
    { label: 'Intervenciones', icon: 'ClipboardList', href: '/supervisor/acciones', group: 'Tu equipo' },
    { label: 'Reporte de equipo', icon: 'FileSpreadsheet', href: '/reportes', group: 'Reportes' }
  ],
  sst: [
    { label: 'Panel agregado', icon: 'BarChart3', href: '/sst/panel', group: 'Monitoreo' },
    { label: 'Bandeja de alertas', icon: 'AlertTriangle', href: '/sst/alertas', group: 'Monitoreo' },
    { label: 'Reglas de alertas', icon: 'Sliders', href: '/sst/reglas-alertas', group: 'Monitoreo' },
    { label: 'Intervenciones', icon: 'ClipboardList', href: '/sst/intervenciones', group: 'Acompañamiento' },
    {
      label: 'Buzón de acompañamiento',
      icon: 'Inbox',
      href: '/sst/buzon',
      group: 'Acompañamiento'
    },
    { label: 'Reportes agregados', icon: 'FileSpreadsheet', href: '/reportes', group: 'Reportes' }
  ],
  auditor: [
    // Un solo destino: sin grupo para no dibujar encabezados innecesarios
    { label: 'Registro de auditoría', icon: 'FileText', href: '/auditor/auditoria' }
  ],
  admin: [
    { label: 'Organización', icon: 'Building2', href: '/admin/organizacion', group: 'Organización' },
    { label: 'Usuarios y roles', icon: 'Users', href: '/admin/usuarios-roles', group: 'Organización' },
    { label: 'Parámetros', icon: 'Sliders', href: '/admin/parametros', group: 'Configuración y datos' },
    { label: 'Importar CSV', icon: 'Upload', href: '/admin/importar', group: 'Configuración y datos' },
    { label: 'Habeas Data', icon: 'ShieldCheck', href: '/admin/solicitudes', group: 'Configuración y datos' },
    { label: 'Reportes', icon: 'FileSpreadsheet', href: '/reportes', group: 'Reportes' }
  ]
};
