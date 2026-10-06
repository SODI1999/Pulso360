ALTER TABLE usuarios ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  delivery_status VARCHAR(12) NOT NULL DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING','DELIVERED','FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX password_reset_user_idx ON password_reset_tokens(usuario_id);

ALTER TABLE versiones_lexico ADD COLUMN contenido JSONB;
CREATE TABLE lexico_activaciones (
  id BIGSERIAL PRIMARY KEY,
  version_id VARCHAR(50) NOT NULL REFERENCES versiones_lexico(id),
  previous_version_id VARCHAR(50) REFERENCES versiones_lexico(id),
  actor_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reglas_alerta ADD COLUMN pending_approval BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reglas_alerta ADD COLUMN propuesta_por_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE reglas_alerta ADD COLUMN aprobada_por_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE reglas_alerta ADD COLUMN aprobada_en TIMESTAMPTZ;

ALTER TABLE auditoria_logs ADD COLUMN hash_version SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE auditoria_logs ADD COLUMN actor_reference VARCHAR(50);
ALTER TABLE sst_alertas ADD COLUMN dismiss_reason TEXT;
