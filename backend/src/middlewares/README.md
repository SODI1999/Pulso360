# Middleware vigente (Arquitectura Modular SDD)

La capa de middlewares (`backend/src/middlewares/`) implementa filtros de seguridad, autorización y transporte conforme al Principio de Responsabilidad Única (SRP):

### 1. `authMiddleware.js` (Autenticación / AuthN)
- `authenticate`: Valida cabecera `Authorization: Bearer <token>`, firma criptográfica HS256 con clave simétrica robusta (`JWT_SECRET`), existencia de usuario activo en base de datos y coherencia de versión de sesión (`auth_version`). Token ausente: 401 `AUTH_TOKEN_MISSING`; formato o firma inválida: 401 `AUTH_TOKEN_INVALID`; sesión revocada tras reseteo: 401 `AUTH_SESSION_REVOKED`.
- Re-exporta `requireRole` desde `rbacMiddleware.js` para mantener retrocompatibilidad total con las rutas existentes.

### 2. `rbacMiddleware.js` (Control de Acceso / AuthZ)
- `requireRole(allowedRoles)`: Compara el rol canónico autenticado (`AGENTE`, `SUPERVISOR`, `SST`, `AUDITOR`, `ADMIN`) contra la lista de roles permitidos para la ruta. Acceso sin rol autorizado: 403 `AUTH_FORBIDDEN_ROLE`.

### 3. `errorMiddleware.js` (Manejo Centralizado de Excepciones)
- `notFoundHandler`: Captura peticiones a rutas inexistentes y devuelve respuesta semántica 404 (`RESOURCE_NOT_FOUND`).
- `errorHandler`: Middleware global de captura de excepciones no controladas `(err, req, res, next)`. Formatea la respuesta con el sobre unificado `{ success: false, error: { message, code } }` y previene fugas de información interna en errores 5xx.

Las finalidades de tratamiento de datos personales se comprueban en los servicios de aplicación conforme a la política vigente (C1 check-in, C2 bitácora, C3 análisis/apoyo y C4 agregación). La titularidad de los registros se valida a nivel de servicio y repositorio; ocultar controles en la interfaz no autoriza una operación.
