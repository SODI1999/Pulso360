import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Explica el origen de la idea en una actividad de materia y enlaza su alcance.
 * @returns {JSX.Element} Presentación del origen estudiantil de Pulso360.
 */
export function AcademicBackingSection() {
  return (
    <section className="academic-backing-section" id="respaldo-cientifico" aria-labelledby="academic-title">
      <div className="landing-container">
        <div className="academic-backing-card">
          <div className="academic-card-top">
            <span className="acts-eyebrow">Origen y evidencia del proyecto</span>
            <h2 id="academic-title">Una actividad de aula dio origen a la idea de Pulso360.</h2>
            <p className="academic-backing-lead">
              La idea nació de datos recogidos para una materia sobre agotamiento emocional y apoyo social
              en un grupo de 185 operadores de call center en Medellín. Esos datos pertenecen a la actividad
              de aula; no representan al sector ni validan la plataforma. El equipo es estudiantil y la
              mención del TdeA no expresa aval institucional.
            </p>
          </div>

          <div className="academic-normative-strip" aria-label="Marco normativo de referencia">
            <div className="normative-item">
              <Icon name="Scale" size={15} />
              <span>Resolución 2764 de 2022 (SG-SST)</span>
            </div>
            <div className="normative-item">
              <Icon name="lock" size={15} />
              <span>Ley 1581 de 2012 (Habeas Data)</span>
            </div>
            <div className="normative-item">
              <Icon name="fileText" size={15} />
              <span>Ley 23 de 1982 (Derechos Morales)</span>
            </div>
          </div>

          <div className="academic-backing-bottom">
            <div className="paper-cite-box">
              <Icon name="fileText" size={16} className="paper-icon" />
              <p>
                «Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de
                call center de Medellín». Material de aula no publicado. Orientación docente: I. J. Saldarriaga Roa.
              </p>
            </div>
            <Link to="/fundamentacion" className="btn-academic-dossier">
              <span>Consultar origen, datos de aula y límites</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
