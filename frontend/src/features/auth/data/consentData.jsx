export const CONSENT_PURPOSES = [
  {
    key: 'c1',
    code: 'C1',
    title: 'Check-in Diario de Bienestar',
    desc: 'Registro voluntario de 6 dimensiones sobre cómo vives el turno.',
    consequence: 'No podrás registrar tu pulso diario ni seguir tu evolución en el panel.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c2',
    code: 'C2',
    title: 'Bitácora Privada de Desahogo',
    desc: 'Permite guardar reflexiones personales en el servidor, asociadas a tu cuenta.',
    consequence: 'El módulo de bitácora se oculta de tu navegación y no se admiten nuevas notas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c3',
    code: 'C3',
    title: 'Acompañamiento y Canal de Apoyo Psicosocial',
    desc: 'Autoriza el análisis léxico de tu bitácora y la solicitud de apoyo a SST.',
    consequence: 'La bitácora funcionará sin análisis léxico y el canal de apoyo quedará deshabilitado.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c4',
    code: 'C4',
    title: 'Analítica Colectiva Agregada con k-Anonimato',
    desc: 'Inclusión de respuestas autorizadas en métricas colectivas cuando se cumplen los mínimos vigentes de participación.',
    consequence: 'Tus respuestas no computarán en promedios colectivos ni en el cálculo de N.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c5',
    code: 'C5',
    title: 'Contacto Preventivo Proactivo',
    desc: 'Preferencia de autorización para contactos preventivos de SST; no activa un servicio de contacto automático.',
    consequence: 'La preferencia quedará desactivada. Las solicitudes voluntarias de apoyo dependen de C3.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  }
];
