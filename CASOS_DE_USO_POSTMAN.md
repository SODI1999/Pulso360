# Guía Maestra de Postman y Casos de Uso — Pulso360 API

> **Objetivo:** Demostrar ante el docente y jurado el **ciclo CRUD completo (Create, Read, Update, Delete)**, la autenticación multi-rol con JWT, la protección de rutas mediante middlewares (RBAC y Fail-Fast) y el cumplimiento de la Ley 1581 de 2012 / SG-SST en la API REST de **Pulso360**.

---

## 1. ¿Tiene Postman Desktop MCP o Cómo se Conecta?

**Respuesta clara:**
Postman Desktop **no expone un servidor MCP nativo** para ser controlado de forma remota por herramientas de IA como si fuera un navegador. 

**¿Por qué es esto mejor para tu sustentación?**
En una sustentación universitaria de Ingeniería de Software (PPI), el docente busca evaluar **tu dominio de la herramienta** y la arquitectura de tu API. Si una IA lo controlara por ti, perderías credibilidad.

Por ello, hemos configurado la arquitectura más profesional y rápida:
1. **Colección Preconfigurada:** `Pulso360_Postman_Collection.json` (todas las peticiones ordenadas y con scripts automáticos de prueba).
2. **Entorno de Variables:** `Pulso360.postman_environment.json` (guarda tokens e IDs generados automáticamente; **no tienes que copiar ni pegar nada a mano**).
3. **Importación en 2 Clics:** Arrastras los dos archivos a Postman Desktop y listo.

---

## 2. Instrucciones Rápidas de Configuración (Importar en 1 Minuto)

1. **Abre Postman Desktop**.
2. Haz clic en el botón **Import** (o presiona `Ctrl + O`).
3. Arrastra a la ventana los siguientes 2 archivos ubicados en la raíz del proyecto:
   - `Pulso360_Postman_Collection.json`
   - `Pulso360.postman_environment.json`
4. En la esquina superior derecha de Postman, en el selector de entornos (**Environment**), selecciona:
   👉 **`Pulso360 — Localhost Environment`**.
5. Asegúrate de que el backend esté encendido en la terminal:
   ```bash
   npm --prefix backend start
   # o bien: cd backend && npm start
   ```
   *(Verificable en `http://localhost:3000/api/v1/health`)*

---

## 3. Credenciales Maestras del Proyecto

Todas las cuentas del ecosistema BPO Liberty utilizan la misma contraseña institucional:

| Rol | Correo Institucional | Contraseña | Alcance Funcional |
| :--- | :--- | :--- | :--- |
| **AGENTE** | `agente@pulso360.co` | `Pulso360#2026` | Check-in diario, Bitácora privada, Solicitudes de apoyo, Habeas Data. |
| **SUPERVISOR** | `supervisor@pulso360.co` | `Pulso360#2026` | Planes de acción asignados, Registro de avance y seguimiento BPO. |
| **SST** | `sst@pulso360.co` | `Pulso360#2026` | Métricas k-anónimas, Alertas psicosociales, Planes de intervención, Reglas. |
| **ADMIN** | `admin@pulso360.co` | `Pulso360#2026` | Directorio de usuarios, Campañas, Equipos, Parámetros y Políticas. |
| **AUDITOR** | `auditor@pulso360.co` | `Pulso360#2026` | Registro inmutable de logs, Integridad criptográfica, Exportación. |

---

## 4. 🌟 Guión de Demostración Rápida al Docente (El CRUD en 2 Minutos)

Si el profesor te dice: *"Muéstrame el CRUD completo funcionando en Postman"*, abre la primera carpeta de la colección:
📁 **`⭐ 1. DEMO RÁPIDA CRUD COMPLETO (Demostración al Docente)`** y ejecuta las peticiones en orden:

### Paso 1: Iniciar Sesión (Autenticación JWT)
- **Petición:** `1.1 [POST] Iniciar Sesión (Login Agente)`
- **Acción:** Presiona **Send**.
- **Respuesta esperada:** `200 OK`. Devuelve el objeto `data.token`.
- **Lo que ocurre detrás:** El script de Postman guarda automáticamente el token en la variable `{{token}}` y `{{token_agente}}`.
- **Qué decirle al profesor:** *"Iniciamos sesión con credenciales cifradas con bcrypt; el servidor responde con un token JWT firmado criptográficamente que autoriza las siguientes peticiones."*

### Paso 2: [C]REATE — Crear Bitácora
- **Petición:** `1.2 [POST] [C]REATE — Crear Bitácora Personal`
- **Acción:** Presiona **Send**.
- **Respuesta esperada:** `201 Created`. Devuelve `id: "jou-xxxx..."`.
- **Lo que ocurre detrás:** Postman captura el `id` recién generado y lo guarda en la variable `{{journal_id}}`.
- **Qué decirle al profesor:** *"Creamos un nuevo registro de bitácora privada. El backend persiste la entrada en PostgreSQL y devuelve código 201 Created con su identificador único."*

### Paso 3: [R]EAD — Listar y Verificar Registro
- **Petición:** `1.3 [GET] [R]EAD — Listar Bitácoras y Verificar Creación`
- **Acción:** Presiona **Send**.
- **Respuesta esperada:** `200 OK`. 
- **Verificación automática:** En la pestaña **Test Results**, verás en verde: `PASS: El registro recién creado aparece en el listado`.
- **Qué decirle al profesor:** *"Consultamos las bitácoras del usuario mediante GET. El test automatizado de Postman recorre el arreglo y certifica que el ID generado en el paso anterior está en la base de datos."*

### Paso 4: [U]PDATE — Modificar Registro (PUT)
- **Petición:** `1.4 [PUT] [U]PDATE — Modificar Contenido de la Bitácora`
- **Acción:** Presiona **Send**.
- **Respuesta esperada:** `200 OK`. Devuelve el registro modificado con `context: "Sustentación Docente (Actualizado)"`.
- **Verificación automática:** `PASS: Campos actualizados correctamente en base de datos`.
- **Qué decirle al profesor:** *"Aplicamos una actualización mediante método HTTP PUT sobre el recurso con ID `{{journal_id}}`, modificando el contexto y contenido de manera controlada."*

### Paso 5: [D]ELETE — Eliminar Registro Físico
- **Petición:** `1.5 [DELETE] [D]ELETE — Eliminar la Bitácora Creada`
- **Acción:** Presiona **Send**.
- **Respuesta esperada:** `200 OK` con `deleted: true`.
- **Verificación automática:** `PASS: Confirmación de borrado físico en base de datos`.
- **Qué decirle al profesor:** *"Ejecutamos el borrado del recurso con método HTTP DELETE. El backend procesa la eliminación atómica y responde 200 OK confirmando la supresión."*

### Paso 6: Verificación Post-Borrado (Garantía de Integridad)
- **Petición:** `1.6 [GET] [R]EAD Post-Borrado — Verificar que ya NO existe`
- **Acción:** Presiona **Send**.
- **Respuesta esperada:** `200 OK`.
- **Verificación automática:** `PASS: El registro eliminado ya NO existe en la base de datos`.
- **Qué decirle al profesor:** *"Volvemos a consultar la lista y el test automatizado comprueba que el ID eliminado ya no existe. Con esto queda demostrado el ciclo CRUD completo (Create, Read, Update, Delete) de forma ineludible."*

---

## 5. 🌟 CRUD de Gestión de Usuarios (Módulo Administrador)

Si el profesor pide: *"Muéstrame el CRUD de administración o gestión de usuarios"*, abre la carpeta:
📁 **`⭐ 2. DEMO CRUD ADMINISTRACIÓN (Gestión de Usuarios)`**:

1. **`2.1 [POST] Iniciar Sesión (Login Administrador)`**: Autentica al Administrador y actualiza `{{token}}`.
2. **`2.2 [GET] [R]EAD — Listar Usuarios del Sistema`**: Retorna el catálogo de más de 100 usuarios del centro de operaciones BPO.
3. **`2.3 [POST] [C]REATE — Crear Nuevo Usuario Agente`**: Genera dinámicamente un correo único (`agente_postman_xxxx@pulso360.co`) y crea el usuario, capturando `{{new_user_id}}`.
4. **`2.4 [PATCH] [U]PDATE — Modificar Estado de Usuario (Suspendido)`**: Modifica el usuario vía PATCH.
5. **`2.5 [PATCH] [U]PDATE Status — Cambiar Estado a Inactivo`**: Desactiva el usuario en el sistema.

---

## 6. Estructura Completa de la Colección (9 Módulos)

La colección `Pulso360_Postman_Collection.json` está dividida en 9 carpetas que cubren el 100% de la API:

```text
📦 Pulso360 — Suite de Pruebas API
 ┣ 📂 ⭐ 1. DEMO RÁPIDA CRUD COMPLETO (Demostración al Docente)
 ┣ 📂 ⭐ 2. DEMO CRUD ADMINISTRACIÓN (Gestión de Usuarios)
 ┣ 📂 3. Autenticación y Control de Acceso (5 Roles)
 ┣ 📂 4. Módulo Agente (Bienestar & Privacidad)
 ┣ 📂 5. Módulo SST & Salud Ocupacional
 ┣ 📂 6. Módulo Supervisor (Operación BPO)
 ┣ 📂 7. Módulo Administración (Empresa, Campañas, Parámetros)
 ┣ 📂 8. Módulo Auditoría & Ley 1581 (Trazabilidad Inmutable)
 ┗ 📂 9. Middlewares, Seguridad y Validación (Pruebas Negativas)
```

### 9. Pruebas Negativas y Manejo de Errores (Middlewares Fail-Fast)
Si el docente pregunta: *"¿Qué pasa si mandan un token falso, no mandan nada o mandan un rol equivocado?"*:

| Petición | Condición de Prueba | Código Esperado | Mensaje / Código de Error |
| :--- | :--- | :--- | :--- |
| **9.1 Token Ausente** | Petición a ruta privada sin encabezado `Authorization` | `401 Unauthorized` | `AUTH_TOKEN_MISSING` |
| **9.2 Token Falso/Corrupto** | Petición con `Bearer token_falso_y_corrupto_123` | `401 Unauthorized` | `AUTH_TOKEN_INVALID` |
| **9.3 Violación RBAC** | Supervisor intenta consultar bitácoras privadas de un agente | `403 Forbidden` | `AUTH_FORBIDDEN_ROLE` |
| **9.4 Body Vacío** | POST a `/auth/login` con body `{}` | `400 Bad Request` | `AUTH_MISSING_FIELDS` |
| **9.5 Longitud Mínima** | POST a `/agent/journal` con texto menor a 5 caracteres | `400 Bad Request` | `JOURNAL_CONTENT_EMPTY` |
| **9.6 Ruta Inexistente** | GET a `/esta-ruta-no-existe...` | `404 Not Found` | `RESOURCE_NOT_FOUND` |

---

## 7. Ejecución Masiva Automatizada (Collection Runner)

Si el profesor pide: *"Corre toda la colección de pruebas para ver cuántas pasan"*:
1. Haz clic derecho sobre el nombre de la colección: **`Pulso360 — Suite de Pruebas API`**.
2. Selecciona **Run collection**.
3. Asegúrate de que el entorno seleccionado sea **`Pulso360 — Localhost Environment`**.
4. Haz clic en el botón azul **Run Pulso360**.
5. Postman ejecutará todas las peticiones secuencialmente, mostrando una cascada de **checks verdes (PASS)**.
