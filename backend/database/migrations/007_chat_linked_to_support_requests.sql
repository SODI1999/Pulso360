-- Migración 007: Vinculación formal de sesiones de chat a solicitudes de apoyo (radicados)
ALTER TABLE sesiones_chat_soporte
  ADD COLUMN IF NOT EXISTS solicitud_id VARCHAR(50) REFERENCES solicitudes_apoyo(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chat_sesiones_solicitud
  ON sesiones_chat_soporte(solicitud_id);
