-- No modifica las alertas históricas ni activa el planificador.
ALTER TABLE sst_alertas ADD COLUMN period_end DATE;
ALTER TABLE sst_alertas ADD COLUMN evaluation_metadata JSONB;
CREATE UNIQUE INDEX sst_alertas_rule_scope_period_unique
  ON sst_alertas(regla_id, campana_id, COALESCE(equipo_id, ''), period_end)
  WHERE period_end IS NOT NULL;

CREATE TABLE alert_job_state (
  job_name VARCHAR(50) PRIMARY KEY,
  last_period_end DATE NOT NULL
);
CREATE TABLE alert_job_runs (
  id UUID PRIMARY KEY,
  period_end DATE NOT NULL,
  status VARCHAR(12) NOT NULL CHECK (status IN ('COMPLETED','FAILED')),
  summary JSONB NOT NULL DEFAULT '{}',
  error_code VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE alert_job_evaluations (
  run_id UUID NOT NULL REFERENCES alert_job_runs(id) ON DELETE CASCADE,
  rule_id VARCHAR(50) REFERENCES reglas_alerta(id) ON DELETE SET NULL,
  campana_id VARCHAR(50) NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
  equipo_id VARCHAR(50) REFERENCES equipos(id) ON DELETE CASCADE,
  outcome VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
