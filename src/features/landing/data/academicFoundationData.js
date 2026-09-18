// src/features/landing/data/academicFoundationData.js
// Fuente de datos estructurada para Fundamentación Científica y Transferencia Tecnológica
// Basado en la investigación formativa original del Tecnológico de Antioquia (TdeA)

export const FOUNDATION_META = {
  kicker: 'Medellín, Colombia · Investigación Formativa TdeA 2026',
  badge: 'Evidencia Empírica & Transferencia Tecnológica',
  title: 'De la investigación social a la ingeniería preventiva: Relación entre el agotamiento emocional y el apoyo social en call centers',
  lead: 'Cómo un estudio cuantitativo sobre 185 operadores en Medellín (84.3% con agotamiento significativo) inspiró a estudiantes de Ingeniería de Software del TdeA a crear Pulso360: una plataforma preventiva, no punitiva y sellada con k-anonimato (k ≥ 5 agentes únicos).',
  lastUpdated: 'Septiembre 2026',
  institution: 'Tecnológico de Antioquia — Institución Universitaria',
  city: 'Medellín, Colombia',
};

export const AUTHORS_MATRIX = {
  socialResearch: {
    badge: 'Investigación Social de Campo',
    roleTitle: 'Semillero de Investigación en Trabajo Social',
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
    focus: 'Diagnóstico cuantitativo del agotamiento emocional y redes de apoyo social en agentes de call center de Medellín',
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
    focus: 'Salvaguardas de k-anonimato (k ≥ 5 agentes únicos), micro-pulsos al cierre de turno y bitácora confidencial con análisis léxico local en cliente',
    icon: 'fileShield'
  }
};

export const EMPIRICAL_DATA = {
  sampleContext: 'Estudio transversal en operadores activos de Contact Center y BPO en Medellín, evaluados bajo alta carga de interacciones simultáneas, rotación de turnos y métricas estrictas de AHT.',
  instruments: [
    {
      acronym: 'MBI-HSS',
      name: 'Maslach Burnout Inventory — Human Services Survey (MBI-HSS)',
      purpose: 'Instrumento psicométrico validado para la medición del Agotamiento Emocional en trabajadores de servicios de alta interacción.'
    },
    {
      acronym: 'MSPSS',
      name: 'Multidimensional Scale of Perceived Social Support (MSPSS de Zimet et al.)',
      purpose: 'Escala psicométrica de Zimet et al. para evaluar la percepción de apoyo social en tres dimensiones: pares laborales, supervisores y familia/entorno significativo.'
    }
  ],
  mainMetric: {
    percentage: '84.3%',
    tag: 'Prevalencia de Agotamiento Emocional Significativo en Muestra',
    label: 'Prevalencia de Agotamiento Emocional Significativo en Muestra',
    description: 'Más de 8 de cada 10 agentes evaluados en la muestra de Medellín reportan vaciamiento de energía, fatiga acumulada y sobrecarga afectiva derivada de la atención continua en línea.'
  },
  distribution: [
    { level: 'Alto', percentage: 19.6, color: '#dc2626', toneClass: 'dist-high', label: '19.6% Alto (Sobrecarga Severa)', summary: 'Agotamiento severo que demanda intervención prioritaria preventiva del equipo de SST y revisión de condiciones de piso.' },
    { level: 'Medio', percentage: 64.7, color: '#d97706', toneClass: 'dist-mid', label: '64.7% Medio (Fatiga Acumulada)', summary: 'Desgaste acumulado por turnos extensos, colas continuas de llamadas y tiempos reducidos de pausa.' },
    { level: 'Bajo', percentage: 15.7, color: '#059669', toneClass: 'dist-low', label: '15.7% Bajo', summary: 'Operadores con niveles estables de energía, respaldados por factores amortiguadores y red de contención activa.' }
  ],
  secondaryMetrics: [
    {
      id: 'turnover',
      value: '76.5%',
      title: 'Intención de Deserción Operativa',
      description: 'El 76.5% de los operadores evaluados manifestó haber considerado renunciar a su puesto como salida a la sobrecarga y tensión operativa diaria.',
      tag: 'Impacto en Rotación BPO'
    },
    {
      id: 'protective',
      value: 'r = -0.428',
      title: 'Efecto Protector del Apoyo Social',
      description: 'Correlación inversa estadísticamente significativa (p < 0.01): a mayor apoyo social percibido (pares y supervisores), menor es el nivel de agotamiento emocional.',
      tag: 'Hallazgo Psicométrico Clave',
      operationalMeaning: 'El soporte social opera como un factor amortiguador fundamental frente al desgaste; el aislamiento operacional intensifica el vaciamiento afectivo en centros de contacto.'
    }
  ]
};

export const TRANSFER_CARDS = [
  {
    id: 'k-anonymity',
    number: '01',
    title: 'Miedo a Represalias vs. Salvaguarda de k-Anonimato (k ≥ 5)',
    socialProblem: 'Junto con la alta intención de deserción (76.5%), los relatos cualitativos de campo evidenciaron que los operadores suelen sobrellevar la sobrecarga en silencio por temor a repercusiones en turno o estabilidad.',
    bpoBarrier: 'Las encuestas internas nominales despiertan desconfianza en piso por miedo a represalias, pérdida de turnos preferidos o afectación en evaluaciones.',
    pulsoSolution: 'Agregación colectiva por diseño: supervisores y SST solo acceden a tendencias consolidadas de grupos de mínimo 5 agentes únicos (k ≥ 5). Los datos se agregan colectivamente para prevenir la individualización de los registros.',
    featureBadge: 'Privacidad por Diseño (k ≥ 5 agentes únicos)',
    icon: 'kAnonymityShield'
  },
  {
    id: 'micro-pulses',
    number: '02',
    title: 'Medición Anual Tardía vs. Micro-pulsos Diarios de 60 Segundos al Cerrar Turno',
    socialProblem: 'El agotamiento emocional varía según las colas de llamadas y la intensidad de la semana, pero las evaluaciones corporativas suelen ser anuales y retrospectivas.',
    bpoBarrier: 'Cuando se consolida la evaluación de riesgo psicosocial meses después, la persona con agotamiento severo suele haber renunciado o encontrarse incapacitada médicamente.',
    pulsoSolution: 'Micro-pulsos diarios de 60 segundos contestados voluntariamente al cerrar turno: capturan la curva de desgaste sin fricción operativa y habilitan alertas tempranas para SST.',
    featureBadge: 'Ergonomía de Turno',
    icon: 'clock'
  },
  {
    id: 'nlp-journal',
    number: '03',
    title: 'Falta de Desahogo Seguro vs. Bitácora Íntima con NLP Léxico Local en Cliente',
    socialProblem: 'La investigación de campo evidenció que el desahogo emocional y la ventilación cognitiva reducen el agotamiento, pero los operadores carecen de canales seguros en planta.',
    bpoBarrier: 'El monitoreo corporativo continuo sobre chats y llamadas inhibe cualquier expresión espontánea de frustración por temor a sanciones disciplinarias.',
    pulsoSolution: 'Bitácora personal y confidencial con análisis léxico procesado localmente en el navegador (Web Worker / NLP en cliente): ningún texto íntimo ni transcripción se transmite a servidores corporativos.',
    featureBadge: 'Seguridad Psicológica & NLP Local',
    icon: 'edit_note'
  },
  {
    id: 'disconnection',
    number: '04',
    title: 'Sobrecarga Extralaboral vs. Garantía de Desconexión Laboral Efectiva (Ley 2191 de 2022)',
    socialProblem: 'La invasión constante de los descansos y días libres con avisos o turnos sobrevenidos intensifica la fatiga auditiva crónica y la deserción operativa.',
    bpoBarrier: 'En la dinámica 24/7 de los Contact Centers, las comunicaciones fuera de horario desbordan las jornadas pactadas e impiden la recuperación psicofísica.',
    pulsoSolution: 'Garantía técnica de desconexión efectiva (Ley 2191 de 2022): la plataforma se sincroniza con los turnos pactados e inhibe check-ins, recordatorios y notificaciones fuera de la jornada de trabajo.',
    featureBadge: 'Conformidad Legal (Ley 2191)',
    icon: 'zap'
  }
];

export const CITATION_DATA = {
  apa7: 'Valles, L. K., Velasquez, V., Vargas, L. F., & Lezcano, J. D. (2026). Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín (I. J. Saldarriaga Roa, Asesora) [Investigación formativa, Facultad de Educación y Ciencias Sociales, Tecnológico de Antioquia].',
  bibtex: '@unpublished{valles2026relacion,\n  author = {Valles, Leidy Katherin and Velasquez, Ver{\'o}nica and Vargas, Luis Ferney and Lezcano, Jhonfer David},\n  title = {Relaci{\'o}n entre el agotamiento emocional y la percepci{\'o}n de apoyo social en trabajadores de call center de Medell{\'i}n},\n  note = {Docente l{\'i}der y asesora: Ingrid Johana Saldarriaga Roa. Investigaci{\'o}n formativa, Semillero de Trabajo Social},\n  school = {Tecnol{\'o}gico de Antioquia -- Instituci{\'o}n Universitaria},\n  year = {2026},\n  address = {Medell{\'i}n, Colombia}\n}',
  repositoryUrl: 'https://dspace.tdea.edu.co/',
  academicNote: 'Investigación formativa adscrita a la Facultad de Educación y Ciencias Sociales del Tecnológico de Antioquia (TdeA). Documento original custodiado en el Repositorio Institucional digital de la universidad.'
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
    body: 'Los datos sobre estados de ánimo y fatiga son clasificados como sensibles (Art. 5, Ley 1581 de 2012). Su registro en Pulso360 es estrictamente voluntario e informado. La plataforma prohíbe por diseño el uso de estos datos para sanciones, evaluaciones disciplinarias de desempeño o despidos.',
    tag: 'Datos Sensibles',
    icon: 'lock'
  },
  {
    code: 'Ley 2191 de 2022',
    title: 'Garantía de Desconexión Laboral Efectiva',
    body: 'Garantía de desconexión laboral efectiva para los operadores de Contact Center. Pulso360 respeta los turnos pactados y bloquea check-ins o notificaciones operativas durante descansos, días libres, licencias o periodos de vacaciones.',
    tag: 'Desconexión Laboral',
    icon: 'clock'
  },
  {
    code: 'Decreto 1072 de 2015 & Ley 1010 de 2006',
    title: 'Articulación SG-SST & Prevención de Acoso Laboral',
    body: 'La plataforma provee tendencias preventivas agregadas y anónimas al COPASST y al Comité de Convivencia Laboral, fortaleciendo el Sistema de Gestión de SST y promoviendo ambientes de trabajo dignos y libres de acoso laboral.',
    tag: 'SG-SST',
    icon: 'shieldCheck'
  }
];

export const ANTI_SURVEILLANCE_PILLARS = [
  {
    title: 'Cero Rankings Individuales',
    description: 'Prohibido por arquitectura generar listas o clasificaciones de agentes más o menos cansados para supervisores.',
    icon: 'checkCircle'
  },
  {
    title: 'Salvaguarda de k-Anonimato (k ≥ 5)',
    description: 'Las métricas colectivas solo se procesan si el grupo activo en el turno cuenta con al menos 5 agentes únicos.',
    icon: 'shieldCheck'
  },
  {
    title: 'Bitácora Confidencial con NLP en Cliente',
    description: 'El procesamiento léxico se ejecuta localmente en el navegador del operador sin transmitir textos íntimos al servidor.',
    icon: 'lock'
  },
  {
    title: 'Desvinculación Contractual y Operativa',
    description: 'Los registros de bienestar no se utilizan para incentivos económicos, métricas de calidad punitiva ni evaluaciones de desempeño.',
    icon: 'zap'
  }
];
