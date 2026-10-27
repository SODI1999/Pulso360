# [TASKS-026] Scope-derived work

- [x] TASK-01 / AC-01: Construir el script `backend/database/seed_bpo_ecosystem.js` con las 5 campañas de BPO Liberty / MásMóvil, los 100 agentes con contraseñas `Pulso360#2026`, roles maestros y asignaciones de equipo.
- [x] TASK-02 / AC-02: Generar e insertar al menos 1.500 check-ins en `daily_checkins` cubriendo las últimas 4 semanas con perfiles emocionales diferenciados y consentimientos C1–C5 bajo la política `v3.003`.
- [x] TASK-03 / AC-03: Ejecutar el seeder y disparar el job de backend `runAlerts.js` / `weeklyAlertService.js` para generar alertas orgánicas en `sst_alertas`.
- [x] TASK-04 / AC-04: Validar la regla de k-anonimato ($N=3 < 5$) en el equipo de Ventas Portabilidad verificando la respuesta `{ protected: true }`.
- [x] TASK-05 / AC-05: Ejecutar los quality gates del proyecto (`backend test`, `frontend test`, `frontend lint`, `frontend build`) y certificar código de salida 0.
