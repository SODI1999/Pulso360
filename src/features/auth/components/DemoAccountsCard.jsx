// src/features/auth/components/DemoAccountsCard.jsx
// Selector rápido de credenciales de prueba con Icon centralizado

import { Icon } from '../../../core/components/Icon';

export function DemoAccountsCard({ onSelectDemo }) {
  const demoUsers = [
    { label: 'Agente', email: 'agente@demo' },
    { label: 'Supervisor', email: 'supervisor@demo' },
    { label: 'Profesional SST', email: 'sst@demo' },
    { label: 'Auditor', email: 'auditor@demo' },
    { label: 'Administrador', email: 'admin@demo' }
  ];

  return (
    <div className="demo-credentials-card">
      <div className="demo-title">
        <Icon name="info" />
        <span>Usuarios demo (Contraseña: <strong>123456</strong>)</span>
      </div>

      {demoUsers.map(({ label, email }) => (
        <div key={email} className="demo-item">
          <span>{label}</span>
          <button
            type="button"
            className="demo-email"
            onClick={() => onSelectDemo(email)}
          >
            {email}
          </button>
        </div>
      ))}
    </div>
  );
}
