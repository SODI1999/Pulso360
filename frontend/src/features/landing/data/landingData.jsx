// src/features/landing/data/landingData.jsx
// Textos editoriales y datos de dominio para la Landing Page de Pulso360
// Dirección A: Editorial Humano & Sereno — Cero clichés de IA, enfocado en la realidad de Contact Centers

/**
 * Escala de 5 niveles para la evaluación de carga cognitiva y emocional del agente
 */
export const AGENT_SCALE_FACTORS = [
  {
    level: 1,
    label: 'Despejado',
    context: 'Ritmo fluido, consultas directas y pausas cumplidas',
    icon: 'moodOptimal'
  },
  {
    level: 2,
    label: 'Equilibrado',
    context: 'Volumen habitual sin picos críticos de cola',
    icon: 'moodBalanced'
  },
  {
    level: 3,
    label: 'Exigente',
    context: 'Atención sostenida con poco margen entre interacciones',
    icon: 'moodDemanding'
  },
  {
    level: 4,
    label: 'Saturado',
    context: 'Presión de AHT, colas continuas y fatiga muscular',
    icon: 'moodSaturated'
  },
  {
    level: 5,
    label: 'Desbordado',
    context: 'Sobrecarga sostenida, hostilidad en línea y agotamiento',
    icon: 'moodCritical'
  }
];

export const TEASER_SCALE_LEVELS = [
  {
    level: 1,
    label: 'Calma',
    headline: 'Jornada asimilada satisfactoriamente',
    advice: 'Tu registro consolida la métrica grupal del turno sin identificar tu nombre.'
  },
  {
    level: 2,
    label: 'Fluida',
    headline: 'Ritmo operativo dentro de parámetros',
    advice: 'Carga habitual absorbida de forma equilibrada en la campaña.'
  },
  {
    level: 3,
    label: 'Exigente',
    headline: 'Carga moderada reportada',
    advice: 'Sugerimos una micro-pausa de respiración antes de salir del centro de contacto.'
  },
  {
    level: 4,
    label: 'Sobrecarga',
    headline: 'Saturación acumulada en piso',
    advice:
      'Se sugiere desconexión mental previa al retorno. SST recibe esta señal agregada si el equipo supera k ≥ 5 agentes únicos.'
  },
  {
    level: 5,
    label: 'Extenuante',
    headline: 'Alta fricción cognitiva registrada',
    advice: 'Alerta agregada para que SG-SST active rotación preventiva de colas y soporte.'
  }
];

/**
 * Escenarios reactivos dinámicos según el nivel seleccionado en la demostración interactiva
 * Refleja situaciones reales de piso de Contact Center y respuestas del motor léxico
 */
export const AGENT_SCALE_SCENARIOS = {
  1: {
    quote:
      '«Jornada tranquila. Las consultas fueron directas, el CRM respondió con agilidad y completé mi pausa de hidratación a tiempo.»',
    tagType: 'success',
    tagText: 'Ritmo Sostenible',
    advice:
      'Carga dentro de parámetros óptimos. Mantener pausas de postura y descanso visual ayuda a conservar este balance a lo largo de la semana.',
    stepNote: 'Nivel 1: Carga baja controlada'
  },
  2: {
    quote:
      '«Turno con volumen estándar. Hubo un par de casos con mayor tiempo de espera, pero sin comprometer las pausas programadas del equipo.»',
    tagType: 'success',
    tagText: 'Carga Equilibrada',
    advice:
      'Operación regular. Te recomendamos realizar estiramientos breves de muñeca y cuello al desconectar de la diadema.',
    stepNote: 'Nivel 2: Demanda moderada estable'
  },
  3: {
    quote:
      '«Flujo continuo sin tiempo muerto entre llamadas. No hubo caídas de sistema, pero la concentración auditiva requerida fue muy exigente.»',
    tagType: 'neutral',
    tagText: 'Atención Sostenida Prolongada',
    advice:
      'Demanda mental continua detectada. Al cerrar sesión, evita el uso de pantallas durante tus primeros 10 minutos de descanso.',
    stepNote: 'Nivel 3: Demanda cognitiva alta'
  },
  4: {
    quote:
      '«Tres llamadas consecutivas complejas por demoras en la plataforma. El AHT se disparó y termino con tensión en el cuello y fatiga visual.»',
    tagType: 'warning',
    tagText: 'Sobrecarga de Interacción & Fricción Técnica',
    advice:
      'Las contingencias técnicas ajenas a tu gestión no definen tu desempeño. Realiza ejercicios breves de descompresión cervical antes de retirarte.',
    stepNote: 'Nivel 4: Tensión física y tecnológica'
  },
  5: {
    quote:
      '«Más de 35 clientes en cola continua, reclamos repetidos de facturación y sin espacio para tomar agua. Salgo con fatiga auditiva y saturación total.»',
    tagType: 'danger',
    tagText: 'Saturación Crítica por Picos de Cola',
    advice:
      'Alta tensión por hostilidad externa y volumen ininterrumpido. Tu reporte alimenta la señal colectiva agregada para que SST active pausas escalonadas en tu campaña.',
    stepNote: 'Nivel 5: Alerta de fatiga acumulada'
  }
};

/**
 * Escenarios operacionales reales para la simulación del Espacio Íntimo del Agente (Acto I)
 * Basados en los relatos recopilados en la investigación formativa del TdeA con operadores en Medellín
 */
export const BPO_SIMULATION_SCENARIOS = [
  {
    id: 'llamada',
    label: '1. Hostilidad en llamada consecutiva',
    category: 'Sobrecarga Emocional',
    agentQuote:
      '«Atendí tres reclamos seguidos de usuarios muy alterados por cobros duplicados. Siento tensión en los hombros y agotamiento al terminar el turno.»',
    nlpTitle: 'Tensión por Interacciones Difíciles',
    nlpFeedback:
      'Identificamos señales de tensión muscular y desgaste por hostilidad en la línea. Sugerimos soltar la diadema, realizar estiramientos cervicales e hidratarte antes del siguiente bloque.',
    domainContext:
      'Las interacciones hostiles sucesivas sin tiempo de descompresión aceleran la sobrecarga emocional en el piso de llamadas.'
  },
  {
    id: 'falla',
    label: '2. Caída del CRM y presión de AHT',
    category: 'Fricción Tecnológica',
    agentQuote:
      '«El CRM y la telefonía fallaron a mitad de turno con 30 clientes en espera. El AHT se nos disparó y los usuarios entraban irritados por la demora sin ser culpa nuestra.»',
    nlpTitle: 'Frustración por Falla de Plataforma',
    nlpFeedback:
      'Detectamos sobrecarga derivada de incidencias técnicas. Recuerda que las demoras originadas en plataformas corporativas son ajenas a tu gestión individual.',
    domainContext:
      'La inestabilidad tecnológica en piso distorsiona los tiempos de operación (AHT) y genera desgaste injusto en el equipo.'
  },
  {
    id: 'cola',
    label: '3. Turno continuo sin pausa programada',
    category: 'Sobrecarga de Atención',
    agentQuote:
      '«Turno corrido de 8 horas con colas en rojo ininterrumpidas. No alcancé a tomar la pausa activa programada y salgo con zumbido en los oídos y fatiga mental.»',
    nlpTitle: 'Fatiga Auditiva y Atención Sostenida',
    nlpFeedback:
      'Registramos demanda auditiva prolongada sin descanso de turno. Esta señal alimenta la métrica colectiva para alertar a SST sobre adherencia a pausas en tu campaña.',
    domainContext:
      'La atención telefónica continua sin pausas programadas compromete la salud auditiva y la adherencia saludable al turno.'
  }
];

/**
 * Pestañas y textos para la demostración interactiva unificada de Pulso360
 */
export const UNIFIED_SHOWCASE_TABS = [
  {
    id: 'agente',
    label: '1. Espacio Íntimo del Agente',
    icon: 'support_agent',
    subtitle: 'Check-in diario de 60s, bitácora personal y orientación sin consecuencias laborales.'
  },
  {
    id: 'kanonymity',
    label: '2. Salvaguarda k-Anonimato (k ≥ 5)',
    icon: 'shieldCheck',
    subtitle: 'Simulador del umbral ético de privacidad (k ≥ 5 agentes únicos) para proteger al equipo.'
  },
  {
    id: 'sst',
    label: '3. Vigilancia Preventiva SST',
    icon: 'healing',
    subtitle:
      'Métricas agregadas simuladas para coordinar pausas activas y balancear colas en tiempo oportuno.'
  }
];

/**
 * Datos y textos para el simulador interactivo de k-anonimato colectivo (Acto II)
 */
export const KANONYMITY_SIMULATION_DATA = {
  minRequired: 5,
  sliderMin: 1,
  sliderMax: 12,
  sliderDefault: 6,
  title: 'Simulador de Privacidad Colectiva (k ≥ 5 agentes únicos)',
  description:
    'Comprueba en tiempo real cómo el sistema agrega la información según el número de participantes distintos que completan su registro:',
  locked: {
    statusBadge: 'Visualización Restringida por Privacidad',
    title: 'Muestra Insuficiente (Menos de 5 respuestas)',
    explanation:
      'Pulso360 restringe las tendencias de este grupo. Un conjunto menor a 5 agentes únicos aumentaría el riesgo de deducción por descarte.',
    actionNote:
      'Los datos permanecen disociados hasta alcanzar el umbral mínimo de 5 participantes distintos.'
  },
  unlocked: {
    statusBadge: 'k-Anonimato Activo (k ≥ 5 agentes únicos)',
    title: 'Tendencia Colectiva Habilitada para SST',
    explanation:
      'Los datos se agregan colectivamente para prevenir la individualización de los registros. El panel de SST solo procesa tendencias cuando se alcanza el umbral mínimo de 5 agentes únicos.',
    actionNote:
      'Métricas agregadas de demostración, totalmente desvinculadas de AHT y evaluaciones de desempeño.'
  }
};

/**
 * Señales operacionales simuladas para la consola de SST (Acto III)
 * Se presentan como escenarios ilustrativos de demostración
 */
export const SST_OPERATIONAL_SIGNALS = [
  {
    id: 'manana',
    shift: 'Turno Mañana (06:00 - 14:00)',
    status: 'Estable',
    statusType: 'success',
    energyIndex: '82%',
    summary: 'Escenario simulado: Carga operativa y clima de apoyo grupal dentro de parámetros sostenibles.',
    actionProtocol: 'Protocolo preventivo: Monitoreo habitual y pausas posturales de rutina.'
  },
  {
    id: 'tarde',
    shift: 'Turno Tarde / Noche (14:00 - 22:00)',
    status: 'Alerta Temprana',
    statusType: 'warning',
    energyIndex: '46%',
    summary:
      'Escenario simulado: Incremento de fatiga cervical y tensión por picos de llamadas consecutivas.',
    actionProtocol:
      'Protocolo aplicado: Coordinar pausas activas guiadas de 10 min y balanceo de colas críticas.'
  }
];

/**
 * Matriz institucional de transparencia, permisos y salvaguardas por rol
 * Asegura trazabilidad conforme a la Ley 1581 de 2012 y normativas de SST
 */
export const ROLES_PERMISSIONS_MATRIX = [
  {
    id: 'agente',
    name: 'Agente de Operación',
    roleTag: 'Espacio Íntimo y Confidencial',
    badgeClass: 'badge-agent',
    icon: 'support_agent',
    mission: 'Espacio personal y seguro para registrar el cansancio del turno sin consecuencias laborales.',
    permissions: [
      { text: 'Registrar su check-in voluntario de 60 segundos al cierre de turno.', allowed: true },
      { text: 'Escribir en su bitácora personal con orientación léxica preventiva local.', allowed: true },
      { text: 'Consultar su propio historial y evolución de bienestar a lo largo del mes.', allowed: true },
      { text: 'Acceder a métricas o respuestas individuales de otros compañeros.', allowed: false },
      { text: 'Ser evaluado en su rendimiento laboral (AHT o calidad) a partir de su pulso.', allowed: false }
    ],
    guarantee:
      'En esta experiencia, la vista de supervisión no expone respuestas individuales ni usa el pulso como calificación de desempeño. La implementación real debe conservar estos límites mediante sus controles de acceso.'
  },
  {
    id: 'supervisor',
    name: 'Supervisor de Operación',
    roleTag: 'Gestión de Condiciones de Piso',
    badgeClass: 'badge-supervisor',
    icon: 'users',
    mission: 'Gestionar las condiciones de los turnos para balancear colas y pausas, sin vigilar a personas.',
    permissions: [
      {
        text: 'Visualizar tendencias colectivas promediadas (únicamente con k ≥ 5 agentes únicos).',
        allowed: true
      },
      {
        text: 'Recibir alertas tempranas de fatiga grupal para coordinar descansos preventivos.',
        allowed: true
      },
      { text: 'Conocer la tasa de participación agregada del equipo sin nombres.', allowed: true },
      { text: 'Identificar qué agentes respondieron o quién decidió omitir el check-in.', allowed: false },
      { text: 'Leer las bitácoras o notas íntimas de cualquier colaborador.', allowed: false }
    ],
    guarantee:
      'El supervisor coordina las condiciones operativas del piso; no tiene acceso a la intimidad ni a las respuestas individuales del agente.'
  },
  {
    id: 'sst',
    name: 'Seguridad y Salud en el Trabajo (SST)',
    roleTag: 'Vigilancia Preventiva & Ergonomía',
    badgeClass: 'badge-sst',
    icon: 'healing',
    mission: 'Identificar señales tempranas de fatiga para diseñar intervenciones ergonómicas y de turno.',
    permissions: [
      { text: 'Consultar mapas térmicos de fatiga agregados por sede, turno y campaña.', allowed: true },
      { text: 'Analizar tendencias longitudinales por dimensiones de sobrecarga laboral.', allowed: true },
      { text: 'Registrar y coordinar protocolos de pausas activas y rotación de puestos.', allowed: true },
      { text: 'Rastrear la identidad nominal de agentes con reportes de cansancio severo.', allowed: false },
      {
        text: 'Consultar grupos que no alcancen el umbral mínimo de k-anonimato (k ≥ 5 agentes únicos).',
        allowed: false
      }
    ],
    guarantee:
      'SST interviene sobre las condiciones de trabajo y los ritmos de piso basándose en promedios colectivos, sin individualizar registros.'
  },
  {
    id: 'auditor',
    name: 'Auditor de Cumplimiento y Privacidad',
    roleTag: 'Trazabilidad Ética & Habeas Data',
    badgeClass: 'badge-auditor',
    icon: 'shieldCheck',
    mission:
      'Verificar la observancia estricta del umbral de k-anonimato, logs de acceso y normativas de datos.',
    permissions: [
      { text: 'Auditar registros de acceso y consultas a la base de datos.', allowed: true },
      {
        text: 'Verificar que ningún reporte vulnere el umbral ético de k-anonimato (k ≥ 5 agentes únicos).',
        allowed: true
      },
      { text: 'Certificar la ausencia de cruces nominales con sistemas de nómina o calidad.', allowed: true },
      { text: 'Acceder a notas personales o respuestas individuales de agentes.', allowed: false },
      { text: 'Modificar o reducir los parámetros de anonimización del sistema.', allowed: false }
    ],
    guarantee:
      'Verifica que la plataforma opere bajo principios de proporcionalidad, no vigilancia punitiva y observancia de Habeas Data.'
  }
];

/**
 * Catálogo de motivos de consulta para la vinculación institucional
 * Etiquetas concisas orientadas a demostraciones técnicas, pilotos y enlace académico
 */
export const CONTACT_SUBJECTS = [
  { value: '', label: 'Selecciona el motivo de tu consulta...' },
  { value: 'piloto', label: 'Proyecto piloto para BPO' },
  { value: 'demostracion', label: 'Demostración técnica SST' },
  { value: 'privacidad', label: 'Consultoría en k-anonimato' },
  { value: 'academico', label: 'Vinculación académica TdeA' },
  { value: 'otro', label: 'Otro requerimiento institucional' }
];
