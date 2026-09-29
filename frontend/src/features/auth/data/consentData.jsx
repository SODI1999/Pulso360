export const CONSENT_PURPOSES = [
  {
    key: 'c1',
    code: 'C1',
    title: 'Check-in diario de bienestar',
    desc: 'Permite registrar las seis dimensiones operativas del turno (energía, carga, recuperación, apoyo, distanciamiento e ineficacia) para tu autogestión.',
    consequence: 'No podrás registrar tu pulso diario ni seguir tu evolución en el panel.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c2',
    code: 'C2',
    title: 'Bitácora privada del operador',
    desc: 'Habilita tu libreta personal para consignar notas de desahogo y reflexión en el almacenamiento seguro de tu estación.',
    consequence: 'El módulo de bitácora se oculta de tu navegación y no se admiten nuevas notas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c3',
    code: 'C3',
    title: 'Procesamiento léxico orientativo (NLP)',
    desc: 'Permite que el motor determinista local analice tus notas para orientarte sobre estresores recurrentes, sin envío a servicios externos.',
    consequence: 'La bitácora funcionará como editor básico sin detección de señales.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c4',
    code: 'C4',
    title: 'Métricas agregadas y k-anonimato',
    desc: 'Permite incorporar tus respuestas a las tendencias colectivas, únicamente bajo estricto cumplimiento del umbral de k-anonimato (RF-07).',
    consequence: 'Tus respuestas no computarán en promedios colectivos ni en el cálculo de N.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c5',
    code: 'C5',
    title: 'Acompañamiento voluntario y canal SST',
    desc: 'Habilita el buzón confidencial para solicitar orientación preventiva directa al equipo de Seguridad y Salud en el Trabajo.',
    consequence: 'El acceso directo se desactiva en tu menú; las rutas públicas continúan habilitadas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  }
];
