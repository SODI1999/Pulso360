// src/features/landing/components/RolesVisibilitySection.jsx
// Sección institucional de visibilidad protegida por rol (k-anonimato y separación de responsabilidades)

import { Link } from 'react-router-dom';

export function RolesVisibilitySection() {
  return (
    <section className="landing-section visibility-section" id="privacidad" aria-labelledby="visibility-title">
      <div className="landing-container visibility-layout">
        <div className="visibility-copy">
          <p className="eyebrow">Privacidad explicada sin tecnicismos</p>
          <h2 id="visibility-title">Cada rol ve únicamente lo necesario para cumplir su función.</h2>
          <p>
            La confianza es esencial: Pulso360 separa el espacio personal del agente y la información colectiva usada para prevenir.
          </p>
          <Link className="button button-light" to="/login">
            Conocer los cinco roles
          </Link>
        </div>

        <div className="visibility-cards">
          <article>
            <span className="role-avatar">A</span>
            <div>
              <h3>El agente puede ver</h3>
              <p>Sus respuestas, su bitácora y su evolución personal.</p>
            </div>
          </article>
          <article>
            <span className="role-avatar role-avatar-supervisor">S</span>
            <div>
              <h3>El supervisor puede ver</h3>
              <p>Tendencias generales del equipo, nunca respuestas individuales.</p>
            </div>
          </article>
          <article>
            <span className="role-avatar role-avatar-sst">SST</span>
            <div>
              <h3>Seguridad y Salud puede ver</h3>
              <p>Alertas colectivas y acciones preventivas, nunca la bitácora privada.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
