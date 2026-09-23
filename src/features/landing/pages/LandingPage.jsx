// src/features/landing/pages/LandingPage.jsx
// Página de aterrizaje institucional de Pulso360 (Diseño Editorial Contemporáneo Humano)

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ProblemSection } from '../components/ProblemSection';
import { ThreeActsSection } from '../components/ThreeActsSection';
import { RolesVisibilitySection } from '../components/RolesVisibilitySection';
import { AcademicBackingSection } from '../components/AcademicBackingSection';
import { ContactCtaSection } from '../components/ContactCtaSection';
import { Footer } from '../components/Footer';
import { ScrollToTopButton } from '../components/ScrollToTopButton';

export function LandingPage() {
  const location = useLocation();

  // Scroll suave al detectar hash en la URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  return (
    <div className="landing-page-root">
      <a
        href="#contenido"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('contenido');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            el.focus({ preventScroll: true });
          }
        }}
      >
        Saltar al contenido principal
      </a>

      {/* Header Institucional Reutilizable */}
      <Navbar />

      {/* Secciones Modulares Ensambladas (Recorrido Editorial Unificado) */}
      <main id="contenido" tabIndex="-1">
        <HeroSection />
        <ProblemSection />
        <ThreeActsSection />
        <RolesVisibilitySection />
        <AcademicBackingSection />
        <ContactCtaSection />
      </main>

      {/* Pie de Página Institucional */}
      <Footer />

      {/* Botón Flotante Accesible para Volver al Inicio */}
      <ScrollToTopButton />
    </div>
  );
}
