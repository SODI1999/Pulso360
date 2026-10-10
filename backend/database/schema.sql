-- ==============================================================================
-- Pulso360 — Esquema Relacional Canónico Definitivo (PostgreSQL 18)
-- Base de datos: pulso360_db
-- 24 Tablas Canónicas: Integración 100% PPI (RF-01 a RF-18) + C01-C14 + BD II
-- ==============================================================================

-- ==============================================================================
-- ¡ADVERTENCIA CRÍTICA DE DESTRUCCIÓN DE DATOS!
-- Este script realiza DROP TABLE CASCADE en todas las tablas. 
-- Es un bootstrap destructivo de inicialización limpia.
-- NUNCA LO EJECUTES EN PRODUCCIÓN si la base de datos ya contiene datos reales.
-- Utiliza migraciones incrementales para conservar información en producción.
-- ==============================================================================

-- 1. Eliminación en orden inverso para despliegues limpios
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS habeas_data_requests CASCADE;
DROP TABLE IF EXISTS journals CASCADE;
DROP TABLE IF EXISTS sst_alerts CASCADE;
DROP TABLE IF EXISTS sst_interventions CASCADE;
DROP TABLE IF EXISTS support_requests CASCADE;
DROP TABLE IF EXISTS user_consents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS configuracion_sistema CASCADE;
DROP TABLE IF EXISTS auditoria_logs CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS reportes_generados CASCADE;
DROP TABLE IF EXISTS solicitudes_habeas_data CASCADE;
DROP TABLE IF EXISTS seguimientos_apoyo CASCADE;
DROP TABLE IF EXISTS solicitudes_apoyo CASCADE;
DROP TABLE IF EXISTS seguimientos_intervencion CASCADE;
DROP TABLE IF EXISTS sst_intervenciones CASCADE;
DROP TABLE IF EXISTS sst_alertas CASCADE;
DROP TABLE IF EXISTS reglas_alerta CASCADE;
DROP TABLE IF EXISTS revisiones_nlp CASCADE;
DROP TABLE IF EXISTS analisis_nlp CASCADE;
DROP TABLE IF EXISTS categorias_nlp CASCADE;
DROP TABLE IF EXISTS versiones_lexico CASCADE;
DROP TABLE IF EXISTS bitacoras CASCADE;
DROP TABLE IF EXISTS daily_checkins CASCADE;
DROP TABLE IF EXISTS consentimientos CASCADE;
DROP TABLE IF EXISTS politicas_privacidad CASCADE;
DROP TABLE IF EXISTS asignaciones_usuario_equipo CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS equipos CASCADE;
DROP TABLE IF EXISTS campanas CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ==============================================================================
-- BLOQUE A: IDENTIDAD, CONTROL DE ACCESO Y ESTRUCTURA ORGANIZACIONAL
-- ==============================================================================

-- Tabla 1: Catálogo Canónico de Roles (RF-01)
CREATE TABLE roles (
    codigo VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla 2: Campañas Operativas de Contact Center (RF-15)
CREATE TABLE campanas (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 3: Equipos de Trabajo (RF-15)
CREATE TABLE equipos (
    id VARCHAR(50) PRIMARY KEY,
    campana_id VARCHAR(50) NOT NULL REFERENCES campanas(id) ON DELETE RESTRICT,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    n_miembros INT DEFAULT 0,
    supervisor_nombre VARCHAR(120),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_equipo_campana_codigo UNIQUE (campana_id, codigo)
);

CREATE INDEX idx_equipos_campana ON equipos(campana_id);

-- Tabla 4: Usuarios del Sistema (RF-01, RF-18)
CREATE TABLE usuarios (
    id VARCHAR(50) PRIMARY KEY,
    rol_codigo VARCHAR(30) NOT NULL REFERENCES roles(codigo) ON DELETE RESTRICT,
    correo_institucional VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    shift_start_hour INT DEFAULT 8,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_correo ON usuarios(correo_institucional);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_codigo);

-- Tabla 5: Asignación Usuario-Equipo (Histórico de Turno y Pertenencia) (RF-15)
CREATE TABLE asignaciones_usuario_equipo (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    equipo_id VARCHAR(50) NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
    tipo_asignacion VARCHAR(30) DEFAULT 'AGENTE' CHECK (tipo_asignacion IN ('AGENTE', 'SUPERVISOR', 'LIDER_OPERATIVO')),
    hora_inicio_turno TIME DEFAULT '08:00:00',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asignaciones_usuario ON asignaciones_usuario_equipo(usuario_id);
CREATE INDEX idx_asignaciones_equipo ON asignaciones_usuario_equipo(equipo_id);

-- ==============================================================================
-- BLOQUE B: PRIVACIDAD Y CONSENTIMIENTO INFORMADO (LEY 1581 DE 2012)
-- ==============================================================================

-- Tabla 6: Versiones de Políticas de Privacidad (RF-02)
CREATE TABLE politicas_privacidad (
    id VARCHAR(50) PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    titulo VARCHAR(150) NOT NULL,
    texto_politica TEXT NOT NULL,
    texto_aviso_privacidad TEXT NOT NULL,
    hash_contenido VARCHAR(64) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PUBLICADA' CHECK (estado IN ('BORRADOR', 'PUBLICADA', 'ARCHIVADA')),
    creado_por_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    publicado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    vigente_desde TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 7: Consentimiento Informado Granular C1..C5 (RF-02)
CREATE TABLE consentimientos (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    politica_id VARCHAR(50) NOT NULL REFERENCES politicas_privacidad(id) ON DELETE RESTRICT,
    tipo_evento VARCHAR(30) DEFAULT 'INICIAL' CHECK (tipo_evento IN ('INICIAL', 'ACTUALIZACION', 'REVOCACION')),
    acepta_politica BOOLEAN NOT NULL DEFAULT FALSE,
    acepta_aviso_privacidad BOOLEAN NOT NULL DEFAULT FALSE,
    c1_checkin BOOLEAN NOT NULL DEFAULT FALSE,
    c2_bitacora BOOLEAN NOT NULL DEFAULT FALSE,
    c3_apoyo BOOLEAN NOT NULL DEFAULT FALSE,
    c4_analitica BOOLEAN NOT NULL DEFAULT FALSE,
    c5_contacto BOOLEAN NOT NULL DEFAULT FALSE,
    ip_origen VARCHAR(45),
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consentimientos_usuario ON consentimientos(usuario_id);

-- ==============================================================================
-- BLOQUE C: BIENESTAR Y REGISTRO PERSONAL DEL AGENTE
-- ==============================================================================

-- Tabla 8: Check-ins Diarios (6 Dimensiones de Bienestar) (RF-03)
CREATE TABLE daily_checkins (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    asignacion_id VARCHAR(50) REFERENCES asignaciones_usuario_equipo(id) ON DELETE SET NULL,
    journey_key VARCHAR(20) NOT NULL,
    checkin_date DATE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    energia INT CHECK (energia BETWEEN 1 AND 5),
    carga_emocional INT CHECK (carga_emocional BETWEEN 1 AND 5),
    recuperacion INT CHECK (recuperacion BETWEEN 1 AND 5),
    apoyo INT CHECK (apoyo BETWEEN 1 AND 5),
    distanciamiento INT CHECK (distanciamiento BETWEEN 1 AND 5),
    ineficacia INT CHECK (ineficacia BETWEEN 1 AND 5),
    CONSTRAINT uq_usuario_checkin_fecha UNIQUE (usuario_id, checkin_date)
);

CREATE INDEX idx_checkins_usuario_fecha ON daily_checkins(usuario_id, checkin_date);
CREATE INDEX idx_checkins_fecha ON daily_checkins(checkin_date);

-- Tabla 9: Bitácoras Personales (Desahogo Privado y Confidencial) (RF-04)
-- Regla Inviolable: Acceso exclusivo del autor (usuario_id)
CREATE TABLE bitacoras (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    asignacion_id VARCHAR(50) REFERENCES asignaciones_usuario_equipo(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    context VARCHAR(60),
    content TEXT NOT NULL,
    analysis_json JSONB,
    corrected_categories_json JSONB,
    correction_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bitacoras_usuario ON bitacoras(usuario_id);
CREATE INDEX idx_bitacoras_fecha ON bitacoras(entry_date);

-- ==============================================================================
-- BLOQUE D: MOTOR LÉXICO DETERMINISTA Y NLP (RF-05, RF-06)
-- ==============================================================================

-- Tabla 10: Versiones del Léxico Determinista (RF-05)
CREATE TABLE versiones_lexico (
    id VARCHAR(50) PRIMARY KEY,
    codigo_version VARCHAR(30) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('BORRADOR', 'ACTIVA', 'OBSOLETA')),
    hash_contenido VARCHAR(64) NOT NULL,
    creado_por_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    activado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 11: Catálogo de Categorías NLP (RF-05)
CREATE TABLE categorias_nlp (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    severidad_base VARCHAR(20) DEFAULT 'Media' CHECK (severidad_base IN ('Baja', 'Media', 'Alta')),
    activa BOOLEAN DEFAULT TRUE
);

-- Tabla 12: Resultados del Análisis NLP de Bitácoras (RF-05)
CREATE TABLE analisis_nlp (
    id VARCHAR(50) PRIMARY KEY,
    bitacora_id VARCHAR(50) NOT NULL UNIQUE REFERENCES bitacoras(id) ON DELETE CASCADE,
    version_lexico_id VARCHAR(50) NOT NULL REFERENCES versiones_lexico(id) ON DELETE RESTRICT,
    categorias_detectadas JSONB NOT NULL,
    confianza_promedio NUMERIC(4,2),
    requiere_revision BOOLEAN DEFAULT FALSE,
    procesado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 13: Revisiones y Corrección Humana del NLP por el Agente (RF-06)
CREATE TABLE revisiones_nlp (
    id VARCHAR(50) PRIMARY KEY,
    analisis_id VARCHAR(50) NOT NULL REFERENCES analisis_nlp(id) ON DELETE CASCADE,
    usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categorias_corregidas JSONB NOT NULL,
    nota_correccion TEXT,
    revisado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- BLOQUE E: PREVENCIÓN, ALERTAS E INTERVENCIONES SST (RF-07, RF-08, RF-09)
-- ==============================================================================

-- Tabla 14: Reglas Configurables de Alerta Temprana (RF-08)
CREATE TABLE reglas_alerta (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    metrica VARCHAR(80) NOT NULL,
    operador VARCHAR(30) NOT NULL,
    valor_umbral NUMERIC(5,2) NOT NULL,
    persistencia_periodos INT DEFAULT 2,
    unidad_tiempo VARCHAR(20) DEFAULT 'semanas',
    alcance VARCHAR(50) DEFAULT 'cualquier equipo',
    severidad VARCHAR(20) DEFAULT 'Alta' CHECK (severidad IN ('Baja', 'Media', 'Alta', 'Critica')),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 15: Alertas Preventivas Emitidas para SST (RF-08, RF-07)
CREATE TABLE sst_alertas (
    id VARCHAR(50) PRIMARY KEY,
    regla_id VARCHAR(50) REFERENCES reglas_alerta(id) ON DELETE SET NULL,
    campana_id VARCHAR(50) REFERENCES campanas(id) ON DELETE CASCADE,
    equipo_id VARCHAR(50) REFERENCES equipos(id) ON DELETE CASCADE,
    alert_date DATE NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Baja', 'Media', 'Alta', 'Critica')),
    respondents INT NOT NULL CHECK (respondents >= 0),
    status VARCHAR(30) DEFAULT 'GENERADA' CHECK (status IN ('GENERADA', 'EN_REVISION', 'INTERVENIDA', 'DESCARTADA')),
    owner_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alertas_campana ON sst_alertas(campana_id);
CREATE INDEX idx_alertas_equipo ON sst_alertas(equipo_id);
CREATE INDEX idx_alertas_fecha ON sst_alertas(alert_date);

-- Tabla 16: Intervenciones Preventivas y Pausas Activas SST (RF-09)
CREATE TABLE sst_intervenciones (
    id VARCHAR(50) PRIMARY KEY,
    alerta_id VARCHAR(50) REFERENCES sst_alertas(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(80) NOT NULL,
    campana_id VARCHAR(50) REFERENCES campanas(id) ON DELETE CASCADE,
    equipo_id VARCHAR(50) REFERENCES equipos(id) ON DELETE CASCADE,
    creator_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    assigned_to VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Activa' CHECK (status IN ('Activa', 'En seguimiento', 'Cerrada')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    indicator VARCHAR(100) NOT NULL,
    baseline NUMERIC(5,2),
    after_val NUMERIC(5,2),
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    target_desc TEXT,
    external_action BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intervenciones_campana ON sst_intervenciones(campana_id);

-- Tabla 17: Seguimiento de Intervenciones y Avances (RF-09)
CREATE TABLE seguimientos_intervencion (
    id VARCHAR(50) PRIMARY KEY,
    intervencion_id VARCHAR(50) NOT NULL REFERENCES sst_intervenciones(id) ON DELETE CASCADE,
    autor_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    progreso_reportado INT CHECK (progreso_reportado BETWEEN 0 AND 100),
    nota_avance TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seg_intervencion ON seguimientos_intervencion(intervencion_id);

-- ==============================================================================
-- BLOQUE F: ACOMPAÑAMIENTO, HABEAS DATA, REPORTES Y AUDITORÍA
-- ==============================================================================

-- Tabla 18: Solicitudes de Acompañamiento Psicosocial (RF-10, RF-16)
CREATE TABLE solicitudes_apoyo (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('anonimo', 'identificado')),
    owner_user_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    identity_user_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    request_date DATE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'media' CHECK (urgency IN ('baja', 'media', 'alta', 'critica')),
    contact_preference VARCHAR(30) DEFAULT 'app',
    time_window VARCHAR(50) DEFAULT 'No aplica',
    status VARCHAR(30) DEFAULT 'Recibida' CHECK (status IN ('Recibida', 'En gestion', 'Atendida', 'Cerrada')),
    assigned_to VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    sla VARCHAR(30) DEFAULT '24 h habiles',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_solicitudes_owner ON solicitudes_apoyo(owner_user_id);
CREATE INDEX idx_solicitudes_status ON solicitudes_apoyo(status);

-- Tabla 19: Seguimiento a Casos de Acompañamiento Psicosocial (RF-10)
CREATE TABLE seguimientos_apoyo (
    id VARCHAR(50) PRIMARY KEY,
    solicitud_id VARCHAR(50) NOT NULL REFERENCES solicitudes_apoyo(id) ON DELETE CASCADE,
    profesional_sst_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    nota_evolucion TEXT NOT NULL,
    nuevo_estado VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seg_apoyo ON seguimientos_apoyo(solicitud_id);

-- Tabla 20: Solicitudes de Derechos ARCO (Habeas Data Ley 1581) (RF-14)
CREATE TABLE solicitudes_habeas_data (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Portabilidad', 'Rectificacion', 'Supresion', 'Consulta')),
    status VARCHAR(30) DEFAULT 'En tramite' CHECK (status IN ('En tramite', 'Respondida', 'Rechazada')),
    deadline DATE NOT NULL,
    note TEXT,
    resuelto_en TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habeas_usuario ON solicitudes_habeas_data(usuario_id);

-- Tabla 21: Reportes Agregados Generados y Exportados (RF-12)
CREATE TABLE reportes_generados (
    id VARCHAR(50) PRIMARY KEY,
    tipo_reporte VARCHAR(50) NOT NULL,
    autor_id VARCHAR(50) NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    campana_id VARCHAR(50) REFERENCES campanas(id) ON DELETE SET NULL,
    equipo_id VARCHAR(50) REFERENCES equipos(id) ON DELETE SET NULL,
    fecha_corte DATE NOT NULL,
    hash_integridad VARCHAR(64) NOT NULL,
    parametros_filtro JSONB,
    ruta_archivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 22: Notificaciones y Avisos In-App (RF-17)
CREATE TABLE notificaciones (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_destinatario VARCHAR(30) REFERENCES roles(codigo) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    context TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    href VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificaciones_rol ON notificaciones(rol_destinatario);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);

-- Tabla 23: Registro Inmutable de Auditoría con Hash Encadenado (RF-13)
CREATE TABLE auditoria_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario_id VARCHAR(50) REFERENCES usuarios(id) ON DELETE SET NULL,
    rol VARCHAR(30),
    action VARCHAR(80) NOT NULL,
    resource VARCHAR(80) NOT NULL,
    resource_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    prev_hash VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_usuario ON auditoria_logs(usuario_id);
CREATE INDEX idx_auditoria_action ON auditoria_logs(action);
CREATE INDEX idx_auditoria_created ON auditoria_logs(created_at);

-- Tabla 24: Configuración Global y Gobernanza del Sistema (RF-15, RF-07)
CREATE TABLE configuracion_sistema (
    clave VARCHAR(50) PRIMARY KEY,
    valor JSONB NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 25: Sesiones de Chat de Acompañamiento Ocupacional SST (RF-10)
CREATE TABLE sesiones_chat_soporte (
    id VARCHAR(50) PRIMARY KEY,
    solicitud_id VARCHAR(50) REFERENCES solicitudes_apoyo(id) ON DELETE CASCADE,
    agente_id VARCHAR(50) NOT NULL REFERENCES usuarios(id),
    es_anonimo BOOLEAN NOT NULL DEFAULT FALSE,
    sst_atendio_id VARCHAR(50) REFERENCES usuarios(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'cerrada', 'rechazada', 'cancelada')),
    motivo_solicitud VARCHAR(100),
    descripcion_solicitud TEXT,
    aprobado_en TIMESTAMPTZ,
    respuesta_triage TEXT,
    motivo_cierre VARCHAR(60),
    notas_cierre TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cerrado_en TIMESTAMPTZ
);

-- Tabla 26: Mensajes Inmutables del Chat de Acompañamiento SST
CREATE TABLE mensajes_chat_soporte (
    id VARCHAR(50) PRIMARY KEY,
    sesion_id VARCHAR(50) NOT NULL REFERENCES sesiones_chat_soporte(id) ON DELETE CASCADE,
    remitente_id VARCHAR(50) NOT NULL REFERENCES usuarios(id),
    remitente_rol VARCHAR(20) NOT NULL,
    remitente_nombre VARCHAR(120) NOT NULL,
    texto TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sesiones_agente_estado ON sesiones_chat_soporte(agente_id, estado);
CREATE INDEX idx_chat_sesiones_triage_estado ON sesiones_chat_soporte(estado, creado_en DESC);
CREATE INDEX idx_chat_sesiones_solicitud ON sesiones_chat_soporte(solicitud_id);
CREATE INDEX idx_chat_mensajes_sesion_orden ON mensajes_chat_soporte(sesion_id, creado_en ASC);

