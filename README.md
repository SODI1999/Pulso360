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

Los Hitos 1, 2, 3, 4, 5, 6 y 7 se encuentran completados al 100%, verificados contra los requisitos del documento de especificacion ERS y con cero deuda tecnica:

- **Hito 1 - Autenticacion y Gobernanza**:
  - RF-01 (Autenticacion y RBAC): Login con derivacion automatica de rol, validacion previa, control de envio duplicado con spinner, bloqueo por 5 intentos fallidos y destruccion de sesiones residuales.
  - RF-02 (Consentimiento Informado Granular): Presentacion de version vigente (v2.4), matriz C1 a C5 voluntaria e independiente, aceptacion de politica separada, explicacion de consecuencias, reconsentimiento e historial inmutable.
  - RF-18 (Seguridad y Recuperacion): Solicitud de recuperacion con mensaje neutro, tokens demo con vigencia de 30 minutos, formulario con contrasena minima de 12 caracteres, medidor de fortaleza en tiempo real y cierre forzoso de sesiones.
- **Hito 2 - Shell, Navegacion y Control de Sesion**:
  - `AppLayout.jsx` con sidebar reactivo segun rol y permisos C1-C5.
  - `ProtectedRoute.jsx` con RBAC estricto y auditoria inmutable.
  - `InactivityModal.jsx` para cierre seguro de sesion por inactividad tras 30 minutos.
- **Hito 3 - Modulo Agente (Experiencia Individual y Bienestar)**:
  - RF-03 (Check-in Diario): Wizard de 6 pasos con ScaleSelector (1-5), atajos de teclado, omision consciente ("Prefiero no responder") y persistencia de borradores.
  - RF-04 (Visualizacion Individual): KPIs dinamicos de energia, carga y racha, acompanados de grafico de tendencias Canvas 2D (`TrendLineChart.jsx`).
  - RF-05 (Bitacora Privada): Espacio personal con split-view, advertencia de datos de terceros y confirmacion estricta para eliminacion segura.
  - RF-06 (Analisis NLP Explicable): Motor lexico determinista (`nlpEngine.js`), extraccion de evidencias, chips de factores con porcentaje de confianza y correccion humana auditada (`NlpCorrectionModal.jsx`).
  - RF-10 (Canal de Acompanamiento): Formulario de contacto voluntario con SST (`SupportRequestForm.jsx`) en modalidades anonima y confidencial.
  - RF-14 (Apoyo en Crisis): Directorio de lineas de ayuda 24/7 y derivacion prioritaria a SST (`CrisisSupportPage.jsx` y `CrisisSupportModal.jsx`).
  - RF-20 (Habeas Data): Inventario de datos almacenados, portabilidad en JSON y flujo de supresion bajo confirmacion explicativa.
- **Hito 4 - Modulo Supervisor (Monitoreo Operativo y Privacidad)**:
  - RF-07 (k-Anonimato N >= 5): Bloqueo visual deliberado con `PrivacyBlockedCard.jsx` ante subgrupos de tamano muestral insuficiente y limite rigido de 2 filtros simultaneos.
  - RF-09 (Gestion de Intervenciones): Seguimiento de planes coordinados con SST (`ActionsPage.jsx`), avance porcentual y registro de notas de seguimiento (`ActionFollowupModal.jsx`) con auditoria inmutable.
  - RF-11 (Panel de Supervision): Dashboard colectivo con indicadores agregados de energia, sobrecarga y participacion, evolucion semanal Canvas 2D y tabla de factores clave (`TeamDashboardPage.jsx`).
- **Hito 5 - Modulo SST (Vigilancia Epidemiologica y Alertas Preventivas)**:
  - RF-07 / RF-11 (Vigilancia Epidemiologica y Mapa de Calor): `SstDashboardPage.jsx` con KPIs agregados, mapa de distribucion de 8 categorias NLP (`HeatmapGrid.jsx`) con supresion primaria (N < 5) y secundaria (menor visible) y tabla de dimensiones ocupacionales.
  - RF-08 (Bandeja de Alertas Tempranas): `AlertsInboxPage.jsx` con ciclo de vida interactivo (`GENERADA`, `EN_REVISION`, `VALIDADA`, `INTERVENCION_CREADA`, `EN_SEGUIMIENTO`, `CERRADA`), descarte con justificacion obligatoria (>= 20 caracteres) en `DismissAlertModal.jsx` y creacion automatica de intervenciones.
  - RF-08 (Motor de Reglas Preventivas): `AlertRulesPage.jsx` con constructor reactivo en lenguaje natural (`RuleFormCard.jsx`), simulacion retrospectiva de 90 dias y propuesta formal al Administrador con separacion de funciones.
  - RF-09 (Planes de Intervencion Colectiva): `InterventionsPage.jsx` con formulacion de planes (`NewInterventionForm.jsx`), calculo automatico de linea base y bloqueo preventivo si el ambito seleccionado vulnera el k-anonimato (N < 5).
  - RF-10 (Buzon de Acompanamiento): `SupportInboxPage.jsx` con atencion confidencial de solicitudes voluntarias, proteccion rigurosa de identidad para casos anonimos y reserva de uso exclusivo para SST en casos confidenciales.
- **Hito 6 - Modulos Administrador y Auditor (Gobierno, Organizacion y Cadena Inmutable de Auditoria)**:
  - RF-13 (Registro Inmutable de Auditoria): `AuditLogPage.jsx` con registro append-only de metadatos no sensibles, algoritmo de verificacion de integridad de hash chain y exportacion criptografica JSON auditada.
  - RF-15 (Estructura Organizacional y k-Anonimato): `OrganizationPage.jsx` con arbol de campanas y equipos, distincion visual de k-anonimato ($N < 5$ vs $N \ge 5$), modales `CampaignModal.jsx`, `TeamModal.jsx`, `AssignSupervisorModal.jsx` y restablecimiento demo seguro.
  - RF-15 (Usuarios y Roles RBAC): `UsersRolesPage.jsx` con tabla de cuentas, catalogo estricto de 5 roles canonicos, modales `CreateUserModal.jsx` y `ManageUserModal.jsx` con proteccion contra auto-suspension del administrador activo.
  - RF-15 (Parametros Institucionales y SLAs): `SystemParamsPage.jsx` con regulacion de umbral $N$, retencion y SLAs de respuesta, alerta dinamica de riesgo con justificacion obligatoria (>= 10 caracteres), versionado de politicas con re-consentimiento obligatorio, gestion de modelos NLP y aprobacion de reglas de SST.
  - RF-15 (Importacion CSV Agregada): `CsvImportPage.jsx` con rechazo categorico de identificadores personales individuales (`status: DENEGADO`), validacion de columnas requeridas, vista previa tabular y descarga de plantilla.
  - RF-14 (Gestion Habeas Data Ley 1581): `HabeasDataPage.jsx` con control de terminos normativos, alerta de radicados vencidos, flujo secuencial de estados y modal de constancia administrativa `HabeasAdvanceModal.jsx`.
- **Hito 7 - Vistas Compartidas, Integracion y Cierre de Plataforma**:
  - RF-12 / RF-07 (Reportes Consolidados): `ReportsPage.jsx` (`/reportes`) con seleccion reactiva de ambito (Global, Campanas, Equipos), evaluacion estricta de k-anonimato ($N \ge 5$ permitido vs $N < 5$ bloqueado preventivamente por `PrivacyBlockedCard.jsx`), KPIs consolidados, previsualizacion tabular y exportacion multiformato real (descarga de archivo CSV, descarga de JSON estructurado e impresion de documento formal PDF via `window.print()`), generacion de hash criptografico demo, registro inmutable de auditoria `EXPORTACION_REPORTE` e historial cronologico de exportaciones.
  - RF-16 (Centro de Notificaciones): `NotificationsPage.jsx` (`/notificaciones`) con bandeja contextual segun rol y usuario, indicadores visuales de no leidas con punto de alerta, marcado individual con navegacion reactiva automatica, marcado masivo ("Marcar todas como leidas") y persistencia de preferencias de recordatorio diario de check-in para agentes en `localStorage`.
  - Presentacion Institucional y Demostracion: `LandingPage.jsx` (`/`) con identidad institucional TdeA, demo interactiva de escala de energia 1 a 5 con omision consciente y feedback visual inmediato, resumen de 3 pasos, desglose de problemas y audiencias BPO, como funciona, 3 pilares de funcionalidad, garantia de privacidad por roles, explorador interactivo de los 5 roles canonicos con tarjeta de bienvenida y acceso directo demo, y pie de pagina academico.
  - Enrutamiento Global y Cero Placeholders: Conexiones finales de rutas en `App.jsx`, atajo `/panel` con redireccion al dashboard correspondiente segun rol, y eliminacion del componente `PlaceholderView.jsx` (100% de las rutas de la plataforma son operativas en produccion).

---

## 4. Estructura de Directorios

```text
Pulso360/
├── .env.example              # Plantilla de variables de entorno (Vite / React)
├── public/
│   └── assets/
│       ├── evidencias/       # Capturas de pantalla y evidencias visuales
│       └── imágenes/         # Ilustraciones y recursos graficos
│
├── src/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── authService.js
│   │   │   └── ProtectedRoute.jsx
│   │   ├── components/
│   │   │   ├── Icon.jsx
│   │   │   ├── InactivityModal.jsx
│   │   │   └── TrendLineChart.jsx
│   │   ├── config/
│   │   │   └── env.js        # Configuracion centralizada de entorno
│   │   ├── layout/
│   │   │   └── AppLayout.jsx
│   │   ├── nlp/
│   │   │   └── nlpEngine.js  # Motor lexico determinista
│   │   └── storage/
│   │       └── pulsoStore.js # Repositorio local preparado para PostgreSQL
│   │
│   ├── features/
│   │   ├── agent/
│   │   │   ├── components/
│   │   │   │   ├── CrisisSupportModal.jsx
│   │   │   │   ├── NlpAnalysisPanel.jsx
│   │   │   │   ├── NlpCorrectionModal.jsx
│   │   │   │   ├── ScaleSelector.jsx
│   │   │   │   └── SupportRequestForm.jsx
│   │   │   └── pages/
│   │   │       ├── AgentDashboardPage.jsx
│   │   │       ├── CheckinWizardPage.jsx
│   │   │       ├── CrisisSupportPage.jsx
│   │   │       ├── JournalPage.jsx
│   │   │       ├── MyAnalysisPage.jsx
│   │   │       ├── MyDataPrivacyPage.jsx
│   │   │       ├── MyWellbeingPage.jsx
│   │   │       └── SupportChannelPage.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── DemoAccountsCard.jsx
│   │   │   │   └── LoginForm.jsx
│   │   │   └── pages/
│   │   │       ├── ConsentPage.jsx
│   │   │       ├── ForbiddenPage.jsx
│   │   │       ├── ForgotPasswordPage.jsx
│   │   │       ├── LoginPage.jsx
│   │   │       └── ResetPasswordPage.jsx
│   │   │
│   │   ├── landing/
│   │   │   └── pages/
│   │   │       └── LandingPage.jsx
│   │   │
│   │   ├── notifications/
│   │   │   └── pages/
│   │   │       └── NotificationsPage.jsx
│   │   │
│   │   ├── reports/
│   │   │   └── pages/
│   │   │       └── ReportsPage.jsx
│   │   │
│   │   ├── supervisor/
│   │   │   ├── components/
│   │   │   │   ├── ActionFollowupModal.jsx
│   │   │   │   ├── PrivacyBlockedCard.jsx
│   │   │   │   ├── TeamFactorsTable.jsx
│   │   │   │   └── TeamKpiGrid.jsx
│   │   │   └── pages/
│   │   │       ├── ActionsPage.jsx
│   │   │       └── TeamDashboardPage.jsx
│   │   │
│   │   └── sst/
│   │       ├── components/
│   │       │   ├── AlertCard.jsx
│   │       │   ├── DismissAlertModal.jsx
│   │       │   ├── HeatmapGrid.jsx
│   │       │   ├── NewInterventionForm.jsx
│   │       │   └── RuleFormCard.jsx
│   │       └── pages/
│   │           ├── AlertRulesPage.jsx
│   │           ├── AlertsInboxPage.jsx
│   │           ├── InterventionsPage.jsx
│   │           ├── SstDashboardPage.jsx
│   │           └── SupportInboxPage.jsx
│   │
│   │   ├── auditor/
│   │   │   └── pages/
│   │   │       └── AuditLogPage.jsx
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── AssignSupervisorModal.jsx
│   │       │   ├── CampaignModal.jsx
│   │       │   ├── CreateUserModal.jsx
│   │       │   ├── HabeasAdvanceModal.jsx
│   │       │   ├── ManageUserModal.jsx
│   │       │   └── TeamModal.jsx
│   │       └── pages/
│   │           ├── CsvImportPage.jsx
│   │           ├── HabeasDataPage.jsx
│   │           ├── OrganizationPage.jsx
│   │           ├── SystemParamsPage.jsx
│   │           └── UsersRolesPage.jsx
│   │
│   ├── styles/
│   │   ├── admin.css
│   │   ├── auditor.css
│   │   ├── auth.css
│   │   ├── bitacora.css
│   │   ├── components.css
│   │   ├── consentimiento.css
│   │   ├── documentacion.css
│   │   ├── layout.css
│   │   ├── notifications.css
│   │   ├── reports.css
│   │   ├── sst.css
│   │   ├── styles.css
│   │   ├── supervisor.css
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

### Hito 3: Modulo Agente - Experiencia Individual (Estado: Completado)
- Motor lexico determinista en JavaScript puro (`nlpEngine.js`) con 8 categorias, negaciones e intensificadores.
- Componente de graficas nativas en Canvas 2D (`TrendLineChart.jsx`).
- Formulario de Check-in diario por pasos con escala 1 a 5, atajos de teclado y opcion de no respuesta (`CheckinWizardPage.jsx`).
- Bitacora privada con advertencia de datos de terceros, analisis NLP y modal de correccion manual (`JournalPage.jsx`).
- Vistas de bienestar personal (`MyWellbeingPage.jsx`), desglose analitico (`MyAnalysisPage.jsx`), solicitudes de acompanamiento (`SupportChannelPage.jsx`) y modulo de Habeas Data (`MyDataPrivacyPage.jsx`).

### Hito 4: Modulo Supervisor - Monitoreo Operativo (Estado: Completado)
- Panel de indicadores de equipo (`TeamDashboardPage.jsx`).
- Aplicacion estricta de umbral de privacidad (k-anonimato N >= 5) con bloqueo visual si el equipo no cumple la cuota.
- Registro y seguimiento de acciones operativas de apoyo (`ActionsPage.jsx`).

### Hito 5: Modulo SST - Vigilancia Epidemiologica y Alertas (Estado: Completado)
- Panel de vigilancia epidemiologica y analitica agregada (`SstDashboardPage.jsx`).
- Mapa de calor de 8 categorias NLP con supresion primaria (N < 5), supresion secundaria y redondeo (`HeatmapGrid.jsx`).
- Bandeja de alertas tempranas con transicion de estados, descarte justificado en modal y creacion automatica de intervenciones (`AlertsInboxPage.jsx`).
- Parametrizacion, simulacion de 90 dias y propuesta formal de reglas de alerta (`AlertRulesPage.jsx`).
- Formulacion y seguimiento macro de intervenciones colectivas (`InterventionsPage.jsx`).
- Buzon confidencial de atencion y acompanamiento para solicitudes voluntarias (`SupportInboxPage.jsx`).

### Hito 6: Modulos Administrador y Auditor - Gobierno y Trazabilidad (Estado: Completado)
- Registro inmutable de auditoria con verificacion de integridad de hash chain y exportacion de metadatos (`AuditLogPage.jsx`).
- Jerarquia organizacional de campanas y equipos con visualizacion de k-anonimato ($N < 5$ vs $N \ge 5$) y modales de campanas, equipos y supervisores (`OrganizationPage.jsx`).
- Administracion de cuentas y asignacion de los 5 roles canonicos con modales desacoplados y proteccion contra auto-suspension (`UsersRolesPage.jsx`).
- Parametrizacion global de umbrales, retencion y SLAs de servicio con alerta de riesgo y justificacion obligatoria, versionado de politicas y lexico NLP (`SystemParamsPage.jsx`).
- Ingesta de metricas agregadas por archivo CSV con rechazo categorico de datos personales individuales y plantilla descargable (`CsvImportPage.jsx`).
- Tramitacion de solicitudes de Habeas Data (Ley 1581) con control de terminos legales, estados secuenciales y constancias auditadas (`HabeasDataPage.jsx`).

### Hito 7: Vistas Compartidas, Integracion y Cierre (Estado: Completado)
- Landing page institucional de presentacion academica TdeA con demostracion interactiva de escala de energia, explicacion de 3 pasos, garantia de privacidad por roles, explorador interactivo de los 5 roles y acceso rapido a demos (`LandingPage.jsx`).
- Centro de notificaciones operativas y preventivas con filtrado contextual por rol/usuario, indicadores de leido/no leido, navegacion reactiva y persistencia de recordatorios de check-in (`NotificationsPage.jsx`).
- Modulo transversal de reportes consolidados con seleccion de ambito, bloqueo por k-anonimato ($N < 5$), exportacion real multiformato (CSV, JSON, PDF imprimible), hash de integridad e historial inmutable de exportaciones (`ReportsPage.jsx`).
- Atajo de enrutamiento global `/panel` con redireccion automatica al dashboard correspondiente segun el rol del usuario autenticado.
- Erradicacion total de componentes placeholder: el 100% de las rutas de la aplicacion son completamente operativas y conformes al diseno de produccion.

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

3. Configurar variables de entorno copiando la plantilla:
   ```bash
   cp .env.example .env
   # En Windows PowerShell:
   Copy-Item .env.example .env
   ```

4. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

5. Abrir en el navegador la direccion provista por Vite (habitualmente `http://localhost:5173`).

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

