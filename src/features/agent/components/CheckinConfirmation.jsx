import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

export function CheckinConfirmation({ setIsResetModalOpen }) {
  return (
    <div className="card center-card restaurador-card">
      <div
        className="center-icon-badge"
        style={{
          backgroundColor: 'var(--c-exito-bg)',
          color: 'var(--c-exito)',
          border: '1px solid var(--c-exito-border)'
        }}
      >
        <Icon name="checkCircle" size={32} />
      </div>

      <h2 className="restaurador-title">¡Turno registrado! Gracias por hacer esta pausa.</h2>

      <div className="restaurador-somatic-box">
        <div className="restaurador-somatic-icon-badge">
          <Icon name="self_improvement" size={20} />
        </div>
        <p className="restaurador-somatic-text">
          Antes de volver a ponerte la diadema: baja los hombros, gira suavemente el cuello e hidrátate con un
          sorbo de agua.
        </p>
      </div>

      <p className="restaurador-privacy-note">
        Tus respuestas siguen la regla de agregación definida para esta experiencia. Las dimensiones omitidas
        se almacenan como ausencia de dato, no como cero.
      </p>

      <div className="restaurador-actions">
        <div className="restaurador-links-group">
          <Link to="/agente/mi-bienestar" className="btn btn-primary">
            <Icon name="favorite" size={16} />
            <span>Ver mi bienestar personal</span>
          </Link>
          <button
            type="button"
            className="btn btn-decompression-highlight"
            onClick={() => setIsResetModalOpen(true)}
          >
            <Icon name="self_improvement" size={18} />
            <span>Pausa de reseteo (2 min)</span>
          </button>
          <Link to="/agente/bitacora" className="btn btn-secondary">
            <Icon name="edit_note" size={16} />
            <span>Escribir en mi bitácora</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
