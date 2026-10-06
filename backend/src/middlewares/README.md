# Middleware vigente

`authMiddleware.js` contiene las dos funciones utilizadas por las rutas:

- `authenticate`: requiere Bearer JWT, firma HS256 con configuración validada, usuario activo y `auth_version` vigente. Token ausente: `AUTH_TOKEN_MISSING`; formato/firma/expiración: `AUTH_TOKEN_INVALID`; sesión revocada: `AUTH_SESSION_REVOKED`. Los casos de token retornan 401. Configuración JWT insegura produce error interno y el arranque normal se rechaza antes de escuchar.
- `requireRole(allowedRoles)`: compara roles canónicos del perfil consultado en servidor (AGENTE, SUPERVISOR, SST, AUDITOR, ADMIN). Rol no permitido: 403 `AUTH_FORBIDDEN_ROLE`.

No existen archivos separados `rbacMiddleware.js`, `consentMiddleware.js` ni `errorMiddleware.js`. Las finalidades se comprueban en los servicios de aplicación usando la política vigente: C1 check-in, C2 bitácora, C3 adicional para análisis/apoyo y C4 agregación. C5 no sustituye autorización de acompañamiento voluntario.

La titularidad y los ámbitos se comprueban además en servicios/repositorios; ocultar controles no autoriza una operación. El manejador de excepciones vive en `src/app.js` y devuelve `{ success:false,error:{message,code} }`, con mensajes públicos seguros para errores 5xx. Health devuelve su propio estado degraded/503 y código público sin detalles PostgreSQL.
