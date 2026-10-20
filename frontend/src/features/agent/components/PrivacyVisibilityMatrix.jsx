import { Icon } from '../../../core/components/Icon';

/**
 * Escala de Niveles de Privacidad y Salvaguardas de Pulso360.
 * Presenta los 4 niveles de visibilidad en un timeline vertical conectado que visualiza
 * la progresión desde el aislamiento íntimo en la estación hasta la capa operativa corporativa.
 * Cumple con el estándar anti-slop: sin badges decorativos redundantes ni pastillas radius-9999.
 */
export function PrivacyVisibilityMatrix() {
  const levels = [
    {
      level: 1,
      scopeTag: 'Aislamiento local en estación',
      icon: 'Lock',
      iconTone: 'var(--c-primario)',
      title: 'Exclusivo en tu estación de trabajo',
      scope: 'Bitácoras personales, textos de desahogo y reflexiones privadas de turno.',
      safeguard: 'El motor léxico opera 100% de forma local en tu navegador. Ni supervisores ni RRHH tienen acceso al contenido escrito; no hay envíos a servidores ni a modelos remotos de IA.'
    },
    {
      level: 2,
      scopeTag: 'Anonimato grupal (k ≥ 5)',
      icon: 'Users',
      iconTone: 'var(--c-info)',
      title: 'Tendencias Agregadas para SG-SST',
      scope: 'Puntajes somáticos de fatiga, tensión y energía del Check-in diario.',
      safeguard: 'Solo alimenta mapas térmicos colectivos si hay al menos 5 agentes en la misma campaña y turno. Jamás se desagrega individualmente ni afecta tu evaluación operativa o AHT.'
    },
    {
      level: 3,
      scopeTag: 'Canal de salud ocupacional',
      icon: 'HeartHandshake',
      iconTone: '#8b5cf6',
      title: 'Acompañamiento Psicosocial Voluntario',
      scope: 'Solicitudes voluntarias de orientación psicosocial o pausas guiadas.',
      safeguard: 'Visible exclusivamente por el profesional de SST o Psicología asignado para atender tu caso, amparado bajo estricto secreto y deber legal de reserva profesional.'
    },
    {
      level: 4,
      scopeTag: 'Capa institucional y WFM',
      icon: 'Building2',
      iconTone: 'var(--c-texto-suave)',
      title: 'Datos Institucionales de Estación',
      scope: 'Nombre corporativo, correo de campaña, sede, turno y campaña asignada por WFM.',
      safeguard: 'Información administrada por el área de operaciones para habilitar tu estación de trabajo, validar tu jornada y permitir el acceso seguro a sistemas.'
    }
  ];

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            Escala de Niveles de Privacidad: ¿Quién tiene acceso a qué?
          </h2>
          <p className="card-subtitle">
            Pulso360 organiza la información en 4 capas de protección para garantizar que el bienestar jamás se confunda con vigilancia laboral.
          </p>
        </div>
      </div>

      <div className="privacy-levels-timeline">
        {levels.map((lvl, index) => {
          const isLast = index === levels.length - 1;
          return (
            <div key={lvl.level} className={`privacy-level-step ${isLast ? 'is-last' : ''}`}>
              {/* Rail vertical conector */}
              <div className="privacy-level-rail">
                <div className="privacy-level-node" style={{ borderColor: lvl.iconTone }}>
                  <Icon name={lvl.icon} size={15} style={{ color: lvl.iconTone }} />
                </div>
                {!isLast && <div className="privacy-level-connector" />}
              </div>

              {/* Contenido estructurado del nivel */}
              <div className="privacy-level-content">
                <div className="privacy-level-header">
                  <div className="privacy-level-title-group">
                    <span className="privacy-level-num-tag">Nivel {lvl.level}</span>
                    <h3 className="privacy-level-title">{lvl.title}</h3>
                  </div>
                  <span className="privacy-level-scope-label">{lvl.scopeTag}</span>
                </div>

                <div className="privacy-level-body">
                  <p className="privacy-level-scope">
                    <strong className="privacy-level-label">Información comprendida:</strong>{' '}
                    <span>{lvl.scope}</span>
                  </p>

                  <div className="privacy-level-safeguard">
                    <Icon name="ShieldCheck" size={14} style={{ color: lvl.iconTone, flexShrink: 0, marginTop: '2px' }} />
                    <span className="privacy-level-safeguard-text">{lvl.safeguard}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
