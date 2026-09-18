// src/features/auth/components/DemoAccountsCard.jsx
// Barra horizontal minimalista y discreta para evaluación rápida de roles RBAC en BPO

import { DEMO_ROLES, DEMO_BAR_TEXTS } from '../data/authData';

export function DemoAccountsCard({ activeEmail, onSelectDemo }) {
  return (
    <div
      className="demo-eval-bar"
      role="region"
      aria-label={DEMO_BAR_TEXTS?.rolesAriaLabel || 'Evaluación BPO por roles'}
    >
      <div className="demo-eval-header">
        <span className="demo-eval-label">Evaluación BPO:</span>
        <span className="demo-eval-pass">
          Clave: <code>Pulso360#2026</code>
        </span>
      </div>

      <div className="demo-eval-pills" role="tablist" aria-label="Perfiles de evaluación">
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
    </div>
  );
}

