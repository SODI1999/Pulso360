export function SupportParameters({
  slaAlta,
  setSlaAlta,
  slaMedia,
  setSlaMedia,
  slaBaja,
  setSlaBaja,
  slaSolicitudes,
  setSlaSolicitudes
}) {
  return (
    <div className="params-grid-4">
      <div className="form-group">
        <label className="form-label" htmlFor="slaAlta">
          Alerta Severidad Alta (horas)
        </label>
        <input
          id="slaAlta"
          type="number"
          min="1"
          max="168"
          className="form-input"
          value={slaAlta}
          onChange={(e) => setSlaAlta(e.target.value)}
        />
        <span className="form-hint">Estándar: 24 horas hábiles.</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="slaMedia">
          Alerta Severidad Media (horas)
        </label>
        <input
          id="slaMedia"
          type="number"
          min="1"
          max="168"
          className="form-input"
          value={slaMedia}
          onChange={(e) => setSlaMedia(e.target.value)}
        />
        <span className="form-hint">Estándar: 48 horas hábiles.</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="slaBaja">
          Alerta Severidad Baja (horas)
        </label>
        <input
          id="slaBaja"
          type="number"
          min="1"
          max="168"
          className="form-input"
          value={slaBaja}
          onChange={(e) => setSlaBaja(e.target.value)}
        />
        <span className="form-hint">Estándar: 72 horas hábiles.</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="slaSol">
          Solicitudes / Habeas Data (horas)
        </label>
        <input
          id="slaSol"
          type="number"
          min="1"
          max="168"
          className="form-input"
          value={slaSolicitudes}
          onChange={(e) => setSlaSolicitudes(e.target.value)}
        />
        <span className="form-hint">Estándar: 24 horas hábiles.</span>
      </div>
    </div>
  );
}
