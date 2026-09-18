import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Módulo de Respaldo Científico y Transferencia Tecnológica TdeA
 */
export function AcademicBackingSection() {
  return (
    <section className="academic-backing-section" id="respaldo-cientifico" aria-labelledby="academic-title">
      <div className="landing-container">
        <div className="academic-backing-card">
          <div className="academic-card-top">
            <span className="acts-eyebrow">Transferencia Tecnológica & Rigor Científico</span>
            <h2 id="academic-title">
              Ciencia social aplicada a la realidad operativa del Contact Center.
            </h2>
            <p className="academic-backing-lead">
              Pulso360 nace de la investigación empírica liderada por el Semillero de Trabajo Social y la Facultad de Ingeniería del Tecnológico de Antioquia (TdeA), evaluando a 185 trabajadores en plataformas reales de call center en Medellín.
            </p>
          </div>

          <div className="academic-normative-strip" aria-label="Marco normativo y garantías legales">
            <div className="normative-item">
              <Icon name="fileShield" size={15} />
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
                «Relación entre el agotamiento emocional y la percepción de apoyo social en trabajadores de call center de Medellín» — Asesoría: I. J. Saldarriaga Roa (TdeA).
              </p>
            </div>
            <Link to="/fundamentacion" className="btn-academic-dossier">
              <span>Consultar fundamentación y marco legal</span>
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
