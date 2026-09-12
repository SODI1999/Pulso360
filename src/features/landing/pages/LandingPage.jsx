// src/features/landing/pages/LandingPage.jsx
// Página de aterrizaje institucional de Pulso360 (Diseño Editorial Contemporáneo Humano)

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ShowcaseSection } from '../components/ShowcaseSection';
import { ProblemSection } from '../components/ProblemSection';
import { ThreeActsSection } from '../components/ThreeActsSection';
import { RolesVisibilitySection } from '../components/RolesVisibilitySection';
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
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById('contenido')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Saltar al contenido principal
      </button>

      {/* Header Institucional Reutilizable */}
      <Navbar />

      {/* Secciones Modulares Ensambladas */}
      <main id="contenido">
        <HeroSection />
        <ShowcaseSection />
        <ProblemSection />
        <ThreeActsSection />
        <RolesVisibilitySection />
      </main>

      {/* Pie de Página Institucional */}
      <Footer />

      {/* Botón Flotante Accesible para Volver al Inicio */}
      <ScrollToTopButton />
    </div>
  );
}
