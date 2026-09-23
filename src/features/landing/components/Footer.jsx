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
        navigate(hash);
      }
    } else {
      navigate(`/${hash}`);
    }
  };

  return (
    <footer className="landing-footer">
      <div className="landing-container footer-grid">
        <div className="footer-brand">
          <Link
            className="brand brand-footer"
            to="/"
            onClick={(event) => {
              event.preventDefault();
              handleNavClick('#inicio');
            }}
            aria-label="Pulso360, volver al inicio"
          >
            <img className="brand-logo" src="/assets/marca/logo.webp" alt="" />
            <span className="brand-name">Pulso360</span>
          </Link>
          <p>
            Encuestas breves, privacidad individual y tendencias colectivas para prevenir el desgaste laboral
            en BPO.
          </p>
        </div>

        <div className="footer-column">
          <h2>Explorar</h2>
          <button type="button" onClick={() => handleNavClick('#problema')}>
            El problema
          </button>
          <button type="button" onClick={() => handleNavClick('#los-tres-actos')}>
            Los 3 Actos
          </button>
          <button type="button" onClick={() => handleNavClick('#transparencia-roles')}>
            Roles
          </button>
          <Link to="/fundamentacion">Fundamentación</Link>
          <Link to="/contactenos">Contáctenos</Link>
        </div>

        <div className="footer-column">
          <h2>Equipo de Software</h2>
          <p>Brahian Andrés Ospina Ríos</p>
          <p>Leonardo Otálvaro</p>
          <p>Andrés Felipe Trujillo</p>
        </div>

        <div className="footer-column footer-credits-col">
          <h2>Origen & Créditos</h2>
          <p className="footer-credits-paper">
            «Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call
            center de Medellín»
          </p>
          <p className="footer-credits-authors">
            Semillero de Trabajo Social · Asesora: I. J. Saldarriaga Roa
          </p>
          <Link to="/fundamentacion" className="footer-credits-link">
            Ver fundamentación y marco legal
          </Link>
        </div>
      </div>

      <div className="landing-container footer-bottom">
        <p>© 2026 Pulso360 · Tecnológico de Antioquia (TdeA)</p>
        <p>
          Software preventivo no médico · Complementario a la Batería de Riesgo Psicosocial (Res. 2764/2022) ·
          Ley 23 de 1982
        </p>
      </div>
    </footer>
  );
}
