# P07 · Application — Casos de Uso y Servicios de Negocio

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P07 · application`
* **Componentes C4**: `C04 · Servicios de negocio` y `C05 · Analítica y reportes`
* **Naturaleza**: Orquestación de casos de uso del sistema sin acoplamiento a HTTP ni a SQL directo.

---

## 2. Servicios de Aplicación Especificados

### A. `authService.js` (Casos de Uso de Autenticación)
* `login(email, password)`: Busca usuario por email, compara contraseña con `bcrypt`, genera token JWT con payload `{ id, email, role, teamId }` y retorna `{ user, token }`.
* `getProfile(userId)`: Recupera los datos de perfil del usuario sin incluir el hash de contraseña.

### B. `agentService.js` (Casos de Uso del Agente)
* `registerCheckin(userId, data)`: Valida dimensiones (1 a 5), verifica que no exista check-in previo para la fecha y persiste en repositorio.
* `getDailyCheckin(userId, date)`: Consulta el check-in registrado para una fecha dada.
* `createJournalEntry(userId, data)`: Registra la entrada privada en la bitácora del agente.
* `getJournalEntries(userId)`: Recupera únicamente las entradas del agente autenticado.

### C. `analyticsService.js` (Casos de Uso de Analítica y Reportes)
* `getAggregatedMetrics(filters)`:
  1. Invoca al repositorio para consultar el recuento de participantes distintos.
  2. Evalúa la regla de dominio de k-anonimato ($k \ge 5$).
  3. Si $k < 5$: retorna estado protegido suprimiendo las métricas individuales.
  4. Si $k \ge 5$: calcula y retorna los promedios agregados por dimensión.

### D. `sstService.js` (Casos de Uso de SST)
* `getAlerts()`: Recupera alertas preventivas registradas.
* `getInterventions()`: Recupera intervenciones y planes de acción activos.
* `createIntervention(creatorId, data)`: Registra una nueva intervención preventiva.
* `getSupportRequests()`: Recupera solicitudes de acompañamiento garantizando anonimato en aquellas que así lo requieran.
