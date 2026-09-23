// src/features/landing/components/Navbar.jsx
// Barra de navegación modular con ScrollSpy reactivo para la Landing Page y páginas públicas

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, roleHomePaths } from '../../../core/auth/authService';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Detección de desplazamiento para sombra y backdrop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ScrollSpy reactivo: detecta la sección visible en la landing principal
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = ['inicio', 'problema', 'los-tres-actos', 'transparencia-roles'];
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  // Manejador reactivo para navegar a secciones de la página sin recargar
  const handleNavClick = (hash) => {
    setIsMenuOpen(false);
    const targetId = hash.replace('#', '');
    setActiveSection(targetId);

    if (location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', hash);
      }
    } else {
      navigate(`/${hash}`);
    }
  };

  // Accesibilidad: Cerrar menú con Escape en móvil
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        document.getElementById('mobileToggleBtn')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const isContactActive = location.pathname === '/contactenos' || location.pathname === '/formulario';
  const isFoundationActive = location.pathname === '/fundamentacion';

  return (
    <header
      className={`landing-header ${isScrolled || isContactActive || isFoundationActive ? 'scrolled' : ''}`}
      id="header"
    >
      <div className="landing-container header-inner">
        <Link
          className="brand"
          to="/"
          onClick={() => handleNavClick('#inicio')}
          aria-label="Pulso360, volver al inicio"
        >
          <img className="brand-logo" src="/assets/marca/logo.png" alt="" />
          <span className="brand-name">Pulso360</span>
          <span className="brand-context">Bienestar laboral</span>
        </Link>

        <nav className="primary-nav" aria-label="Navegación principal">
          <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="navMenu">
            <li>
              <button
                type="button"
                className={`nav-link ${location.pathname === '/' && activeSection === 'inicio' ? 'active' : ''}`}
                onClick={() => handleNavClick('#inicio')}
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link ${location.pathname === '/' && activeSection === 'problema' ? 'active' : ''}`}
                onClick={() => handleNavClick('#problema')}
              >
                El problema
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link ${location.pathname === '/' && activeSection === 'los-tres-actos' ? 'active' : ''}`}
                onClick={() => handleNavClick('#los-tres-actos')}
              >
                Los 3 Actos
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link ${location.pathname === '/' && activeSection === 'transparencia-roles' ? 'active' : ''}`}
                onClick={() => handleNavClick('#transparencia-roles')}
              >
                Roles
              </button>
            </li>
            <li>
              <Link
                className={`nav-link ${isFoundationActive ? 'active' : ''}`}
                to="/fundamentacion"
                onClick={() => setIsMenuOpen(false)}
              >
                Fundamentación
              </Link>
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
            <li className="nav-item-mobile-cta">
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
            aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isMenuOpen}
            aria-controls="navMenu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
