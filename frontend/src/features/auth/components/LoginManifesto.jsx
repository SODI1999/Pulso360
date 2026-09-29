import { Link } from 'react-router-dom';

import { Icon } from '../../../core/components/Icon';
import { AUTH_SAFEGUARDS, AUTH_METADATA } from '../data/authData';

export function LoginManifesto() {
  return (
    <aside className="login-manifesto-panel" aria-label="Principios de acceso y privacidad de Pulso360">
      <div className="manifesto-top-bar">
        <div className="manifesto-brand-lockup">
          <img src="/assets/marca/logo.webp" alt="Pulso360" className="manifesto-brand-symbol" />
          <span className="manifesto-brand-title">Pulso360</span>
        </div>
        <Link to="/" className="manifesto-back-link" title="Volver al portal público">
          <Icon name="arrowLeft" size={14} />
          <span>Volver al portal</span>
        </Link>
      </div>

      <div className="manifesto-body">
        <header className="manifesto-editorial-header">
          <h1 className="manifesto-title">
            Tu espacio de desahogo.
            <br className="manifesto-break" /> Bienestar separado del desempeño.
          </h1>
          <p className="manifesto-lead">{AUTH_METADATA.subtitle}</p>
        </header>

        {/* Salvaguardas Éticas y de Seguridad SGSI */}
        <div className="manifesto-safeguards-container">
          <span className="safeguards-section-heading">Salvaguardas de Privacidad y SG-SST</span>
          <ul className="manifesto-safeguards-clean">
            {AUTH_SAFEGUARDS.map((safe) => (
              <li key={safe.title} className="safeguard-card-clean">
                <span className="safeguard-bullet-icon" aria-hidden="true">
                  <Icon name={safe.icon} size={16} />
                </span>
                <div className="safeguard-detail">
                  <strong className="safeguard-name">{safe.title}</strong>
                  <p className="safeguard-summary">{safe.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="manifesto-corporate-footer">
        <span>{AUTH_METADATA.footerNote}</span>
      </footer>
    </aside>
  );
}
