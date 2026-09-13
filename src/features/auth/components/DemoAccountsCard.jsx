// src/features/auth/components/DemoAccountsCard.jsx
// Selector discreto de perfiles RBAC para evaluación de jurado y demostración

import { Icon } from '../../../core/components/Icon';
import { DEMO_ROLES } from '../data/authData';

export function DemoAccountsCard({ activeEmail, onSelectDemo }) {
  const activeRole = DEMO_ROLES.find(
    (r) => r.email.toLowerCase() === (activeEmail || '').toLowerCase()
  ) || DEMO_ROLES[0];

  return (
    <section className="demo-rbac-strip" aria-label="Selector de perfiles de demostración RBAC">
      <div className="demo-rbac-top">
        <span className="demo-rbac-caption">
          <Icon name="users" size={12} />
          <span>Acceso rápido (Demo RBAC)</span>
        </span>
        <span className="demo-rbac-pass">
          Clave: <code>Pulso360#2026</code>
        </span>
      </div>

      <div className="demo-rbac-chips" role="tablist" aria-label="Perfiles de evaluación">
        {DEMO_ROLES.map((role) => {
          const isSelected = activeEmail?.toLowerCase() === role.email.toLowerCase();
          return (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`demo-rbac-chip ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectDemo(role)}
              title={`${role.fullName} · ${role.description}`}
            >
              <span className="rbac-chip-icon" aria-hidden="true">
                <Icon name={role.icon} size={12} />
              </span>
              <span className="rbac-chip-label">{role.label}</span>
            </button>
          );
        })}
      </div>

      {activeRole && (
        <div className="demo-rbac-scope" aria-live="polite">
          <span className="rbac-scope-badge">{activeRole.badge}</span>
          <span className="rbac-scope-desc">{activeRole.description}</span>
        </div>
      )}
    </section>
  );
}
