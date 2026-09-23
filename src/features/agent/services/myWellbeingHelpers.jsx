export const DIMENSION_DEFINITIONS = [
  {
    key: 'energia',
    label: 'Batería de turno',
    desc: 'Vitalidad y energía disponible durante la operación telefónica y digital',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral' };
      if (val <= 2) return { text: 'Batería baja; prioriza descanso', tone: 'alert' };
      if (val === 3) return { text: 'Energía estándar de turno', tone: 'warm' };
      return { text: 'Buena vitalidad y enfoque', tone: 'calm' };
    }
  },
  {
    key: 'cargaEmocional',
    label: 'Tensión por usuarios',
    desc: 'Exigencia emocional en llamadas e interacciones de alta fricción',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral' };
      if (val >= 4) return { text: 'Alta tensión acumulada', tone: 'alert' };
      if (val === 3) return { text: 'Fricción moderada', tone: 'warm' };
      return { text: 'Interacciones serenas', tone: 'calm' };
    }
  },
  {
    key: 'recuperacion',
    label: 'Recuperación y descanso',
    desc: 'Calidad de sueño, desconexión fuera de turno y pausas activas',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral' };
      if (val <= 2) return { text: 'Recuperación insuficiente', tone: 'alert' };
      if (val === 3) return { text: 'Descanso intermedio', tone: 'warm' };
      return { text: 'Recuperación adecuada', tone: 'calm' };
    }
  },
  {
    key: 'apoyo',
    label: 'Respaldo en línea',
    desc: 'Acompañamiento percibido del equipo, soporte de piso y supervisión',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral' };
      if (val <= 2) return { text: 'Sensación de aislamiento', tone: 'alert' };
      if (val === 3) return { text: 'Respaldo regular en línea', tone: 'warm' };
      return { text: 'Excelente acompañamiento', tone: 'calm' };
    }
  },
  {
    key: 'distanciamiento',
    label: 'Piloto automático',
    desc: 'Modo automático o desapego como barrera defensiva ante el cansancio',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral' };
      if (val >= 4) return { text: 'Piloto automático por fatiga', tone: 'alert' };
      if (val === 3) return { text: 'Automatismo ocasional', tone: 'warm' };
      return { text: 'Atención presente y conectada', tone: 'calm' };
    }
  },
  {
    key: 'ineficacia',
    label: 'Eficacia y trabas del sistema',
    desc: 'Fluidez de aplicativos, CRM y telefonía frente a trabas operativas',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral' };
      if (val >= 4) return { text: 'Alta fricción por fallas técnicas', tone: 'alert' };
      if (val === 3) return { text: 'Fricciones puntuales', tone: 'warm' };
      return { text: 'Sistemas operando con fluidez', tone: 'calm' };
    }
  }
];

export const formatShiftTabDate = (dateStr, isLatest) => {
  if (!dateStr) return 'Turno';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const monthName = months[monthIdx] || parts[1];
  return isLatest ? `${day} ${monthName} (Hoy)` : `${day} ${monthName}`;
};
