// src/features/landing/data/academicFoundationData.js
// Fuente de datos estructurada para Fundamentacion Científica y Transferencia Tecnologica

export const FOUNDATION_META = {
  kicker: 'Medellín, Colombia · Investigación Formativa 2026',
  badge: 'Evidencia Científica & Transferencia',
  title: 'Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín',
  lead: 'Cómo los hallazgos cuantitativos en salud ocupacional y trabajo social del Tecnológico de Antioquia inspiraron el diseño de un sistema de software preventivo, ergonómico y éticamente blindado para operaciones de alta presión en BPO.',
  lastUpdated: 'Septiembre 2026',
  institution: 'Tecnológico de Antioquia — Institución Universitaria',
  city: 'Medellín, Colombia',
};

export const AUTHORS_MATRIX = {
  socialResearch: {
    badge: 'Investigación Social de Campo',
    roleTitle: 'Semillero / Trabajo Social',
    leadAuthor: 'Ingrid Johana Saldarriaga Roa',
    leadAuthorRole: 'Docente Líder & Asesora Metodológica',
    coauthors: [
      'Leidy Katherin Valles',
      'Verónica Velasquez',
      'Luis Ferney Vargas',
      'Jhonfer David Lezcano'
    ],
    faculty: 'Facultad de Educación y Ciencias Sociales',
    institution: 'Tecnológico de Antioquia (TdeA)',
    focus: 'Diagnóstico cuantitativo del desgaste afectivo y redes de contención en agentes BPO',
    icon: 'users'
  },
  softwareEngineering: {
    badge: 'Ingeniería de Software & Arquitectura',
    roleTitle: 'Equipo de Desarrollo Pulso360',
    leadAuthor: 'Plataforma Preventiva Pulso360',
    leadAuthorRole: 'Innovación Tecnológica para SST',
    coauthors: [
      'Brahian Andrés Ospina Ríos',
      'Leonardo Otálvaro',
      'Andrés Felipe Trujillo'
    ],
    faculty: 'Programa de Ingeniería de Software',
    institution: 'Tecnológico de Antioquia (TdeA)',
    focus: 'k-Anonimato algorítmico, micro-pulsos al cierre de diadema y NLP léxico en cliente',
    icon: 'code'
  }
};

export const EMPIRICAL_DATA = {
  sampleContext: 'Estudio transversal en operadores activos de Contact Center y BPO en Medellín, evaluados bajo alta carga de interacciones simultáneas y métricas estrictas de AHT.',
  instruments: [
    {
      acronym: 'MBI-HSS',
      name: 'Maslach Burnout Inventory — Human Services Survey',
      purpose: 'Cuantificación psicométrica del agotamiento emocional y distanciamiento cinismo.'
    },
    {
      acronym: 'MSPSS',
      name: 'Multidimensional Scale of Perceived Social Support',
      purpose: 'Medición de la percepción de soporte brindado por pares, supervisores y familia.'
    }
  ],
  mainMetric: {
    percentage: '84.3%',
    label: 'Presenta Agotamiento Emocional Significativo',
    description: 'Más de 8 de cada 10 agentes evaluados reportan vaciamiento crónico de energía y saturación afectiva por la atención continua de usuarios con alta frustración.'
  },
  distribution: [
    { level: 'Alto', percentage: 19.6, color: '#dc2626', toneClass: 'dist-high', label: '19.6% Alto (Riesgo Crítico)', summary: 'Agotamiento severo con necesidad de intervención prioritaria de SST.' },
    { level: 'Medio', percentage: 64.7, color: '#d97706', toneClass: 'dist-mid', label: '64.7% Medio (Fatiga Acumulada)', summary: 'Cansancio en aumento por jornadas extendidas y tiempos de descanso reducidos.' },
    { level: 'Bajo', percentage: 15.7, color: '#059669', toneClass: 'dist-low', label: '15.7% Bajo (Nivel Estable)', summary: 'Operadores con amortiguadores psicosociales y red de apoyo activa.' }
  ],
  secondaryMetrics: [
    {
      id: 'turnover',
      value: '76.5%',
      title: 'Intención de Deserción Operativa',
      description: 'Más de tres cuartas partes de la muestra ha considerado renunciar como único mecanismo de escape ante la presión sostenida.',
      tag: 'Impacto en Rotación BPO'
    },
    {
      id: 'protective',
      value: 'r = -0.428',
      title: 'Efecto Protector del Apoyo Social',
      description: 'Correlación inversa estadísticamente significativa (p < 0.01): a mayor escucha y respaldo de pares y supervisores, menor es el agotamiento severo.',
      tag: 'Hallazgo Clave SST',
      operationalMeaning: 'Cada incremento en la percepción de apoyo entre compañeros reduce en más de un 42% la severidad de la fatiga emocional en línea.'
    }
  ]
};

export const TRANSFER_CARDS = [
  {
    id: 'k-anonymity',
    number: '01',
    title: 'Miedo a Represalias vs. k-Anonimato Matemático',
    socialProblem: 'El 76.5% de los agentes prefiere renunciar en silencio antes que manifestar su cansancio a la línea de mando.',
    bpoBarrier: 'Las encuestas internas nominales generan temor de ser mal evaluado, perder turnos preferidos o ser despedido.',
    pulsoSolution: 'Aislamiento algorítmico por diseño: supervisores y SST solo acceden a tendencias de grupos de mínimo 5 personas (k ≥ 5). Nadie puede rastrear una respuesta individual.',
    featureBadge: 'Privacidad por Diseño',
    icon: 'shieldCheck'
  },
  {
    id: 'micro-pulses',
    number: '02',
    title: 'Medición Anual Extemporánea vs. Micro-pulsos de 60s',
    socialProblem: 'El agotamiento varía por semana y pico de llamadas, pero las evaluaciones corporativas son anuales.',
    bpoBarrier: 'Cuando RRHH aplica la batería reglamentaria, el empleado con burnout ya renunció o está incapacitado médicamente.',
    pulsoSolution: '6 dimensiones operativas tipo Likert contestadas voluntariamente en 60 segundos al apagar la diadema, capturando la curva diaria de estrés sin interrumpir la operación.',
    featureBadge: 'Ergonomía de Turno',
    icon: 'clock'
  },
  {
    id: 'nlp-journal',
    number: '03',
    title: 'Falta de Desahogo Seguro vs. Bitácora Íntima Local',
    socialProblem: 'La investigación demostró que procesar la frustración con pares aminora el agotamiento emocional.',
    bpoBarrier: 'Los operadores carecen de un espacio privado de descarga cognitiva dentro de la estación de trabajo asignada.',
    pulsoSolution: 'Espacio confidencial para escribir el cierre del turno con orientación ergonómica inmediata procesada en el navegador (NLP local), sin enviar texto privado a servidores.',
    featureBadge: 'Seguridad Psicológica',
    icon: 'lock'
  },
  {
    id: 'disconnection',
    number: '04',
    title: 'Sobrecarga Extralaboral vs. Desconexión Garantizada',
    socialProblem: 'La invasión del tiempo de descanso con mensajes operativos exacerba el insomnio y la fatiga auditiva crónica.',
    bpoBarrier: 'En operaciones 24/7 los canales informales de mensajería invaden los turnos de descanso y días libres.',
    pulsoSolution: 'Arquitectura sincronizada con la jornada pactada (Ley 2191): la plataforma inhibe check-ins y alertas fuera de turno, protegiendo el descanso real del agente.',
    featureBadge: 'Conformidad Legal',
    icon: 'zap'
  }
];

export const CITATION_DATA = {
  apa7: 'Velasquez, V., Vargas, L. F., Valles, L. K., & Lezcano, J. D. (2026). Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín durante el año 2026 (I. J. Saldarriaga Roa, Asesora) [Investigación formativa, Tecnológico de Antioquia].',
  bibtex: '@unpublished{velasquez2026relacion,\n  author = {Velasquez, Verónica and Vargas, Luis Ferney and Valles, Leidy Katherin and Lezcano, Jhonfer David},\n  title = {Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín durante el año 2026},\n  note = {Asesoría: Ingrid Johana Saldarriaga Roa. Investigación formativa},\n  school = {Tecnológico de Antioquia},\n  year = {2026},\n  address = {Medellín, Colombia}\n}',
  academicNote: 'Investigación formativa adscrita a la Facultad de Educación y Ciencias Sociales del Tecnológico de Antioquia (TdeA). Documento original conservado en los repositorios académicos institucionales.'
};

export const LEGAL_FRAMEWORK_DATA = [
  {
    code: 'Ley 23 de 1982',
    title: 'Propiedad Intelectual & Derechos Morales de Autor',
    body: 'Pulso360 reconoce y salvaguarda de forma irrenunciable los derechos morales de autoría del equipo de investigación de Trabajo Social. El código fuente, diseño de interfaces, algoritmos de privacidad y arquitectura de software de Pulso360 son una obra informática derivada e independiente creada por los estudiantes del programa de Ingeniería de Software del TdeA.',
    tag: 'Derechos Morales'
  },
  {
    code: 'Resolución 2764 de 2022 & Res. 2646 de 2008',
    title: 'Naturaleza Preventiva No Médica (MinTrabajo)',
    body: 'Pulso360 es un sistema de apoyo operacional para Seguridad y Salud en el Trabajo (SST). No emite diagnósticos clínicos, no determina patologías psiquiátricas individuales ni sustituye la Batería oficial de Instrumentos para la Evaluación de Factores de Riesgo Psicosocial exigida por el Ministerio del Trabajo de Colombia.',
    tag: 'Salud Ocupacional (SST)'
  },
  {
    code: 'Ley 1581 de 2012 & Decreto 1377 de 2013',
    title: 'Tratamiento de Datos Sensibles & Habeas Data',
    body: 'Los datos sobre estados de fatiga o emociones se categorizan como datos sensibles (Art. 5, Ley 1581). Su registro en Pulso360 es 100% voluntario e informado. Está prohibido por diseño utilizar la información para despidos, llamados de atención disciplinarios o degradación salarial.',
    tag: 'Datos Sensibles'
  },
  {
    code: 'Ley 2191 de 2022',
    title: 'Garantía de Desconexión Laboral Efectiva',
    body: 'Pulso360 respeta estrictamente los horarios y descansos pactados en turnos de Contact Center. No emite notificaciones push obligatorias ni exige diligenciamiento de bitácoras durante descansos, días libres o vacaciones.',
    tag: 'Desconexión Laboral'
  },
  {
    code: 'Decreto 1072 de 2015 & Ley 1010 de 2006',
    title: 'Articulación SG-SST & Prevención de Acoso Laboral',
    body: 'El sistema provee insumos epidemiológicos continuos de carácter agregado para el COPASST y el Comité de Convivencia Laboral, garantizando ambientes de trabajo dignos y libres de persecución laboral.',
    tag: 'SG-SST'
  }
];

export const ANTI_SURVEILLANCE_PILLARS = [
  {
    title: 'Cero Rankings Individuales',
    description: 'Prohibido por arquitectura generar listas de agentes más o menos cansados para supervisores.',
    icon: 'checkCircle'
  },
  {
    title: 'k-Anonimato Matemático (k ≥ 5)',
    description: 'Ninguna consulta de clima o fatiga se muestra si el grupo activo cuenta con menos de 5 agentes.',
    icon: 'shieldCheck'
  },
  {
    title: 'Bitácora Confidencial en Memoria',
    description: 'El procesamiento NLP se ejecuta en el navegador del operador sin enviar textos íntimos al servidor.',
    icon: 'lock'
  },
  {
    title: 'Desvinculación Salarial Total',
    description: 'Los datos de bienestar jamás afectarán comisiones, métricas de calidad ni continuidad contractual.',
    icon: 'zap'
  }
];
