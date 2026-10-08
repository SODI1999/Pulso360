// src/features/landing/data/academicFoundationData.jsx
// Fuente de datos estructurada para Fundamentación Científica y Transferencia Tecnológica
// Basado en la investigación formativa original del Tecnológico de Antioquia (TdeA)

export const FOUNDATION_META = {
  kicker: 'Medellín, Colombia · Investigación Formativa TdeA 2026',
  badge: 'Evidencia Empírica & Transferencia Tecnológica',
  title:
    'De la investigación social a la ingeniería preventiva: Relación entre el agotamiento emocional y el apoyo social en call centers',
  lead: 'Cómo un estudio cuantitativo sobre 185 operadores en Medellín (84.3% con agotamiento significativo) inspiró a estudiantes de Ingeniería de Software del TdeA a crear Pulso360: una plataforma preventiva que separa tendencias agregadas de registros individuales en sus flujos definidos.',
  lastUpdated: 'Septiembre 2026',
  institution: 'Tecnológico de Antioquia: Institución Universitaria',
  city: 'Medellín, Colombia'
};

export const AUTHORS_MATRIX = {
  socialResearch: {
    badge: 'Investigación Social de Campo',
    roleTitle: 'Semillero de Investigación en Trabajo Social',
    leadAuthor: 'Ingrid Johana Saldarriaga Roa',
    leadAuthorRole: 'Docente Líder & Asesora Metodológica',
    coauthors: ['Leidy Katherin Valles', 'Verónica Velasquez', 'Luis Ferney Vargas', 'Jhonfer David Lezcano'],
    faculty: 'Facultad de Educación y Ciencias Sociales',
    institution: 'Tecnológico de Antioquia (TdeA)',
    focus:
      'Diagnóstico cuantitativo del agotamiento emocional y redes de apoyo social en agentes de call center de Medellín',
    icon: 'users'
  },
  softwareEngineering: {
    badge: 'Ingeniería de Software & Transferencia',
    roleTitle: 'Equipo de Ingeniería de Software (TdeA)',
    leadAuthor: 'Brahian Andrés Ospina Ríos, Leonardo Otálvaro, Andrés Felipe Trujillo',
    leadAuthorRole: 'Desarrolladores & Autores de la Plataforma Pulso360',
    coauthors: [
      'Facultad de Ingeniería (Ingeniería de Software)',
      'Obra Informática Derivada e Independiente (Ley 23 de 1982)'
    ],
    faculty: 'Facultad de Ingeniería (Ingeniería de Software)',
    institution: 'Tecnológico de Antioquia (TdeA)',
    focus:
      'Regla de agregación k-anonimato (k ≥ 5 agentes únicos), micro-pulsos al cierre de turno y análisis léxico local para la bitácora',
    icon: 'fileShield'
  }
};

export const EMPIRICAL_DATA = {
  sampleContext:
    'Estudio transversal en operadores activos de Contact Center y BPO en Medellín, evaluados bajo alta carga de interacciones simultáneas, rotación de turnos y métricas estrictas de AHT.',
  instruments: [
    {
      acronym: 'MBI-HSS',
      name: 'Maslach Burnout Inventory: Human Services Survey (MBI-HSS)',
      purpose:
        'Instrumento descrito en la investigación para explorar agotamiento emocional en trabajadores de servicios de alta interacción.'
    },
    {
      acronym: 'MSPSS',
      name: 'Multidimensional Scale of Perceived Social Support (MSPSS de Zimet et al.)',
      purpose:
        'Escala de Zimet et al. descrita para explorar la percepción de apoyo social en tres dimensiones: pares laborales, supervisores y familia/entorno significativo.'
    }
  ],
  mainMetric: {
    percentage: '84.3%',
    tag: 'Prevalencia de Agotamiento Emocional en Muestra de Referencia',
    label: 'Prevalencia de Agotamiento Emocional en Muestra de Referencia',
    description:
      'Dato correspondiente al estudio de caso académico formativo de referencia desarrollado con 185 operadores de centros de contacto en Medellín (TdeA). En dicha muestra investigativa, más de 8 de cada 10 participantes evaluados reportaron manifestaciones significativas de fatiga acumulada, vaciamiento energético y sobrecarga por atención continuada. Este indicador se presenta como marco exploratorio y contextual de la investigación formativa, diferenciándose expresamente de una certificación epidemiológica formal o un peritaje oficial de riesgo psicosocial.'
  },
  distribution: [
    {
      level: 'Alto',
      percentage: 19.6,
      color: '#dc2626',
      toneClass: 'dist-high',
      label: '19.6% Alto (Sobrecarga Severa)',
      summary:
        'Agotamiento severo que demanda intervención prioritaria preventiva del equipo de SST y revisión de condiciones de piso.'
    },
    {
      level: 'Medio',
      percentage: 64.7,
      color: '#d97706',
      toneClass: 'dist-mid',
      label: '64.7% Medio (Fatiga Acumulada)',
      summary:
        'Desgaste acumulado por turnos extensos, colas continuas de llamadas y tiempos reducidos de pausa.'
    },
    {
      level: 'Bajo',
      percentage: 15.7,
      color: '#059669',
      toneClass: 'dist-low',
      label: '15.7% Bajo',
      summary:
        'Operadores con niveles estables de energía, respaldados por factores amortiguadores y red de contención activa.'
    }
  ],
  secondaryMetrics: [
    {
      id: 'turnover',
      value: '76.5%',
      title: 'Intención de Deserción Operativa',
      description:
        'En la muestra del estudio de caso académico formativo de referencia, el 76.5% de los operadores consultados manifestó haber considerado renunciar a su puesto como salida a la sobrecarga y tensión operativa diaria en piso.',
      tag: 'Impacto en Rotación BPO',
      footnote:
        'Nota metodológica: Dato correspondiente al estudio de caso académico formativo de referencia (Medellín, TdeA). Expresa la percepción exploratoria de la muestra de operadores evaluada en el marco del proyecto, diferenciándose nítidamente de una certificación epidemiológica o de un peritaje oficial de rotación laboral.',
      operationalMeaning:
        'La intención de retiro voluntario opera como señal exploratoria de alerta temprana frente a la saturación por colas de llamadas continuas y la escasez de pausas de recuperación psicofísica.'
    },
    {
      id: 'protective',
      value: 'r = -0.428',
      title: 'Efecto Protector del Apoyo Social',
      description:
        'Correlación inversa estadísticamente significativa (p < 0.01) observada en el estudio de caso académico formativo de referencia: a mayor apoyo social percibido entre pares y supervisión, menor fue el nivel de agotamiento emocional reportado.',
      tag: 'Hallazgo Psicométrico Clave',
      footnote:
        'Nota metodológica: Hallazgo correlacional del estudio formativo de referencia mediante la administración académica de las escalas MSPSS y MBI-HSS. Sustenta la pertinencia del soporte comunitario preventivo sin constituir un diagnóstico psicopatológico clínico ni un peritaje médico-laboral oficial.',
      operationalMeaning:
        'El respaldo constructivo y la contención cotidiana entre pares operan como amortiguadores esenciales frente al desgaste; el aislamiento operacional profundiza la sobrecarga afectiva.'
    }
  ]
};

export const TRANSFER_CARDS = [
  {
    id: 'k-anonymity',
    number: '01',
    title: 'Miedo a Represalias vs. Salvaguarda de k-Anonimato (k ≥ 5)',
    socialProblem:
      'Junto con la alta intención de deserción (76.5%), los relatos cualitativos de campo evidenciaron que los operadores suelen sobrellevar la sobrecarga en silencio por temor a repercusiones en turno o estabilidad.',
    bpoBarrier:
      'Las encuestas internas nominales despiertan desconfianza en piso por miedo a represalias, pérdida de turnos preferidos o afectación en evaluaciones.',
    pulsoSolution:
      'Agregación colectiva por diseño en los flujos definidos: supervisores y SST reciben tendencias consolidadas sólo cuando el grupo alcanza el umbral de 5 agentes únicos (k ≥ 5). La interfaz bloquea la vista colectiva por debajo de ese umbral.',
    featureBadge: 'Privacidad por Diseño (k ≥ 5 agentes únicos)',
    icon: 'kAnonymityShield'
  },
  {
    id: 'micro-pulses',
    number: '02',
    title: 'Medición Anual Tardía vs. Micro-pulsos Diarios de 60 Segundos al Cerrar Turno',
    socialProblem:
      'El agotamiento emocional varía según las colas de llamadas y la intensidad de la semana, pero las evaluaciones corporativas suelen ser anuales y retrospectivas.',
    bpoBarrier:
      'Cuando se consolida la evaluación de riesgo psicosocial meses después, la persona con agotamiento severo suele haber renunciado o encontrarse incapacitada médicamente.',
    pulsoSolution:
      'Micro-pulsos diarios de 60 segundos contestados voluntariamente al cerrar turno: registran una percepción breve del turno y pueden alimentar una revisión agregada de SST cuando se cumple el umbral definido.',
    featureBadge: 'Ergonomía de Turno',
    icon: 'clock'
  },
  {
    id: 'nlp-journal',
    number: '03',
    title: 'Falta de Desahogo Seguro vs. Bitácora Íntima con NLP Léxico Local en Cliente',
    socialProblem:
      'La investigación de campo relacionó el desahogo emocional y la ventilación cognitiva con el abordaje del agotamiento; el estudio también señaló la falta de canales de expresión confiables en planta.',
    bpoBarrier:
      'El monitoreo corporativo continuo sobre chats y llamadas inhibe cualquier expresión espontánea de frustración por temor a sanciones disciplinarias.',
    pulsoSolution:
      'Bitácora personal con análisis léxico determinista en el cliente. El repositorio actual centraliza la persistencia en `pulsoStore`; cualquier despliegue con backend debe conservar explícitamente el alcance de esta separación.',
    featureBadge: 'Seguridad Psicológica & NLP Local',
    icon: 'edit_note'
  },
  {
    id: 'disconnection',
    number: '04',
    title: 'Sobrecarga extralaboral y marco de desconexión laboral (Ley 2191 de 2022)',
    socialProblem:
      'La invasión constante de los descansos y días libres con avisos o turnos sobrevenidos intensifica la fatiga auditiva crónica y la deserción operativa.',
    bpoBarrier:
      'En la dinámica 24/7 de los Contact Centers, las comunicaciones fuera de horario desbordan las jornadas pactadas e impiden la recuperación psicofísica.',
    pulsoSolution:
      'La Ley 2191 de 2022 se presenta como marco de referencia para la desconexión laboral. La versión actual documenta el principio, pero no demuestra una sincronización con turnos pactados ni un bloqueo integral fuera de jornada.',
    featureBadge: 'Marco de referencia (Ley 2191)',
    icon: 'Unplug'
  }
];

export const CITATION_DATA = {
  apa7: 'Valles, L. K., Velasquez, V., Vargas, L. F., & Lezcano, J. D. (2026). Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín (I. J. Saldarriaga Roa, Asesora) [Investigación formativa, Facultad de Educación y Ciencias Sociales, Tecnológico de Antioquia].',
  bibtex:
    "@unpublished{valles2026relacion,\n  author = {Valles, Leidy Katherin and Velasquez, Ver{'o}nica and Vargas, Luis Ferney and Lezcano, Jhonfer David},\n  title = {Relaci{'o}n entre el agotamiento emocional y la percepci{'o}n de apoyo social en trabajadores de call center de Medell{'i}n},\n  note = {Docente l{'i}der y asesora: Ingrid Johana Saldarriaga Roa. Investigaci{'o}n formativa, Semillero de Trabajo Social},\n  school = {Tecnol{'o}gico de Antioquia -- Instituci{'o}n Universitaria},\n  year = {2026},\n  address = {Medell{'i}n, Colombia}\n}",
  repositoryUrl: 'https://dspace.tdea.edu.co/',
  academicNote:
    'Investigación formativa adscrita a la Facultad de Educación y Ciencias Sociales del Tecnológico de Antioquia (TdeA). Documento original custodiado en el Repositorio Institucional digital de la universidad.'
};

export const LEGAL_FRAMEWORK_META = {
  sectionTitle: 'Marco Normativo de Referencia',
  sectionSubtitle: 'Marco Normativo de Referencia & Deslinde de Responsabilidad'
};

export const LEGAL_FRAMEWORK_DATA = [
  {
    code: 'Ley 23 de 1982',
    title: 'Propiedad Intelectual & Derechos Morales de Autor',
    body: 'Pulso360 reconoce y salvaguarda de forma irrenunciable los derechos morales de autoría del Semillero de Investigación en Trabajo Social (Facultad de Educación y Ciencias Sociales del TdeA). El código fuente, algoritmos de privacidad, diseño de interfaces y arquitectura tecnológica son una obra informática derivada e independiente desarrollada por los estudiantes del programa de Ingeniería de Software del Tecnológico de Antioquia.',
    tag: 'Derechos Morales',
    icon: 'fileText'
  },
  {
    code: 'Resolución 2764 de 2022 & Res. 2646 de 2008',
    title: 'Naturaleza Preventiva No Médica de SST (MinTrabajo)',
    body: 'Pulso360 es una solución tecnológica de apoyo preventivo para Seguridad y Salud en el Trabajo (SST). No emite diagnósticos clínicos ni psicológicos, no determina patologías psiquiátricas individuales ni reemplaza la evaluación pericial ni la Batería oficial de Instrumentos para la Evaluación de Factores de Riesgo Psicosocial adoptada por el Ministerio del Trabajo de Colombia mediante la Resolución 2764 de 2022.',
    tag: 'Salud Ocupacional (SST)',
    icon: 'healing'
  },
  {
    code: 'Ley 1581 de 2012 & Decreto 1377 de 2013',
    title: 'Tratamiento de Datos Sensibles & Voluntariedad',
    body: 'Los datos sobre estados de ánimo y fatiga pueden estar sujetos a reglas de protección de datos sensibles (Art. 5, Ley 1581 de 2012). El producto plantea un registro voluntario e informado y define como límite de diseño que estos datos no se usen para sanciones ni evaluaciones disciplinarias; la aplicación efectiva requiere gobernanza institucional.',
    tag: 'Datos Sensibles',
    icon: 'lock'
  },
  {
    code: 'Ley 2191 de 2022',
    title: 'Marco de referencia para la desconexión laboral',
    body: 'La Ley 2191 de 2022 sirve como marco de referencia para discutir la desconexión laboral en operaciones de Contact Center. La versión actual de Pulso360 no debe presentarse como una sincronización legal completa con turnos, licencias o vacaciones.',
    tag: 'Desconexión Laboral',
    icon: 'clock'
  },
  {
    code: 'Decreto 1072 de 2015 & Ley 1010 de 2006',
    title: 'Articulación SG-SST & Prevención de Acoso Laboral',
    body: 'La plataforma está orientada a tendencias preventivas agregadas para apoyar conversaciones de SST. El alcance de cada rol y el umbral de visualización dependen de los controles implementados; no equivale por sí solo a una garantía de anonimato ni sustituye las responsabilidades institucionales.',
    tag: 'SG-SST',
    icon: 'shieldCheck'
  }
];

export const ANTI_SURVEILLANCE_PILLARS = [
  {
    title: 'Sin rankings individuales en la vista revisada',
    description:
      'Principio de diseño: no presentar a supervisores listas o clasificaciones de agentes según su estado de bienestar.',
    icon: 'checkCircle'
  },
  {
    title: 'Umbral de agregación k-Anonimato (k ≥ 5)',
    description:
      'La vista colectiva revisada se bloquea cuando el grupo no alcanza 5 agentes únicos; el umbral no equivale por sí solo a anonimato universal.',
    icon: 'shieldCheck'
  },
  {
    title: 'Análisis léxico local para la bitácora',
    description:
      'El procesamiento léxico determinista se ejecuta en el navegador; cualquier despliegue con backend debe conservar explícitamente este alcance y sus límites de persistencia.',
    icon: 'lock'
  },
  {
    title: 'Separación de bienestar y desempeño',
    description:
      'Principio de diseño: los registros de bienestar no deben convertirse en rankings ni métricas punitivas de desempeño; la gobernanza institucional debe sostener este límite.',
    icon: 'fileShield'
  }
];
