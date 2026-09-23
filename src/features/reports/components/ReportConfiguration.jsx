import { Icon } from '../../../core/components/Icon';

export function ReportConfiguration({
  handleGenerateReport,
  selectedScopeId,
  setSelectedScopeId,
  setGeneratedReport,
  availableScopes,
  currentScope,
  minThreshold,
  selectedPeriod,
  setSelectedPeriod,
  sections,
  setSections,
  format,
  setFormat,
  isAllowedByPrivacy
}) {
  return (
    <div className="reports-controls-panel">
      <div className="reports-controls-header">
        <h2 className="reports-controls-title">Parámetros del reporte</h2>
        <p className="reports-controls-subtitle">
          Configura el alcance organizacional, periodo y dimensiones de análisis.
        </p>
      </div>

      <form onSubmit={handleGenerateReport}>
        {/* Selector de Alcance */}
        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
          <label className="form-label" htmlFor="reportScopeSelect">
            Alcance / Corte organizacional <span style={{ color: 'var(--c-critico)' }}>*</span>
          </label>
          <select
            id="reportScopeSelect"
            className="form-select"
            value={selectedScopeId}
            onChange={(e) => {
              setSelectedScopeId(e.target.value);
              setGeneratedReport(null);
            }}
          >
            {availableScopes.map((scope) => (
              <option key={scope.id} value={scope.id}>
                {scope.label} (N = {scope.n})
              </option>
            ))}
          </select>
          <span className="form-hint">
            {currentScope?.n < minThreshold ? (
              <strong style={{ color: '#b45309' }}>
                Corte con N = {currentScope.n} (Bajo umbral confidencial N &ge; {minThreshold})
              </strong>
            ) : (
              `Corte con N = ${currentScope?.n} (Publicable)`
            )}
          </span>
        </div>

        {/* Selector de Periodo */}
        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
          <label className="form-label" htmlFor="reportPeriodSelect">
            Periodo temporal
          </label>
          <select
            id="reportPeriodSelect"
            className="form-select"
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setGeneratedReport(null);
            }}
          >
            <option value="Semana 34 (18–24 Ago 2026)">Semana 34 (18–24 Ago 2026)</option>
            <option value="Semana 33 (11–17 Ago 2026)">Semana 33 (11–17 Ago 2026)</option>
            <option value="Mes de Agosto 2026">Mes de Agosto 2026</option>
            <option value="Trimestre Q3 2026">Trimestre Q3 2026</option>
          </select>
        </div>

        {/* Checkboxes de Dimensiones */}
        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
          <label className="form-label">Dimensiones incluidas en el reporte</label>
          <div className="reports-checkbox-group">
            <label className="reports-checkbox-item">
              <input
                type="checkbox"
                checked={sections.energia}
                onChange={(e) => setSections({ ...sections, energia: e.target.checked })}
              />
              <span>Energía agregada</span>
            </label>
            <label className="reports-checkbox-item">
              <input
                type="checkbox"
                checked={sections.carga}
                onChange={(e) => setSections({ ...sections, carga: e.target.checked })}
              />
              <span>Carga emocional agregada</span>
            </label>
            <label className="reports-checkbox-item">
              <input
                type="checkbox"
                checked={sections.recuperacion}
                onChange={(e) => setSections({ ...sections, recuperacion: e.target.checked })}
              />
              <span>Recuperación percibida</span>
            </label>
            <label className="reports-checkbox-item">
              <input
                type="checkbox"
                checked={sections.participacion}
                onChange={(e) => setSections({ ...sections, participacion: e.target.checked })}
              />
              <span>Participación en check-in</span>
            </label>
          </div>
        </div>

        {/* Formato de Exportación */}
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">Formato de exportación</label>
          <div className="reports-format-radios">
            <label className="reports-radio-label">
              <input
                type="radio"
                name="reportFormat"
                value="CSV"
                checked={format === 'CSV'}
                onChange={() => setFormat('CSV')}
              />
              <span>CSV</span>
            </label>
            <label className="reports-radio-label">
              <input
                type="radio"
                name="reportFormat"
                value="PDF"
                checked={format === 'PDF'}
                onChange={() => setFormat('PDF')}
              />
              <span>PDF</span>
            </label>
            <label className="reports-radio-label">
              <input
                type="radio"
                name="reportFormat"
                value="JSON"
                checked={format === 'JSON'}
                onChange={() => setFormat('JSON')}
              />
              <span>JSON</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={!isAllowedByPrivacy}
        >
          <Icon name="summarize" size={16} />
          <span>Generar y exportar reporte</span>
        </button>
      </form>
    </div>
  );
}
