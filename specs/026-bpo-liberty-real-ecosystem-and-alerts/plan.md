# [PLAN-026] Technical plan

## Evidence and existing architecture
- **Esquema de BD:** Monorepo con backend Express 5 y PostgreSQL. Tablas existentes: `usuarios`, `campanas`, `equipos`, `asignaciones_usuario_equipo`, `daily_checkins`, `consentimientos`, `politicas_privacidad`, `reglas_alerta`, `sst_alertas`, `sst_intervenciones`, `seguimientos_intervencion`, `auditoria_logs`.
- **Motor de Alertas Existente:** `backend/src/application/services/weeklyAlertService.js` evalúa semanas cerradas pasadas comparando snapshots de `analyticsRepository.js` contra reglas activas de `reglas_alerta`, e inserta alertas orgánicamente en `sst_alertas`.
- **Invariante de Privacidad:** `backend/src/domain/privacyRules.js` define `K_ANONYMITY_THRESHOLD = 5`.

## Proposed change
1. **Script de Seeder `backend/database/seed_bpo_ecosystem.js`:**
   - Limpia ordenadamente las tablas transaccionales bajo transacción SQL sin tocar el esquema DDL.
   - Siembra la configuración y la política legal `v3.003`.
   - Inserta las 5 campañas de BPO Liberty / MásMóvil:
     1. Cobranzas Mora Temprana
     2. Retención & Bajas VIP
     3. Soporte Técnico
     4. SAC Care (Atención al Cliente)
     5. Ventas Outbound (Portabilidad)
   - Inserta los 4 roles administrativos (`admin`, `sst`, `supervisor`, `auditor`) y 100 agentes con contraseñas `Pulso360#2026` hasheadas con `bcryptjs`.
   - Inserta consentimientos informados C1–C5 vigentes para todos los agentes.
   - Inserta 4 semanas de check-ins diarios (`daily_checkins`) con perfiles emocionales diferenciados por campaña:
     - Retención VIP (25 agentes): Descenso progresivo en recuperación ($70 \rightarrow 58 \rightarrow 45$).
     - Cobranzas (20 agentes): Carga emocional elevada persistente ($>75/100$).
     - SAC Care y Tech (52 agentes): Registros estables en rango saludable ($50-65/100$).
     - Ventas Portabilidad (3 agentes): Quórum reducido para comprobación de $N < 5$.
   - La tabla `sst_alertas` permanece vacía tras la ejecución del seeder.
2. **Ejecución Orgánica de Alertas:**
   - Invocación de `weeklyAlertService.js` a través del job de producción para evaluar semanas vencidas y generar alertas en `sst_alertas` con evidencia histórica real.
3. **Validación de Quality Gates:**
   - Verificación de no-regresión en pruebas de backend (132 tests) y frontend (41 tests).

## Contracts and compatibility
- **Contrato de Autenticación:** `POST /api/v1/auth/login` con `{ correo, contrasena }` devuelve usuario normalizado y JWT con roles en mayúsculas (`AGENTE`, `SUPERVISOR`, `SST`, `AUDITOR`, `ADMIN`).
- **Contrato de Métricas y k-Anonimato:** `GET /api/v1/sst/metrics` y `GET /api/v1/supervisor/metrics` retornan `protected: true` cuando $N < 5$.

## Technology, setup and documentation decisions
- Se utiliza `bcryptjs` (dependencia existente en backend) para hash de contraseñas.
- Se utiliza `pg` (cliente PostgreSQL existente) para la transacción del seeder.
- Documentación interna mediante JSDoc en el script de seeding.

## UI & Interaction Design
- N/A para nuevas vistas: Se reutilizan las pantallas existentes de SST, Supervisor y Agente, las cuales consumen los datos reales recién poblados.

## Verification
- `AC-01` $\rightarrow$ Conteo de usuarios y campañas en base de datos.
- `AC-02` $\rightarrow$ Conteo de filas en `daily_checkins` $\ge 1.500$.
- `AC-03` $\rightarrow$ Ejecución del job `weeklyAlertService` y verificación de filas en `sst_alertas`.
- `AC-04` $\rightarrow$ Consulta HTTP de métricas en equipo de Ventas comprobando `{ protected: true }`.
- `AC-05` $\rightarrow$ Quality gates: `npm test` en ambos proyectos, `lint` y `build`.

## Rollback / recovery
- El script de seeding es idempotente. Puede reejecutarse en cualquier momento para restaurar el estado base limpio.
