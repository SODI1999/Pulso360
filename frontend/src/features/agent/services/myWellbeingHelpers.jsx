// src/features/agent/services/myWellbeingHelpers.jsx
// Definiciones somáticas, evaluadores cualitativos con micro-recomendaciones ergonómicas para BPO
// y utilidades de síntesis de vitalidad semanal.

export const DIMENSION_DEFINITIONS = [
  {
    key: 'energia',
    label: 'Batería de turno',
    group: 'body',
    icon: 'zap',
    desc: 'Vitalidad y energía disponible durante la operación telefónica y digital',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral', recommendation: 'Completa tu check-in diario para monitorear tu vitalidad.' };
      if (val <= 2) {
        return {
          text: 'Batería baja',
          tone: 'alert',
          recommendation: 'Prioriza desconexión física al cierre de turno; camina 2 minutos para reactivar la circulación de piernas y espalda.'
        };
      }
      if (val === 3) {
        return {
          text: 'Energía estándar',
          tone: 'warm',
          recommendation: 'Ritmo equilibrado; aprovecha tu próxima pausa activa para estirar muñecas, hombros y cuello.'
        };
      }
      return {
        text: 'Buena vitalidad',
        tone: 'calm',
        recommendation: 'Nivel óptimo sostenido; mantén hidratación constante en tu estación para cuidar tu rendimiento vocal.'
      };
    }
  },
  {
    key: 'cargaEmocional',
    label: 'Tensión por usuarios',
    group: 'body',
    icon: 'headphones',
    desc: 'Exigencia emocional en llamadas e interacciones de alta fricción',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral', recommendation: 'Registra la fricción con usuarios para prevenir desgaste acumulado.' };
      if (val >= 4) {
        return {
          text: 'Alta tensión acumulada',
          tone: 'alert',
          recommendation: 'Pausa de descarga auditiva: retira los auriculares 1 min, rota hombros hacia atrás y haz 3 respiraciones profundas.'
        };
      }
      if (val === 3) {
        return {
          text: 'Fricción moderada',
          tone: 'warm',
          recommendation: 'Estiramiento suave de cervicales entre llamadas para soltar la mandíbula y la zona escapular.'
        };
      }
      return {
        text: 'Interacciones serenas',
        tone: 'calm',
        recommendation: 'Jornada con ritmo fluido; realiza micro-descansos de voz entre bloques intensos de atención.'
      };
    }
  },
  {
    key: 'recuperacion',
    label: 'Recuperación y descanso',
    group: 'body',
    icon: 'wind',
    desc: 'Calidad de sueño, desconexión fuera de turno y pausas activas',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral', recommendation: 'Evalúa tu descanso previo para calibrar la exigencia de tu jornada.' };
      if (val <= 2) {
        return {
          text: 'Recuperación insuficiente',
          tone: 'alert',
          recommendation: 'Descanso previo incompleto; evita pantallas luminosas 30 minutos antes de dormir para permitir sueño reparador.'
        };
      }
      if (val === 3) {
        return {
          text: 'Descanso intermedio',
          tone: 'warm',
          recommendation: 'Recuperación regular; procura evitar café o bebidas energéticas en las últimas 2 horas de tu jornada.'
        };
      }
      return {
        text: 'Recuperación adecuada',
        tone: 'calm',
        recommendation: 'Excelente ciclo de descanso y desconexión laboral efectiva fuera de tu horario operativo.'
      };
    }
  },
  {
    key: 'apoyo',
    label: 'Respaldo en línea',
    group: 'operation',
    icon: 'users',
    desc: 'Acompañamiento percibido del equipo, soporte de piso y supervisión',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral', recommendation: 'Identifica la cercanía del soporte técnico y operativo en tu turno.' };
      if (val <= 2) {
        return {
          text: 'Sensación de aislamiento',
          tone: 'alert',
          recommendation: 'Si sientes falta de respaldo, contacta a tu supervisor de piso o apóyate en el canal de consulta de campaña.'
        };
      }
      if (val === 3) {
        return {
          text: 'Respaldo regular en línea',
          tone: 'warm',
          recommendation: 'Acompañamiento estándar; comparte cualquier traba de procedimiento con tus compañeros de línea.'
        };
      }
      return {
        text: 'Excelente acompañamiento',
        tone: 'calm',
        recommendation: 'Respaldo cercano y comunicación abierta con el equipo y supervisores en el piso de operaciones.'
      };
    }
  },
  {
    key: 'distanciamiento',
    label: 'Piloto automático',
    group: 'operation',
    icon: 'shield',
    desc: 'Modo automático o desapego como barrera defensiva ante el cansancio',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral', recommendation: 'Revisa tu nivel de presencia y conexión durante las llamadas.' };
      if (val >= 4) {
        return {
          text: 'Piloto automático por fatiga',
          tone: 'alert',
          recommendation: 'Desapego como defensa: realiza una pausa breve para reconectar con tus sensaciones físicas y respirar.'
        };
      }
      if (val === 3) {
        return {
          text: 'Automatismo ocasional',
          tone: 'warm',
          recommendation: 'Monotonía en llamadas repetitivas: varía tu postura en la silla y haz 2 respiraciones diafragmáticas.'
        };
      }
      return {
        text: 'Atención presente y conectada',
        tone: 'calm',
        recommendation: 'Atención consciente y empática con los usuarios sin experimentar sobrecarga por despersonalización.'
      };
    }
  },
  {
    key: 'ineficacia',
    label: 'Fluidez de sistemas',
    group: 'operation',
    icon: 'activity',
    desc: 'Fluidez de aplicativos, CRM y telefonía frente a trabas operativas',
    evaluator: (val) => {
      if (val == null) return { text: 'Sin registro', tone: 'neutral', recommendation: 'Mide el impacto de herramientas y software en tu nivel de estrés diario.' };
      if (val >= 4) {
        return {
          text: 'Alta fricción por fallas técnicas',
          tone: 'alert',
          recommendation: 'Fatiga por trabas de CRM o telefonía: aplica la regla 20-20-20 mirando a lo lejos para relajar la vista.'
        };
      }
      if (val === 3) {
        return {
          text: 'Fricciones puntuales',
          tone: 'warm',
          recommendation: 'Trabas operativas leves: ajusta el brillo de pantalla y la inclinación del monitor para mitigar fatiga visual.'
        };
      }
      return {
        text: 'Sistemas operando con fluidez',
        tone: 'calm',
        recommendation: 'Herramientas ágiles y aplicativos operando sin generar sobrecarga cognitiva adicional.'
      };
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

/**
 * Genera la síntesis cualitativa y ergonómica de la trayectoria semanal de vitalidad.
 * @param {string|number|null} averageEnergy - Promedio aritmético de energía (1-5).
 * @param {Array} recentShifts - Lista de jornadas del ciclo reciente.
 * @returns {Object} Objeto descriptivo con título, explicación, tono y badge.
 */
export const getVitalitySummary = (averageEnergy, recentShifts = []) => {
  if (averageEnergy == null || recentShifts.length === 0) {
    return {
      title: 'Comienza tu seguimiento',
      description: 'Registra tus check-ins al cierre de cada turno para construir tu trayectoria de vitalidad personal.',
      tone: 'neutral',
      badge: 'Sin datos suficientes'
    };
  }

  const avg = parseFloat(averageEnergy);

  if (avg >= 4.0) {
    return {
      title: 'Vitalidad alta y sostenida',
      description: 'Tus turnos recientes reflejan un ritmo balanceado con buena capacidad de recarga entre jornadas operativas.',
      tone: 'calm',
      badge: `${avg} / 5 · Ritmo óptimo`
    };
  }

  if (avg >= 3.0) {
    return {
      title: 'Ritmo operativo estable',
      description: 'Equilibrio adecuado frente a la demanda de llamadas. Mantén tus pausas activas para evitar fatiga acumulada hacia el fin de ciclo.',
      tone: 'warm',
      badge: `${avg} / 5 · Ritmo equilibrado`
    };
  }

  return {
    title: 'Señal de sobrecarga acumulada',
    description: 'Tus registros muestran drenaje de energía continuo en las jornadas recientes. Prioriza micropausas de respiración y desconexión puntual.',
    tone: 'alert',
    badge: `${avg} / 5 · Atención preventiva`
  };
};
