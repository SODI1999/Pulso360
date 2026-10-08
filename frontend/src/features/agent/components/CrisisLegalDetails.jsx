import { Icon } from '../../../core/components/Icon';

export function CrisisLegalDetails() {
  return (
    <details className="crisis-legal-details">
      <summary className="crisis-legal-summary">
        <div className="crisis-legal-summary-left">
          <Icon name="Scale" size={18} />
          <span>Rutas institucionales y marco legal (Ley 1010 y Resolución 3461)</span>
        </div>
        <span className="crisis-legal-summary-hint">
          Consulta cuándo acudir al CCL y cuándo el caso no se concilia
        </span>
      </summary>

      <div className="crisis-legal-content">
        {/* Caja 1: Acoso Laboral (Ley 1010 de 2006) */}
        <div className="crisis-legal-box">
          <strong className="crisis-legal-title">
            Ruta para Acoso Laboral: Comité de Convivencia Laboral (CCL)
          </strong>
          <p className="crisis-legal-desc">
            El <strong>Comité de Convivencia Laboral (CCL)</strong> es el organismo bipartito formal encargado
            de tramitar quejas sobre conductas persistentes de maltrato, persecución o discriminación en el
            trabajo (Ley 1010 de 2006).
          </p>
          <ul className="crisis-legal-list">
            <li>Procedimiento confidencial y preventivo de concertación interna.</li>
            <li>Formulación de acuerdos y compromisos mutuos de mejora.</li>
            <li>Radicación directa ante la secretaría del CCL de la compañía.</li>
          </ul>
        </div>

        {/* Caja 2: Acoso o Violencia Sexual (Resolución 3461 de 2025) */}
        <div className="crisis-legal-box crisis-legal-box--orange">
          <strong className="crisis-legal-title crisis-legal-title--orange">
            Presunto Acoso o Violencia Sexual: NO pasa por el CCL
          </strong>
          <p className="crisis-legal-desc crisis-legal-desc--orange">
            Conforme a la <strong>Resolución 3461 de 2025 del Ministerio del Trabajo</strong>, las denuncias
            por acoso o violencia sexual en el trabajo <strong>tienen prohibida la conciliación</strong> para
            prevenir cualquier forma de revictimización.
          </p>
          <ul className="crisis-legal-list crisis-legal-list--orange">
            <li>
              Canalización directa ante Talento Humano, SST o autoridades externas (Fiscalía, MinTrabajo).
            </li>
            <li>Medidas de protección inmediatas: separación funcional sin afectación salarial.</li>
            <li>Debida diligencia y máxima reserva en la gestión del caso.</li>
          </ul>
        </div>
      </div>
    </details>
  );
}
