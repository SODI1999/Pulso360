import { Icon } from '../../../core/components/Icon';
import { FOUNDATION_META } from '../data/academicFoundationData';

export function AcademicHeader({ handlePrint }) {
  return (
    <header className="academic-hero-header">
      {/* Membrete formal exclusivo para impresión / exportación a PDF */}
      <div className="print-editorial-header only-print" aria-hidden="true">
        <div className="print-header-top">
          <div className="print-institution-block">
            <span className="print-header-institution">TECNOLÓGICO DE ANTIOQUIA · INSTITUCIÓN UNIVERSITARIA</span>
            <span className="print-header-faculty">Facultad de Educación y Ciencias Sociales · Grupo de Investigación</span>
          </div>
          <div className="print-meta-block">
            <span className="print-header-code">Radicado: TDEA-SST-P360-2024</span>
            <span className="print-header-date">
              Emisión: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="print-header-doc">
          DOSSIER TÉCNICO DE INVESTIGACIÓN: MODELO CIENTÍFICO DE PREVENCIÓN DEL BURNOUT EN BPO
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
          title="Imprimir o exportar ficha metodológica en PDF"
          aria-label="Imprimir Ficha PDF y Resumen Metodológico del Dossier"
        >
          <Icon name="Printer" size={14} />
          <span>Imprimir Ficha PDF</span>
        </button>
      </div>

      <h1 className="academic-hero-title">{FOUNDATION_META.title}</h1>

      <p className="academic-hero-lead">{FOUNDATION_META.lead}</p>
    </header>
  );
}
