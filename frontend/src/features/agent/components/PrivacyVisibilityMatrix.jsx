import { Icon } from '../../../core/components/Icon';

/**
 * Describe almacenamiento y acceso según el tipo de información del agente.
 * Distingue el análisis léxico local de la persistencia y autorización del servidor.
 * @returns {JSX.Element} Matriz de alcance de los datos y controles implementados.
 */
export function PrivacyVisibilityMatrix() {
  const levels = [
    {
      level: 1,
      scopeTag: 'Acceso personal',
      icon: 'Lock',
      iconTone: 'var(--c-primario)',
      title: 'Bitácora de tu cuenta',
      scope: 'Bitácoras personales, textos de desahogo y reflexiones privadas de turno.',
      safeguard: 'El análisis léxico se ejecuta en tu navegador, sin modelos remotos de IA. Al guardar, el texto y su análisis se envían al servidor y quedan asociados a tu cuenta. Las vistas de supervisión no muestran el contenido de tus bitácoras.'
    },
    {
      level: 2,
      scopeTag: 'Agregados protegidos',
      icon: 'Users',
      iconTone: 'var(--c-info)',
      title: 'Tendencias colectivas',
      scope: 'Respuestas de check-in autorizadas para analítica colectiva.',
      safeguard: 'El servidor aplica los mínimos de participación vigentes al grupo y período autorizados. Si no se cumplen, restringe los resultados; las vistas colectivas no muestran respuestas individuales. La dotación de un equipo no determina por sí sola que una métrica pueda publicarse.'
    },
    {
      level: 3,
      scopeTag: 'Canal de salud ocupacional',
      icon: 'HeartHandshake',
      iconTone: 'var(--c-rol-sst)',
      title: 'Acompañamiento voluntario con SST',
      scope: 'Solicitudes de apoyo y mensajes que compartes en su radicado.',
      safeguard: 'El equipo SST autorizado puede consultar y gestionar estos casos. En modalidad anónima, SST no recibe tu nombre ni tu identificador de cuenta, pero el contenido puede revelar tu identidad. El sistema conserva el vínculo del radicado con tu cuenta para permitir su seguimiento.'
    },
    {
      level: 4,
      scopeTag: 'Administración de acceso',
      icon: 'Building2',
      iconTone: 'var(--c-texto-suave)',
      title: 'Datos de tu cuenta y asignación',
      scope: 'Nombre, correo, rol y asignaciones organizacionales registradas en Pulso360.',
      safeguard: 'La administración gestiona las cuentas, sus roles y asignaciones. Esos permisos delimitan las rutas y datos accesibles; administrar una cuenta no habilita la lectura de su bitácora personal.'
    }
  ];

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            ¿Cómo se guardan y quién puede consultar tus datos?
          </h2>
          <p className="card-subtitle">
            El acceso depende del tipo de registro y de los permisos de cada rol. Estas son las diferencias entre tu información personal, los agregados y las solicitudes de apoyo.
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
