export const CONSENT_PURPOSES = [
  {
    key: 'c1',
    code: 'C1',
    title: 'Check-in Diario de Bienestar',
    desc: 'Registro voluntario de 6 dimensiones al inicio de turno.',
    consequence: 'No podrás registrar tu pulso diario ni seguir tu evolución en el panel.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c2',
    code: 'C2',
    title: 'Bitácora Privada de Desahogo',
    desc: 'Espacio de reflexión personal con análisis léxico confidencial.',
    consequence: 'El módulo de bitácora se oculta de tu navegación y no se admiten nuevas notas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c3',
    code: 'C3',
    title: 'Acompañamiento y Canal de Apoyo Psicosocial',
    desc: 'Habilita la solicitud y canal de contacto seguro con SST.',
    consequence: 'La bitácora funcionará como editor básico sin detección de señales.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c4',
    code: 'C4',
    title: 'Analítica Colectiva Agregada con k-Anonimato',
    desc: 'Inclusión anónima en métricas colectivas siempre que k >= 5.',
    consequence: 'Tus respuestas no computarán en promedios colectivos ni en el cálculo de N.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c5',
    code: 'C5',
    title: 'Contacto Preventivo Proactivo',
    desc: 'Permite al área de SST sugerir pausas activas o recursos de apoyo.',
    consequence: 'El acceso directo se desactiva en tu menú; las rutas públicas continúan habilitadas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  }
];
