# [SPEC-011] User Profile Avatar Preferences

Date: 2026-10-20
Status: SPECIFIED

## 0. Fase de Clarificación y Supuestos

- **Decisión de Navegación**: El menú de cuenta del sidebar (`AppLayout.jsx`) se simplifica eliminando la duplicación en bloque de la tarjeta inferior. Se agrega la opción unificada *"Mi perfil y preferencias"* para todos los roles.
- **Modal Centrado Accesible**: Se implementa `UserProfileModal.jsx` como diálogo modal centrado (`role="dialog"`, `aria-modal="true"`, WAI-ARIA) para editar avatar y preferencias operativas de bienestar sin abandonar la vista activa.
- **Diversidad de Avatares**: Se crean 3 nuevos activos fotográficos/3D documentales BPO (2 masculinos y 1 femenino alternativo) para erradicar las iniciales monocromáticas y garantizar diversidad de género y rol en `seed.jsx` y nuevos usuarios.
- **Personalización de Avatar**: El usuario puede elegir entre los avatares institucionales predefinidos o cargar una imagen local (almacenada en base64 en `pulsoStore`/`localData`), con opción de restablecer.
- **Integración de Preferencias**: Se da interfaz gráfica accesible a las preferencias huérfanas en `preferences.jsx` (sonido ambiental de pausas activas, recordatorios de turno y descanso visual ergonómico).

## 1. Need and scope

- **Quién**: Agentes, Supervisores, Especialistas SST, Auditores y Administradores de Contact Center en Pulso360.
- **Problema**:
  1. *Duplicidad visual*: El popover de cuenta clona exactamente la tarjeta de usuario ubicada debajo, con opciones casi inexistentes para roles que no sean agente (solo "Cerrar sesión").
  2. *Carencia de avatares masculinos*: No existen avatares masculinos en el repositorio; usuarios como Carlos Mendoza y Marcos Rivas quedan limitados a un círculo con inicial 'C' o 'M'.
  3. *Inexistencia de personalización*: El usuario no puede cambiar su avatar ni elegir de un catálogo representativo de operaciones BPO.
  4. *Falta de panel de preferencias*: Las configuraciones operativas de bienestar (sonido de pausas activas, avisos de turno) carecen de interfaz de usuario.
- **Alcance**:
  - Rediseñar el popover de cuenta en `AppLayout.jsx` para convertirlo en un menú de acciones limpio y contextual.
  - Generar 3 activos visuales fotográficos/3D documentales BPO con el subagente `bpo-asset-designer`.
  - Crear el componente `UserProfileModal.jsx` con 3 pestañas focales: *Identidad & Avatar*, *Preferencias de Bienestar*, *Salvaguardas & Privacidad*.
  - Conectar el estado de avatar y preferencias en `pulsoStore.js`, `preferences.jsx` y `authService.js`, sincronizando reactivamente con el evento `pulso360-session-changed`.

## 2. Acceptance Criteria and Non-Goals

### Acceptance Criteria

- **AC-01 (Popover de Cuenta Desacoplado y Sin Duplicidad)**: Al desplegar el menú de cuenta desde `.user-card`, el popover no debe duplicar la tarjeta inferior (avatar grande y nombre repetidos); debe presentar una cabecera contextual ligera (correo corporativo y turno) y opciones claras: *"Mi perfil y preferencias"*, *"Mis datos y privacidad"* (para agentes) y *"Cerrar sesión"*.
- **AC-02 (Catálogo de Avatares BPO con Inclusión Masculina)**: Incorporar en `public/assets/fotos/` al menos 2 avatares masculinos (`bpo-avatar-male-agent.webp`, `bpo-avatar-male-supervisor.webp`) y 1 femenino alternativo (`bpo-avatar-female-agent-2.webp`) con estilo documental BPO. En `seed.jsx`, asignar avatares acordes a Carlos Mendoza (`usr-2`) y Marcos Rivas (`usr-4`), eliminando iniciales monocromáticas por defecto.
- **AC-03 (Selector de Avatar y Carga de Foto Personalizada)**: En el modal de perfil, el usuario puede seleccionar cualquier avatar del catálogo institucional o cargar un archivo de imagen propio (PNG/JPG/WebP, previsualizado y almacenado en base64 en `pulsoStore`), disponiendo además de un botón para restablecer al avatar institucional.
- **AC-04 (Panel de Preferencias de Bienestar y Ergonomía)**: En la pestaña de preferencias, el usuario puede activar/desactivar el sonido ambiental de pausas activas, los recordatorios sutiles de jornada y el modo de descanso visual ergonómico (reducción de movimiento), persistiendo de inmediato en el almacenamiento local.
- **AC-05 (Accesibilidad WAI-ARIA y Estados de Interfaz)**: El modal debe cumplir WAI-ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco atrapado, cierre con `Escape` y retorno de foco al elemento activador), contemplando estado interactivo de carga, retroalimentación accesible de guardado (`role="status"`) y validación de archivo.
- **AC-06 (Sincronización Reactiva y Calidad de Código)**: Al guardar cambios de avatar o perfil, el sidebar y topbar deben actualizarse reactivamente mediante el evento `pulso360-session-changed` sin recargar la página, superando `npm --prefix frontend run lint` y `npm --prefix frontend run build`.

### Non-Goals

- No implementar endpoints de almacenamiento de imágenes en servidor backend ni almacenamiento en nube S3; el avatar personalizado se maneja de forma segura y eficiente en el cliente (`dataURL` / almacenamiento local).
- No añadir librerías externas pesadas de manipulación de fotos (cropper/canvas).
- No alterar la lógica de cumplimiento de Habeas Data en `MyDataPrivacyPage.jsx`.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | SÍ | Se gestiona nombre, correo corporativo, turno y avatar del usuario. Toda la información pertenece al titular y se almacena en su sesión local o registro de usuario institucional bajo la Ley 1581 de 2012. |
| **Does it expose cross-tenant data?** | NO | Cada usuario solo accede y edita su propio perfil y sus propias preferencias locales. No hay fuga de datos entre equipos. |
| **Does it require audit logging?** | SÍ | Las modificaciones de avatar y preferencias registran eventos en el log de auditoría local de `pulsoStore` (`ACTUALIZACION_PERFIL_USUARIO`). |
| **¿Accede o procesa datos sensibles?** | NO | El avatar y las preferencias ergonómicas no son datos médicos ni de salud clínica; son configuraciones operativas de interfaz y representación. |

## 4. Experiencia y límites

- **Estado de Carga y Carga de Imagen**: Indicador visual breve cuando se procesa una imagen cargada por el usuario.
- **Límite de Tamaño**: Validación de tamaño máximo de imagen local (≤ 2 MB) con mensaje de advertencia accesible si se excede.
- **Estado de Éxito**: Toast o aviso de confirmación con `role="status"` y persistencia inmediata.
- **Ergonomía Visual**: Respeto a las variables de color del sistema (`--c-superficie`, `--c-primario`, `--radius-md`), sin degradados artificiales ni componentes tipo plantilla genérica.

## 5. Traceability

| Criterio | Sección del Plan | Tarea Asociada | Verificación Prevista |
| :--- | :--- | :--- | :--- |
| **AC-01** | Plan § 1 (Rediseño Popover) | T1 (AppLayout popover) | Inspección visual en navegador y prueba de interacción |
| **AC-02** | Plan § 2 (Activos Visuales) | T2 (Subagente bpo-asset-designer) | Comprobación de archivos de imagen y seed |
| **AC-03** | Plan § 3 (Modal Perfil) | T3 (UserProfileModal componente) | Prueba de selección y carga de foto |
| **AC-04** | Plan § 4 (Preferencias Bienestar) | T4 (Integración preferencias) | Verificación de persistencia en localData |
| **AC-05** | Plan § 5 (Accesibilidad WAI-ARIA) | T5 (Trampa de foco y ARIA) | Navegación por teclado y lector de pantalla |
| **AC-06** | Plan § 6 (Integración & Gates) | T6 (Quality gates) | `npm run lint` y `npm run build` |
