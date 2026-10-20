import { env } from '../config/env';

export const initialSeed = {
  users: [
    {
      id: 'usr-1',
      email: 'agente@pulso360.co',
      name: 'Laura Gómez',
      role: 'agente',
      teamId: 'team-alpha-1',
      teamName: 'Equipo Alpha 1',
      campaign: 'Campaña Soporte Alpha',
      shiftStartHour: 8,
      avatar: '/assets/fotos/bpo-agent-profile.jpg'
    },
    {
      id: 'usr-2',
      email: 'supervisor@pulso360.co',
      name: 'Carlos Mendoza',
      role: 'supervisor',
      avatar: '/assets/fotos/bpo-avatar-male-supervisor.webp',
      teamId: 'team-alpha-1',
      teamName: 'Equipo Alpha 1',
      campaign: 'Campaña Soporte Alpha'
    },
    {
      id: 'usr-3',
      email: 'sst@pulso360.co',
      name: 'Patricia Silva',
      role: 'sst',
      avatar: '/assets/fotos/bpo-sst-guardian.jpg',
      teamId: null,
      teamName: 'Seguridad y Salud en el Trabajo'
    },
    {
      id: 'usr-4',
      email: 'auditor@pulso360.co',
      name: 'Marcos Rivas',
      role: 'auditor',
      avatar: '/assets/fotos/bpo-avatar-male-agent.webp',
      teamId: null,
      teamName: 'Auditoría'
    },
    {
      id: 'usr-5',
      email: 'admin@pulso360.co',
      name: 'Admin Pulso360',
      role: 'admin',
      avatar: '/assets/fotos/bpo-avatar-female-agent-2.webp',
      teamId: null,
      teamName: 'Administración'
    }
  ],

  // Tabla: user_consents
  consents: {
    'usr-1': {
      policyAccepted: false,
      policyVersion: null,
      c1: false,
      c2: false,
      c3: false,
      c4: false,
      c5: false,
      updatedAt: null
    }
  },
  consentHistory: [],

  // Tabla: daily_checkins
  checkins: [
    {
      id: 'chk-1',
      userId: 'usr-1',
      journeyKey: '2026-08-20',
      date: '2026-08-20',
      submittedAt: '2026-08-20T08:12:00-05:00',
      energia: 3,
      cargaEmocional: 4,
      recuperacion: 2,
      apoyo: 4,
      distanciamiento: 2,
      ineficacia: 2
    },
    {
      id: 'chk-2',
      userId: 'usr-1',
      journeyKey: '2026-08-19',
      date: '2026-08-19',
      submittedAt: '2026-08-19T08:18:00-05:00',
      energia: 2,
      cargaEmocional: 5,
      recuperacion: 2,
      apoyo: 3,
      distanciamiento: 3,
      ineficacia: 3
    },
    {
      id: 'chk-3',
      userId: 'usr-1',
      journeyKey: '2026-08-18',
      date: '2026-08-18',
      submittedAt: '2026-08-18T08:05:00-05:00',
      energia: 4,
      cargaEmocional: 3,
      recuperacion: 4,
      apoyo: 4,
      distanciamiento: 1,
      ineficacia: 1
    }
  ],

  // Tabla: journals (Bitácoras del agente)
  journals: [
    {
      id: 'jrn-1',
      userId: 'usr-1',
      date: '2026-08-20',
      createdAt: '2026-08-20T18:32:05-05:00',
      context: 'Turno tarde',
      text: 'Hoy hubo mucho volumen de llamadas y terminé agotada. El equipo me apoyó cuando una conversación se puso difícil.',
      analysis: {
        version: 'lexico-v1.2',
        categories: [
          { name: 'Sobrecarga percibida', confidence: 0.82, evidence: ['volumen de llamadas'] },
          { name: 'Exigencia emocional', confidence: 0.68, evidence: ['difícil'] },
          { name: 'Bajo apoyo organizacional', confidence: 0.42, evidence: [] }
        ],
        requiresReview: false
      },
      correctedCategories: null,
      correctionNote: null
    }
  ],

  // Solicitudes de apoyo
  supportRequests: [
    {
      id: 'req-1',
      code: 'ANON-2026-0982',
      mode: 'anonimo',
      ownerUserId: 'usr-1',
      identityUserId: null,
      date: '2026-08-19',
      reason: 'Sobrecarga percibida',
      description: 'Quisiera orientación para manejar una semana difícil.',
      urgency: 'media',
      contactPreference: 'app',
      timeWindow: 'No aplica',
      status: 'Recibida',
      assignedTo: 'usr-3',
      sla: '24 h hábiles'
    }
  ],

  // Solicitudes de Habeas Data
  habeasRequests: [
    {
      id: 'HD-2026-001',
      userId: 'usr-1',
      type: 'Portabilidad',
      createdAt: '2026-08-20T09:10:00-05:00',
      status: 'Respondida',
      deadline: '2026-09-03',
      note: 'Copia JSON preparada (dato demo).'
    },
    {
      id: 'HD-2026-002',
      userId: 'usr-1',
      type: 'Rectificación',
      createdAt: '2026-08-21T14:20:00-05:00',
      status: 'En trámite',
      deadline: '2026-09-11',
      note: 'Solicitud demo en revisión.'
    }
  ],

  reportHistory: [],
  // Tabla: alerts (Alertas de SST)
  alerts: [
    {
      id: 'alt-1',
      rule: 'Caída sostenida de recuperación',
      campaign: 'Campaña Soporte Alpha',
      team: 'Equipo Alpha 1',
      date: '2026-08-20',
      severity: 'Alta',
      respondents: 14,
      status: 'GENERADA',
      owner: 'usr-3',
      description: 'La recuperación agregada descendió durante 3 semanas consecutivas.',
      evidence: [68, 61, 54]
    },
    {
      id: 'alt-2',
      rule: 'Carga emocional elevada',
      campaign: 'Campaña Retención Beta',
      team: 'Equipo Beta 2',
      date: '2026-08-18',
      severity: 'Media',
      respondents: 22,
      status: 'EN_REVISION',
      owner: 'usr-3',
      description: 'La carga emocional agregada supera el valor configurado durante 2 semanas.',
      evidence: [58, 64]
    }
  ],

  // Reglas configuradas para disparar alertas
  rules: [
    {
      id: 'rule-1',
      metric: 'Recuperación agregada',
      operator: 'baje más de',
      value: 15,
      persistence: 3,
      unit: 'semanas',
      scope: 'cualquier equipo',
      severity: 'Alta',
      active: true
    }
  ],

  // Intervenciones de SST
  interventions: [
    {
      id: 'int-1',
      title: 'Pausas cognitivas coordinadas',
      type: 'Pausas cognitivas',
      campaign: 'Campaña Soporte Alpha',
      team: 'Equipo Alpha 1',
      creator: 'usr-3',
      assignedTo: 'usr-2',
      status: 'Activa',
      startDate: '2026-08-18',
      endDate: '2026-09-01',
      indicator: 'Recuperación agregada',
      baseline: 58,
      after: null,
      progress: 55,
      target: 'Mejorar recuperación percibida',
      externalAction: true
    },
    {
      id: 'int-2',
      title: 'Taller de manejo emocional',
      type: 'Taller de manejo emocional',
      campaign: 'Campaña Retención Beta',
      team: 'Equipo Beta 2',
      creator: 'usr-3',
      assignedTo: 'usr-2',
      status: 'Cerrada',
      startDate: '2026-07-01',
      endDate: '2026-07-28',
      indicator: 'Carga emocional',
      baseline: 78,
      after: 42,
      progress: 100,
      target: 'Reducir carga emocional agregada',
      externalAction: false
    }
  ],

  // Notificaciones
  notifications: [
    {
      id: 'not-1',
      role: 'sst',
      title: 'Nueva alerta en Soporte Alpha',
      context: 'Regla: caída sostenida de recuperación',
      date: '2026-08-20T10:00:00-05:00',
      read: false,
      href: '/sst/alertas'
    },
    {
      id: 'not-2',
      role: 'agente',
      title: 'Actualización de tu solicitud',
      context: 'Hay un cambio de estado disponible dentro de la app',
      date: '2026-08-20T11:00:00-05:00',
      read: false,
      href: '/agente/apoyo'
    }
  ],

  // Tabla: audit_logs (con simulación de hash encadenado)
  auditLogs: [
    {
      id: 'aud-103',
      date: '2026-08-20 18:45:00',
      actor: 'usr-2 (Supervisor)',
      action: 'CONSULTA_AGREGADA',
      target: 'Equipo Alpha 1 · semana 34',
      ip: '192.168.1.12',
      userAgent: 'Demo browser',
      status: 'EXITO',
      prevHash: 'demo-aud-102',
      hash: 'demo-aud-103'
    },
    {
      id: 'aud-102',
      date: '2026-08-20 18:32:05',
      actor: 'usr-1 (Agente)',
      action: 'ENTRADA_BITACORA',
      target: 'Bitácora personal',
      ip: '192.168.1.45',
      userAgent: 'Demo browser',
      status: 'EXITO',
      prevHash: 'demo-aud-101',
      hash: 'demo-aud-102'
    },
    {
      id: 'aud-101',
      date: '2026-08-20 18:30:12',
      actor: 'usr-1 (Agente)',
      action: 'REGISTRO_CHECKIN',
      target: 'Check-in diario',
      ip: '192.168.1.45',
      userAgent: 'Demo browser',
      status: 'EXITO',
      prevHash: 'GENESIS',
      hash: 'demo-aud-101'
    }
  ],

  // Estructura de campañas y equipos
  organization: {
    campaigns: [
      {
        id: 'camp-1',
        name: 'Campaña Soporte Alpha',
        active: true,
        teams: [
          { id: 'team-alpha-1', name: 'Equipo Alpha 1', n: 14, supervisor: 'Carlos Mendoza', active: true },
          { id: 'team-alpha-2', name: 'Equipo Alpha 2', n: 4, supervisor: 'Supervisor Alpha 2', active: true }
        ]
      },
      {
        id: 'camp-2',
        name: 'Campaña Retención Beta',
        active: true,
        teams: [
          { id: 'team-beta-2', name: 'Equipo Beta 2', n: 22, supervisor: 'Supervisor Beta', active: true }
        ]
      }
    ]
  },

  // Parámetros de gobernanza y privacidad
  settings: {
    umbralMinimo: 5,
    minUmbralAllowed: 3,
    checkinEditHours: 2,
    minGranularity: 'semanal',
    auditRetentionYears: 5,
    slaAltaHoras: 24,
    slaMediaHoras: 48,
    slaBajaHoras: 72,
    slaSolicitudesHoras: 24,
    policyVersion: env.policyVersion,
    policyEffectiveDate: env.policyEffectiveDate,
    policyVersions: ['v2.2', 'v2.3', 'v2.4'],
    nlpVersion: 'lexico-v1.2',
    nlpVersions: ['lexico-v1.1', 'lexico-v1.2']
  },
  passwordReset: { tokens: [] }
};
