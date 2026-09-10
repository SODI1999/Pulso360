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
          <p>Encuestas breves, privacidad individual y tendencias colectivas para prevenir el desgaste laboral.</p>
        </div>

        <div className="footer-column">
          <h2>Explorar</h2>
          <button type="button" onClick={() => handleNavClick('#problema')}>El problema</button>
          <button type="button" onClick={() => handleNavClick('#como-funciona')}>Cómo funciona</button>
          <button type="button" onClick={() => handleNavClick('#funcionalidades')}>Funcionalidades</button>
          <Link to="/contactenos">Contáctenos</Link>
        </div>

        <div className="footer-column">
          <h2>Equipo</h2>
          <p>Brahian Andrés Ospina Ríos</p>
          <p>Leonardo Otálvaro</p>
          <p>Andrés Felipe Trujillo</p>
        </div>
      </div>

      <div className="landing-container footer-bottom">
        <p>© 2026 Pulso360 · Tecnológico de Antioquia (TdeA)</p>
        <p>Prototipo académico de Ingeniería de Software · No realiza diagnósticos clínicos.</p>
      </div>
    </footer>
  );
}
