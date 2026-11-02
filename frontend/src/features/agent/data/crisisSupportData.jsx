/**
 * @file crisisSupportData.jsx
 * Somatic Grounding 5-4-3-2-1 sequence and audio prompts for acute post-call de-escalation.
 * Anchors agents in sensory workstation reality (sight, touch, hearing, scent, and psychological safety closure).
 */

/**
 * Structural steps for somatic grounding in contact center workstations.
 * @type {Array<{number: number, sense: string, verb: string, title: string, guide: string, badge: string, anchors: Array<{id: string, label: string, cue: string}>}>}
 */
export const GROUNDING_STEPS = [
  {
    number: 5,
    sense: 'Vista',
    verb: 'Observa 5 anclas visibles',
    title: '5 puntos físicos para fijar tu mirada en el puesto',
    guide:
      'Elige cada elemento con la mirada en tu estación de trabajo y márcalo al ubicarlo. No analices ni juzgues: solo confirma su presencia física real.',
    badge: 'Observa',
    anchors: [
      {
        id: 'v1',
        label: 'Borde exterior de tu monitor o pantalla',
        cue: 'Nota el contraste del marco contra la iluminación de la sala'
      },
      {
        id: 'v2',
        label: 'Cable o estructura de tu diadema telefónica',
        cue: 'Observa su forma y curvatura sobre tu mesa de trabajo'
      },
      {
        id: 'v3',
        label: 'Una tecla específica de tu teclado (ej. barra espaciadora)',
        cue: 'Fija la mirada en el relieve y la letra con nitidez'
      },
      {
        id: 'v4',
        label: 'Termo, vaso de agua o tu libreta de notas',
        cue: 'Observa su color, reflejo y posición al alcance de tu mano'
      },
      {
        id: 'v5',
        label: 'Un punto de luz o sombra sobre la superficie de la mesa',
        cue: 'Registra el límite entre la luz y la sombra sin forzar la vista'
      }
    ]
  },
  {
    number: 4,
    sense: 'Tacto',
    verb: 'Siente 4 apoyos corporales',
    title: '4 anclas de descarga física inmediata',
    guide:
      'Desvía la atención de la llamada hacia las sensaciones físicas de tu postura. Tu cuerpo es el ancla más rápida con el momento presente.',
    badge: 'Siente',
    anchors: [
      {
        id: 't1',
        label: 'Apoya ambos pies firmes y planos sobre el suelo',
        cue: 'Siente el contacto total de la suela de tus zapatos contra el piso'
      },
      {
        id: 't2',
        label: 'Presiona suavemente las palmas sobre el borde del escritorio',
        cue: 'Nota la firmeza y temperatura fría o neutra de la mesa'
      },
      {
        id: 't3',
        label: 'Siente el respaldo de la silla en tu zona lumbar',
        cue: 'Permite que la silla sostenga tu espalda; no necesitas retener tensión'
      },
      {
        id: 't4',
        label: 'Suelta la mandíbula y desciende los hombros',
        cue: 'Separa los dientes suavemente y exhala el peso acumulado'
      }
    ]
  },
  {
    number: 3,
    sense: 'Oído',
    verb: 'Escucha 3 sonidos neutros',
    title: '3 anclas sonoras del entorno operativo',
    guide:
      'Filtra las voces o los ecos mentales de la llamada anterior. Enfócate en sonidos constantes que están ocurriendo ahora mismo.',
    badge: 'Escucha',
    anchors: [
      {
        id: 'o1',
        label: 'Zumbido continuo del aire acondicionado o ventilación',
        cue: 'Un sonido monótono y constante que te ayuda a aislar el ruido mental'
      },
      {
        id: 'o2',
        label: 'El flujo de tu propia exhalación pausada',
        cue: 'Escucha el sonido del aire saliendo sin prisa por la nariz o boca'
      },
      {
        id: 'o3',
        label: 'Murmullo amortiguado o tecleo distante en la sala',
        cue: 'Sonidos neutros que confirman que la operación continúa sin ti en este instante'
      }
    ]
  },
  {
    number: 2,
    sense: 'Olfato / Aire',
    verb: 'Inhala 2 registros de aire limpio',
    title: '2 registros de aire y aroma en tu estación',
    guide:
      'Inhala despacio hacia la base de tus pulmones. Lleva aire fresco y nota las sutilezas de tu entorno inmediato.',
    badge: 'Inhala',
    anchors: [
      {
        id: 'ol1',
        label: 'Inhala lento sintiendo la temperatura del aire al entrar',
        cue: 'Percibe el aire más fresco en tus fosas nasales'
      },
      {
        id: 'ol2',
        label: 'Aroma de tu bebida (café, té, agua) o tejido de tu ropa',
        cue: 'Un estímulo cotidiano y familiar que te devuelve a la calma'
      }
    ]
  },
  {
    number: 1,
    sense: 'Conexión / Presencia',
    verb: '1 afirmación de retorno',
    title: '1 momento para elegir cómo continuar',
    guide:
      'Observa cómo te encuentras. Puedes detener este ejercicio y consultar las opciones de apoyo si lo necesitas.',
    badge: 'Conecta',
    anchors: [
      {
        id: 'c1',
        label: '«Puedo detener este ejercicio y buscar apoyo.»',
        cue: 'Elige si quieres continuar, hacer otra pausa o consultar las opciones de apoyo'
      }
    ]
  }
];

/**
 * Spoken guidance script for introducing each grounding step via speech synthesis.
 * @type {Record<number, string>}
 */
export const STEP_INTRO_SPEECH = {
  5: 'Paso 5: Vista. Respira despacio y ubica con la mirada cinco puntos en tu puesto de trabajo. Toca cada número cuando lo encuentres.',
  4: 'Paso 4: Tacto. Siente el apoyo físico de tu cuerpo. Libera la tensión en pies, palmas, espalda y hombros.',
  3: 'Paso 3: Oído. Filtra los ecos de la llamada. Enfócate en los sonidos neutros que ocurren ahora en la sala.',
  2: 'Paso 2: Olfato y aire. Inhala suavemente sintiendo la frescura del aire y los aromas cercanos en tu puesto.',
  1: 'Paso 1: Conexión. Observa cómo te encuentras. Puedes detener este ejercicio y buscar apoyo si lo necesitas.'
};

/**
 * Spoken confirmation feedback emitted when the user selects or touches an anchor.
 * @type {Record<string, string>}
 */
export const ANCHOR_FEEDBACK_SPEECH = {
  v1: 'Monitor localizado. Respira hondo y busca el siguiente punto.',
  v2: 'Diadema telefónica ubicada.',
  v3: 'Tecla del teclado enfocada.',
  v4: 'Termo o vaso de agua registrado.',
  v5: 'Haz de luz y sombra fijado.',
  t1: 'Pies planos y firmes en el piso.',
  t2: 'Palmas apoyadas sobre el escritorio.',
  t3: 'Zona lumbar sostenida por el respaldo.',
  t4: 'Mandíbula suelta y hombros descendidos.',
  o1: 'Ventilación continua de la sala escuchada.',
  o2: 'Sonido de tu propia respiración reconocido.',
  o3: 'Sonido amortiguado de la sala filtrado.',
  ol1: 'Inhalación de aire fresco recibida.',
  ol2: 'Aroma cotidiano registrado.',
  c1: 'Ejercicio completado. Puedes elegir tu siguiente paso.'
};
