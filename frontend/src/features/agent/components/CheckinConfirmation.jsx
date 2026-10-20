import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Confirmation card rendered upon successful submission of the daily check-in.
 * Promotes restorative somatic transitions before wearing headsets and starting calls.
 *
 * @returns {import('react').JSX.Element} Restorative confirmation view.
 */
export function CheckinConfirmation() {
  return (
    <div className="card restaurador-card">
      <div className="restaurador-media">
        <img
          src="/assets/fotos/bpo-agent-checkin-ready.jpg"
          alt="Operadora de Contact Center estirando suavemente cuello y hombros antes de iniciar llamadas"
          className="restaurador-hero-img"
          loading="eager"
        />
      </div>
      <h2 className="restaurador-title">¡Turno registrado!</h2>
      <p className="restaurador-subtitle">
        Tus respuestas quedaron guardadas. Puedes continuar con tu jornada o tomar una pausa breve antes de continuar en la línea.
      </p>

      <div className="restaurador-somatic-box">
        <div className="restaurador-somatic-icon-badge">
          <Icon name="respiro" size={18} />
        </div>
        <div className="restaurador-somatic-content">
          <strong className="restaurador-somatic-headline">Antes de ponerte la diadema</strong>
          <p className="restaurador-somatic-text">
            Baja los hombros, gira suavemente el cuello y toma un sorbo de agua para comenzar con calma.
          </p>
        </div>
      </div>

      <div className="restaurador-actions">
        <Link to="/apoyo-crisis" className="btn btn-secondary">
          <Icon name="respiro" size={16} />
          <span>Pausa de respiración</span>
        </Link>
        <Link to="/agente/bitacora" className="btn btn-ghost">
          <Icon name="edit_note" size={16} />
          <span>Ir a mi bitácora</span>
        </Link>
      </div>
    </div>
  );
}
