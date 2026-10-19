import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';
import { ZenBreathingOrb } from '../components/ZenBreathingOrb';
import { CrisisContactLines } from '../components/CrisisContactLines';
import { CrisisLegalDetails } from '../components/CrisisLegalDetails';
import { useCrisisSupport } from '../hooks/useCrisisSupport';

import '../../../styles/crisis.css';

export function CrisisSupportPage() {
  const {
    navigate,
    consent
  } = useCrisisSupport();

  return (
    <div className="agent-page crisis-editorial-page">
      {/* Retorno al panel del agente */}
      <nav className="agent-subnav" aria-label="Navegación secundaria">
        <button type="button" className="agent-back-btn" onClick={() => navigate('/agente/panel')}>
          <Icon name="arrowLeft" size={16} />
          <span>Volver al panel</span>
        </button>
      </nav>

      {/* Cabecera Editorial Serana y Sin Relleno */}
      <header className="crisis-page-header">
        <h1 className="crisis-page-title">Espacio de contención y apoyo inmediato</h1>
        <p className="crisis-page-subtitle">
          Respira hondo y recupera el control. La llamada ya terminó y tú marcas el compás de tu turno.
        </p>
      </header>

      {/* Layout Unificado y Limpio (2 Columnas Equilibradas, CERO Redundancias) */}
      <div className="crisis-clean-layout">
        {/* Columna 1: Pausa Somática in situ */}
        <section className="crisis-clean-card crisis-clean-card--calm" aria-labelledby="zen-heading">
          <div className="crisis-section-heading-group">
            <h2 id="zen-heading" className="crisis-section-title">
              Pausa de respiración en puesto
            </h2>
            <p className="crisis-section-desc">
              Sigue el compás del círculo para bajar la frecuencia cardíaca y recuperar tu centro.
            </p>
          </div>

          <ZenBreathingOrb />
        </section>

        {/* Columna 2: Líneas Oficiales de Atención 24/7 */}
        <div className="crisis-clean-card">
          <CrisisContactLines />
        </div>
      </div>

      {/* Sección Secundaria Plegada: Apoyo Institucional con SST y Marco Legal */}
      <details className="crisis-legal-details">
        <summary className="crisis-legal-summary">
          <div className="crisis-legal-summary-left">
            <Icon name="Scale" size={18} />
            <span>Orientación institucional, solicitud con SST y marco legal (Ley 1010 y Res. 3461)</span>
          </div>
          <span className="crisis-legal-summary-hint">
            Canales de reporte formal y acompañamiento voluntario
          </span>
        </summary>

        <div className="crisis-sst-section" style={{ marginTop: '16px', marginBottom: '16px' }} aria-labelledby="sst-heading">
          <div className="crisis-sst-info">
            <h3 id="sst-heading" className="crisis-sst-title">
              ¿Requieres orientación personalizada con el equipo de SST?
            </h3>
            <p className="crisis-sst-desc">
              Puedes registrar una solicitud voluntaria en modalidad anónima o confidencial. Tus respuestas de
              check-in y bitácoras no se incorporan a la solicitud.
            </p>
          </div>

          <div className="crisis-sst-actions">
            {!consent?.c3 || consent?.active === false ? (
              <Link to="/consentimiento" className="btn-crisis-call btn-crisis-call--secondary">
                <Icon name="shieldCheck" size={16} />
                <span>Gestionar consentimiento para acompañamiento (C3)</span>
              </Link>
            ) : (
              <Link to="/agente/apoyo" className="btn-crisis-call btn-crisis-call--primary">
                <Icon name="support_agent" size={18} />
                <span>Ir al canal de acompañamiento con SST</span>
              </Link>
            )}
          </div>
        </div>

        <CrisisLegalDetails />
      </details>
    </div>
  );
}
