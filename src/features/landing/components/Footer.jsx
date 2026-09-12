// src/features/landing/components/Footer.jsx
// Pie de página modular reutilizable para la Landing Page y páginas públicas

import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (hash) => {
    if (location.pathname === '/') {
      const targetId = hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', hash);
      }
    } else {
      navigate(`/${hash}`);
    }
  };

  return (
    <footer className="landing-footer">
      <div className="landing-container footer-grid">
        <div className="footer-brand">
          <Link className="brand brand-footer" to="/" onClick={() => handleNavClick('#inicio')} aria-label="Pulso360, volver al inicio">
            <img className="brand-logo" src="/assets/imágenes/logo.png" alt="" />
            <span className="brand-name">Pulso360</span>
          </Link>
          <p>Encuestas breves, privacidad individual y tendencias colectivas para prevenir el desgaste laboral en BPO.</p>
        </div>

        <div className="footer-column">
          <h2>Explorar</h2>
          <button type="button" onClick={() => handleNavClick('#problema')}>El problema</button>
          <button type="button" onClick={() => handleNavClick('#como-funciona')}>Cómo funciona</button>
          <button type="button" onClick={() => handleNavClick('#funcionalidades')}>Funcionalidades</button>
          <Link to="/contactenos">Contáctenos</Link>
        </div>

        <div className="footer-column">
          <h2>Equipo de Software</h2>
          <p>Brahian Andrés Ospina Ríos</p>
          <p>Leonardo Otálvaro</p>
          <p>Andrés Felipe Trujillo</p>
          <span className="footer-submeta">Ingeniería de Software</span>
        </div>

        <div className="footer-column footer-credits-col">
          <h2>Origen & Créditos</h2>
          <p className="footer-credits-paper">
            «Agotamiento emocional y apoyo social en call centers de Medellín»
          </p>
          <p className="footer-credits-authors">
            L. K. Valles, V. Velásquez, L. F. Vargas, J. D. Lezcano
          </p>
          <Link to="/fundamentacion" className="footer-credits-link">
            Ver fundamentación y deslinde
          </Link>
        </div>
      </div>

      <div className="landing-container footer-bottom">
        <p>© 2026 Pulso360 · Tecnológico de Antioquia (TdeA)</p>
        <p>Inspirado en investigación empírica de Trabajo Social · Software preventivo no médico · Ley 23 de 1982</p>
      </div>
    </footer>
  );
}
