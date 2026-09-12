// src/features/landing/components/RolesVisibilitySection.jsx
// Matriz Institucional de Transparencia y Separación Ética de Roles

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';

const ROLES_SPEC = [
  {
    id: 'agente',
    name: 'Agente de Operación',
    roleTag: 'Espacio Íntimo y Confidencial',
    badgeClass: 'badge-agent',
    mission: 'Contar con un entorno personal seguro donde expresar su nivel de cansancio sin consecuencias laborales.',
    permissions: [
      { text: 'Registrar su pulso diario de 60 segundos de forma voluntaria.', allowed: true },
      { text: 'Escribir en su bitácora íntima con orientación del motor NLP léxico.', allowed: true },
      { text: 'Consultar su propio historial y evolución de bienestar personal.', allowed: true },
      { text: 'Acceder a métricas o respuestas de compañeros de campaña.', allowed: false },
      { text: 'Ser evaluado en su desempeño profesional a partir de sus respuestas.', allowed: false }
    ],
    guarantee: 'Tus respuestas jamás podrán ser utilizadas por supervisores ni clientes para emitir sanciones o evaluar tu calidad.'
  },
  {
    id: 'supervisor',
    name: 'Supervisor de Campaña',
    roleTag: 'Gestión Operativa de Condiciones',
    badgeClass: 'badge-supervisor',
    mission: 'Monitorear la carga general de los turnos para balancear colas y pausas, sin vigilar a personas.',
    permissions: [
      { text: 'Visualizar tendencias colectivas promediadas (solo con k ≥ 5 respuestas).', allowed: true },
      { text: 'Recibir alertas preventivas de fatiga grupal para coordinar descansos.', allowed: true },
      { text: 'Conocer la tasa de participación general de su equipo sin nombres.', allowed: true },
      { text: 'Identificar qué agentes respondieron o quién decidió omitir el pulso.', allowed: false },
      { text: 'Leer las bitácoras o desahogos privados de cualquier trabajador.', allowed: false }
    ],
    guarantee: 'El supervisor actúa como gestor de condiciones de trabajo, nunca como auditor de la intimidad del agente.'
  },
  {
    id: 'sst',
    name: 'Seguridad y Salud en el Trabajo (SST)',
    roleTag: 'Vigilancia Epidemiológica & Ergonomía',
    badgeClass: 'badge-sst',
    mission: 'Diseñar planes de intervención temprana sobre factores de riesgo psicosocial en operaciones BPO.',
    permissions: [
      { text: 'Consultar mapas térmicos de riesgo agregados por sede, turno y campaña.', allowed: true },
      { text: 'Analizar tendencias longitudinales según factores de la Batería SST.', allowed: true },
      { text: 'Registrar y monitorear planes de intervención ergonómica y pausas activas.', allowed: true },
      { text: 'Rastrear la identidad nominal de agentes con reportes de agotamiento severo.', allowed: false },
      { text: 'Consultar agrupaciones que vulneren el umbral mínimo de k-anonimato.', allowed: false }
    ],
    guarantee: 'SST interviene sobre las causas estructurales del estrés en el piso, no sobre la persona en particular.'
  },
  {
    id: 'auditor',
    name: 'Auditor de Cumplimiento',
    roleTag: 'Trazabilidad Ética & Habeas Data',
    badgeClass: 'badge-auditor',
    mission: 'Verificar el cumplimiento estricto de las leyes de privacidad y las políticas institucionales.',
    permissions: [
      { text: 'Revisar bitácoras inmutables de acceso y auditoría del sistema.', allowed: true },
      { text: 'Auditar que ningún reporte rompa el umbral de k-anonimato (k ≥ 5).', allowed: true },
      { text: 'Certificar la no existencia de cruces nominales en bases de datos.', allowed: true },
      { text: 'Acceder a contenidos sensibles o respuestas individuales.', allowed: false },
      { text: 'Modificar parámetros de anonimización en el sistema.', allowed: false }
    ],
    guarantee: 'Garantiza la trazabilidad jurídica del sistema conforme a la Ley Estatutaria de Habeas Data en Colombia.'
  }
];

export function RolesVisibilitySection() {
  const [selectedRole, setSelectedRole] = useState(ROLES_SPEC[0]);

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
          {ROLES_SPEC.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selectedRole.id === r.id}
              className={`role-select-btn ${selectedRole.id === r.id ? 'active' : ''}`}
              onClick={() => setSelectedRole(r)}
            >
              <Icon name={r.id === 'agente' ? 'support_agent' : r.id === 'supervisor' ? 'monitoring' : r.id === 'sst' ? 'healing' : 'shieldCheck'} size={16} />
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
