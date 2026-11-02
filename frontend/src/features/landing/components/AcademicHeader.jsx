import { Icon } from '../../../core/components/Icon';
import { FOUNDATION_META } from '../data/academicFoundationData';

export function AcademicHeader({ handlePrint }) {
  return (
    <header className="academic-hero-header">
      {/* El alcance de aula también queda explícito en la impresión. */}
      <div className="print-editorial-header only-print" aria-hidden="true">
        <div className="print-header-top">
          <div className="print-institution-block">
            <span className="print-header-institution">PULSO360 · ORIGEN DE UNA IDEA ESTUDIANTIL</span>
            <span className="print-header-faculty">Actividad de aula de una materia · Material no publicado</span>
          </div>
          <div className="print-meta-block">
            <span className="print-header-code">Contexto del equipo: estudiantes del TdeA, sin aval institucional</span>
            <span className="print-header-date">
              Fecha de impresión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="print-header-doc">
          DATOS DE UNA ACTIVIDAD DE AULA Y DECISIONES DE DISEÑO DE PULSO360
        </div>
      </div>
      <div className="academic-kicker-row">
        <div className="kicker-badges-group">
          <span className="academic-editorial-kicker">{FOUNDATION_META.badge}</span>
          <span className="kicker-separator" aria-hidden="true">
            ·
          </span>
          <span className="academic-meta-date">{FOUNDATION_META.kicker}</span>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="btn-print-dossier no-print"
          title="Imprimir el origen de la idea y los datos atribuidos a la actividad de aula"
          aria-label="Imprimir origen y datos de la actividad de aula"
        >
          <Icon name="Printer" size={14} />
          <span>Imprimir página</span>
        </button>
      </div>

      <h1 className="academic-hero-title">{FOUNDATION_META.title}</h1>

      <p className="academic-hero-lead">{FOUNDATION_META.lead}</p>
    </header>
  );
}
