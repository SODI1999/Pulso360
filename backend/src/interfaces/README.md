# P05 · Interfaces / HTTP — Especificación Canónica de Contratos REST (SDD)

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P05 · interfaces/http`
* **Componente C4**: `C02 · API REST /api/v1`
* **Framework**: Express.js 5 (`express.Router()`)
* **Prefijo Global**: `/api/v1`
* **Estándar Formal OpenAPI 3.1**: Disponible en archivo ejecutable [`contracts/openapi.json`](contracts/openapi.json).
* **Políticas de Red**: CORS restringido al cliente web (`http://localhost:5173`).

---

## 2. Matriz Maestra de Endpoints y Trazabilidad PPI

| Método | Endpoint | Roles Permitidos | Requisito PPI | Propósito Principal |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | RNF-03 | Comprobación de disponibilidad de servidor y PostgreSQL. |
| `POST` | `/auth/login` | Público | RF-01 | Autenticación con email/password y expedición de JWT. |
| `GET` | `/auth/me` | Todos (JWT) | RF-01 | Obtención de identidad, rol y equipo del usuario activo. |
| `POST` | `/auth/logout` | Todos (JWT) | RF-01 | Cierre de sesión y revocación en cliente. |
| `GET` | `/agent/consent` | `AGENTE` | RF-02 | Consulta de estado de consentimiento C1..C5 (Ley 1581). |
| `PUT` | `/agent/consent` | `AGENTE` | RF-02 | Actualización granular de consentimientos informados. |
| `GET` | `/agent/checkin/today` | `AGENTE` | RF-03 | Consulta si el agente ya completó su check-in en la jornada. |
| `POST` | `/agent/checkin` | `AGENTE` | RF-03 | Registro diario de las 6 dimensiones de bienestar. |
| `GET` | `/agent/checkin/history`| `AGENTE` | RF-03 | Historial personal de check-ins del propio agente. |
| `GET` | `/agent/journal` | `AGENTE` | RF-04 | **Inviolable**: Listado de bitácoras del propio autor. |
| `POST` | `/agent/journal` | `AGENTE` | RF-04 | **Inviolable**: Nueva entrada privada de desahogo emocional. |
| `GET` | `/sst/metrics` | `SST`, `SUPERVISOR` | RF-07 | Métricas agregadas con supresión de $k$-anonimato ($k \ge 5$). |
| `GET` | `/sst/alerts` | `SST` | RF-08 | Consulta de alertas tempranas automáticas generadas. |
| `GET` | `/sst/interventions` | `SST` | RF-09 | Consulta de planes de acción y mitigación activos. |
| `POST` | `/sst/interventions` | `SST` | RF-09 | Creación de plan de intervención preventiva psicosocial. |
| `GET` | `/sst/support-requests`| `SST` | RF-10 | Bandeja de acompañamiento (anonimato preservado si aplica). |
| `POST` | `/sst/support-requests`| `AGENTE` | RF-10 | Radicación voluntaria de solicitud de apoyo psicosocial. |

---

## 3. Especificación Detallada de Contratos (Fichas Técnicas SDD)

---

### Endpoints del Módulo de Autenticación (`/auth`)

#### 1. `POST /api/v1/auth/login`
* **Autenticación**: Pública.
* **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "correo": "agente@pulso360.co",
  "contrasena": "Pulso360#2026"
}
```
* `correo` *(string, obligatorio, formato email)*.
* `contrasena` *(string, obligatorio, mínimo 6 caracteres)*.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "usuario": {
        "id": "usr-1",
        "correo": "agente@pulso360.co",
        "nombres": "Laura",
        "apellidos": "Gomez",
        "rol": "AGENTE"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```
* `400 Bad Request` (`AUTH_MISSING_FIELDS`): Faltan campos requeridos en el body.
* `401 Unauthorized` (`AUTH_INVALID_CREDENTIALS`): Correo o contraseña erróneos.
* `403 Forbidden` (`AUTH_ACCOUNT_BLOCKED`): Cuenta bloqueada por superar 5 intentos fallidos consecutivos.

---

#### 2. `GET /api/v1/auth/me`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: Cualquier rol autenticado.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "id": "usr-1",
      "correo": "agente@pulso360.co",
      "nombres": "Laura",
      "apellidos": "Gomez",
      "rol": "AGENTE",
      "equipo": {
        "id": "team-alpha-1",
        "nombre": "Equipo Alpha 1",
        "campana": "Campaña Soporte Alpha"
      }
    }
  }
  ```
* `401 Unauthorized` (`AUTH_TOKEN_MISSING` o `AUTH_TOKEN_INVALID`).

---

### Endpoints del Módulo de Agente (`/agent`)

#### 3. `GET /api/v1/agent/consent`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "politica_version": "v2.4",
      "acepta_politica": true,
      "acepta_aviso_privacidad": true,
      "c1_checkin": true,
      "c2_bitacora": true,
      "c3_apoyo": true,
      "c4_analitica": true,
      "c5_contacto": true,
      "registrado_en": "2026-08-15T05:00:00.000Z"
    }
  }
  ```

---

#### 4. `PUT /api/v1/agent/consent`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.

**Request Body**:
```json
{
  "c1_checkin": true,
  "c2_bitacora": false,
  "c3_apoyo": true,
  "c4_analitica": true,
  "c5_contacto": false
}
```

**Respuestas**:
* `200 OK`: Retorna el estado actualizado y genera evento auditable en `auditoria_logs`.
* `400 Bad Request` (`CONSENT_INVALID_PAYLOAD`): Campos no booleanos o formato erróneo.

---

#### 5. `GET /api/v1/agent/checkin/today`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "completed": true,
      "checkin": {
        "id": "chk-1",
        "checkin_date": "2026-10-02",
        "energia": 4,
        "carga_emocional": 3,
        "recuperacion": 4,
        "apoyo": 5,
        "distanciamiento": 1,
        "ineficacia": 2,
        "submitted_at": "2026-10-02T13:12:00.000Z"
      }
    }
  }
  ```

---

#### 6. `POST /api/v1/agent/checkin`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.
* **Precondición**: El usuario debe tener `c1_checkin = true`.

**Request Body**:
```json
{
  "journey_key": "2026-10-02",
  "energia": 4,
  "carga_emocional": 3,
  "recuperacion": 4,
  "apoyo": 5,
  "distanciamiento": 1,
  "ineficacia": 2
}
```
* Las 6 dimensiones son **obligatorias** y deben ser enteros estrictos entre **1 y 5**.

**Respuestas**:
* `201 Created`:
  ```json
  {
    "success": true,
    "data": {
      "id": "chk-102",
      "checkin_date": "2026-10-02",
      "submitted_at": "2026-10-02T14:45:00.000Z"
    }
  }
  ```
* `400 Bad Request` (`CHECKIN_INVALID_DIMENSIONS`): Algún valor no es entero o está fuera de [1..5].
* `403 Forbidden` (`CONSENT_C1_REQUIRED`): El agente no ha otorgado el consentimiento C1.
* `409 Conflict` (`CHECKIN_ALREADY_REGISTERED_TODAY`): Ya se completó el check-in diario para la fecha.

---

#### 7. `GET /api/v1/agent/journal`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.
* **Invariante de Privacidad**: La consulta SQL ejecuta estrictamente `WHERE usuario_id = $1`. Jamás se exponen a supervisores ni SST.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "jrn-1",
        "entry_date": "2026-10-02",
        "context": "Turno tarde",
        "content": "Jornada intensa con muchas llamadas de soporte...",
        "analysis_json": { "categorias": ["SOBRECARGA"] },
        "created_at": "2026-10-02T18:32:05.000Z"
      }
    ]
  }
  ```

---

#### 8. `POST /api/v1/agent/journal`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.
* **Precondición**: Requiere `c2_bitacora = true`.

**Request Body**:
```json
{
  "context": "Cierre de turno",
  "content": "Hoy experimenté bastante agotamiento tras tres llamadas complejas de soporte."
}
```

**Respuestas**:
* `201 Created`:
  ```json
  {
    "success": true,
    "data": {
      "id": "jrn-2",
      "entry_date": "2026-10-02",
      "context": "Cierre de turno",
      "content": "Hoy experimenté bastante agotamiento...",
      "created_at": "2026-10-02T19:00:00.000Z"
    }
  }
  ```
* `400 Bad Request` (`JOURNAL_CONTENT_EMPTY`): Contenido inferior a 5 caracteres o vacío.
* `403 Forbidden` (`CONSENT_C2_REQUIRED`): Falta consentimiento C2 para desahogo personal.

---

### Endpoints del Módulo de SST y Supervisión (`/sst`)

#### 9. `GET /api/v1/sst/metrics`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `SST`, `SUPERVISOR`.
* **Query Parameters**:
  * `campana_id` *(opcional)*
  * `equipo_id` *(opcional)*
  * `desde` *(opcional, date YYYY-MM-DD)*
  * `hasta` *(opcional, date YYYY-MM-DD)*

**Comportamiento $k$-Anonimato**:
* **Si $\text{cohort\_count} \ge 5$**:
  ```json
  {
    "success": true,
    "data": {
      "protected": false,
      "cohort_count": 14,
      "k_threshold": 5,
      "metrics": {
        "energia_avg": 3.42,
        "carga_emocional_avg": 3.85,
        "recuperacion_avg": 2.91,
        "apoyo_avg": 4.10,
        "distanciamiento_avg": 2.12,
        "ineficacia_avg": 2.05
      }
    }
  }
  ```
* **Si $\text{cohort\_count} < 5$ (Supresión de Privacidad)**:
  ```json
  {
    "success": true,
    "data": {
      "protected": true,
      "reason": "Muestra insuficiente para garantizar k-anonimato (k < 5)",
      "cohort_count": 3,
      "k_threshold": 5,
      "metrics": null
    }
  }
  ```

---

#### 10. `GET /api/v1/sst/alerts`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `SST`.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "alt-1",
        "regla_nombre": "Caida sostenida de recuperacion",
        "campana_nombre": "Campaña Soporte Alpha",
        "equipo_nombre": "Equipo Alpha 1",
        "alert_date": "2026-10-02",
        "severity": "Alta",
        "respondents": 14,
        "status": "GENERADA",
        "description": "La recuperación agregada descendió durante 3 semanas consecutivas."
      }
    ]
  }
  ```

---

#### 11. `POST /api/v1/sst/interventions`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `SST`.

**Request Body**:
```json
{
  "alerta_id": "alt-1",
  "title": "Pausas cognitivas de recuperación",
  "type": "Pausas activas coordinadas",
  "campana_id": "camp-1",
  "equipo_id": "team-alpha-1",
  "assigned_to": "usr-2",
  "start_date": "2026-10-05",
  "end_date": "2026-10-25",
  "indicator": "Recuperacion agregada",
  "target_desc": "Mejorar percepción de recuperación en un 15%"
}
```

**Respuestas**:
* `201 Created`:
  ```json
  {
    "success": true,
    "data": {
      "id": "int-99",
      "status": "Activa",
      "created_at": "2026-10-02T15:00:00.000Z"
    }
  }
  ```
* `400 Bad Request` (`INTERVENTION_MISSING_REQUIRED_FIELDS`).

---

#### 12. `GET /api/v1/sst/support-requests`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `SST`.
* **Regla de Privacidad**: Si `mode = 'anonimo'`, el campo `solicitante` retorna `null` y el ID del usuario se suprime en la respuesta HTTP.

**Respuestas**:
* `200 OK`:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "req-1",
        "code": "ANON-2026-0982",
        "mode": "anonimo",
        "request_date": "2026-10-01",
        "reason": "Sobrecarga percibida",
        "description": "Quisiera orientación para manejar una semana difícil.",
        "urgency": "media",
        "status": "Recibida",
        "solicitante": null
      }
    ]
  }
  ```

---

#### 13. `POST /api/v1/sst/support-requests`
* **Autenticación**: Requerida (`Authorization: Bearer <jwt>`).
* **Roles**: `AGENTE`.

**Request Body**:
```json
{
  "mode": "anonimo",
  "reason": "Sobrecarga percibida",
  "description": "Quisiera orientación para manejar una semana difícil.",
  "urgency": "media",
  "contact_preference": "app"
}
```

**Respuestas**:
* `201 Created`:
  ```json
  {
    "success": true,
    "data": {
      "id": "req-102",
      "code": "ANON-2026-4412",
      "sla": "24 h habiles",
      "status": "Recibida"
    }
  }
  ```

---

## 4. Diccionario Canónico de Códigos de Error

| Código de Error (`error.code`) | HTTP Status | Causa Raíz |
| :--- | :--- | :--- |
| `AUTH_MISSING_FIELDS` | `400 Bad Request` | Correo o contraseña no suministrados en payload. |
| `AUTH_INVALID_CREDENTIALS` | `401 Unauthorized` | Correo no existe o hash bcrypt no coincide. |
| `AUTH_TOKEN_MISSING` | `401 Unauthorized` | Falta la cabecera `Authorization: Bearer <token>`. |
| `AUTH_TOKEN_INVALID` | `401 Unauthorized` | Token JWT manipulado o expirado. |
| `AUTH_FORBIDDEN_ROLE` | `403 Forbidden` | El rol del token no cuenta con privilegios en el endpoint. |
| `AUTH_ACCOUNT_BLOCKED` | `403 Forbidden` | Superó el límite de 5 intentos fallidos consecutivos. |
| `CONSENT_C1_REQUIRED` | `403 Forbidden` | El agente no ha otorgado consentimiento C1 para check-in. |
| `CONSENT_C2_REQUIRED` | `403 Forbidden` | El agente no ha otorgado consentimiento C2 para bitácora. |
| `CHECKIN_INVALID_DIMENSIONS` | `400 Bad Request` | Alguna de las 6 dimensiones no es un entero entre 1 y 5. |
| `CHECKIN_ALREADY_REGISTERED_TODAY` | `409 Conflict` | Ya existe un registro para la fecha actual de turno. |
| `JOURNAL_CONTENT_EMPTY` | `400 Bad Request` | El texto de la bitácora contiene menos de 5 caracteres. |
| `RESOURCE_NOT_FOUND` | `404 Not Found` | El ID solicitado no existe en la base de datos. |
| `INTERNAL_SERVER_ERROR` | `500 Internal Error` | Error de consulta SQL o fallo no controlado de Node.js. |
