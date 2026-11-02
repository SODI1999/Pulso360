// src/features/landing/data/academicFoundationData.jsx
// Datos atribuidos a una actividad de aula de una materia, origen de la idea Pulso360.
// El contexto estudiantil TdeA no implica publicación, aval ni validación institucional.

export const FOUNDATION_META = {
  kicker: 'Actividad de aula · Medellín, Colombia · 2026',
  badge: 'Origen de la idea Pulso360',
  title:
    'De una actividad de aula sobre agotamiento y apoyo social a la idea de Pulso360',
  lead: 'La idea de Pulso360 nació de datos recogidos en una actividad de aula de una materia. El material reporta un grupo de 185 operadores de call center en Medellín y una relación entre agotamiento emocional y apoyo social. Las cifras describen esa actividad: no representan al sector ni son resultados o validación de Pulso360. La mención del TdeA sitúa al equipo de estudiantes; no expresa aval institucional.',
  lastUpdated: 'Noviembre 2026',
  institution: 'Contexto estudiantil: Tecnológico de Antioquia (TdeA)',
  city: 'Medellín, Colombia'
};

export const AUTHORS_MATRIX = {
  socialResearch: {
    badge: 'Actividad de aula',
    roleTitle: 'Trabajo realizado para una materia',
    leadAuthor: 'Ingrid Johana Saldarriaga Roa',
    leadAuthorRole: 'Docente orientadora de la actividad',
    coauthors: ['Leidy Katherin Valles', 'Verónica Velasquez', 'Luis Ferney Vargas', 'Jhonfer David Lezcano'],
    institution: 'Contexto estudiantil: TdeA',
    focus:
      'Datos recogidos durante una actividad de materia sobre agotamiento emocional y apoyo social. Material de aula no publicado.',
    icon: 'users'
  },
  softwareEngineering: {
    badge: 'Idea y desarrollo de software',
    roleTitle: 'Equipo estudiantil de Pulso360',
    leadAuthor: 'Brahian Andrés Ospina Ríos, Leonardo Otálvaro, Andrés Felipe Trujillo',
    leadAuthorRole: 'Estudiantes desarrolladores de Pulso360',
    institution: 'Estudiantes del Tecnológico de Antioquia (TdeA)',
    focus:
      'La actividad de aula dio origen a una propuesta de software para registros voluntarios, apoyo y tendencias colectivas protegidas. Los datos de esa actividad no validan los instrumentos ni los resultados de la plataforma.',
    icon: 'fileShield'
  }
};

export const EMPIRICAL_DATA = {
  sampleContext:
    'Fuente de las cifras de esta página: datos recogidos en una actividad de aula de una materia, referidos a 185 operadores de call center en Medellín. Su alcance se limita a ese grupo y a las condiciones de la actividad; no se presentan como una publicación universitaria ni como una estimación de todo el sector BPO.',
  instruments: [
    {
      acronym: 'MBI-HSS',
      name: 'Maslach Burnout Inventory: Human Services Survey (MBI-HSS)',
      purpose:
        'Instrumento mencionado en el material de aula al abordar el agotamiento emocional. No es el check-in de Pulso360 ni acredita su validación clínica.'
    },
    {
      acronym: 'MSPSS',
      name: 'Multidimensional Scale of Perceived Social Support (MSPSS de Zimet et al.)',
      purpose:
        'Escala mencionada en el material de aula para abordar el apoyo social percibido. Esa referencia no valida las funciones ni los resultados de Pulso360.'
    }
  ],
  mainMetric: {
    percentage: '84.3%',
    tag: 'Dato de la actividad de aula',
    label: 'Categorías media y alta de agotamiento en el grupo de la actividad',
    description:
      'En los datos recogidos en la actividad de materia, el 84.3% corresponde a las categorías media y alta reportadas para el grupo de 185 participantes. Es una descripción de esos datos, no un diagnóstico individual, una cifra de todo el sector ni una medición de Pulso360.'
  },
  distribution: [
    {
      level: 'Alto',
      percentage: 19.6,
      color: '#dc2626',
      toneClass: 'dist-high',
      label: '19.6% · Categoría alta',
      summary:
        'Proporción clasificada en la categoría alta en el material de la actividad de aula.'
    },
    {
      level: 'Medio',
      percentage: 64.7,
      color: '#b45309',
      toneClass: 'dist-mid',
      label: '64.7% · Categoría media',
      summary:
        'Proporción clasificada en la categoría media en el material de la actividad de aula.'
    },
    {
      level: 'Bajo',
      percentage: 15.7,
      color: '#059669',
      toneClass: 'dist-low',
      label: '15.7% · Categoría baja',
      summary:
        'Proporción clasificada en la categoría baja en el material de la actividad de aula.'
    }
  ],
  secondaryMetrics: [
    {
      id: 'turnover',
      value: '76.5%',
      title: 'Intención de renuncia en el grupo de la actividad',
      description:
        'En los datos recogidos durante la actividad de aula, se reportó que el 76.5% de los participantes había considerado renunciar a su puesto. La cifra se atribuye únicamente a ese grupo.',
      tag: 'Dato recogido en el aula',
      operationalMeaning:
        'Este dato motivó al equipo a considerar el acceso a orientación y apoyo. La intención declarada no es una tasa de rotación efectiva ni evidencia de que Pulso360 la reduzca.'
    },
    {
      id: 'protective',
      value: 'r = -0.428',
      title: 'Relación entre apoyo social y agotamiento',
      description:
        'El material de la actividad de aula reporta una asociación inversa (r = -0.428; p < 0.01): en esos datos, un mayor apoyo social percibido se relacionó con menor agotamiento reportado. La asociación no establece causalidad.',
      tag: 'Asociación reportada en el aula',
      footnote:
        'La cifra pertenece a la actividad de materia. Las referencias a MSPSS y MBI-HSS no validan el check-in ni el análisis léxico de Pulso360.',
      operationalMeaning:
        'La relación observada dio importancia al apoyo social al formular la idea de Pulso360. Orienta una pregunta de diseño sobre acceso a apoyo; no demuestra un beneficio medido de la plataforma.'
    }
  ]
};

export const TRANSFER_CARDS = [
  {
    id: 'k-anonymity',
    number: '01',
    title: 'Confianza al compartir información y protección de tendencias',
    socialProblem:
      'El dato de intención de renuncia (76.5%) recogido en la actividad llevó al equipo a considerar cómo ofrecer apoyo sin presentar registros individuales a supervisión.',
    bpoBarrier:
      'Pregunta de diseño: cómo explicar qué datos se guardan y qué puede consultar cada rol, sin prometer una confidencialidad absoluta.',
    pulsoSolution:
      'El servidor aplica mínimos de participación a los grupos y períodos autorizados. Las vistas colectivas restringen resultados cuando no se cumplen esos mínimos y no muestran respuestas individuales.',
    featureBadge: 'Agregados y acceso por rol',
    icon: 'kAnonymityShield'
  },
  {
    id: 'micro-pulses',
    number: '02',
    title: 'Evaluaciones periódicas y registros voluntarios del turno',
    socialProblem:
      'La actividad recogió percepciones de agotamiento y apoyo social en un grupo concreto. A partir de esa experiencia, el equipo planteó registros voluntarios cercanos al turno.',
    bpoBarrier:
      'Pregunta de diseño: cómo permitir un registro propio sin convertirlo en evaluación de desempeño ni asumir que describe por completo la situación de la persona.',
    pulsoSolution:
      'Check-ins diarios contestados voluntariamente: registran una percepción del turno y pueden alimentar una revisión agregada de SST cuando se cumplen las reglas de participación y consentimiento.',
    featureBadge: 'Ergonomía de Turno',
    icon: 'clock'
  },
  {
    id: 'nlp-journal',
    number: '03',
    title: 'Falta de Desahogo Seguro vs. Bitácora Íntima con NLP Léxico Local',
    socialProblem:
      'La asociación entre apoyo social y agotamiento reportada en la actividad motivó la idea de ofrecer un espacio de reflexión y una ruta voluntaria hacia apoyo.',
    bpoBarrier:
      'Pregunta de diseño: cómo diferenciar la reflexión personal del contenido que la persona decide compartir en una solicitud a SST.',
    pulsoSolution:
      'Bitácora personal con análisis léxico determinista en el navegador. Al guardar, el texto y su análisis se envían al servidor y quedan asociados a la cuenta del titular. Las vistas de supervisión no muestran los textos de la bitácora; el procesamiento local no equivale a almacenamiento exclusivamente local.',
    featureBadge: 'Seguridad Psicológica & NLP Local',
    icon: 'edit_note'
  },
  {
    id: 'disconnection',
    number: '04',
    title: 'Desconexión: criterio de diseño y límite de implementación',
    socialProblem:
      'Al formular la idea, el equipo también consideró el límite entre una herramienta voluntaria de bienestar y las condiciones organizacionales del turno.',
    bpoBarrier:
      'Pregunta de diseño: cómo evitar que el uso de la aplicación se presente como una obligación adicional o como una garantía sobre los horarios laborales.',
    pulsoSolution:
      'La Ley 2191 de 2022 se presenta como marco de referencia para la desconexión laboral. La versión actual documenta el principio, pero no demuestra una sincronización con turnos pactados ni un bloqueo integral fuera de jornada.',
    featureBadge: 'Desconexión Laboral (Ley 2191 de 2022)',
    icon: 'Unplug'
  }
];

export const CITATION_DATA = {
  apa7: 'Valles, L. K., Velasquez, V., Vargas, L. F., & Lezcano, J. D. (2026). Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín [Trabajo de aula de una materia, no publicado]. Orientación docente: I. J. Saldarriaga Roa.',
  bibtex:
    "@unpublished{valles2026relacion,\n  author = {Valles, Leidy Katherin and Velasquez, Ver{'o}nica and Vargas, Luis Ferney and Lezcano, Jhonfer David},\n  title = {Relaci{'o}n entre el agotamiento emocional y la percepci{'o}n de apoyo social en trabajadores de call center de Medell{'i}n},\n  note = {Trabajo de aula realizado para una materia, no publicado. Orientaci{'o}n docente: Ingrid Johana Saldarriaga Roa. Contexto estudiantil: TdeA, sin aval institucional},\n  year = {2026},\n  address = {Medell{'i}n, Colombia}\n}",
  academicNote:
    'Referencia al material no publicado de una actividad de aula de una materia. Sus datos originaron la idea de Pulso360; no constituyen una publicación ni un aval institucional del TdeA. La aplicación no proporciona un documento original alojado en un repositorio.'
};

export const LEGAL_FRAMEWORK_META = {
  sectionTitle: 'Marco Normativo de Referencia',
  sectionSubtitle: 'Marco Normativo de Referencia & Deslinde de Responsabilidad'
};

export const LEGAL_FRAMEWORK_DATA = [
  {
    code: 'Ley 23 de 1982',
    title: 'Reconocimiento de autoría y origen',
    body: 'Se reconoce a las personas indicadas como autoras del material de aula y a la docente por su orientación. Pulso360 es la propuesta estudiantil de software que nació de esa actividad. Esta referencia no presenta el trabajo como publicación universitaria ni implica un aval institucional de la plataforma.',
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
    body: 'Los datos sobre estados de ánimo y fatiga están protegidos bajo las salvaguardas de datos sensibles (Art. 5, Ley 1581 de 2012). Su registro es voluntario e informado, restringiendo su tratamiento al ámbito estrictamente preventivo de bienestar y vedando su uso para evaluaciones sancionatorias.',
    tag: 'Datos Sensibles',
    icon: 'lock'
  },
  {
    code: 'Ley 2191 de 2022',
    title: 'Marco de referencia para la desconexión laboral',
    body: 'Marco de garantía para la desconexión laboral en operaciones de Contact Center (Ley 2191 de 2022). Orienta las ventanas de interacción y pausas de recuperación para evitar la invasión de los descansos pactados y mitigar la sobrecarga comunicacional fuera de turno.',
    tag: 'Desconexión Laboral',
    icon: 'clock'
  },
  {
    code: 'Decreto 1072 de 2015 & Ley 1010 de 2006',
    title: 'Articulación SG-SST & Prevención de Acoso Laboral',
    body: 'Articulación preventiva con el Sistema de Gestión de SST y los comités de convivencia laboral. Canaliza alertas colectivas e indicadores tempranos para mitigar factores de riesgo psicosocial sin incurrir en prácticas de vigilancia o persecución.',
    tag: 'SG-SST',
    icon: 'shieldCheck'
  }
];

export const ANTI_SURVEILLANCE_PILLARS = [
  {
    title: 'Sin rankings ni clasificaciones individuales',
    description:
      'Principio de diseño: no presentar a supervisores listas o clasificaciones de agentes según su estado de bienestar.',
    icon: 'checkCircle'
  },
  {
    title: 'Mínimos de participación para publicar agregados',
    description:
      'El servidor restringe las métricas si el grupo y período autorizados no cumplen los mínimos vigentes de participación. La agregación reduce la exposición de respuestas individuales, pero no equivale a una garantía absoluta contra la reidentificación.',
    icon: 'shieldCheck'
  },
  {
    title: 'Análisis léxico confidencial en el navegador',
    description:
      'El análisis léxico se ejecuta en el navegador sin modelos generativos externos. Guardar la entrada envía el texto y su análisis al servidor para conservarlos en la cuenta del titular, con acceso restringido por los permisos implementados.',
    icon: 'lock'
  },
  {
    title: 'Separación de bienestar y evaluación de desempeño',
    description:
      'Principio de diseño: los registros de bienestar no deben convertirse en rankings ni métricas punitivas de desempeño; la gobernanza institucional debe sostener este límite.',
    icon: 'fileShield'
  }
];
