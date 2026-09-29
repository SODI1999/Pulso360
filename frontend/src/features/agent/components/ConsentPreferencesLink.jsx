import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

export function ConsentPreferencesLink() {
  return (
    <div className="card">
      <div>
        <div className="card-title">Consentimientos y finalidades</div>
        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 16px' }}>
          Puedes revisar o revocar las finalidades C1–C5 en cualquier momento sin consecuencias laborales.
        </p>
      </div>
      <Link to="/consentimiento" className="btn btn-secondary">
        <Icon name="shield" size={16} />
        <span>Modificar mis preferencias</span>
      </Link>
    </div>
  );
}
