// src/features/auth/components/DemoAccountsCard.jsx
// Barra / acordeón discreto y colapsable para evaluación rápida de roles RBAC en BPO

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import { DEMO_ROLES, DEMO_BAR_TEXTS } from '../data/authData';

export function DemoAccountsCard({ activeEmail, onSelectDemo }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`demo-eval-accordion ${isOpen ? 'open' : ''}`}
      role="region"
      aria-label={DEMO_BAR_TEXTS?.rolesAriaLabel || 'Evaluación BPO por roles'}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="demo-accordion-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="demo-eval-collapse-panel"
      >
        <span className="demo-accordion-prompt">
          <span className="demo-eval-academic-badge">
            Entorno de evaluación académica · Credenciales de prueba
          </span>
        </span>
        <span className={`demo-accordion-chevron ${isOpen ? 'rotated' : ''}`} aria-hidden="true">
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={14} />
        </span>
      </button>

      {isOpen && (
        <div id="demo-eval-collapse-panel" className="demo-eval-content">
          <p className="demo-eval-helper">
            Selecciona un rol para autocompletar credenciales de prueba en este entorno de evaluación
            académica:
          </p>

          <div className="demo-eval-pills" role="tablist" aria-label="Perfiles de evaluación académica">
            {DEMO_ROLES.map((role) => {
              const isSelected = (activeEmail || '').toLowerCase() === role.email.toLowerCase();
              return (
                <button
                  key={role.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`demo-eval-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectDemo(role)}
                  title={`${role.fullName} · ${role.description}`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>

          <div className="demo-eval-footer-note">
            <span>
              Clave de demostración unificada: <code>Pulso360#2026</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
