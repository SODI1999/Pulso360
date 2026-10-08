-- Migración 006: Triage, aprobación de SST e historial para chat de soporte (RF-10)

ALTER TABLE sesiones_chat_soporte 
  DROP CONSTRAINT IF EXISTS sesiones_chat_soporte_estado_check;

ALTER TABLE sesiones_chat_soporte 
  ADD CONSTRAINT sesiones_chat_soporte_estado_check 
  CHECK (estado IN ('pendiente', 'activa', 'cerrada', 'rechazada', 'cancelada'));

ALTER TABLE sesiones_chat_soporte
  ALTER COLUMN estado SET DEFAULT 'pendiente';

ALTER TABLE sesiones_chat_soporte
  ADD COLUMN IF NOT EXISTS motivo_solicitud VARCHAR(100),
  ADD COLUMN IF NOT EXISTS descripcion_solicitud TEXT,
  ADD COLUMN IF NOT EXISTS aprobado_en TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS respuesta_triage TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_sesiones_triage_estado 
  ON sesiones_chat_soporte(estado, creado_en DESC);
