-- ==============================================================================
-- Pulso360 — DDL PostgreSQL Database Schema
-- Base de datos: pulso360_db
-- Cumple con: P11 · persistence / C08 · PostgreSQL
-- ==============================================================================

-- 1. Eliminación en cascada para despliegues limpios de desarrollo
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sst_interventions CASCADE;
DROP TABLE IF EXISTS sst_alerts CASCADE;
DROP TABLE IF EXISTS habeas_data_requests CASCADE;
DROP TABLE IF EXISTS support_requests CASCADE;
DROP TABLE IF EXISTS journals CASCADE;
DROP TABLE IF EXISTS daily_checkins CASCADE;
DROP TABLE IF EXISTS user_consents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Tabla de Usuarios y Roles (RBAC)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('agente', 'supervisor', 'sst', 'auditor', 'admin')),
    team_id VARCHAR(50),
    team_name VARCHAR(100),
    campaign VARCHAR(100),
    shift_start_hour INT DEFAULT 8,
    status VARCHAR(20) DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo', 'Suspendido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_team ON users(team_id);

-- 3. Tabla de Consentimiento Informado (Ley 1581 de 2012 / Habeas Data)
CREATE TABLE user_consents (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    policy_accepted BOOLEAN DEFAULT FALSE,
    policy_version VARCHAR(20) DEFAULT 'v2.4',
    c1_checkin BOOLEAN DEFAULT FALSE,
    c2_bitacora BOOLEAN DEFAULT FALSE,
    c3_apoyo BOOLEAN DEFAULT FALSE,
    c4_analitica BOOLEAN DEFAULT FALSE,
    c5_contacto BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Check-ins Diarios de Bienestar (6 Dimensiones Operativas)
CREATE TABLE daily_checkins (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_key VARCHAR(20) NOT NULL,
    checkin_date DATE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    energia INT CHECK (energia BETWEEN 1 AND 5),
    carga_emocional INT CHECK (carga_emocional BETWEEN 1 AND 5),
    recuperacion INT CHECK (recuperacion BETWEEN 1 AND 5),
    apoyo INT CHECK (apoyo BETWEEN 1 AND 5),
    distanciamiento INT CHECK (distanciamiento BETWEEN 1 AND 5),
    ineficacia INT CHECK (ineficacia BETWEEN 1 AND 5),
    CONSTRAINT uq_user_checkin_date UNIQUE (user_id, checkin_date)
);

CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX idx_checkins_date ON daily_checkins(checkin_date);

-- 5. Tabla de Bitácoras Personales (Privada / Confidencial)
-- Regla de Dominio: Solo consultable por el autor (user_id)
CREATE TABLE journals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    context VARCHAR(50),
    content TEXT NOT NULL,
    analysis JSONB,
    corrected_categories JSONB,
    correction_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journals_user ON journals(user_id);
CREATE INDEX idx_journals_date ON journals(entry_date);

-- 6. Tabla de Solicitudes de Acompañamiento Psicosocial (SST)
CREATE TABLE support_requests (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('anonimo', 'identificado')),
    owner_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    identity_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    request_date DATE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'media' CHECK (urgency IN ('baja', 'media', 'alta', 'critica')),
    contact_preference VARCHAR(30) DEFAULT 'app',
    time_window VARCHAR(50) DEFAULT 'No aplica',
    status VARCHAR(30) DEFAULT 'Recibida' CHECK (status IN ('Recibida', 'En gestion', 'Atendida', 'Cerrada')),
    assigned_to VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    sla VARCHAR(30) DEFAULT '24 h habiles',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_owner ON support_requests(owner_user_id);
CREATE INDEX idx_support_status ON support_requests(status);

-- 7. Tabla de Solicitudes de Habeas Data (ARCO - Ley 1581)
CREATE TABLE habeas_data_requests (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Portabilidad', 'Rectificacion', 'Supresion', 'Consulta')),
    status VARCHAR(30) DEFAULT 'En tramite' CHECK (status IN ('En tramite', 'Respondida', 'Rechazada')),
    deadline DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habeas_user ON habeas_data_requests(user_id);

-- 8. Tabla de Alertas Preventivas Organizacionales (SST)
CREATE TABLE sst_alerts (
    id VARCHAR(50) PRIMARY KEY,
    rule_name VARCHAR(150) NOT NULL,
    campaign VARCHAR(100) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    alert_date DATE NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Baja', 'Media', 'Alta', 'Critica')),
    respondents INT NOT NULL CHECK (respondents >= 0),
    status VARCHAR(30) DEFAULT 'GENERADA' CHECK (status IN ('GENERADA', 'EN_REVISION', 'INTERVENIDA', 'DESCARTADA')),
    owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_date ON sst_alerts(alert_date);
CREATE INDEX idx_alerts_campaign ON sst_alerts(campaign);

-- 9. Tabla de Intervenciones Preventivas (SST)
CREATE TABLE sst_interventions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(80) NOT NULL,
    campaign VARCHAR(100) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    creator_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    assigned_to VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
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

CREATE INDEX idx_interventions_campaign ON sst_interventions(campaign);
CREATE INDEX idx_interventions_status ON sst_interventions(status);

-- 10. Tabla de Auditoría Inmutable (Trazabilidad RF-13)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(30),
    action VARCHAR(80) NOT NULL,
    resource VARCHAR(80) NOT NULL,
    resource_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
