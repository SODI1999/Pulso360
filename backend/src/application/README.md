# P07 · Application — Especificación Formal de Casos de Uso y Servicios

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P07 · application`
* **Componentes C4**: `C04 · Servicios de negocio` y `C05 · Analítica y reportes`
* **Naturaleza**: Orquestación pura de casos de uso. Desacoplada de objetos HTTP (`req`, `res`) y de sentencias SQL directas.
* **Patrón de Retorno**: Métodos asíncronos que retornan objetos puros (DTOs) o lanzan `AppError` tipificados con código semántico y status HTTP sugerido.

---

## 2. Contratos de Servicios y Casos de Uso (SDD)

---

### A. `authService.js` (Casos de Uso de Autenticación y Perfil)

#### 1. `login({ correo, contrasena })`
* **Propósito**: Validar credenciales de acceso y generar sesión segura mediante JWT.
* **Entrada**:
  ```typescript
  { correo: string, contrasena: string }
  ```
* **Precondiciones**:
  * `correo` y `contrasena` no deben ser nulos ni vacíos.
* **Flujo del Caso de Uso**:
  1. Consultar usuario por correo en `userRepository.findByEmail(correo)`.
  2. Si no existe: registrar intento fallido y lanzar `AppError('Credenciales inválidas', 'AUTH_INVALID_CREDENTIALS', 401)`.
  3. Si existe, verificar `usuario.estado`: si no es `'Activo'`, lanzar `AppError('Usuario inactivo', 'AUTH_USER_INACTIVE', 403)`.
  4. Si `usuario.intentos_fallidos >= 5` y `bloqueado_hasta > NOW()`: lanzar `AppError('Cuenta bloqueada', 'AUTH_ACCOUNT_BLOCKED', 403)`.
  5. Comparar `contrasena` con `usuario.contrasena_hash` usando `bcrypt.compare`.
  6. Si no coincide: incrementar `intentos_fallidos` en BD. Si llega a 5, setear `bloqueado_hasta = NOW() + INTERVAL '15 MIN'`. Lanzar `AUTH_INVALID_CREDENTIALS`.
  7. Si coincide: restablecer `intentos_fallidos = 0`, generar token JWT firmado con payload `{ id: usuario.id, email: usuario.correo_institucional, role: usuario.rol_codigo }` (expiración: `JWT_EXPIRES_IN`, default 8h).
  8. Retornar DTO excluyendo `contrasena_hash`.
* **Retorno**:
  ```typescript
  {
    usuario: { id: string, correo: string, nombres: string, apellidos: string, rol: string },
    token: string
  }
  ```

#### 2. `getProfile(userId)`
* **Entrada**: `userId: string`
* **Flujo**:
  1. Invocar `userRepository.findProfileById(userId)`.
  2. Si no existe: lanzar `AppError('Usuario no encontrado', 'RESOURCE_NOT_FOUND', 404)`.
  3. Mapear datos con equipo y campaña activa.
* **Retorno**:
  ```typescript
  {
    id: string, correo: string, nombres: string, apellidos: string, rol: string,
    equipo: { id: string, nombre: string, campana: string } | null
  }
  ```

---

### B. `agentService.js` (Casos de Uso del Agente)

#### 3. `registerCheckin(userId, data)`
* **Propósito**: Registrar el estado de bienestar diario en 6 dimensiones.
* **Entrada**:
  ```typescript
  {
    journey_key?: string,
    energia: number,
    carga_emocional: number,
    recuperacion: number,
    apoyo: number,
    distanciamiento: number,
    ineficacia: number
  }
  ```
* **Precondiciones**:
  * Verificar consentimiento informado: `consentRepository.findActiveByUserId(userId)`. Si `c1_checkin !== true`, lanzar `AppError('Requiere consentimiento C1', 'CONSENT_C1_REQUIRED', 403)`.
  * Validar dimensiones: Cada una debe ser número entero en rango $[1, 5]$. De lo contrario, lanzar `AppError('Dimensiones inválidas', 'CHECKIN_INVALID_DIMENSIONS', 400)`.
* **Invariante de Idempotencia**:
  * Solo se admite un check-in por agente por fecha natural (`CURRENT_DATE`).
  * Consultar `checkinRepository.findByUserAndDate(userId, today)`. Si existe, lanzar `AppError('Check-in ya completado hoy', 'CHECKIN_ALREADY_REGISTERED_TODAY', 409)`.
* **Flujo**:
  1. Obtener la asignación activa del usuario: `userRepository.findActiveAssignment(userId)`.
  2. Insertar en `checkinRepository.create(...)`.
* **Retorno**:
  ```typescript
  { id: string, checkin_date: string, submitted_at: string }
  ```

#### 4. `getTodayCheckin(userId)`
* **Entrada**: `userId: string`
* **Retorno**:
  ```typescript
  { completed: boolean, checkin: CheckinDTO | null }
  ```

#### 5. `createJournalEntry(userId, { context, content })`
* **Propósito**: Espacio personal de desahogo emocional privado.
* **Precondición**:
  * Consentimiento `c2_bitacora === true`. Si no, lanzar `CONSENT_C2_REQUIRED` (403).
  * Longitud mínima de contenido $\ge 5$ caracteres. Si no, lanzar `JOURNAL_CONTENT_EMPTY` (400).
* **Invariante de Privacidad Absoluta**:
  * La inserción asocia estrictamente `usuario_id = userId`.
* **Flujo**:
  1. Insertar en `journalRepository.create({ userId, context, content })`.
  2. Emitir evento asíncrono o job para análisis léxico determinista (sin bloquear la respuesta).
* **Retorno**:
  ```typescript
  { id: string, entry_date: string, context: string, content: string, created_at: string }
  ```

#### 6. `getMyJournalEntries(userId)`
* **Invariante**: Invocar `journalRepository.findByUserId(userId)`. Solo devuelve las bitácoras del propio solicitante.

---

### C. `analyticsService.js` (Casos de Uso de Analítica y Privacidad k-Anonimato)

#### 7. `getAggregatedMetrics({ campanaId, equipoId, desde, hasta })`
* **Propósito**: Calcular promedios organizacionales respetando las salvaguardas éticas y legales.
* **Regla Inviolable de Dominio ($k$-anonimato, $k \ge 5$)**:
  1. Invocar al repositorio: `analyticsRepository.countDistinctParticipants({ campanaId, equipoId, desde, hasta })`.
  2. Evaluar:
     $$\text{cohortCount} = \text{COUNT(DISTINCT usuario\_id)}$$
  3. **Si $\text{cohortCount} < 5$**:
     * Suprimir métricas individuales y promedios.
     * Retornar objeto de protección:
       ```typescript
       {
         protected: true,
         reason: 'Muestra insuficiente para garantizar k-anonimato (k < 5)',
         cohort_count: cohortCount,
         k_threshold: 5,
         metrics: null
       }
       ```
  4. **Si $\text{cohortCount} \ge 5$**:
     * Consultar promedios agregados: `analyticsRepository.getAverages(...)`.
     * Retornar:
       ```typescript
       {
         protected: false,
         cohort_count: cohortCount,
         k_threshold: 5,
         metrics: {
           energia_avg: number,
           carga_emocional_avg: number,
           recuperacion_avg: number,
           apoyo_avg: number,
           distanciamiento_avg: number,
           ineficacia_avg: number
         }
       }
       ```

---

### D. `sstService.js` (Casos de Uso de Prevención e Intervenciones SST)

#### 8. `getAlerts(filters)`
* Recupera alertas automáticas generadas por el motor de reglas psicosociales (`sstRepository.findAlerts(filters)`).

#### 9. `createIntervention(creatorId, data)`
* **Precondición**: `data.title`, `data.type`, `data.campana_id`, `data.equipo_id`, `data.start_date` obligatorios.
* **Flujo**:
  1. Persistir en `sstRepository.createIntervention({ creatorId, ...data })`.
  2. Si `alerta_id` está presente, actualizar estado de la alerta a `'EN_INTERVENCION'`.
* **Retorno**:
  ```typescript
  { id: string, status: 'Activa', created_at: string }
  ```

#### 10. `getSupportRequests(filters)`
* **Invariante de Acompañamiento Confidencial**:
  * Si la solicitud tiene `mode === 'anonimo'`, el servicio omite intencionalmente cualquier información identificable del agente, manteniendo únicamente el código de seguimiento (ej. `ANON-2026-0982`).

---

## 3. Manejo Centralizado de Excepciones de Aplicación (`AppError`)

Todos los servicios lanzan instancias de la clase estándar `AppError`:
```javascript
export class AppError extends Error {
  constructor(message, code, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
```
El middleware centralizado `errorMiddleware.js` captura estas instancias y las traduce directamente al formato unificado `{ success: false, error: { message, code, details } }`.
