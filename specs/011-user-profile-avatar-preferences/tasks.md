# [TASKS-011] Scope-derived work: User Profile, Avatar Diversity & Preferences

Trazabilidad completa entre criterios de aceptación (AC-01 a AC-06), plan técnico y tareas de implementación en orden de dependencias.

- [x] **TASK-01 / AC-02**: Generación de activos fotográficos/3D documentales BPO para inclusión masculina y diversidad de avatares.
  - *Archivos afectados*: `frontend/public/assets/fotos/bpo-avatar-male-agent.webp`, `frontend/public/assets/fotos/bpo-avatar-male-supervisor.webp`, `frontend/public/assets/fotos/bpo-avatar-female-agent-2.webp`.
  - *Acción*: Invocar al subagente `bpo-asset-designer` para crear las imágenes con estilo documental 3D digno de Contact Center (Mateo Ramos operador, Carlos Mendoza supervisor, Sofía Vega operadora alternativa).
  - *Verificación*: Comprobar existencia física de los archivos y legibilidad de formato en el navegador.

- [x] **TASK-02 / AC-02 & AC-06**: Asignación de avatares en seed y soporte de persistencia de perfil en store.
  - *Archivos afectados*: `frontend/src/core/storage/seed.jsx`, `frontend/src/core/storage/pulsoStore.jsx`.
  - *Acción*: Asignar propiedades `avatar` en los usuarios mock iniciales de `seed.jsx` (`usr-1` Laura, `usr-2` Carlos supervisor masculino, `usr-3` Patricia SST, `usr-4` Marcos auditor masculino). Implementar método `updateUserProfile(userId, profileData)` en `pulsoStore` que actualice la colección de usuarios, sincronice `sessionData` y emita el evento global `pulso360-session-changed`.
  - *Verificación*: Inspección de retorno en `pulsoStore.get().users` y emisión de evento de sesión.

- [x] **TASK-03 / AC-03, AC-04 & AC-05**: Creación del componente `UserProfileModal.jsx` y estilos `profile.css`.
  - *Archivos afectados*: `frontend/src/core/components/UserProfileModal.jsx`, `frontend/src/styles/profile.css`.
  - *Acción*: Implementar diálogo modal centrado WAI-ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, trampa de foco y cierre con `Escape`) con 3 pestañas:
    1. *Identidad & Avatar*: Visualización de datos operativos, preview de avatar actual, catálogo interactivo de 4 avatares predeterminados BPO, carga de imagen propia (`FileReader` base64 con validación ≤ 2 MB) y botón de restablecer.
    2. *Preferencias de Bienestar*: Toggles accesibles para sonido ambiental en pausas (`preferences.readPauseSound`/`savePauseSound`), avisos de inicio de jornada (`preferences.readReminder`/`saveReminder`) y modo descanso visual / reducción de movimiento.
    3. *Salvaguardas & Privacidad*: Resumen de garantías institucionales (Ley 1581 / SG-SST) y acceso directo a Habeas Data.
  - *Verificación*: Pruebas interactivas de cambio de avatar, selección de catálogo, subida de imagen local y persistencia de toggles.

- [x] **TASK-04 / AC-01 & AC-06**: Rediseño del popover de cuenta en `AppLayout.jsx` y estilos en `layout.css`.
  - *Archivos afectados*: `frontend/src/core/layout/AppLayout.jsx`, `frontend/src/styles/layout.css`.
  - *Acción*: Eliminar la cabecera `.account-popover-header` que clonaba la tarjeta inferior; reemplazarla por una cabecera contextual ligera (correo corporativo + turno asignado). Añadir opción *"Mi perfil y preferencias"* para abrir `UserProfileModal.jsx`. Resolver el avatar dinámico desde `user.avatar` con fallback inteligente.
  - *Verificación*: Inspección visual en navegador de la eliminación de duplicidad y apertura del modal desde el menú.

- [x] **TASK-05 / AC-05 & AC-06**: Validación integral de accesibilidad, sincronización reactiva y quality gates.
  - *Archivos afectados*: Todo el frontend integrado.
  - *Acción*: Comprobar trampa de foco con Tab y Shift+Tab, cierre con `Escape` y retorno de foco al elemento activador. Ejecutar scripts de calidad del repositorio.
  - *Verificación*: Ejecución exitosa de `npm --prefix frontend test`, `npm --prefix frontend run lint` y `npm --prefix frontend run build`.
