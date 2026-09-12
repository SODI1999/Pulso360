// src/features/landing/components/Navbar.jsx
// Barra de navegación modular reutilizable para la Landing Page y páginas públicas

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, roleHomePaths } from '../../../core/auth/authService';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejador reactivo para navegar a secciones de la página sin usar href
  const handleNavClick = (hash) => {
    setIsMenuOpen(false);
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

  const isContactActive = location.pathname === '/contactenos' || location.pathname === '/formulario';

  return (
    <header className={`landing-header ${isScrolled || isContactActive ? 'scrolled' : ''}`} id="header">
      <div className="landing-container header-inner">
        <Link className="brand" to="/" onClick={() => handleNavClick('#inicio')} aria-label="Pulso360, volver al inicio">
          <img className="brand-logo" src="/assets/imágenes/logo.png" alt="" />
          <span className="brand-name">Pulso360</span>
          <span className="brand-context">Bienestar laboral</span>
        </Link>

        <nav className="primary-nav" aria-label="Navegación principal">
          <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="navMenu">
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('#inicio')}>
                Inicio
              </button>
            </li>
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('#problema')}>
                El problema
              </button>
            </li>
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('#los-tres-actos')}>
                Los 3 Actos
              </button>
            </li>
            <li>
              <button type="button" className="nav-link" onClick={() => handleNavClick('#transparencia-roles')}>
                Transparencia de Roles
              </button>
            </li>
            <li>
              <Link
                className={`nav-link ${isContactActive ? 'active' : ''}`}
                to="/contactenos"
                onClick={() => setIsMenuOpen(false)}
              >
                Contáctenos
              </Link>
            </li>
            <li>
              <Link
                className="nav-link nav-link-mobile-cta"
                to={currentUser ? roleHomePaths[currentUser.role] : '/login'}
                onClick={() => setIsMenuOpen(false)}
              >
                {currentUser ? 'Ir a mi Panel' : 'Iniciar sesión'}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <Link className="header-login" to={currentUser ? roleHomePaths[currentUser.role] : '/login'}>
            {currentUser ? 'Ir a mi Panel' : 'Iniciar sesión'}
          </Link>
          <button
            className="mobile-toggle"
            id="mobileToggleBtn"
            type="button"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
