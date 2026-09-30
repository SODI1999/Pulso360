# P05 · Interfaces / HTTP — Rutas y Controladores REST

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P05 · interfaces/http`
* **Componente C4**: `C02 · API REST /api/v1`
* **Framework**: Express.js 5 (`express.Router()`)
* **Prefijo Global**: `/api/v1`

---

## 2. Catálogo de Contratos y Endpoints (REST API)

| Método | Ruta | Roles Permitidos | Requisito PPI | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | RNF-03 | Healthcheck de disponibilidad del servidor y base de datos. |
| `POST` | `/auth/login` | Público | RF-01 | Inicio de sesión con email y contraseña, retorno de JWT. |
| `GET` | `/auth/me` | Todos (con JWT) | RF-01 | Obtiene perfil y rol del usuario autenticado. |
| `POST` | `/auth/logout` | Todos (con JWT) | RF-01 | Cierre de sesión e invalidación. |
| `GET` | `/agent/consent` | `agente` | RF-02 | Consulta estado de consentimiento informado (C1–C5). |
| `PUT` | `/agent/consent` | `agente` | RF-02 | Actualiza preferencias de consentimiento granular. |
| `GET` | `/agent/checkin/today` | `agente` | RF-03 | Consulta si el agente ya completó el check-in del día. |
| `POST` | `/agent/checkin` | `agente` | RF-03 | Registra el check-in diario con las 6 dimensiones. |
| `GET` | `/agent/checkin/history`| `agente` | RF-03 | Consulta historial de check-ins propios del agente. |
| `GET` | `/agent/journal` | `agente` | RF-04 | **Privado**: Lista bitácoras del agente autenticado. |
| `POST` | `/agent/journal` | `agente` | RF-04 | **Privado**: Crea nueva entrada de desahogo en bitácora. |
| `GET` | `/sst/metrics` | `sst`, `supervisor` | RF-07 | Métricas agregadas por campaña (con k-anonimato $k \ge 5$). |
| `GET` | `/sst/alerts` | `sst` | RF-08 | Lista de alertas preventivas generadas. |
| `GET` | `/sst/interventions` | `sst` | RF-09 | Lista de intervenciones activas y planes de acción. |
| `POST` | `/sst/interventions` | `sst` | RF-09 | Crea nueva intervención preventiva. |
| `GET` | `/sst/support-requests`| `sst` | RF-10 | Bandeja de solicitudes de acompañamiento psicosocial. |

---

## 3. Estándar de Códigos de Respuesta HTTP
* `200 OK`: Operación de lectura o actualización exitosa.
* `201 Created`: Creación de recurso exitosa (check-in, bitácora, intervención).
* `400 Bad Request`: Payload malformado o campos faltantes.
* `401 Unauthorized`: Token ausente, inválido o expirado.
* `403 Forbidden`: Token válido pero rol insuficiente para el recurso.
* `404 Not Found`: Recurso no encontrado.
* `500 Internal Server Error`: Error interno de servidor o base de datos.
