# P09 · Jobs — Procesador y Planificador de Tareas

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P09 · jobs`
* **Componentes C4**: `C06 · Procesador de tareas` y `C12 · Planificador de tareas`
* **Naturaleza**: Procesamiento en segundo plano y tareas programadas.

---

## 2. Job semanal implementado

`alertScheduler.js` coordina el servicio `weeklyAlertService.js`; todo SQL permanece en repositorios. El planificador se integra al arranque de la API únicamente con `ALERT_JOB_ENABLED=true`. No requiere dependencias nuevas, SMTP ni un proceso externo. Consulta cada minuto si existe un cierre pendiente; no recalcula la semana continuamente.

- Semanas lunes-domingo, según `America/Bogota`. La última semana cerrada vence para evaluación el lunes a las 06:00. Los resultados corresponden a los datos disponibles al ejecutar el cierre; registros tardíos no reescriben alertas anteriores.
- Primer arranque: evalúa la última semana vencida. Luego recupera cierres pendientes desde su cursor persistido, en grupos de hasta ocho por pasada. No produce un backfill ilimitado al activar el componente.
- Solo reglas `activa=true` y `pending_approval=false`. Las reglas históricas activas conservan su condición. Una aprobación posterior al cierre no genera alertas retrospectivas para ese periodo.
- Ámbitos: equipos y campañas activos por ID. `cualquier equipo` evalúa cada equipo activo por separado. Una campaña específica usa el agregado de sus equipos activos.
- Fuente: check-ins y analítica existentes, con C4 y política vigente. Cada dimensión y cada semana necesita al menos k=5 participantes distintos, también en la semana de comparación. Omisiones, falta de semanas o muestra protegida se registran como `INSUFFICIENT_DATA`, sin evidencia numérica.
- Recuperación, carga emocional, ineficacia y distanciamiento usan su dimensión existente. La escala de paneles se conserva: promedio 1..5 multiplicado por 20. No es una probabilidad ni un instrumento clínico.
- `supere`/`supere el`: valor estrictamente mayor al umbral durante 2, 3 o 4 semanas consecutivas.
- `baje más de`/`baje mas de`: caída porcentual relativa `(anterior-actual)/anterior*100`, estrictamente mayor al umbral en cada transición. Tres descensos requieren cuatro semanas evaluables; un rebote rompe la condición. No son puntos porcentuales.
- `Sobrecarga percibida` permanece `UNSUPPORTED_METRIC`: no se sustituye por carga emocional ni se lee la bitácora para completarla. Condiciones históricas incompatibles quedan sin evaluar con motivo explícito.

## 3. Persistencia, privacidad y reintentos

La migración incremental `004_weekly_alert_job` agrega cursor, ejecuciones, resultados sin valores personales y metadatos de evaluación en `sst_alertas`. No modifica alertas históricas ni habilita el proceso. Necesita aprobación específica para aplicarse a una base compartida o real.

Un bloqueo transaccional PostgreSQL evita solapamiento entre procesos. Cada cierre se confirma atómicamente junto con sus alertas, auditoría y cursor. Un fallo revierte esos cambios, registra `FAILED` con código genérico y permite reintentar. Un índice único por regla/campaña/equipo/periodo impide duplicados; un reintento no reabre alertas descartadas o intervenidas.

La evidencia contiene valores y periodos colectivos, sin titulares ni bitácoras. `respondents` representa el mínimo de participantes de la dimensión entre las semanas usadas. Los eventos automáticos llevan `source=weekly-alert-job`, sin atribuirse a un usuario o inventar un rol.

## 4. Operación

Desde `backend/`, tras aplicar la migración en el destino autorizado:

```powershell
# Prueba separada; no usar NODE_ENV=test para la base principal.
$env:NODE_ENV='test'
$env:DB_NAME_TEST='pulso360_plan_test_20261005'
npm run db:migrate -- --database pulso360_plan_test_20261005
npm run job:alerts -- --database pulso360_plan_test_20261005
```

El comando manual exige un destino explícito y procesa únicamente cierres vencidos. Para ejecución automática, configurar `ALERT_JOB_ENABLED=true` en el servidor y reiniciar la API después de la migración autorizada. El computador y la API deben estar encendidos; al volver se recuperan cierres desde el cursor. La migración no se aplica al arrancar.

## 5. Límites conservados

El análisis de bitácoras continúa en el motor léxico determinista del frontend y guarda su resultado mediante la API. No se añadió análisis diferido de textos, retención automática, envío de alertas por correo, asignación automática de responsables ni intervención automática. SST conserva la revisión y decisión de intervención. SMTP de recuperación sigue pendiente de configuración externa.
