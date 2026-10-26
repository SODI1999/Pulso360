import { Icon } from '../../../core/components/Icon';
import { FOUNDATION_META } from '../data/academicFoundationData';

export function AcademicHeader({ handlePrint }) {
  return (
    <header className="academic-hero-header">
      {/* Membrete formal exclusivo para impresión / guardado PDF */}
      <div className="print-editorial-header only-print" aria-hidden="true">
        <div className="print-header-top">
          <span className="print-header-institution">Tecnológico de Antioquia · Institución Universitaria</span>
          <span className="print-header-date">
            Ficha metodológica emitida el {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="print-header-doc">
          Dossier Científico & Metodológico · Plataforma Pulso360 (Investigación Formativa)
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
          title="Imprimir o guardar ficha en PDF"
          aria-label="Guardar / Imprimir Ficha metodológica en PDF"
        >
          <Icon name="Printer" size={14} />
          <span>Guardar / Imprimir Ficha</span>
        </button>
      </div>

      <h1 className="academic-hero-title">{FOUNDATION_META.title}</h1>

      <p className="academic-hero-lead">{FOUNDATION_META.lead}</p>
    </header>
  );
}
