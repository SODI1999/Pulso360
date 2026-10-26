# [PLAN-019] Plan de Implementación: Rail Lateral Izquierdo Sticky

## 1. Arquitectura de Componentes y Flujo de Datos

1. **Desacoplamiento de `AcademicHeader.jsx`**:
   - Retener en `AcademicHeader.jsx` el membrete de impresión, kicker, título formal, resumen (lead) y la acción de imprimir.
   - Extraer el TOC fuera de `AcademicHeader.jsx` para que no quede encapsulado en un encabezado cerrado.
   - Mover la matriz de autores (`#autores`) como la primera sección del flujo de contenido del artículo.

2. **Componente / Estructura del Rail Lateral (`AcademicFoundationPage.jsx`)**:
   - Envolver el contenido posterior a la cabecera en `<div className="academic-body-layout">`.
   - Crear el rail lateral `<aside className="academic-sidebar-rail" aria-label="Navegación del dossier">` que contiene `<nav className="academic-toc-sidebar" aria-label="Índice temático del dossier">`.
   - El índice muestra:
     - Etiqueta de sección con icono: *"Índice del Dossier"*.
     - Lista vertical accesible de saltos temáticos:
       - `Autores y Equipo` (`#autores`)
       - `1. Evidencia Empírica` (`#evidencia-empirica`)
       - `2. Transferencia` (`#transferencia`)
       - `3. Anti-vigilancia` (`#antivigilancia`)
       - `4. Citación & DSpace` (`#citacion`)
       - `5. Marco Legal` (`#marco-legal`)
     - Botón de atajo directo para impresión / guardado PDF con accesibilidad Label in Name.

3. **Columna de Contenido Editorial (`.academic-content-flow`)**:
   - Agrupa en orden:
     - `#autores`: Matriz de Autoría Interdisciplinaria (Trabajo Social e Ingeniería de Software).
     - `#evidencia-empirica`: `<AcademicEvidence />`.
     - `#transferencia`: `<AcademicTransfer />`.
     - `#antivigilancia`: Salvaguardas éticas anti-vigilancia.
     - `#citacion`: `<AcademicCitation />`.
     - `#marco-legal`: `<AcademicLegalFramework />`.

4. **Estilos CSS (`evidence.css` & `footer-responsive.css`)**:
   - Declarar `.academic-body-layout` con `display: grid; grid-template-columns: 240px 1fr; gap: 44px; align-items: start;`.
   - Declarar `.academic-sidebar-rail` con `position: sticky; top: 88px; max-height: calc(100vh - 100px); overflow-y: auto;`.
   - Diseñar `.toc-vertical-link` con padding ergonómico, transición suave, indicador activo con borde izquierdo y estado de foco `:focus-visible`.
   - Media queries: en `<= 960px`, `grid-template-columns: 1fr`, rail `position: static`.
   - `@media print`: `.academic-sidebar-rail { display: none !important; }`.

---

## 2. Archivos Afectados

- [frontend/src/features/landing/pages/AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx)
- [frontend/src/features/landing/components/AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx)
- [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css)
- [frontend/src/styles/academic/footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css)
- [specs/019-019-foundation-sidebar-toc-rail/tasks.md](tasks.md)
- [specs/019-019-foundation-sidebar-toc-rail/acceptance.json](acceptance.json)

---

## 3. Data Contracts and API Contracts (N/A Justification)

- **Contratos de Datos / API Contracts**: N/A (Justificado). Esta especificación se limita a la reorganización maquetada del frontend y estilos CSS del layout editorial de `AcademicFoundationPage`. No altera esquemas de base de datos, DTOs de backend, endpoints HTTP ni contratos en `specs/contracts.json`.
- **Persistencia**: Cero impacto en `pulsoStore` o APIs de backend.
- **Permisos RBAC**: La página `/fundamentacion` permanece como ruta pública institucional sin alteración de roles.

---

## 4. Rollback and Migration Reversal Strategy (N/A Justification)

- **Migraciones de Base de Datos**: N/A (Justificado). No existen migraciones de base de datos ni transformaciones de datos persistidos.
- **Estrategia de Reversión (Rollback)**: Reversión atómica limpia de los commits en Git (`git checkout` o `git revert`) sobre los archivos afectados de interfaz y estilos (`frontend/src/features/landing/*` y `frontend/src/styles/academic/*`). No deja estado huérfano ni requiere scripts de desinstalación.
