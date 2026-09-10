// src/features/landing/pages/LandingPage.jsx
// Página de Bienvenida y Presentación Institucional (Composición Declarativa por Componentes)

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ProblemSection } from '../components/ProblemSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { RolesVisibilitySection } from '../components/RolesVisibilitySection';
import { Footer } from '../components/Footer';

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
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RolesVisibilitySection />
      </main>

      {/* Pie de Página Institucional */}
      <Footer />
    </div>
  );
}
