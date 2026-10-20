/**
 * @file checkinWizardData.jsx
 * Multi-dimensional occupational check-in questionnaire for BPO agents.
 * Grounded in daily shift operational reality: energy battery, emotional friction with customers,
 * recovery/sleep, on-line supervisor support, protective detachment, and tooling friction.
 */

/**
 * Specification of questions for the daily check-in wizard.
 * @type {Array<{key: string, title: string, labels: string[], contextNote: string}>}
 */
export const QUESTIONS = [
  {
    key: 'energia',
    title: '¿Con qué nivel de batería física y mental estás enfrentando este turno?',
    labels: ['Sin batería', 'Baja energía', 'Justa para el turno', 'Buena energía', 'Plena y enfocado'],
    contextNote:
      'Empezar con poca energía es natural tras jornadas largas o trasnocho. Reconocerlo te ayuda a no forzarte de más.'
  },
  {
    key: 'cargaEmocional',
    title: '¿Qué tan difícil o cargado sientes el trato con los usuarios en esta jornada?',
    labels: ['Muy tranquilo', 'Manejable', 'Exigente', 'Muy tenso', 'Hostil o agotador'],
    contextNote:
      'Absorber la molestia de los clientes desgasta a cualquiera. Marcar un nivel alto refleja la rudeza de la cola hoy, no tu capacidad.'
  },
  {
    key: 'recuperacion',
    title: '¿Lograste descansar y desconectarte de la operación antes de iniciar hoy?',
    labels: [
      'Nada de descanso',
      'Poco descanso',
      'Descanso parcial',
      'Buen descanso',
      'Totalmente recuperado'
    ],
    contextNote:
      'Tu descanso es un derecho laboral. El sueño interrumpido o pensar en llamadas afecta directamente tu bienestar.'
  },
  {
    key: 'apoyo',
    title:
      'Cuando se te complica una llamada o un caso difícil, ¿qué tan respaldado te sientes por tu soporte?',
    labels: ['Sin respaldo', 'Poco apoyo', 'Respaldo básico', 'Buen respaldo', 'Totalmente respaldado'],
    contextNote:
      'Esta percepción corresponde a tu experiencia del turno; en los flujos definidos no se plantea usarla para calificar o amonestar a otras personas.'
  },
  {
    key: 'distanciamiento',
    title: "¿Sientes la necesidad de ponerte en 'piloto automático' para sobrellevar la cola de llamadas?",
    labels: ['Nada (conectado)', 'Casi nunca', 'A veces', 'Frecuentemente', 'Todo el turno'],
    contextNote:
      'Poner un escudo mental es una reacción natural de autoprotección cuando la cola no frena. No significa desinterés.'
  },
  {
    key: 'ineficacia',
    title:
      '¿Sientes que los sistemas, herramientas y políticas te dejan resolverle al usuario o te atan las manos?',
    labels: ['Todo fluye', 'Mayormente fluido', 'Trabas ocasionales', 'Manos atadas', 'Impotencia total'],
    contextNote:
      'La frustración cuando el sistema se congela o la política no ayuda es un fallo de herramientas, no de tu capacidad.'
  }
];
