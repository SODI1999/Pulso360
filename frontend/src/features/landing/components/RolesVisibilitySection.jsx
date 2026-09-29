// src/features/landing/components/RolesVisibilitySection.jsx
// Matriz Institucional de Transparencia y Separación Ética de Roles

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import { ROLES_PERMISSIONS_MATRIX } from '../data/landingData';

export function RolesVisibilitySection() {
  const [selectedRole, setSelectedRole] = useState(ROLES_PERMISSIONS_MATRIX[0]);

  const handleRoleKeyDown = (e, currentIdx) => {
    let nextIdx = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % ROLES_PERMISSIONS_MATRIX.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + ROLES_PERMISSIONS_MATRIX.length) % ROLES_PERMISSIONS_MATRIX.length;
    }
    if (nextIdx !== null) {
      const nextRole = ROLES_PERMISSIONS_MATRIX[nextIdx];
      setSelectedRole(nextRole);
      const nextBtn = document.getElementById(`role-tab-${nextRole.id}`);
      if (nextBtn) nextBtn.focus();
    }
  };

  return (
    <section
      className="roles-transparency-section"
      id="transparencia-roles"
      aria-labelledby="transparency-title"
    >
      <div className="landing-container">
        <div className="transparency-header">
          <span className="acts-eyebrow">Matriz de Gobernanza & Privacidad</span>
          <h2 id="transparency-title">Transparencia Radical por Rol</h2>
          <p className="transparency-lead">
            La confianza se construye con reglas explícitas. Selecciona un perfil para revisar qué información
            puede consultar la aplicación en esta experiencia y qué queda fuera de su alcance:
          </p>
        </div>

        <div className="transparency-role-selector" role="tablist" aria-label="Perfiles operativos Pulso360">
          {ROLES_PERMISSIONS_MATRIX.map((r, idx) => (
            <button
              key={r.id}
              id={`role-tab-${r.id}`}
              type="button"
              role="tab"
              aria-selected={selectedRole.id === r.id}
              tabIndex={selectedRole.id === r.id ? 0 : -1}
              className={`role-select-btn ${selectedRole.id === r.id ? 'active' : ''}`}
              onClick={() => setSelectedRole(r)}
              onKeyDown={(e) => handleRoleKeyDown(e, idx)}
            >
              <Icon name={r.icon} size={16} />
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        {/* Ficha Editorial de Especificación del Rol */}
        <div
          className="role-specification-card"
          id="role-specification-card"
          role="tabpanel"
          aria-labelledby={`role-tab-${selectedRole.id}`}
        >
          <div className="role-spec-head">
            <div>
              <span className={`role-spec-badge ${selectedRole.badgeClass}`}>{selectedRole.roleTag}</span>
              <h3>{selectedRole.name}</h3>
            </div>
            <p className="role-spec-mission">{selectedRole.mission}</p>
          </div>

          <div className="role-spec-table">
            <div className="spec-table-head">
              <span>Capacidad y Condición de Acceso</span>
              <span>Gobernanza Ética</span>
            </div>

            <div className="spec-table-body">
              {selectedRole.permissions.map((p, idx) => (
                <div key={idx} className={`spec-row ${p.allowed ? 'row-allowed' : 'row-forbidden'}`}>
                  <div className="spec-text">
                    <span className="spec-icon">
                      <Icon name={p.allowed ? 'checkCircle' : 'lock'} size={16} />
                    </span>
                    <span>{p.text}</span>
                  </div>
                  <div className="spec-status-badge">
                    {p.allowed ? (
                      <span className="status-pill-allowed">Permitido por Diseño</span>
                    ) : (
                      <span className="status-pill-forbidden">Prohibido & Bloqueado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="role-guarantee-footer">
            <Icon name="shieldCheck" size={20} />
            <div>
              <strong>Límite de acceso en Pulso360:</strong>
              <p>{selectedRole.guarantee}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
