# P06 · Middleware — Control de Acceso, Validación y Consentimiento

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P06 · middleware`
* **Componente C4**: `C03 · Acceso y consentimiento`
* **Tecnología**: Middlewares de Express 5 (`req, res, next`)

---

## 2. Middlewares Especificados

### A. `authMiddleware.js` (Autenticación JWT)
* **Objetivo**: Extraer, verificar y decodificar el token JWT de la cabecera HTTP.
* **Cabecera Requerida**: `Authorization: Bearer <token>`
* **Comportamiento**:
  * Si la cabecera no existe o no tiene el prefijo `Bearer `: retorna `401 Unauthorized` con código `AUTH_TOKEN_MISSING`.
  * Si el token expiró o su firma es inválida: retorna `401 Unauthorized` con código `AUTH_TOKEN_INVALID`.
  * Si es válido: inyecta en la petición `req.user = { id, email, name, role, teamId }` y ejecuta `next()`.

### B. `rbacMiddleware.js` (Control de Acceso Basado en Roles)
* **Objetivo**: Restringir endpoints a uno o varios roles canónicos (`agente`, `supervisor`, `sst`, `auditor`, `admin`).
* **Firma**: `requireRole(allowedRoles = [])`
* **Comportamiento**:
  * Si `req.user.role` no está incluido en `allowedRoles`: retorna `403 Forbidden` con código `AUTH_FORBIDDEN_ROLE`.
  * Si el rol está autorizado: invoca `next()`.

### C. `consentMiddleware.js` (Verificación de Consentimiento Informado)
* **Objetivo**: Cumplir con la Ley 1581 de 2012 para tratamiento de datos sensibles.
* **Comportamiento**:
  * Antes de permitir crear check-ins o bitácoras, verifica que el usuario tenga registrado `c1_checkin = true`.
  * Si no tiene consentimiento activo: retorna `403 Forbidden` con código `CONSENT_REQUIRED`.

### D. `errorMiddleware.js` (Manejador Central de Excepciones)
* **Objetivo**: Capturar cualquier error no controlado y devolver una respuesta estandarizada.
* **Formato de Respuesta**:
  ```json
  {
    "success": false,
    "error": {
      "message": "Mensaje legible del error",
      "code": "INTERNAL_SERVER_ERROR"
    }
  }
  ```
