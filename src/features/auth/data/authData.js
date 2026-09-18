// src/features/auth/data/authData.js
// Textos y metadatos institucionales para el acceso seguro a Pulso360
// Dirección A: Editorial Humano & Sereno — Cero jerga burocrática ni marketing de IA

/**
 * Roles disponibles para demostración y evaluación rápida de permisos (Sandbox RBAC)
 */
export const DEMO_ROLES = [
  {
    id: 'agente',
    role: 'agente',
    label: 'Agente',
    fullName: 'Agente de Operaciones',
    badge: 'Línea de Frente',
    email: 'agente@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'support_agent',
    description: 'Check-in de 60s al cierre de turno, bitácora personal y registro de fatiga sin métricas de AHT.'
  },
  {
    id: 'supervisor',
    role: 'supervisor',
    label: 'Supervisor',
    fullName: 'Líder Operativo de Campaña',
    badge: 'Piso de Operación',
    email: 'supervisor@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'group',
    description: 'Clima grupal agregado (k ≥ 5), balance de colas y activación de pausas preventivas sin vigilancia individual.'
  },
  {
    id: 'sst',
    role: 'sst',
    label: 'SST',
    fullName: 'Especialista en SST',
    badge: 'Cuidado Ocupacional',
    email: 'sst@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'healing',
    description: 'Vigilancia epidemiológica, mapas térmicos de fatiga cervical y diseño de intervenciones en turno.'
  },
  {
    id: 'auditor',
    role: 'auditor',
    label: 'Auditor',
    fullName: 'Auditor de Privacidad y Ética',
    badge: 'Conformidad Ética',
    email: 'auditor@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'audit',
    description: 'Trazabilidad de accesos, verificación del umbral k ≥ 5 y cumplimiento estricto de Habeas Data.'
  },
  {
    id: 'admin',
    role: 'admin',
    label: 'Admin',
    fullName: 'Administrador TI / Operaciones',
    badge: 'Gobernanza TI',
    email: 'admin@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'tune',
    description: 'Configuración de sedes y campañas, gestión de identidades corporativas y políticas de retención.'
  }
];

/**
 * Salvaguardas éticas y de privacidad mostradas en el panel de autenticación
 */
export const AUTH_SAFEGUARDS = [
  {
    icon: 'shieldCheck',
    title: 'Protección Colectiva (k ≥ 5)',
    description: 'Tus respuestas solo se consolidan en grupos de 5 o más agentes. Nadie en la operación puede aislar tu registro.'
  },
  {
    icon: 'fileShield',
    title: 'Desvinculado de tus Métricas y AHT',
    description: 'Tu nivel de fatiga o saturación jamás afectará tu adherencia al turno, tiempos de llamada ni evaluaciones laborales.'
  },
  {
    icon: 'lock',
    title: 'Bitácora Confidencial y Personal',
    description: 'Tus notas se procesan localmente en tu dispositivo. Tu supervisor nunca tiene acceso al texto de tu bitácora.'
  }
];

/**
 * Metadatos editoriales de la pantalla de autenticación
 */
export const AUTH_METADATA = {
  title: 'Cuidado humano y prevención en Contact Centers',
  subtitle: 'Un espacio sereno para registrar tu fatiga diaria, con salvaguardas éticas que protegen tu voz y cuidan a tu equipo.',
  footerNote: 'Pulso360 · Prevención de fatiga y bienestar operativo en BPO'
};

/**
 * Proveedores federados de acceso corporativo (SSO) en operaciones BPO
 */
export const BPO_SSO_PROVIDERS = [
  {
    id: 'microsoft',
    label: 'Continuar con Microsoft 365',
    shortLabel: 'Microsoft 365',
    helper: 'Directorio activo corporativo (Azure AD / Entra ID)'
  },
  {
    id: 'google',
    label: 'Continuar con Google Workspace',
    shortLabel: 'Google Workspace',
    helper: 'Cuentas institucionales @empresa.com'
  },
  {
    id: 'magic-link',
    label: 'Acceso con Enlace Rápido',
    shortLabel: 'Enlace Rápido',
    helper: 'Enlace seguro temporal enviado a tu correo corporativo'
  }
];

/**
 * Textos para la barra de evaluación rápida de roles demo (Sandbox RBAC)
 */
export const DEMO_BAR_TEXTS = {
  sectionTitle: 'Acceso rápido de evaluación (Demo RBAC)',
  sectionSubtitle: 'Explora la plataforma desde las distintas perspectivas operativas de un Contact Center.',
  passwordBadge: 'Clave unificada: Pulso360#2026',
  tooltipHint: 'Selecciona un rol para cargar credenciales de prueba y explorar sus vistas protegidas.',
  rolesAriaLabel: 'Selector de perfiles de demostración por rol operativo'
};