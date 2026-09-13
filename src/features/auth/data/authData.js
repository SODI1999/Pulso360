// src/features/auth/data/authData.js
// Datos y metadatos institucionales para la experiencia de autenticación de Pulso360

export const DEMO_ROLES = [
  {
    id: 'agente',
    role: 'agente',
    label: 'Agente',
    fullName: 'Agente de Operación',
    badge: 'Frontline',
    email: 'agente@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'support_agent',
    description: 'Check-in de 60s, bitácora íntima y autoevaluación sin vigilancia'
  },
  {
    id: 'supervisor',
    role: 'supervisor',
    label: 'Supervisor',
    fullName: 'Supervisor de Piso',
    badge: 'Líder Operativo',
    email: 'supervisor@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'group',
    description: 'Clima de equipo agregado, balance de colas y alertas operativas'
  },
  {
    id: 'sst',
    role: 'sst',
    label: 'SST',
    fullName: 'Especialista en SST',
    badge: 'Salud Ocupacional',
    email: 'sst@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'healing',
    description: 'Vigilancia epidemiológica, batería psicosocial y trazabilidad'
  },
  {
    id: 'auditor',
    role: 'auditor',
    label: 'Auditor',
    fullName: 'Auditor de Control',
    badge: 'Conformidad Ética',
    email: 'auditor@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'audit',
    description: 'Trazabilidad inmutable, logs de acceso y garantía de no-vigilancia'
  },
  {
    id: 'admin',
    role: 'admin',
    label: 'Admin',
    fullName: 'Administrador TI',
    badge: 'Gobernanza',
    email: 'admin@pulso360.co',
    password: 'Pulso360#2026',
    icon: 'tune',
    description: 'Gestión organizacional, parámetros del sistema y Habeas Data'
  }
];

export const AUTH_SAFEGUARDS = [
  {
    icon: 'shieldCheck',
    title: 'k-Anonimato Estricto (k ≥ 5)',
    description: 'Consolidación en grupos mínimos de 5 personas. Tus respuestas nunca se desglosan de forma individual.'
  },
  {
    icon: 'lock',
    title: 'Procesamiento Local en Dispositivo',
    description: 'Tus notas se procesan exclusivamente en tu navegador, sin exponer desahogos íntimos a supervisores.'
  },
  {
    icon: 'fileShield',
    title: 'Garantía No Punitiva',
    description: 'Tu nivel de fatiga no se asocia a metas operativas (AHT) ni influye en tu evaluación laboral.'
  }
];

export const AUTH_METADATA = {
  title: 'Sistema de Gestión de Bienestar & Salud Ocupacional',
  subtitle: 'Plataforma empresarial para la prevención de fatiga y cuidado del equipo humano en Contact Centers.',
  footerNote: 'Pulso360 Enterprise · Plataforma de Bienestar Laboral y SG-SST'
};