# P10 · Infrastructure / Repositories — Acceso a Datos SQL Nativo

## 1. Responsabilidad
Esta subcapa aloja las funciones de consulta y persistencia directa contra PostgreSQL usando el pool de `src/infrastructure/db.js`.

---

## 2. Catálogo de Repositorios Previstos
1. **`userRepository.js`**: Consultas a la tabla `users` (por ID, por email) y actualización de estados/contraseñas.
2. **`consentRepository.js`**: Consultas y actualizaciones a la tabla `user_consents`.
3. **`checkinRepository.js`**: Inserción de check-ins diarios, consulta por fecha/usuario e historial.
4. **`journalRepository.js`**: Inserción y consulta de bitácoras del agente autor (**obligatorio `WHERE user_id = $1`**).
5. **`analyticsRepository.js`**: Consultas agregadas de tendencias con recuento de `COUNT(DISTINCT user_id)`.
6. **`sstRepository.js`**: Consultas y mutaciones de alertas (`sst_alerts`), intervenciones (`sst_interventions`) y solicitudes (`support_requests`).
7. **`auditRepository.js`**: Inserción de eventos en `audit_logs`.

---

## 3. Reglas de Codificación
* Todas las funciones deben ser asíncronas (`async/await`).
* Utilizar `query(sqlText, [param1, param2...])` importado de `../db.js`.
* Retornar filas limpias (`res.rows` o `res.rows[0]`), nunca el objeto `QueryResult` completo sin procesar.
