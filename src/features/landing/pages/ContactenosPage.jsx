// src/features/landing/pages/ContactenosPage.jsx
// Vista dedicada para la ruta de Contáctenos con barra de navegación completa y pie de página institucional

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Contactenos } from '../components/Contactenos';

export function ContactenosPage() {
  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de navegación institucional completa */}
      <Navbar />

      {/* Contenido Principal */}
      <main id="contenido" style={{ flex: 1, padding: 'var(--space-8) 0' }}>
        <div className="landing-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
            <p className="eyebrow eyebrow-dark" style={{ display: 'inline-block' }}>
              Atención y Consultoría · Pulso360
            </p>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--landing-ink)', margin: 'var(--space-2) 0' }}>
              Contáctenos
            </h1>
            <p style={{ color: 'var(--c-texto-suave)', fontSize: '1rem', maxWidth: '620px', margin: '0 auto', lineHeight: '1.5' }}>
              ¿Tienes inquietudes sobre la implementación de Pulso360, nuestras métricas de k-anonimato o deseas una demostración institucional para tu Contact Center? Déjanos tus datos y nos comunicaremos contigo.
            </p>
          </div>

          {/* Componente funcional de Contáctenos */}
          <Contactenos />
        </div>
      </main>

      {/* Pie de página institucional */}
      <Footer />
    </div>
  );
}

// Alias de exportación retrocompatible
export { ContactenosPage as FormularioPage, ContactenosPage as FormularioView };
