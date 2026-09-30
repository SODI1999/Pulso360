-- ==============================================================================
-- Pulso360 — Seed Inicial de Base de Datos
-- Base de datos: pulso360_db
-- Contraseña estándar para todos los usuarios demo: Pulso360#2026
-- Hash bcrypt (cost=10): $2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6
-- ==============================================================================

-- 1. Usuarios del Sistema (5 Roles Canónicos)
INSERT INTO users (id, email, password_hash, name, role, team_id, team_name, campaign, shift_start_hour, status) VALUES
('usr-1', 'agente@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Laura Gomez', 'agente', 'team-alpha-1', 'Equipo Alpha 1', 'Campana Soporte Alpha', 8, 'Activo'),
('usr-2', 'supervisor@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Carlos Mendoza', 'supervisor', 'team-alpha-1', 'Equipo Alpha 1', 'Campana Soporte Alpha', 8, 'Activo'),
('usr-3', 'sst@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Patricia Silva', 'sst', NULL, 'Seguridad y Salud en el Trabajo', NULL, 8, 'Activo'),
('usr-4', 'auditor@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Marcos Rivas', 'auditor', NULL, 'Auditoria y Cumplimiento', NULL, 8, 'Activo'),
('usr-5', 'admin@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Admin Pulso360', 'admin', NULL, 'Administracion General', NULL, 8, 'Activo');

-- 2. Consentimientos Informados (Ley 1581)
INSERT INTO user_consents (user_id, policy_accepted, policy_version, c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto, updated_at) VALUES
('usr-1', TRUE, 'v2.4', TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP);

-- 3. Check-ins Diarios Demo (6 Dimensiones)
INSERT INTO daily_checkins (id, user_id, journey_key, checkin_date, submitted_at, energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia) VALUES
('chk-1', 'usr-1', '2026-08-20', '2026-08-20', '2026-08-20 08:12:00-05', 3, 4, 2, 4, 2, 2),
('chk-2', 'usr-1', '2026-08-19', '2026-08-19', '2026-08-19 08:18:00-05', 2, 5, 2, 3, 3, 3),
('chk-3', 'usr-1', '2026-08-18', '2026-08-18', '2026-08-18 08:05:00-05', 4, 3, 4, 4, 1, 1);

-- 4. Bitácora Personal Demo (Privada del Agente)
INSERT INTO journals (id, user_id, entry_date, context, content, analysis, created_at) VALUES
('jrn-1', 'usr-1', '2026-08-20', 'Turno tarde', 'Hoy hubo mucho volumen de llamadas y termine agotada. El equipo me apoyo cuando una conversacion se puso dificil.',
'{"version": "lexico-v1.2", "categories": [{"name": "Sobrecarga percibida", "confidence": 0.82}, {"name": "Exigencia emocional", "confidence": 0.68}], "requiresReview": false}'::jsonb,
'2026-08-20 18:32:05-05');

-- 5. Solicitud de Acompañamiento Demo
INSERT INTO support_requests (id, code, mode, owner_user_id, identity_user_id, request_date, reason, description, urgency, contact_preference, time_window, status, assigned_to, sla) VALUES
('req-1', 'ANON-2026-0982', 'anonimo', 'usr-1', NULL, '2026-08-19', 'Sobrecarga percibida', 'Quisiera orientacion para manejar una semana dificil.', 'media', 'app', 'No aplica', 'Recibida', 'usr-3', '24 h habiles');

-- 6. Solicitudes de Habeas Data Demo
INSERT INTO habeas_data_requests (id, user_id, type, status, deadline, note) VALUES
('HD-2026-001', 'usr-1', 'Portabilidad', 'Respondida', '2026-09-03', 'Copia JSON preparada (dato demo).'),
('HD-2026-002', 'usr-1', 'Rectificacion', 'En tramite', '2026-09-11', 'Solicitud demo en revision.');

-- 7. Alertas Preventivas de SST
INSERT INTO sst_alerts (id, rule_name, campaign, team_name, alert_date, severity, respondents, status, owner_id, description, evidence) VALUES
('alt-1', 'Caida sostenida de recuperacion', 'Campana Soporte Alpha', 'Equipo Alpha 1', '2026-08-20', 'Alta', 14, 'GENERADA', 'usr-3', 'La recuperacion agregada descendio durante 3 semanas consecutivas.', '[68, 61, 54]'::jsonb),
('alt-2', 'Carga emocional elevada', 'Campana Retencion Beta', 'Equipo Beta 2', '2026-08-18', 'Media', 22, 'EN_REVISION', 'usr-3', 'La carga emocional agregada supera el valor configurado durante 2 semanas.', '[58, 64]'::jsonb);

-- 8. Intervenciones de SST
INSERT INTO sst_interventions (id, title, type, campaign, team_name, creator_id, assigned_to, status, start_date, end_date, indicator, baseline, progress, target_desc, external_action) VALUES
('int-1', 'Pausas cognitivas coordinadas', 'Pausas cognitivas', 'Campana Soporte Alpha', 'Equipo Alpha 1', 'usr-3', 'usr-2', 'Activa', '2026-08-18', '2026-09-01', 'Recuperacion agregada', 58.00, 55, 'Mejorar recuperacion percibida', TRUE),
('int-2', 'Taller de manejo emocional', 'Taller de manejo emocional', 'Campana Retencion Beta', 'Equipo Beta 2', 'usr-3', 'usr-2', 'Cerrada', '2026-07-01', '2026-07-28', 'Carga emocional', 72.00, 100, 'Reduccion de estres en llamadas dificiles', FALSE);
