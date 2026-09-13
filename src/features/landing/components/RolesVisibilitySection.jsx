// src/features/landing/components/RolesVisibilitySection.jsx
// Matriz Institucional de Transparencia y Separación Ética de Roles

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import { ROLES_PERMISSIONS_MATRIX } from '../data/landingData';

export function RolesVisibilitySection() {
  const [selectedRole, setSelectedRole] = useState(ROLES_PERMISSIONS_MATRIX[0]);

  return (
    <section className="roles-transparency-section" id="transparencia-roles" aria-labelledby="transparency-title">
      <div className="landing-container">
        <div className="transparency-header">
          <span className="acts-eyebrow">Matriz de Gobernanza & Privacidad</span>
          <h2 id="transparency-title">Transparencia Radical por Rol</h2>
          <p className="transparency-lead">
            La confianza se construye con reglas explícitas. En Pulso360, ningún rol puede exceder sus límites éticos. Selecciona un perfil para auditar sus facultades y restricciones:
          </p>
        </div>

        <div className="transparency-role-selector" role="tablist">
          {ROLES_PERMISSIONS_MATRIX.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selectedRole.id === r.id}
              className={`role-select-btn ${selectedRole.id === r.id ? 'active' : ''}`}
              onClick={() => setSelectedRole(r)}
            >
              <Icon name={r.icon} size={16} />
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        {/* Ficha Editorial de Especificación del Rol */}
        <div className="role-specification-card">
          <div className="role-spec-head">
            <div>
              <span className={`role-spec-badge ${selectedRole.badgeClass}`}>{selectedRole.roleTag}</span>
              <h3>{selectedRole.name}</h3>
            </div>
            <p className="role-spec-mission">{selectedRole.mission}</p>
          </div>

          <div className="role-spec-table">
            <div className="spec-table-head">
              <span>Capacidad / Regla de Acceso al Sistema</span>
              <span>Estado Ético</span>
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
              <strong>Garantía Institucional Pulso360:</strong>
              <p>{selectedRole.guarantee}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
