export // Respiración: ciclo completo de 12s (inhala 4 · sostén 2 · exhala 6).
// Las pistas enseñan el gesto correcto; el orbe lo marca con precisión.
const BREATH_SECONDS = 12;
export const BREATH_CYCLES = 5;
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
export const EYE_REST_SECONDS = 20;
export const STRETCH_SECONDS = 12;
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
export const STRETCH_TOTAL = STRETCH_SECONDS * STRETCHES.length;
export const BREATH_TOTAL = BREATH_SECONDS * BREATH_CYCLES;
export const PAUSE_TOTAL = BREATH_TOTAL + EYE_REST_SECONDS + STRETCH_TOTAL;
export const PHASE_DURATIONS = {
  breathing: BREATH_TOTAL,
  eyes: EYE_REST_SECONDS,
  stretch: STRETCH_TOTAL
};
export const TIMED_PHASES = Object.keys(PHASE_DURATIONS);
export const NEXT_PHASE = {
  breathing: 'eyes',
  eyes: 'stretch',
  stretch: 'done'
};

// Preferencias de audio del agente (no son datos personales: solo un interruptor).
// localStorage guarda la elección para no tener que silenciar en cada pausa.
