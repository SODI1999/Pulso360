-- ==============================================================================
-- Pulso360 — Seed Canónico Definitivo (PostgreSQL 18)
-- Base de datos: pulso360_db
-- Contraseña universal para todos los usuarios demo: Pulso360#2026
-- Hash bcrypt (cost=10): $2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6
-- ==============================================================================

-- 1. Catálogo de Roles
INSERT INTO roles (codigo, nombre, descripcion) VALUES
('AGENTE', 'Agente de Contact Center', 'Operador de atención, llamadas y soporte con acceso a check-in y bitácora privada.'),
('SUPERVISOR', 'Supervisor Operativo', 'Líder de equipo con acceso a métricas grupales agregadas respetando k-anonimato.'),
('SST', 'Seguridad y Salud en el Trabajo', 'Especialista en prevención psicosocial, alertas, intervenciones y acompañamiento.'),
('AUDITOR', 'Auditor de Cumplimiento', 'Responsable de trazabilidad, logs inmutables y verificación de políticas Ley 1581.'),
('ADMIN', 'Administrador del Sistema', 'Gestor de infraestructura, estructura organizacional, catálogos y políticas.');

-- 2. Campañas Operativas
INSERT INTO campanas (id, codigo, nombre, descripcion, activa) VALUES
('camp-1', 'ALPHA', 'Campaña Soporte Alpha', 'Operación de soporte técnico y atención multicanal.', TRUE),
('camp-2', 'BETA', 'Campaña Retención Beta', 'Operación de retención, cobranza y fidelización de usuarios.', TRUE);

-- 3. Equipos de Trabajo
INSERT INTO equipos (id, campana_id, codigo, nombre, descripcion, n_miembros, supervisor_nombre, activo) VALUES
('team-alpha-1', 'camp-1', 'ALPHA-1', 'Equipo Alpha 1', 'Equipo principal de soporte de primer nivel.', 14, 'Carlos Mendoza', TRUE),
('team-alpha-2', 'camp-1', 'ALPHA-2', 'Equipo Alpha 2', 'Equipo de soporte especializado (contingencia).', 4, 'Supervisor Alpha 2', TRUE),
('team-beta-2', 'camp-2', 'BETA-2', 'Equipo Beta 2', 'Equipo de retención y fidelización de clientes.', 22, 'Supervisor Beta', TRUE);

-- 4. Usuarios Demo (Contraseña: Pulso360#2026)
INSERT INTO usuarios (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos, shift_start_hour, estado) VALUES
('usr-1', 'AGENTE', 'agente@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Laura', 'Gomez', 8, 'Activo'),
('usr-2', 'SUPERVISOR', 'supervisor@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Carlos', 'Mendoza', 8, 'Activo'),
('usr-3', 'SST', 'sst@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Patricia', 'Silva', 8, 'Activo'),
('usr-4', 'AUDITOR', 'auditor@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Marcos', 'Rivas', 8, 'Activo'),
('usr-5', 'ADMIN', 'admin@pulso360.co', '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Admin', 'Pulso360', 8, 'Activo');

-- 5. Asignaciones de Usuarios a Equipos
INSERT INTO asignaciones_usuario_equipo (id, usuario_id, equipo_id, tipo_asignacion, hora_inicio_turno, fecha_inicio, activa) VALUES
('asig-1', 'usr-1', 'team-alpha-1', 'AGENTE', '08:00:00', '2026-01-01', TRUE),
('asig-2', 'usr-2', 'team-alpha-1', 'SUPERVISOR', '08:00:00', '2026-01-01', TRUE);

-- 6. Políticas de Privacidad
INSERT INTO politicas_privacidad (id, version, titulo, texto_politica, texto_aviso_privacidad, hash_contenido, estado, creado_por_id, publicado_en, vigente_desde) VALUES
('pol-v24', 'v2.4', 'Politica Integral de Privacidad y Tratamiento de Datos Sensibles Pulso360',
'Politica de tratamiento de datos personales y sensibles para la prevencion de riesgos psicosociales en Contact Centers bajo la Ley 1581 de 2012 y Res. 2764 de 2022.',
'Aviso de privacidad: los check-ins y bitacoras son voluntarios y de caracter preventivo.',
'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'PUBLICADA', 'usr-5', '2026-08-15 00:00:00-05', '2026-08-15 00:00:00-05');

-- 7. Consentimientos Informados
INSERT INTO consentimientos (id, usuario_id, politica_id, tipo_evento, acepta_politica, acepta_aviso_privacidad, c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto, ip_origen) VALUES
('con-1', 'usr-1', 'pol-v24', 'INICIAL', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '192.168.1.45');

-- 8. Check-ins Diarios Demo (6 Dimensiones)
INSERT INTO daily_checkins (id, usuario_id, asignacion_id, journey_key, checkin_date, submitted_at, energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia) VALUES
('chk-1', 'usr-1', 'asig-1', '2026-08-20', '2026-08-20', '2026-08-20 08:12:00-05', 3, 4, 2, 4, 2, 2),
('chk-2', 'usr-1', 'asig-1', '2026-08-19', '2026-08-19', '2026-08-19 08:18:00-05', 2, 5, 2, 3, 3, 3),
('chk-3', 'usr-1', 'asig-1', '2026-08-18', '2026-08-18', '2026-08-18 08:05:00-05', 4, 3, 4, 4, 1, 1);

-- 9. Bitácoras Personales Demo (Privada)
INSERT INTO bitacoras (id, usuario_id, asignacion_id, entry_date, context, content, created_at) VALUES
('jrn-1', 'usr-1', 'asig-1', '2026-08-20', 'Turno tarde', 'Hoy hubo mucho volumen de llamadas y termine agotada. El equipo me apoyo cuando una conversacion se puso dificil.', '2026-08-20 18:32:05-05');

-- 10. Versiones de Léxico NLP
INSERT INTO versiones_lexico (id, codigo_version, descripcion, estado, hash_contenido, creado_por_id) VALUES
('lex-v12', 'lexico-v1.2', 'Diccionario lexico determinista de palabras clave y riesgo psicosocial v1.2', 'ACTIVA', 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 'usr-5');

-- 11. Categorías NLP
INSERT INTO categorias_nlp (id, codigo, nombre, descripcion, severidad_base, activa) VALUES
('cat-1', 'SOBRECARGA', 'Sobrecarga percibida', 'Percepcion de volumen inmanejable de llamadas y tareas', 'Alta', TRUE),
('cat-2', 'EXIGENCIA', 'Exigencia emocional', 'Interacciones continuas con usuarios en situacion de conflicto', 'Alta', TRUE),
('cat-3', 'BAJO_APOYO', 'Bajo apoyo organizacional', 'Sensacion de falta de respaldo de lideres o equipo', 'Media', TRUE);

-- 12. Análisis NLP de Bitácoras
INSERT INTO analisis_nlp (id, bitacora_id, version_lexico_id, categorias_detectadas, confianza_promedio, requiere_revision) VALUES
('an-1', 'jrn-1', 'lex-v12', '[{"name": "Sobrecarga percibida", "confidence": 0.82, "evidence": ["volumen de llamadas"]}, {"name": "Exigencia emocional", "confidence": 0.68, "evidence": ["dificil"]}]'::jsonb, 0.75, FALSE);

-- 14. Reglas de Alerta Temprana
INSERT INTO reglas_alerta (id, nombre, metrica, operador, valor_umbral, persistencia_periodos, unidad_tiempo, alcance, severidad, activa) VALUES
('rule-1', 'Caida sostenida de recuperacion', 'Recuperacion agregada', 'baje mas de', 15.00, 3, 'semanas', 'cualquier equipo', 'Alta', TRUE),
('rule-2', 'Carga emocional elevada', 'Carga emocional agregada', 'supere', 65.00, 2, 'semanas', 'cualquier equipo', 'Media', TRUE);

-- 15. Alertas Preventivas SST
INSERT INTO sst_alertas (id, regla_id, campana_id, equipo_id, alert_date, severity, respondents, status, owner_id, description, evidence) VALUES
('alt-1', 'rule-1', 'camp-1', 'team-alpha-1', '2026-08-20', 'Alta', 14, 'GENERADA', 'usr-3', 'La recuperacion agregada descendio durante 3 semanas consecutivas.', '[68, 61, 54]'::jsonb),
('alt-2', 'rule-2', 'camp-2', 'team-beta-2', '2026-08-18', 'Media', 22, 'EN_REVISION', 'usr-3', 'La carga emocional agregada supera el umbral durante 2 semanas.', '[58, 64]'::jsonb);

-- 16. Intervenciones Preventivas SST
INSERT INTO sst_intervenciones (id, alerta_id, title, type, campana_id, equipo_id, creator_id, assigned_to, status, start_date, end_date, indicator, baseline, progress, target_desc, external_action) VALUES
('int-1', 'alt-1', 'Pausas cognitivas coordinadas', 'Pausas cognitivas', 'camp-1', 'team-alpha-1', 'usr-3', 'usr-2', 'Activa', '2026-08-18', '2026-09-01', 'Recuperacion agregada', 58.00, 55, 'Mejorar recuperacion percibida', TRUE),
('int-2', 'alt-2', 'Taller de manejo emocional', 'Taller de manejo emocional', 'camp-2', 'team-beta-2', 'usr-3', 'usr-2', 'Cerrada', '2026-07-01', '2026-07-28', 'Carga emocional', 72.00, 100, 'Reduccion de estres en llamadas dificiles', FALSE);

-- 17. Seguimientos de Intervención
INSERT INTO seguimientos_intervencion (id, intervencion_id, autor_id, fecha, progreso_reportado, nota_avance) VALUES
('seg-int-1', 'int-1', 'usr-2', '2026-08-22', 55, 'Se ejecutaron pausas activas con 12 de los 14 agentes presentes de forma coordinada.');

-- 18. Solicitudes de Acompañamiento Psicosocial
INSERT INTO solicitudes_apoyo (id, code, mode, owner_user_id, identity_user_id, request_date, reason, description, urgency, contact_preference, time_window, status, assigned_to, sla) VALUES
('req-1', 'ANON-2026-0982', 'anonimo', 'usr-1', NULL, '2026-08-19', 'Sobrecarga percibida', 'Quisiera orientacion para manejar una semana dificil.', 'media', 'app', 'No aplica', 'Recibida', 'usr-3', '24 h habiles');

-- 19. Seguimientos de Acompañamiento
INSERT INTO seguimientos_apoyo (id, solicitud_id, profesional_sst_id, fecha, nota_evolucion, nuevo_estado) VALUES
('seg-ap-1', 'req-1', 'usr-3', '2026-08-20', 'Caso recibido y priorizado por el equipo psicosocial.', 'En gestion');

-- 20. Solicitudes de Habeas Data
INSERT INTO solicitudes_habeas_data (id, usuario_id, type, status, deadline, note) VALUES
('HD-2026-001', 'usr-1', 'Portabilidad', 'Respondida', '2026-09-03', 'Copia JSON preparada.'),
('HD-2026-002', 'usr-1', 'Rectificacion', 'En tramite', '2026-09-11', 'Solicitud en revision por el oficial de privacidad.');

-- 21. Reportes Generados
INSERT INTO reportes_generados (id, tipo_reporte, autor_id, campana_id, equipo_id, fecha_corte, hash_integridad, parametros_filtro, ruta_archivo) VALUES
('rep-1', 'TENDENCIAS_MENSUALES', 'usr-3', 'camp-1', 'team-alpha-1', '2026-08-20', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '{"rango": "2026-08", "k_minimo": 5}'::jsonb, '/var/pulso360/storage/reportes/rep-1.pdf');

-- 22. Notificaciones In-App
INSERT INTO notificaciones (id, usuario_id, rol_destinatario, title, context, is_read, href) VALUES
('not-1', NULL, 'SST', 'Nueva alerta en Soporte Alpha', 'Regla: caida sostenida de recuperacion', FALSE, '/sst/alertas'),
('not-2', 'usr-1', 'AGENTE', 'Actualizacion de tu solicitud', 'Hay un cambio de estado disponible dentro de la app', FALSE, '/agente/apoyo');

-- 23. Auditoría Inmutable con Hash Encadenado
INSERT INTO auditoria_logs (usuario_id, rol, action, resource, resource_id, details, ip_address, prev_hash, hash, created_at) VALUES
('usr-1', 'AGENTE', 'REGISTRO_CHECKIN', 'daily_checkins', 'chk-1', '{"dimensiones": 6}'::jsonb, '192.168.1.45', 'GENESIS', 'demo-aud-101', '2026-08-20 18:30:12-05'),
('usr-1', 'AGENTE', 'ENTRADA_BITACORA', 'bitacoras', 'jrn-1', '{"contexto": "Turno tarde"}'::jsonb, '192.168.1.45', 'demo-aud-101', 'demo-aud-102', '2026-08-20 18:32:05-05'),
('usr-2', 'SUPERVISOR', 'CONSULTA_AGREGADA', 'analytics', 'team-alpha-1', '{"semana": 34, "n": 14}'::jsonb, '192.168.1.12', 'demo-aud-102', 'demo-aud-103', '2026-08-20 18:45:00-05');

-- 24. Configuración Global del Sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('umbral_k_anonimato', '{"valor": 5, "minimo_permitido": 3}'::jsonb, 'Umbral minimo de participantes distintos para publicar metricas agregadas.'),
('slas_atencion', '{"alta_horas": 24, "media_horas": 48, "baja_horas": 72, "solicitudes_horas": 24}'::jsonb, 'Tiempos maximos de respuesta para atencion de casos de SST.'),
('gobernanza_checkin', '{"horas_edicion_permitidas": 2, "granularidad_minima": "semanal", "retencion_auditoria_anios": 5}'::jsonb, 'Parametros operativos de captura y retencion.');
