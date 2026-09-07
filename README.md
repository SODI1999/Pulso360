# Pulso360: Sistema de Monitoreo de Bienestar Laboral

Documento Tecnico del Proyecto en React
Asignatura: Construccion de Software 3
Institucion: Institucion Universitaria Tecnologico de Antioquia (TdeA)
Stack Frontend: React 18, Vite, React Router DOM, CSS Vanilla Modular (Design Tokens)
Arquitectura: Modular basada en caracteristicas (Feature-Driven), Principio de Responsabilidad Unica (SRP) y Clean Code

---

## 1. Informacion General

Pulso360 es una plataforma tecnologica orientada al monitoreo continuo de percepciones de bienestar y a la deteccion temprana de tendencias colectivas de desgaste en operaciones de BPO (Business Process Outsourcing).

El sistema esta disenado bajo principios de Privacidad desde el Diseno (Privacy by Design), cumplimiento de la Ley 1581 de 2012 y lineamientos de Seguridad y Salud en el Trabajo (Resolucion 2646 de 2008 y Resolucion 2764 de 2022). No realiza diagnosticos clinicos ni comparte respuestas individuales con supervisores o lideres operativos.

---

## 2. Decisiones Arquitectonicas

1. Enfoque Modular por Caracteristicas (Feature-Driven): Cada contexto de negocio (Autenticacion, Agente, Supervisor, SST, Auditoria, Administracion) reside en su propia carpeta bajo `src/features/`.
2. Principio de Responsabilidad Unica (SRP): Separacion clara entre la vista (componentes JSX), la gestion del estado y los servicios/adaptadores de persistencia.
3. Componentes Generales vs. Especificos:
   - Componentes Generales: Ubicados en `src/core/components/` para ser reutilizados por todos los roles (`AppLayout`, `ProtectedRoute`, `Icon`, `InactivityModal`, `TrendLineChart`).
   - Componentes Especificos: Alojados dentro de la carpeta `components/` de cada modulo (`LoginForm`, `DemoAccountsCard`, etc.).
4. Preparacion para Backend Futuro (Node.js + Express + PostgreSQL):
   - Todas las llamadas a repositorios son asincronas (`async/await`) y devuelven Promesas.
   - En la fase actual leen y escriben en `pulsoStore` (persistencia simulada en `localStorage` con estructura relacional).
   - Cuando el backend en Express este desarrollado, solo se reemplazara el adaptador de acceso a datos sin necesidad de modificar los componentes de React.
5. Iconografia Profesional: Cero emojis o librerias pesadas. Iconos vectoriales nativos centralizados en `src/core/components/Icon.jsx`.

---

## 3. Estado Actual del Proyecto

El Hito 1 se encuentra completado al 100%, verificado contra los requisitos del documento de especificacion ERS:

- RF-01 (Autenticacion y RBAC): Login con derivacion automatica de rol, validacion previa, control de envio duplicado con spinner, bloqueo por 5 intentos fallidos y destruccion de sesiones residuales.
- RF-02 (Consentimiento Informado Granular): Presentacion de version vigente (v2.4), matriz C1 a C5 voluntaria e independiente, aceptacion de politica separada, explicacion de consecuencias, reconsentimiento e historial inmutable.
- RF-18 (Seguridad y Recuperacion): Solicitud de recuperacion con mensaje neutro, tokens demo con vigencia de 30 minutos, formulario con contrasena minima de 12 caracteres, medidor de fortaleza en tiempo real y cierre forzoso de sesiones.

---

## 4. Estructura de Directorios

```text
Pulso360/
├── public/
│   └── assets/
│       ├── evidencias/
│       └── imágenes/
│
├── src/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── authService.js
│   │   │   └── ProtectedRoute.jsx
│   │   ├── components/
│   │   │   ├── Icon.jsx
│   │   │   ├── InactivityModal.jsx
│   │   │   └── PlaceholderView.jsx
│   │   ├── layout/
│   │   │   └── AppLayout.jsx
│   │   └── storage/
│   │       └── pulsoStore.js
│   │
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── DemoAccountsCard.jsx
│   │       │   └── LoginForm.jsx
│   │       └── pages/
│   │           ├── ConsentPage.jsx
│   │           ├── ForbiddenPage.jsx
│   │           ├── ForgotPasswordPage.jsx
│   │           ├── LoginPage.jsx
│   │           └── ResetPasswordPage.jsx
│   │
│   ├── styles/
│   │   ├── auth.css
│   │   ├── bitacora.css
│   │   ├── components.css
│   │   ├── consentimiento.css
│   │   ├── documentacion.css
│   │   ├── generated-utilities.css
│   │   ├── layout.css
│   │   ├── styles.css
│   │   ├── tokens.css
│   │   └── umbral.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 5. Roadmap de Migracion

El proceso de migracion se estructura en siete hitos de ejecucion secuencial:

### Hito 1: Modulo de Autenticacion, Consentimiento y Seguridad (Estado: Completado)
- Creacion del almacen central `pulsoStore.js` con datos semilla y registro de auditoria encadenada.
- Servicio `authService.js` con control de intentos fallidos y derivacion de roles.
- Componente centralizado de iconografia vectorial `Icon.jsx`.
- Componentes `LoginForm.jsx` y `DemoAccountsCard.jsx`.
- Vistas `LoginPage.jsx`, `ConsentPage.jsx`, `ForgotPasswordPage.jsx` y `ResetPasswordPage.jsx`.
- Blindaje de seguridad contra sesiones residuales.

### Hito 2: Nucleo de Layout, Navegacion y Seguridad (Estado: Completado)
- Implementacion de `ProtectedRoute.jsx` para control de acceso por roles (RBAC) y auditoria inmutable.
- Implementacion de `AppLayout.jsx` con sidebar dinamico segun rol/consentimientos y topbar con contador de avisos.
- Temporizador de inactividad de 30 minutos con modal de advertencia de 60 segundos (`InactivityModal.jsx`).
- Vista de acceso denegado (`ForbiddenPage.jsx` / 403).
- Configuracion del arbol de rutas maestras en `App.jsx` y vista provisional `PlaceholderView.jsx`.

### Hito 3: Modulo Agente - Experiencia Individual (Estado: Pendiente)
- Motor lexico determinista en JavaScript puro (`nlpEngine.js`) con 8 categorias, negaciones e intensificadores.
- Componente de graficas nativas en Canvas 2D (`TrendLineChart.jsx`).
- Formulario de Check-in diario por pasos con escala 1 a 5, atajos de teclado y opcion de no respuesta (`CheckinWizardPage.jsx`).
- Bitacora privada con advertencia de datos de terceros, analisis NLP y modal de correccion manual (`JournalPage.jsx`).
- Vistas de bienestar personal, desglose analitico, solicitudes de acompanamiento y modulo de Habeas Data.

### Hito 4: Modulo Supervisor - Monitoreo Operativo (Estado: Pendiente)
- Panel de indicadores de equipo (`TeamDashboardPage.jsx`).
- Aplicacion estricta de umbral de privacidad (k-anonimato N >= 5) con bloqueo visual si el equipo no cumple la cuota.
- Registro y seguimiento de acciones operativas de apoyo (`ActionsPage.jsx`).

### Hito 5: Modulo SST - Vigilancia Epidemiologica y Alertas (Estado: Pendiente)
- Servicio de umbrales y supresion secundaria (`thresholdService.js`).
- Mapa de calor organizacional por dimensiones de desgaste (`HeatmapGrid.jsx`).
- Bandeja de alertas operativas con transicion de estados (Generada, En revision, Atendida).
- Parametrizacion de reglas de disparo de alertas preventivas.
- Formulacion de planes de intervencion colectiva y buzon de solicitudes de acompanamiento.

### Hito 6: Modulos Administrador y Auditor - Gobierno y Trazabilidad (Estado: Pendiente)
- Gestion de sedes, campanas y equipos organizacionales.
- Administracion de usuarios y asignacion de roles.
- Parametrizacion de umbrales, SLAs y versiones de politicas.
- Importacion masiva de datos simulada mediante archivos CSV.
- Atencion de solicitudes legales de privacidad (Habeas Data).
- Registro inmutable de auditoria con verificacion de cadena de hashes criptograficos simulados.

### Hito 7: Vistas Compartidas, Integracion y Cierre (Estado: Pendiente)
- Landing page institucional y demostracion interactiva (`LandingPage.jsx`).
- Centro de notificaciones operativas con marcado de leido/no leido y filtrado por rol.
- Modulo de generacion y exportacion de reportes consolidados (CSV, PDF, JSON).
- Directorio de recursos de apoyo en crisis con atencion 24/7.
- Pruebas de paridad funcional y accesibilidad (ARIA) contra la maqueta original.

---

## 6. Instalacion y Ejecucion Local

1. Clonar el repositorio y ubicarse en la carpeta del proyecto:
   ```bash
   cd Pulso360
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador la direccion provista por Vite (habitualmente `http://localhost:5173`).

---

## 7. Credenciales de Prueba

| Perfil | Correo Electronico | Contrasena | Destino Inicial |
| :--- | :--- | :--- | :--- |
| Agente | agente@demo | 123456 | Consentimiento (v2.4) o Panel Personal |
| Supervisor | supervisor@demo | 123456 | Panel de Equipo |
| Profesional SST | sst@demo | 123456 | Panel Agregado y Alertas |
| Auditor | auditor@demo | 123456 | Registro de Auditoria |
| Administrador | admin@demo | 123456 | Gestion Organizacional |

---

## 8. Estandar de Commits (Conventional Commits)

El proyecto adopta la convencion de Conventional Commits para mantener un historial de cambios claro, trazable y legible:

### Estructura del Mensaje
```text
<tipo>(<alcance>): <descripcion breve en espanol>
```

### Tipos Permitidos
- feat: Nueva caracteristica o funcionalidad implementada.
- fix: Correccion de un error o brecha funcional.
- refactor: Reestructuracion interna de codigo sin alterar la logica de negocio.
- style: Cambios de formato, estilos CSS, espaciado o apariencia visual.
- docs: Actualizaciones en documentacion, archivos README o diagramas.
- chore: Tareas de configuracion de herramientas, dependencias o mantenimiento.

### Ejemplos Aplicados al Proyecto
- feat(auth): implementar modulo de autenticacion y consentimiento versionado
- fix(auth): corregir padding de icono en contrasena y destruir sesion residual
- docs(readme): incorporar roadmap formal y estandar de commits
- feat(layout): implementar estructura de shell con sidebar dinamico y topbar

