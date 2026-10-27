# [SPEC-026] Bpo Liberty Real Ecosystem And Alerts

Date: 2026-10-27

## 0. Clarification and Assumptions
- **Contexto Operativo:** Simulación de una operación de Contact Center para BPO Liberty atendiendo la cuenta de telecomunicaciones MásMóvil.
- **Estructura DDL:** No se modifica el esquema relacional existente de PostgreSQL (`DDL`, tablas, columnas y constraints permanecen intactos).
- **Cero Alertas Hardcoded:** Las tablas `sst_alertas`, `sst_intervenciones` y `seguimientos_intervencion` se inicializan vacías; las alertas deben ser emitidas exclusivamente por el motor de evaluación semanal (`weeklyAlertService.js`).
- **Credenciales Maestras Preservadas:** Se conservan los correos de prueba principales con contraseña unificada `Pulso360#2026`.

## 1. Need and scope
- **Necesidad:** Para sustentar y evaluar de forma creíble la plataforma en un entorno universitario con rigor de producción, se requiere reemplazar los datos residuales de testing (campañas con nombres de herramientas de prueba y usuarios de fixtures) por un ecosistema relacional de 100 agentes en 5 campañas operativas reales de Contact Center.
- **Alcance:**
  1. Script de seeding profesional `backend/database/seed_bpo_ecosystem.js` idempotente que limpie tablas transaccionales e inserte:
     - 5 campañas reales: Cobranzas Mora, Retención VIP, Soporte Técnico, SAC Care y Ventas Portabilidad.
     - 100 agentes con nombres realistas, rol `AGENTE`, contraseñas bcrypt válidas y asignaciones de equipo.
     - Consentimientos informados granulares C1–C5 vigentes para la política `v3.003`.
     - 4 semanas de check-ins diarios (`daily_checkins`) con distribuciones diferenciadas de las 6 dimensiones por campaña.
  2. Disparo orgánico de alertas mediante la ejecución de `runAlerts.js` / `weeklyAlertService.js`.
  3. Demostración funcional dual de k-anonimato: equipos con $N \ge 5$ con métricas y alertas activas, y equipo de Ventas con $N=3 < 5$ con supresión de datos y tarjeta de protección.

## 2. Acceptance Criteria and Non-Goals
- **AC-01 [functional]:** El script `seed_bpo_ecosystem.js` limpia e inserta las 5 campañas BPO, sus equipos, los roles administrativos (`admin`, `sst`, `supervisor`, `auditor`) y 100 agentes con contraseñas `Pulso360#2026` válidas.
- **AC-02 [functional]:** Se registran en `daily_checkins` al menos 1.500 registros cubriendo 4 semanas para los agentes, vinculados a consentimientos C1–C5 válidos bajo la política `v3.003`.
- **AC-03 [functional]:** El job de backend (`npm --prefix backend run job:alerts -- --database pulso360_db`) evalúa las semanas cerradas y genera de forma orgánica al menos 1 alerta en `sst_alertas` con evidencia histórica calculada sin alertas pre-quemadas.
- **AC-04 [functional]:** La consulta del equipo de Ventas Portabilidad ($N=3$) activa la regla de k-anonimato devolviendo `protected: true` y renderizando la tarjeta de protección en `/supervisor/panel`.
- **AC-05 [functional]:** Los cuatro quality gates del proyecto (`npm --prefix backend test`, `npm --prefix frontend test`, `npm --prefix frontend run lint` y `npm --prefix frontend run build`) se ejecutan con código de salida 0.

### Non-Goals
- No modificar el esquema DDL de la base de datos (tablas, columnas ni tipos de datos).
- No reintroducir archivos mock, almacenamiento local simulado ni bifurcaciones en el frontend.
- No alterar contratos de API REST ni componentes de UI existentes.

## 3. Domain applicability
| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | Sí | Los datos de check-in y consentimientos se asocian mediante UUIDs a usuarios simulados. No se expone información personal en promedios colectivos. |
| **Does it expose cross-tenant data?** | N/A | Monotenant académico para operación de Contact Center Liberty / MásMóvil. |
| **Does it require audit logging?** | Sí | La creación de usuarios, consentimientos y ejecuciones de job generan trazabilidad en `auditoria_logs` con hash SHA-256. |
| **Does it access or process sensitive data?** | Sí | Las dimensiones del check-in se protegen mediante k-anonimato ($k \ge 5$) evaluado en `analyticsService.js`. |

## 4. Experience and limits
- Las pantallas de SST y Supervisor consumirán datos reales desde PostgreSQL a través de la API Express.
- El panel de Supervisor mostrará métricas colectivas cuando el ámbito seleccionado tenga $N \ge 5$, y la tarjeta de bloqueo cuando $N < 5$.

## 5. Traceability
- `AC-01` $\rightarrow$ `backend/database/seed_bpo_ecosystem.js` (Estructura de usuarios y campañas).
- `AC-02` $\rightarrow$ `backend/database/seed_bpo_ecosystem.js` (Generación de check-ins y consentimientos).
- `AC-03` $\rightarrow$ `backend/src/jobs/runAlerts.js` y `backend/src/application/services/weeklyAlertService.js`.
- `AC-04` $\rightarrow$ `backend/src/domain/privacyRules.js` y `frontend/src/features/supervisor/pages/TeamDashboardPage.jsx`.
- `AC-05` $\rightarrow$ Scripts de verificación `test` y `build` en `backend` y `frontend`.
