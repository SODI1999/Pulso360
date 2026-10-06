export function PrivacyParameters({
  umbralN,
  setUmbralN,
  checkinEditHours,
  setCheckinEditHours,
  minGranularity,
  setMinGranularity,
  auditRetentionYears,
  setAuditRetentionYears
}) {
  return (
    <div className="params-grid-4">
      <div className="form-group">
        <label className="form-label" htmlFor="paramUmbralN">
          Umbral mínimo N (k-anonimato)
        </label>
        <input
          id="paramUmbralN"
          type="number"
          min="3"
          max="50"
          className="form-input"
          value={umbralN}
          onChange={(e) => setUmbralN(e.target.value)}
        />
        <span className="form-hint">
          Mínimo recomendado: k ≥ 5 para mitigar riesgos de reidentificación por agregación.
        </span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="paramEditWindow">
          Ventana de edición check-in (horas)
        </label>
        <input
          id="paramEditWindow"
          type="number"
          min="1"
          max="24"
          className="form-input"
          value={checkinEditHours}
          onChange={(e) => setCheckinEditHours(e.target.value)}
        />
        <span className="form-hint">Base: 2 horas desde el registro inicial.</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="paramGranularity">
          Granularidad temporal mínima
        </label>
        <select
          id="paramGranularity"
          className="form-select"
          value={minGranularity}
          onChange={(e) => setMinGranularity(e.target.value)}
        >
          <option value="semanal">Semanal (Estándar)</option>
          <option value="quincenal">Quincenal</option>
          <option value="mensual">Mensual</option>
        </select>
        <span className="form-hint">Referencia de presentación; no restringe los periodos de consulta en esta versión.</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="paramAuditRetention">
          Retención de auditoría (años)
        </label>
        <input
          id="paramAuditRetention"
          type="number"
          min="5"
          max="20"
          className="form-input"
          value={auditRetentionYears}
          onChange={(e) => setAuditRetentionYears(e.target.value)}
        />
        <span className="form-hint">
          Referencia de retención; no hay borrado automático de auditoría implementado.
        </span>
      </div>
    </div>
  );
}
