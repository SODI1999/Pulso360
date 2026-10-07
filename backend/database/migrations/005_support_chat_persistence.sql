-- Migración 005: Persistencia de Sesiones y Mensajes del Chat de Acompañamiento SST
CREATE TABLE IF NOT EXISTS sesiones_chat_soporte (
    id VARCHAR(50) PRIMARY KEY,
    agente_id VARCHAR(50) NOT NULL REFERENCES usuarios(id),
    es_anonimo BOOLEAN NOT NULL DEFAULT FALSE,
    sst_atendio_id VARCHAR(50) REFERENCES usuarios(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada')),
    motivo_cierre VARCHAR(60),
    notas_cierre TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cerrado_en TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mensajes_chat_soporte (
    id VARCHAR(50) PRIMARY KEY,
    sesion_id VARCHAR(50) NOT NULL REFERENCES sesiones_chat_soporte(id) ON DELETE CASCADE,
    remitente_id VARCHAR(50) NOT NULL REFERENCES usuarios(id),
    remitente_rol VARCHAR(20) NOT NULL,
    remitente_nombre VARCHAR(120) NOT NULL,
    texto TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sesiones_agente_estado ON sesiones_chat_soporte(agente_id, estado);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_sesion_orden ON mensajes_chat_soporte(sesion_id, creado_en ASC);

-- Conceder permisos DML al rol de aplicación pulso360_app si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pulso360_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sesiones_chat_soporte TO pulso360_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensajes_chat_soporte TO pulso360_app;
  END IF;
END $$;
