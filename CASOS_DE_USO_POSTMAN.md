# Casos de Uso para Pruebas Manuales en Postman — Pulso360 API

Este documento contiene la guía paso a paso de los casos de uso para demostrar manualmente en **Postman**:
1. **Middlewares** (`authMiddleware` y `rbacMiddleware`).
2. **Validaciones de campos vacíos** (cuerpos vacíos y strings de espacios en blanco).
3. **Validaciones de campos erróneos y tipos** (tipos incompatibles, longitudes mínimas y credenciales inválidas).
4. **Manejadores de error** (`notFoundHandler` 404 y `errorHandler` centralizado).
5. **Ciclo CRUD Completo** (Create, Read, Update, Delete sobre bitácoras).

---

## Parámetros Globales

- **Base URL:** `http://localhost:3000/api/v1`
- **Servidor:** Asegurarse de tener el backend corriendo (`cd backend && npm run dev` o `npm start`).

### Credenciales de Prueba

| Rol | Correo Institucional | Contraseña |
| :--- | :--- | :--- |
| **AGENTE** | `agente@pulso360.co` | `Pulso360#2026` |
| **SUPERVISOR** | `supervisor@pulso360.co` | `Pulso360#2026` |
| **ADMIN** | `admin@pulso360.co` | `Pulso360#2026` |

---

## Paso 0: Obtención de Tokens para las Pruebas

### Caso 0.1: Login como Agente (Obtener Token)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "correo": "agente@pulso360.co",
    "contrasena": "Pulso360#2026"
  }
  ```
- **Código esperado:** `200 OK`
- **Acción:** Copiar el valor de `"token"` recibido en el JSON de respuesta. En los siguientes casos se referenciará como `<TOKEN_AGENTE>`.

---

### Caso 0.2: Login como Supervisor (Obtener Token)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "correo": "supervisor@pulso360.co",
    "contrasena": "Pulso360#2026"
  }
  ```
- **Código esperado:** `200 OK`
- **Acción:** Copiar el valor de `"token"` recibido. Se referenciará como `<TOKEN_SUPERVISOR>`.

---

## 1. Demostración de Middlewares

### Caso 1: Middleware de Autenticación (`authMiddleware`) — Token Ausente
*Demuestra que el middleware bloquea cualquier petición a una ruta protegida si no se envía la cabecera `Authorization`.*

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:** *(Ninguno, dejar sin header de Authorization)*
- **Código esperado:** `401 Unauthorized`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Token ausente",
      "code": "AUTH_TOKEN_MISSING"
    }
  }
  ```

---

### Caso 2: Middleware de Autenticación (`authMiddleware`) — Token Inválido o Falso
*Demuestra que el middleware verifica criptográficamente la firma del JWT y rechaza tokens manipulados o no emitidos por la aplicación.*

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Authorization`: `Bearer token_falso_o_corrupto_123`
- **Código esperado:** `401 Unauthorized`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Token inválido o expirado",
      "code": "AUTH_TOKEN_INVALID"
    }
  }
  ```

---

### Caso 3: Middleware de Roles (`rbacMiddleware`) — Rol No Autorizado
*Demuestra el Control de Acceso Basado en Roles (RBAC): un Supervisor intenta acceder a la bitácora privada de un Agente y es rechazado para salvaguardar la privacidad.*

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Authorization`: `Bearer <TOKEN_SUPERVISOR>`
- **Código esperado:** `403 Forbidden`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Rol no autorizado",
      "code": "AUTH_FORBIDDEN_ROLE"
    }
  }
  ```

---

## 2. Validaciones de Campos Vacíos (Fail-Fast)

### Caso 4: Campos Requeridos Ausentes (Body Vacío `{}`)
*Demuestra que el middleware de validación (`validateBody`) rechaza la petición inmediatamente antes de llegar al controlador cuando faltan claves obligatorias.*

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {}
  ```
- **Código esperado:** `400 Bad Request`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Correo y contraseña son obligatorios",
      "code": "AUTH_MISSING_FIELDS"
    }
  }
  ```

---

### Caso 5: Campo Vacío con Solo Espacios en Blanco
*Demuestra que la validación aplica `.trim()` y detecta campos de texto que contienen únicamente espacios en blanco.*

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Body (raw JSON):**
  ```json
  {
    "context": "Turno Mañana",
    "content": "      "
  }
  ```
- **Código esperado:** `400 Bad Request`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "El contenido de la bitácora no puede estar vacío o tener menos de 5 caracteres",
      "code": "JOURNAL_CONTENT_EMPTY"
    }
  }
  ```

---

## 3. Validaciones de Campos Erróneos y Tipos

### Caso 6: Tipo de Dato Inválido (Número en vez de String)
*Demuestra que el middleware valida tipos estrictos (Type Checking) y no permite números donde se requiere texto.*

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Body (raw JSON):**
  ```json
  {
    "context": "Turno Mañana",
    "content": 999999
  }
  ```
- **Código esperado:** `400 Bad Request`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "El campo 'content' debe ser de tipo string.",
      "code": "JOURNAL_CONTENT_EMPTY"
    }
  }
  ```

---

### Caso 7: Longitud Mínima Insuficiente (< 5 caracteres)
*Demuestra la regla de negocio que restringe entradas de bitácora triviales o con menos de 5 caracteres.*

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Body (raw JSON):**
  ```json
  {
    "context": "Turno Mañana",
    "content": "hola"
  }
  ```
- **Código esperado:** `400 Bad Request`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "El contenido de la bitácora no puede estar vacío o tener menos de 5 caracteres",
      "code": "JOURNAL_CONTENT_EMPTY"
    }
  }
  ```

---

### Caso 8: Credenciales Erróneas (Contraseña Equivocada)
*Demuestra la verificación segura con hash bcrypt ante una contraseña errónea.*

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "correo": "agente@pulso360.co",
    "contrasena": "PasswordErronea#123"
  }
  ```
- **Código esperado:** `401 Unauthorized`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Credenciales inválidas",
      "code": "AUTH_INVALID_CREDENTIALS"
    }
  }
  ```

---

## 4. Manejadores de Error (Error Handlers)

### Caso 9: `notFoundHandler` — Ruta No Mapeada en la API (404)
*Demuestra que el middleware final de Express captura rutas inexistentes devolviendo el sobre de error canónico SDD.*

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/esta-ruta-no-existe-en-el-backend`
- **Headers:** *(Ninguno)*
- **Código esperado:** `404 Not Found`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "La ruta 'GET /api/v1/esta-ruta-no-existe-en-el-backend' no existe en esta versión de la API.",
      "code": "RESOURCE_NOT_FOUND"
    }
  }
  ```

---

### Caso 10: `errorHandler` Centralizado — Recurso Inexistente (`AppError` 404)
*Demuestra que las excepciones de dominio lanzadas con `AppError` en los servicios son capturadas por el manejador global de errores.*

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/agent/journal/jou-id-que-no-existe-999`
- **Headers:**
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Código esperado:** `404 Not Found`
- **Respuesta esperada:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Bitácora no encontrada o no pertenece al usuario",
      "code": "JOURNAL_NOT_FOUND"
    }
  }
  ```

---

## 5. Ciclo CRUD Completo (Paso a Paso)

Este ciclo se ejecuta sobre el recurso de **Bitácoras Privadas del Agente** (`/api/v1/agent/journal`).

### Caso 11: [C]REATE — Registrar Nueva Bitácora
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Body (raw JSON):**
  ```json
  {
    "context": "Cierre de Turno",
    "content": "Jornada completada con alto volumen de llamadas pero buen soporte del equipo."
  }
  ```
- **Código esperado:** `201 Created`
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "data": {
      "id": "jou-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "entry_date": "2026-10-14",
      "context": "Cierre de Turno",
      "content": "Jornada completada con alto volumen de llamadas pero buen soporte del equipo.",
      "created_at": "..."
    }
  }
  ```
- **Acción:** Copiar el valor de `"id"` generado (por ejemplo `jou-3f1b2c4d...`). Se referenciará como `<ID_CREADO>`.

---

### Caso 12: [R]EAD — Consultar Bitácoras del Agente
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Código esperado:** `200 OK`
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "<ID_CREADO>",
        "entry_date": "2026-10-14",
        "context": "Cierre de Turno",
        "content": "Jornada completada con alto volumen de llamadas pero buen soporte del equipo."
      }
    ]
  }
  ```
- *Verificar que el registro con `<ID_CREADO>` está en la lista.*

---

### Caso 13: [U]PDATE — Modificar Contenido de la Bitácora
*Reemplazar `<ID_CREADO>` en la URL por el ID obtenido en el Caso 11.*

- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/agent/journal/<ID_CREADO>`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Body (raw JSON):**
  ```json
  {
    "context": "Cierre de Turno Actualizado",
    "content": "EDICIÓN: Se realizó pausa activa de 10 minutos y disminuyó la fatiga cervical."
  }
  ```
- **Código esperado:** `200 OK`
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "data": {
      "id": "<ID_CREADO>",
      "content": "EDICIÓN: Se realizó pausa activa de 10 minutos y disminuyó la fatiga cervical.",
      "context": "Cierre de Turno Actualizado",
      "updated_at": "..."
    }
  }
  ```

---

### Caso 14: [D]ELETE — Eliminar la Bitácora
*Reemplazar `<ID_CREADO>` por el mismo ID.*

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/agent/journal/<ID_CREADO>`
- **Headers:**
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Código esperado:** `200 OK`
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "data": {
      "id": "<ID_CREADO>",
      "deleted": true
    }
  }
  ```

---

### Caso 15: Verificación Post-Borrado
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/agent/journal`
- **Headers:**
  - `Authorization`: `Bearer <TOKEN_AGENTE>`
- **Código esperado:** `200 OK`
- *Verificar que el registro con `<ID_CREADO>` ya NO aparece en el arreglo devuelto.*
