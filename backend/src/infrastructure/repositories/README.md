# P10 · Infrastructure / Repositories — Especificación de Acceso a Datos SQL

## 1. Identificación y Responsabilidad
* **Paquete Arquitectónico**: `P10 · infrastructure/repositories`
* **Componente C4**: `C07 · Repositorios y persistencia`
* **Motor Relacional**: PostgreSQL 18 (`pulso360_db`), esquema canónico de 24 tablas en [`backend/database/schema.sql`](../../../database/schema.sql).
* **Patrón de Ejecución**: Consultas SQL nativas parametrizadas (`$1, $2, ...`) mediante el Pool de conexiones de `../db.js`.
* **Regla Inviolable**: **Cero sentencias SQL fuera de este directorio**. Los servicios y controladores no conocen SQL.

---

## 2. Alineación Canónica con las 24 Tablas de PostgreSQL

| Repositorio | Tablas de `pulso360_db` Asignadas | Salvaguarda Principal |
| :--- | :--- | :--- |
| `userRepository.js` | `usuarios`, `roles`, `asignaciones_usuario_equipo` | Exclusión sistemática de `contrasena_hash` en lecturas generales. |
| `consentRepository.js` | `consentimientos`, `politicas_privacidad` | Versionamiento inmutable (insert por cada actualización de consentimiento). |
| `checkinRepository.js` | `daily_checkins` | Restricción de unicidad `(usuario_id, checkin_date)`. |
| `journalRepository.js` | `bitacoras` | **Inviolable: Cláusula `WHERE usuario_id = $1` obligatoria**. |
| `analyticsRepository.js` | `daily_checkins`, `equipos`, `campanas` | Cálculo previo de `COUNT(DISTINCT usuario_id)` para $k$-anonimato. |
| `sstRepository.js` | `sst_alertas`, `sst_intervenciones`, `solicitudes_apoyo` | Supresión de identidad en solicitudes con `mode = 'anonimo'`. |
| `auditRepository.js` | `auditoria_logs` | Trazabilidad inmutable de eventos sensibles. |

---

## 3. Especificación de Firmas y Consultas SQL (SDD)

---

### A. `userRepository.js`

#### 1. `findByEmail(correo)`
* **Consulta SQL**:
  ```sql
  SELECT id, rol_codigo, correo_institucional, contrasena_hash, 
         nombres, apellidos, estado, intentos_fallidos, bloqueado_hasta
  FROM usuarios 
  WHERE correo_institucional = $1;
  ```
* **Parámetros**: `[correo.toLowerCase().trim()]`
* **Retorno**: Fila del usuario o `null`.

#### 2. `findProfileById(id)`
* **Consulta SQL**:
  ```sql
  SELECT u.id, u.correo_institucional, u.nombres, u.apellidos, u.rol_codigo AS rol,
         e.id AS equipo_id, e.nombre AS equipo_nombre,
         c.nombre AS campana_nombre
  FROM usuarios u
  LEFT JOIN asignaciones_usuario_equipo a ON a.usuario_id = u.id AND a.activa = TRUE
  LEFT JOIN equipos e ON e.id = a.equipo_id
  LEFT JOIN campanas c ON c.id = e.campana_id
  WHERE u.id = $1;
  ```
* **Retorno**: Objeto de perfil formateado o `null`.

#### 3. `registerFailedAttempt(id, maxReached)`
* **Consulta SQL**:
  ```sql
  UPDATE usuarios 
  SET intentos_fallidos = intentos_fallidos + 1,
      bloqueado_hasta = CASE WHEN $2 = TRUE THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE bloqueado_hasta END,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = $1;
  ```

#### 4. `resetFailedAttempts(id)`
* **Consulta SQL**:
  ```sql
  UPDATE usuarios 
  SET intentos_fallidos = 0, bloqueado_hasta = NULL, updated_at = CURRENT_TIMESTAMP
  WHERE id = $1;
  ```

---

### B. `consentRepository.js`

#### 5. `findActiveByUserId(userId)`
* **Consulta SQL**:
  ```sql
  SELECT c.id, c.usuario_id, p.version AS politica_version,
         c.acepta_politica, c.acepta_aviso_privacidad,
         c.c1_checkin, c.c2_bitacora, c.c3_apoyo, c.c4_analitica, c.c5_contacto,
         c.registrado_en
  FROM consentimientos c
  JOIN politicas_privacidad p ON p.id = c.politica_id
  WHERE c.usuario_id = $1
  ORDER BY c.registrado_en DESC
  LIMIT 1;
  ```

#### 6. `createConsentEvent({ id, userId, politicaId, tipoEvento, flags, ipOrigen })`
* **Consulta SQL**:
  ```sql
  INSERT INTO consentimientos (
      id, usuario_id, politica_id, tipo_evento,
      acepta_politica, acepta_aviso_privacidad,
      c1_checkin, c2_bitacora, c3_apoyo, c4_analitica, c5_contacto,
      ip_origen, registrado_en
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
  RETURNING id, registrado_en;
  ```

---

### C. `checkinRepository.js`

#### 7. `create({ id, userId, asignacionId, journeyKey, checkinDate, energia, cargaEmocional, recuperacion, apoyo, distanciamiento, ineficacia })`
* **Consulta SQL**:
  ```sql
  INSERT INTO daily_checkins (
      id, usuario_id, asignacion_id, journey_key, checkin_date,
      energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia,
      submitted_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
  RETURNING id, checkin_date, submitted_at;
  ```

#### 8. `findByUserAndDate(userId, checkinDate)`
* **Consulta SQL**:
  ```sql
  SELECT id, usuario_id, checkin_date, energia, carga_emocional, recuperacion,
         apoyo, distanciamiento, ineficacia, submitted_at
  FROM daily_checkins
  WHERE usuario_id = $1 AND checkin_date = $2;
  ```

#### 9. `findHistoryByUser(userId, limit = 30)`
* **Consulta SQL**:
  ```sql
  SELECT id, checkin_date, energia, carga_emocional, recuperacion,
         apoyo, distanciamiento, ineficacia, submitted_at
  FROM daily_checkins
  WHERE usuario_id = $1
  ORDER BY checkin_date DESC
  LIMIT $2;
  ```

---

### D. `journalRepository.js` (Inviolable)

#### 10. `create({ id, userId, asignacionId, entryDate, context, content })`
* **Consulta SQL**:
  ```sql
  INSERT INTO bitacoras (id, usuario_id, asignacion_id, entry_date, context, content, created_at)
  VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
  RETURNING id, entry_date, context, content, created_at;
  ```

#### 11. `findByUserId(userId)`
* **Invariante de Aislamiento**:
  ```sql
  SELECT id, entry_date, context, content, analysis_json, created_at
  FROM bitacoras
  WHERE usuario_id = $1
  ORDER BY created_at DESC;
  ```
* *Nota de Auditoría*: Bajo ninguna circunstancia esta consulta omite `WHERE usuario_id = $1`.

---

### E. `analyticsRepository.js` ($k$-Anonimato)

#### 12. `countDistinctParticipants({ campanaId, equipoId, desde, hasta })`
* **Consulta SQL**:
  ```sql
  SELECT COUNT(DISTINCT d.usuario_id) AS cohort_count
  FROM daily_checkins d
  LEFT JOIN asignaciones_usuario_equipo a ON a.id = d.asignacion_id
  LEFT JOIN equipos e ON e.id = a.equipo_id
  WHERE ($1::varchar IS NULL OR e.campana_id = $1)
    AND ($2::varchar IS NULL OR e.id = $2)
    AND ($3::date IS NULL OR d.checkin_date >= $3)
    AND ($4::date IS NULL OR d.checkin_date <= $4);
  ```

#### 13. `getAggregatedAverages({ campanaId, equipoId, desde, hasta })`
* **Consulta SQL**:
  ```sql
  SELECT 
      ROUND(AVG(d.energia), 2) AS energia_avg,
      ROUND(AVG(d.carga_emocional), 2) AS carga_emocional_avg,
      ROUND(AVG(d.recuperacion), 2) AS recuperacion_avg,
      ROUND(AVG(d.apoyo), 2) AS apoyo_avg,
      ROUND(AVG(d.distanciamiento), 2) AS distanciamiento_avg,
      ROUND(AVG(d.ineficacia), 2) AS ineficacia_avg
  FROM daily_checkins d
  LEFT JOIN asignaciones_usuario_equipo a ON a.id = d.asignacion_id
  LEFT JOIN equipos e ON e.id = a.equipo_id
  WHERE ($1::varchar IS NULL OR e.campana_id = $1)
    AND ($2::varchar IS NULL OR e.id = $2)
    AND ($3::date IS NULL OR d.checkin_date >= $3)
    AND ($4::date IS NULL OR d.checkin_date <= $4);
  ```

---

### F. `sstRepository.js`

#### 14. `findAlerts(filters)`
* **Consulta SQL**:
  ```sql
  SELECT a.id, r.nombre AS regla_nombre, c.nombre AS campana_nombre,
         e.nombre AS equipo_nombre, a.alert_date, a.severity,
         a.respondents, a.status, a.description
  FROM sst_alertas a
  JOIN reglas_alerta r ON r.id = a.regla_id
  JOIN campanas c ON c.id = a.campana_id
  JOIN equipos e ON e.id = a.equipo_id
  ORDER BY a.alert_date DESC;
  ```

#### 15. `createIntervention(data)`
* **Consulta SQL**:
  ```sql
  INSERT INTO sst_intervenciones (
      id, alerta_id, title, type, campana_id, equipo_id, creator_id,
      assigned_to, status, start_date, end_date, indicator, baseline, progress, target_desc
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Activa', $9, $10, $11, $12, 0, $13)
  RETURNING id, status, created_at;
  ```

#### 16. `findSupportRequests()`
* **Consulta SQL (Preservación de Anonimato)**:
  ```sql
  SELECT s.id, s.code, s.mode, s.request_date, s.reason, s.description,
         s.urgency, s.status,
         CASE WHEN s.mode = 'anonimo' THEN NULL ELSE CONCAT(u.nombres, ' ', u.apellidos) END AS solicitante
  FROM solicitudes_apoyo s
  LEFT JOIN usuarios u ON u.id = s.identity_user_id
  ORDER BY s.request_date DESC;
  ```

---

## 4. Reglas Estrictas de Implementación
1. **Todas las funciones son asíncronas (`async/await`)**.
2. **Utilizar `query(sql, params)` de `../db.js`**.
3. **Mapeo Limpio**: Retornar filas limpias (`res.rows[0]` para búsquedas unívocas o `res.rows` para colecciones).
4. **Cero concatenaciones dinámicas de texto**: Cada variable de filtro debe enviarse como parámetro posicional (`$1`, `$2`, etc.) para inmunizar el sistema contra inyecciones SQL.
