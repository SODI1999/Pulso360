# [SPEC-018] Elevación Editorial, Navegación Reactiva y Dossier PDF de Fundamentación

Date: 2026-10-26  
Type: feature  
Status: IN_PROGRESS  

---

## 0. Clarification & Assumptions

- **Decisiones confirmadas**:
  - Posicionamiento del TOC: Franja horizontal compacta que se fija debajo del navbar (`sticky top: 64px`) con ScrollSpy reactivo (Opción A recomendada).
  - Impresión PDF: Hoja de estilos `@media print` depurada que oculta `.landing-header` y controles web, añadiendo membrete institucional formal con fecha dinámica de emisión.
  - Repositorio Institucional: Enlace formal hacia DSpace TdeA (`https://dspace.tdea.edu.co/`) en la tarjeta de citación.
  - Ergonomía y Tipografía: Cifras tabulares (`tabular-nums`) en indicadores cuantitativos y restricción de medida de lectura (`max-width: 68ch`).
- **Evidencia observada (`OBSERVED`)**:
  - `footer-responsive.css:201`: `@media print` oculta `.landing-navbar` en vez de la cabecera real `.landing-header`.
  - `academicFoundationData.jsx:184`: `repositoryUrl` está definido en el modelo pero no se renderiza en la UI.
  - `AcademicHeader.jsx:32`: El TOC temático es estático y desaparece tras el scroll.

---

## 1. Need and scope

- **Necesidad**: La página de Fundamentación Académica (`/fundamentacion`) contiene la evidencia empírica cuantitativa y metodológica de 185 operadores de Contact Center que respalda el origen de Pulso360. La interfaz requiere elevar su calidad editorial para operar como un Dossier Científico de Alto Nivel.
- **Alcance**:
  1. Proveer una experiencia de impresión y guardado en PDF limpia, formal y presentable ante comités de SST y entes evaluadores.
  2. Permitir una navegación fluida entre las 6 secciones densas del documento mediante un TOC sticky interactivo con ScrollSpy.
  3. Otorgar acceso directo y verificable al repositorio de la universidad (DSpace TdeA).
  4. Refinar la legibilidad y presentación de métricas estadísticas conforme a las mejores prácticas de diseño editorial.

---

## 2. Acceptance Criteria and Non-Goals

- **AC-01 [functional]**: En `@media print`, se ocultan de forma exhaustiva `.landing-header`, `.btn-scroll-top`, `.breadcrumb-link`, `.citation-tabs` y elementos interactivos; se activa un membrete impreso con fecha de emisión y se aseguran reglas `break-inside: avoid` en tarjetas y bloques.
- **AC-02 [functional]**: El índice temático `.academic-toc-strip` se fija en pantalla (`sticky top: 64px`) al hacer scroll; un mecanismo de ScrollSpy detecta la sección activa (`#autores`, `#evidencia-empirica`, `#transferencia`, `#antivigilancia`, `#citacion`, `#marco-legal`) y aplica la clase `.is-active` y `aria-current="true"`.
- **AC-03 [functional]**: En [AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx), se renderiza un enlace formal al Repositorio Digital DSpace TdeA (`CITATION_DATA.repositoryUrl`), accesible por teclado, con icono de enlace externo y `target="_blank" rel="noopener noreferrer"`.
- **AC-04 [functional]**: En [evidence.css](../../frontend/src/styles/academic/evidence.css), se declaran cifras tabulares (`font-variant-numeric: tabular-nums`) en métricas estadísticas (`.number-val`, `.dist-bar-text`, `.aside-metric`) y se restringe el ancho de prosa a `max-width: 68ch` en párrafos explicativos.
- **AC-05 [functional]**: En [AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx), se optimiza el vector de correlación protectora ($r = -0.428, p < 0.01$) con diseño semántico y texto explicativo accesible que clarifique el efecto amortiguador del apoyo social.
- **AC-06 [functional]**: Todos los quality gates del proyecto (`npm run lint`, `npm test`, `npm run build`) se ejecutan con salida 0 y la auditoría Lighthouse Snapshot confirma 100/100 en Accesibilidad.

### Non-Goals
- Modificar endpoints, esquemas de base de datos o contratos de API en backend.
- Introducir librerías pesadas externas de generación de PDF; se optimiza el motor de impresión nativo del navegador con `@media print`.
- Modificar la estructura del navbar global ni alterar su comportamiento en otras rutas.

---

## 3. Domain applicability

| Control de Seguridad y Cumplimiento | Aplica | Justificación Técnica |
| :--- | :---: | :--- |
| **¿Toca datos personales sensibles (PII)?** | No | Solo presenta datos estadísticos agregados y metadatos bibliográficos públicos del proyecto. |
| **¿Expone datos multi-tenant?** | No | Página pública accesible sin autenticación previa. |
| **¿Requiere registro de auditoría?** | No | Vista informativa/editorial sin mutaciones de estado persistente. |
| **¿Accede o procesa datos protegidos?** | No | Visualización cliente de datos declarados en constantes del frontend. |

---

## 4. Experience and limits

- **Visual / Interactivo**: TOC sticky con transición suave, soporte de scroll horizontal en viewport móvil sin desborde.
- **Impresión / PDF**: Formato monocromático optimizado para ahorro de tinta, tipografía formal Serif/Sans legible y cero recortes a mitad de sección.
- **Fallback de red en repositorio**: Enlace externo con `rel="noopener noreferrer"` y texto descriptivo que anticipa la apertura en nueva pestaña.

---

## 5. Traceability

| Criterio | Sección del Plan | Tarea Asociada | Método de Verificación |
| :--- | :--- | :--- | :--- |
| **AC-01** | Eje 1 (Impresión PDF) | TASK-01 | Emulación `@media print` en DevTools MCP & CSS inspection |
| **AC-02** | Eje 2 (TOC Sticky & ScrollSpy) | TASK-02 | Runtime DOM evaluation & Scroll simulation |
| **AC-03** | Eje 3 (Enlace Repositorio) | TASK-03 | Inspección DOM de atributos y navegación segura |
| **AC-04** | Eje 4 (Tipografía & Measure) | TASK-04 | Computed styles inspection de `tabular-nums` y `max-width` |
| **AC-05** | Eje 4 (Vector de Correlación) | TASK-05 | Inspección visual y semántica del componente |
| **AC-06** | Calidad & Gates | TASK-06 | Ejecución automatizada de lint, tests, build y Lighthouse |
