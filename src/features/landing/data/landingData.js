// src/features/landing/data/landingData.js
// Datos estáticos y conceptuales de la Landing Page y páginas públicas de Pulso360
// Arquitectura pedagógica: separación estricta entre datos de dominio y presentación

/**
 * Escala de 5 niveles para la evaluación de carga cognitiva y emocional del agente
 */
export const AGENT_SCALE_FACTORS = [
  { level: 1, label: 'Despejado' },
  { level: 2, label: 'Moderado' },
  { level: 3, label: 'Exigente' },
  { level: 4, label: 'Saturado' },
  { level: 5, label: 'Desbordado' }
];

/**
 * Escenarios reactivos dinámicos según el nivel seleccionado en el Showcase (Demostración)
 * Permite simular en vivo el comportamiento del motor NLP léxico preventivo
 */
export const AGENT_SCALE_SCENARIOS = {
  1: {
    quote: '«Jornada tranquila. Las solicitudes fueron directas, el CRM respondió sin demoras y alcancé a hacer mi pausa de hidratación a tiempo.»',
    tagType: 'success',
    tagText: 'Ritmo sostenible detectado',
    advice: 'Orientación: Tu nivel de energía es óptimo. Mantener una hidratación constante y breves pausas de postura ayuda a conservar este balance a lo largo de la semana.',
    stepNote: 'Nivel 1: Carga baja controlada'
  },
  2: {
    quote: '«Turno con volumen habitual. Hubo un par de casos con tiempos de espera mayores, pero nada que comprometiera el ritmo del equipo.»',
    tagType: 'success',
    tagText: 'Carga operativa equilibrada',
    advice: 'Orientación: Operación dentro de parámetros regulares. Te recomendamos realizar estiramientos de muñecas y cuello al terminar las llamadas de soporte.',
    stepNote: 'Nivel 2: Carga moderada estable'
  },
  3: {
    quote: '«El flujo de llamadas estuvo continuo durante casi todo el turno. No hubo caídas graves de sistema, pero la concentración requerida fue intensa.»',
    tagType: 'neutral',
    tagText: 'Atención sostenida prolongada',
    advice: 'Orientación: Reportas demanda cognitiva alta. Al cerrar la sesión, evita el uso inmediato de pantallas móviles durante tus primeros 15 minutos de descanso.',
    stepNote: 'Nivel 3: Demanda mental continua'
  },
  4: {
    quote: '«Tuve 3 llamadas consecutivas muy complejas por caídas en la plataforma. El AHT se disparó y sentí mucha tensión en el cuello...»',
    tagType: 'warning',
    tagText: 'Sobrecarga situacional detectada',
    advice: 'Orientación: La frustración por fallas tecnológicas es externa a tu competencia. Te sugerimos realizar ejercicios de estiramiento cervical de 3 minutos antes de salir.',
    stepNote: 'Nivel 4: Fatiga cervical y tecnológica'
  },
  5: {
    quote: '«Cola continua con más de 40 clientes en espera y usuarios muy agresivos por fallas de facturación. Termino el turno con dolor de cabeza y agotamiento total.»',
    tagType: 'danger',
    tagText: 'Alerta temprana de saturación',
    advice: 'Orientación: Registramos alta tensión por hostilidad externa y presión de cola. Tu reporte alimenta la telemetría agregada para que SST active pausas escalonadas en tu campaña.',
    stepNote: 'Nivel 5: Riesgo agudo de burnout'
  }
};

/**
 * Escenarios operacionales reales de simulación para el Acto I (Espacio Íntimo del Agente)
 * Basado en investigación empírica de Call Centers (Medellín, Colombia)
 */
export const BPO_SIMULATION_SCENARIOS = [
  {
    id: 'llamada',
    label: '1. Agresión verbal en llamada',
    category: 'Tensión Emocional',
    agentQuote: '«Atendí tres llamadas seguidas con clientes muy molestos gritando por cobros incorrectos. Siento los hombros agarrotados y una gran opresión en el pecho al cerrar el turno.»',
    nlpTitle: 'Sobrecarga Emocional & Tensión Muscular',
    nlpFeedback: 'Identificamos menciones de alta tensión por hostilidad externa y fatiga física. Te recomendamos ejercicios breves de relajación cervical y una pausa de hidratación.',
    domainContext: 'La agresión verbal no controlada es el principal detonante de agotamiento emocional en agentes de primer contacto.'
  },
  {
    id: 'falla',
    label: '2. Falla de software y presión de AHT',
    category: 'Estrés Tecnológico',
    agentQuote: '«El CRM y la telefonía se colgaron a las 2:00 PM con 30 clientes en espera. El AHT se nos fue al piso y los clientes entraban enfurecidos por el retraso sin ser nuestra culpa.»',
    nlpTitle: 'Frustración por Factores Fuera de Control',
    nlpFeedback: 'Detectamos impotencia derivada de fallas de plataforma. Recuerda que las contingencias técnicas no son responsabilidad de tu gestión profesional.',
    domainContext: 'La fricción tecnológica prolongada desmotiva al agente y distorsiona injustamente sus métricas operativas.'
  },
  {
    id: 'cola',
    label: '3. Turno rotativo continuo sin pausas',
    category: 'Sobrecarga Cognitiva',
    agentQuote: '«Turno de cierre de 2:00 PM a 10:00 PM con cola continua y sin respiro. No alcancé ni a pararme a tomar agua y siento un cansancio mental que no me deja ni pensar.»',
    nlpTitle: 'Fatiga Cognitiva Sostenida',
    nlpFeedback: 'Registramos fatiga mental prolongada. Esta señal colectiva se consolida anónimamente para que SST ajuste las pausas de tu campaña.',
    domainContext: 'Los picos de atención sostenida sin micropausas degradan la salud auditiva y la estabilidad anímica en BPO.'
  }
];

/**
 * Matriz institucional de roles, límites éticos y permisos de acceso (Transparencia de Roles)
 * Garantiza cumplimiento de Ley 1581/2012 y Resoluciones 2646/2008 y 2764/2019
 */
export const ROLES_PERMISSIONS_MATRIX = [
  {
    id: 'agente',
    name: 'Agente de Operación',
    roleTag: 'Espacio Íntimo y Confidencial',
    badgeClass: 'badge-agent',
    icon: 'support_agent',
    mission: 'Contar con un entorno personal seguro donde expresar su nivel de cansancio sin consecuencias laborales.',
    permissions: [
      { text: 'Registrar su pulso diario de 60 segundos de forma voluntaria.', allowed: true },
      { text: 'Escribir en su bitácora íntima con orientación del motor NLP léxico.', allowed: true },
      { text: 'Consultar su propio historial y evolución de bienestar personal.', allowed: true },
      { text: 'Acceder a métricas o respuestas de compañeros de campaña.', allowed: false },
      { text: 'Ser evaluado en su desempeño profesional a partir de sus respuestas.', allowed: false }
    ],
    guarantee: 'Tus respuestas jamás podrán ser utilizadas por supervisores ni clientes para emitir sanciones o evaluar tu calidad.'
  },
  {
    id: 'supervisor',
    name: 'Supervisor de Campaña',
    roleTag: 'Gestión Operativa de Condiciones',
    badgeClass: 'badge-supervisor',
    icon: 'monitoring',
    mission: 'Monitorear la carga general de los turnos para balancear colas y pausas, sin vigilar a personas.',
    permissions: [
      { text: 'Visualizar tendencias colectivas promediadas (solo con k ≥ 5 respuestas).', allowed: true },
      { text: 'Recibir alertas preventivas de fatiga grupal para coordinar descansos.', allowed: true },
      { text: 'Conocer la tasa de participación general de su equipo sin nombres.', allowed: true },
      { text: 'Identificar qué agentes respondieron o quién decidió omitir el pulso.', allowed: false },
      { text: 'Leer las bitácoras o desahogos privados de cualquier trabajador.', allowed: false }
    ],
    guarantee: 'El supervisor actúa como gestor de condiciones de trabajo, nunca como auditor de la intimidad del agente.'
  },
  {
    id: 'sst',
    name: 'Seguridad y Salud en el Trabajo (SST)',
    roleTag: 'Vigilancia Epidemiológica & Ergonomía',
    badgeClass: 'badge-sst',
    icon: 'healing',
    mission: 'Diseñar planes de intervención temprana sobre factores de riesgo psicosocial en operaciones BPO.',
    permissions: [
      { text: 'Consultar mapas térmicos de riesgo agregados por sede, turno y campaña.', allowed: true },
      { text: 'Analizar tendencias longitudinales según factores de la Batería SST.', allowed: true },
      { text: 'Registrar y monitorear planes de intervención ergonómica y pausas activas.', allowed: true },
      { text: 'Rastrear la identidad nominal de agentes con reportes de agotamiento severo.', allowed: false },
      { text: 'Consultar agrupaciones que vulneren el umbral mínimo de k-anonimato.', allowed: false }
    ],
    guarantee: 'SST interviene sobre las causas estructurales del estrés en el piso, no sobre la persona en particular.'
  },
  {
    id: 'auditor',
    name: 'Auditor de Cumplimiento',
    roleTag: 'Trazabilidad Ética & Habeas Data',
    badgeClass: 'badge-auditor',
    icon: 'shieldCheck',
    mission: 'Verificar el cumplimiento estricto de las leyes de privacidad y las políticas institucionales.',
    permissions: [
      { text: 'Revisar bitácoras inmutables de acceso y auditoría del sistema.', allowed: true },
      { text: 'Auditar que ningún reporte rompa el umbral de k-anonimato (k ≥ 5).', allowed: true },
      { text: 'Certificar la no existencia de cruces nominales en bases de datos.', allowed: true },
      { text: 'Acceder a contenidos sensibles o respuestas individuales.', allowed: false },
      { text: 'Modificar parámetros de anonimización en el sistema.', allowed: false }
    ],
    guarantee: 'Garantiza la trazabilidad jurídica del sistema conforme a la Ley Estatutaria de Habeas Data en Colombia.'
  }
];

/**
 * Catálogo de motivos de consulta institucional para la página de Contáctenos
 * Garantiza estricta coherencia con la notación de k-anonimato (k ≥ 5)
 */
export const CONTACT_SUBJECTS = [
  { value: '', label: 'Selecciona el motivo de tu consulta...' },
  { value: 'implementacion', label: 'Implementación en Operación de Contact Center' },
  { value: 'demostracion', label: 'Solicitud de Demostración Institucional' },
  { value: 'privacidad', label: 'Consultoría en Privacidad y k-Anonimato (k ≥ 5)' },
  { value: 'sst', label: 'Vigilancia Epidemiológica y Prevención de Burnout' },
  { value: 'otro', label: 'Otra consulta o requerimiento' }
];
