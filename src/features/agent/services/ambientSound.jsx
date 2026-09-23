// src/features/agent/services/ambientSound.jsx
// Ambiente sonoro del Modo Pausa, sintetizado en el dispositivo con la Web Audio
// API: ruido rosa filtrado con un vaivén lentísimo (el "aire" de la aurora) más un
// drone cálido de dos tonos en quinta. No usa archivos de audio ni licencias de
// terceros, y no se repite nunca igual porque el ruido se genera al vuelo.
// Requiere un gesto del usuario para iniciar (el clic en "Iniciar pausa").

const NOISE_SECONDS = 4;
const FADE_IN_SECONDS = 3;
const FADE_OUT_SECONDS = 1.5;
const TARGET_GAIN = 0.85;
const AIR_LFO_HZ = 0.05; // 20 s por ciclo: tan lento que no se percibe como pulso
const AIR_SWEEP_HZ = 180;
const DRONE_HZ = [110, 164.81]; // La2 + Mi3: quinta abierta, sin tensión

// Perfil sonoro por sub-fase: al inhalar el aire se vuelve más brillante,
// al exhalar más opaco y cálido. Refuerza el ritmo por el oído.
const AIR_PROFILES = [
  { label: 'inhala', filter: 900, air: 0.22, drone: 0.045 },
  { label: 'sosten', filter: 640, air: 0.17, drone: 0.05 },
  { label: 'exhala', filter: 320, air: 0.12, drone: 0.062 }
];
const NEUTRAL_PROFILE = { filter: 520, air: 0.16, drone: 0.05 };

// Ruido rosa (aproximación de Paul Kellet): suena a aire/viento, no a estática
const createPinkNoiseBuffer = (context) => {
  const length = context.sampleRate * NOISE_SECONDS;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.15;
  }

  return buffer;
};

export function createAmbientSound() {
  let context = null;
  let masterGain = null;
  let airFilter = null;
  let airGain = null;
  let droneGain = null;

  const buildGraph = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    context = new AudioContextClass();
    masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    // Capa 1 · Aire: ruido rosa pasado por un filtro que respira muy despacio
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = createPinkNoiseBuffer(context);
    noiseSource.loop = true;

    const airFilterNode = context.createBiquadFilter();
    airFilterNode.type = 'lowpass';
    airFilterNode.frequency.value = NEUTRAL_PROFILE.filter;
    airFilterNode.Q.value = 0.6;
    airFilter = airFilterNode;

    const airGainNode = context.createGain();
    airGainNode.gain.value = NEUTRAL_PROFILE.air;
    airGain = airGainNode;

    const airLfo = context.createOscillator();
    airLfo.frequency.value = AIR_LFO_HZ;
    const airLfoDepth = context.createGain();
    airLfoDepth.gain.value = AIR_SWEEP_HZ;
    airLfo.connect(airLfoDepth).connect(airFilterNode.frequency);

    noiseSource.connect(airFilterNode).connect(airGainNode).connect(masterGain);
    noiseSource.start();
    airLfo.start();

    // Capa 2 · Drone cálido: dos senoidales suaves con vibrato imperceptible
    const droneGainNode = context.createGain();
    droneGainNode.gain.value = NEUTRAL_PROFILE.drone;
    droneGainNode.connect(masterGain);
    droneGain = droneGainNode;

    DRONE_HZ.forEach((frequency, index) => {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const partialGain = context.createGain();
      partialGain.gain.value = index === 0 ? 0.6 : 0.3;
      osc.connect(partialGain).connect(droneGainNode);
      osc.start();
    });

    return context;
  };

  const fadeTo = (value, seconds) => {
    if (!context || !masterGain) return;
    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(value, now + seconds);
  };

  // Campana suave: fundamental + quinta con caída larga. Marca el inicio de cada
  // ciclo (o el cierre) sin sobresaltar: ataque de 20 ms y cola de varios segundos.
  const playChime = (baseHz, level, seconds) => {
    if (!context || !masterGain) return;
    const now = context.currentTime;

    const fundamental = context.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.value = baseHz;

    const overtone = context.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.value = baseHz * 1.5;
    const overtoneGain = context.createGain();
    overtoneGain.gain.value = 0.32;

    const softener = context.createBiquadFilter();
    softener.type = 'lowpass';
    softener.frequency.value = 2400;

    const envelope = context.createGain();
    envelope.gain.value = 0;

    fundamental.connect(envelope);
    overtone.connect(overtoneGain).connect(envelope);
    envelope.connect(softener).connect(masterGain);

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(level, now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

    fundamental.start(now);
    overtone.start(now);
    fundamental.stop(now + seconds + 0.05);
    overtone.stop(now + seconds + 0.05);
  };

  return {
    // Inicia (o reanuda) el ambiente con entrada suave
    start() {
      if (!context) buildGraph();
      if (!context || !masterGain) return false;
      if (context.state === 'suspended') context.resume();
      fadeTo(TARGET_GAIN, FADE_IN_SECONDS);
      return true;
    },

    // Silencia o reactiva sin destruir el grafo (para el botón Sonido/Silencio)
    setEnabled(enabled) {
      fadeTo(enabled ? TARGET_GAIN : 0, enabled ? FADE_IN_SECONDS : FADE_OUT_SECONDS);
    },

    // Ajusta el brillo y el peso del aire según la sub-fase respiratoria.
    // Sin índice (null) vuelve al perfil neutro fuera de la fase de respiración.
    setBreathPhase(index) {
      if (!context || !airFilter || !airGain || !droneGain) return;
      const profile = AIR_PROFILES[index] ?? NEUTRAL_PROFILE;
      const now = context.currentTime;
      const glide = 1.1; // segundos: transición inaudible, sin cortes
      airFilter.frequency.setTargetAtTime(profile.filter, now, glide);
      airGain.gain.setTargetAtTime(profile.air, now, glide);
      droneGain.gain.setTargetAtTime(profile.drone, now, glide);
    },

    // Campana de ritmo: aguda al abrir cada ciclo, grave y larga al cerrar la pausa
    chime({ deep = false } = {}) {
      playChime(deep ? 220 : 440, deep ? 0.05 : 0.042, deep ? 3.4 : 1.9);
    },

    // Apaga con desvanecimiento y libera el contexto de audio
    stop() {
      if (!context || !masterGain) return;
      const closingContext = context;
      fadeTo(0, FADE_OUT_SECONDS);
      context = null;
      masterGain = null;
      airFilter = null;
      airGain = null;
      droneGain = null;
      setTimeout(
        () => {
          closingContext.close().catch(() => {});
        },
        FADE_OUT_SECONDS * 1000 + 150
      );
    }
  };
}
