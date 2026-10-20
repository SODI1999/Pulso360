/**
 * @file bpoPauseData.jsx
 * Active somatic pause configuration and phase timing for BPO contact center agents.
 * Calibrated for micro-breaks between intensive call queues: breathing, eye rest, and stretches.
 */

/** Duration of each breathing cycle in seconds (inhale 4s, hold 2s, exhale 6s). */
export const BREATH_SECONDS = 12;

/** Total breathing repetitions recommended per pause. */
export const BREATH_CYCLES = 5;

/**
 * Visual and cognitive guidance for each breathing phase.
 * @type {Array<{label: string, hint: string}>}
 */
export const BREATH_PHASES = [
  {
    label: 'Inhala',
    hint: 'El aire entra por la nariz y llena el abdomen.'
  },
  {
    label: 'Sostén',
    hint: 'Mantén el aire sin esfuerzo, hombros sueltos.'
  },
  {
    label: 'Exhala',
    hint: 'Suelta por la boca, más lento que al inhalar.'
  }
];

/** 20-20-20 visual rest guideline (20 seconds focusing into distance). */
export const EYE_REST_SECONDS = 20;

/** Duration per somatic stretch exercise in seconds. */
export const STRETCH_SECONDS = 12;

/**
 * Ergonomic somatic stretches targeted at BPO operator pain points (cervical, wrists, dorsal).
 * @type {Array<{title: string, desc: string}>}
 */
export const STRETCHES = [
  {
    title: 'Descarga cervical',
    desc: 'Inclina la cabeza suave hacia un hombro y cambia de lado sin forzar.'
  },
  {
    title: 'Alivio de muñecas',
    desc: 'Brazo extendido: flexiona los dedos hacia atrás con la otra mano.'
  },
  {
    title: 'Apertura dorsal',
    desc: 'Manos entrelazadas detrás de la espalda; eleva el pecho al inhalar.'
  }
];

/** Total duration of stretching section in seconds. */
export const STRETCH_TOTAL = STRETCH_SECONDS * STRETCHES.length;

/** Total duration of breathing section in seconds. */
export const BREATH_TOTAL = BREATH_SECONDS * BREATH_CYCLES;

/** Total active pause duration in seconds. */
export const PAUSE_TOTAL = BREATH_TOTAL + EYE_REST_SECONDS + STRETCH_TOTAL;

/**
 * Mapping of phase identifier to allotted duration in seconds.
 * @type {Record<string, number>}
 */
export const PHASE_DURATIONS = {
  breathing: BREATH_TOTAL,
  eyes: EYE_REST_SECONDS,
  stretch: STRETCH_TOTAL
};

/** List of phases that run with active countdown timers. */
export const TIMED_PHASES = Object.keys(PHASE_DURATIONS);

/**
 * State machine sequence for phase progression.
 * @type {Record<string, string>}
 */
export const NEXT_PHASE = {
  breathing: 'eyes',
  eyes: 'stretch',
  stretch: 'done'
};
