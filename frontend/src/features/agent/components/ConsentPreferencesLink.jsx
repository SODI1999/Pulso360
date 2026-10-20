import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Navigation shortcut card linking to the informed consent preference manager.
 * Reminds agents of their statutory right to grant, modify, or revoke C1-C5 purposes without employment penalties.
 *
 * @returns {import('react').JSX.Element} Consent preferences card.
 */
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
