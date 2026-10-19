# [PLAN-003] Technical Plan: Avatar Identity, Checkin State and Professional Logo Redesign

Fecha: 2026-10-18  
Estado: EN PLANIFICACIÓN  
Especificación asociada: [spec.md](spec.md)

---

## 1. Evidencia y Arquitectura Existente

### Archivos e Implementación Afectados
- **Logotipo y Marca Institucional**:
  - `frontend/public/assets/marca/logo.webp` (logotipo rasterizado actual con texto empastado).
  - [../../frontend/src/core/layout/AppLayout.jsx](../../frontend/src/core/layout/AppLayout.jsx) (renderiza el logotipo en `sidebar-logo` y el nombre en `sidebar-brand-name`).
  - [../../frontend/src/features/auth/components/LoginManifesto.jsx](../../frontend/src/features/auth/components/LoginManifesto.jsx) (logotipo en panel de acceso).
  - [../../frontend/src/features/landing/components/Navbar.jsx](../../frontend/src/features/landing/components/Navbar.jsx) y [Footer.jsx](../../frontend/src/features/landing/components/Footer.jsx).
  - [../../frontend/index.html](../../frontend/index.html) (referencia a favicon).
- **Pantalla de Check-in (Estado ya registrado / cerrado)**:
  - [../../frontend/src/features/agent/pages/CheckinWizardPage.jsx](../../frontend/src/features/agent/pages/CheckinWizardPage.jsx#L148-L175) (bloque condicional `existingCheckin && !isEditing` que renderiza tarjeta plana vacía sin media ni acciones).
  - [../../frontend/src/styles/agent/checkin.css](../../frontend/src/styles/agent/checkin.css) o `agent.css`.
- **Foto de Perfil del Agente**:
  - [../../frontend/src/core/layout/AppLayout.jsx](../../frontend/src/core/layout/AppLayout.jsx#L270-L328) (inicial de texto `user.name.charAt(0)` en `user-avatar` y `account-popover-avatar`).
  - [../../frontend/src/styles/layout.css](../../frontend/src/styles/layout.css) (clases `.user-avatar` y `.account-popover-avatar`).

### Invariantes y Restricciones Confirmadas
1. **Identidad del Avatar 3D Preservada**: Mismo estilo, fisionomía, tonos y uniforme de Contact Center. No mezclar con estilos 2D planos ni fotos stock genéricas.
2. **Logotipo Institucional No-Avatar**: El logo es el símbolo corporativo del sistema (Pulso Orbital 360° en SVG), no el rostro del personaje.
3. **Privacidad y No-Vigilancia**: El avatar ilustrado en el perfil evita exigir fotos reales de operadores en el piso de llamadas.
4. **Cero Dependencias Adicionales**: No instalar librerías pesadas; usar SVG nativo y WebP optimizados.

---

## 2. Componentes y Flujo Propuesto

### 2.1 Sistema de Marca Vectorial (`symbol.svg` y `logo.svg`)
* **Isotipo (`symbol.svg`)**:
  * Dimensiones: ViewBox `0 0 48 48` escalable.
  * Geometría: Dos arcos envolventes orbitales (360°) con gradiente continuo Teal profundo (`#0D9488` a `#0F766E`) y Menta energética (`#10B981`) que se entrelazan abrazando un núcleo con pulso vital biométrico.
  * Fondo: 100% transparente.
  * Uso: Barra lateral (`AppLayout`), favicon (`favicon.svg`), vistas compactas.
* **Imagotipo Completo (`logo.svg`)**:
  * Isotipo + tipografía corporativa "Pulso360" refinada con interletreado ergonómico en color Navy pizarra (`#0F172A`) y acento teal para "360".
  * Uso: Landing page, manifest login, footer.

### 2.2 Tarjeta de Cierre Restaurador en `CheckinWizardPage.jsx`
* Sustituir el `<div className="card center-card">` plano por un bloque restaurador y acogedor:
  * Imagen de cabecera: Nueva imagen del avatar descansando (`/assets/fotos/bpo-agent-checkin-completed.webp`), con diadema en reposo y sonrisa serena.
  * Título: "Registro de hoy completado".
  * Subtítulo explicativo: Tiempo restante de edición si aún está dentro de las 2 horas, o confirmación de que la ventana cerró y el registro está protegido.
  * Botones de acción:
    * `Volver al panel` (Botón primario).
    * `Ir a mi bitácora` (Botón ghost con icono de notas).
    * `Pausa de respiración` (Botón secundario hacia `/apoyo-crisis`).
    * `Editar registro` (si `remainingTime > 0`).

### 2.3 Foto de Perfil en la Navegación (`AppLayout.jsx`)
* Reemplazar la letra inicial de texto por una etiqueta `<img>` con el headshot circular del avatar (`/assets/fotos/bpo-agent-profile.webp`):
  * Almacenada en WebP optimizado de 128×128 px.
  * Fallback suave a la inicial en caso de error de red.
  * Aplicado en el botón trigger del pie del sidebar y en la cabecera del popover de cuenta.

### 2.4 Generación de Nuevos Activos con `image-generator` / `bpo-asset-designer`
1. `bpo-agent-checkin-completed.webp`: Avatar sentada relajada en su silla ergonómica de call center, diadema descansando, sonrisa serena, libreta cerrada.
2. `bpo-agent-profile.webp`: Retrato primer plano (headshot 1:1) de la protagonista con expresión amable y profesional.
3. `bpo-agent-journal-calm.webp`: Avatar en escritorio escribiendo en su cuaderno de notas (para empty state de bitácora).
4. `bpo-agent-breathing-guide.webp`: Avatar en postura de respiración consciente.

---

## 3. Contratos y Verificación

| Criterio | Método de Verificación |
| :--- | :--- |
| **AC-01** (Nuevo Logotipo SVG) | Renderizado vectorial nítido en navegador, comprobación de paths y transparencia |
| **AC-02** (Integración de Marca) | Inspección visual en Sidebar, Login, Landing y Favicon |
| **AC-03** (Imagen Check-in Nuevo) | Archivo generado en `public/assets/fotos/`, verificación de peso (<180 KB) y consistencia 3D |
| **AC-04** (Rediseño Check-in) | Navegación a `/agente/checkin` con check-in existente, validación de imagen, copy y enlaces |
| **AC-05** (Foto de Perfil) | Visualización en trigger de sidebar y popover de cuenta |
| **AC-06** (Activos Complementarios) | Presencia de imágenes nuevas optimizadas en la carpeta de activos |
| **AC-07** (Quality Gates) | Ejecución exitosa de `npm run lint` y `npm run build` |

---

## 4. Reversión / Rollback

- **Estrategia de Rollback**: Al tratarse exclusivamente de activos estáticos (SVG, WebP) y modificaciones a componentes de presentación en React (`CheckinWizardPage.jsx`, `AppLayout.jsx`), cualquier reversión se realiza de forma atómica mediante control de versiones (`git checkout`). Los activos anteriores (`logo.webp`) se conservan en el árbol de archivos como respaldo, garantizando cero riesgo de pérdida de datos o migraciones de base de datos pendientes (Rollback N/A a nivel de esquema de base de datos).

