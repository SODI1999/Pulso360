# [SPEC-021] Dossier Académico Formal en PDF y Desduplicación de Controles

## 0. Clarification & Assumptions (Anti-Hallucination Gate)

- **Problema 1 (Duplicidad)**: Existían dos botones de impresión en pantalla simultáneamente: uno en la cabecera (`AcademicHeader`) y otro al pie del índice lateral (`AcademicSidebarToc`).
- **Problema 2 (Aspecto de Pantallazo Web en lugar de PDF Formal)**: La impresión nativa mediante `window.print()` se limitaba a volcar la interfaz web sobre papel, generando un aspecto de "pantallazo de la página web" (tarjetas con sombras, bloques oscuros, barras de progreso de software), en lugar de un informe/paper formal de investigación del Tecnológico de Antioquia.
- **Solución Acordada (Opción A)**:
  1. Suprimir el botón duplicado de `AcademicSidebarToc.jsx` dejando un único control formal en `AcademicHeader.jsx`.
  2. Rediseñar exhaustivamente las reglas `@media print` en `footer-responsive.css` para transformar el documento en un **Dossier Científico & Ficha Metodológica Universitaria Formal**:
     - Membrete formal con escudo y datos institucionales del Tecnológico de Antioquia (TdeA), facultades y radicación.
     - Conversión de tarjetas de interfaz web en secciones editoriales sobrias con tipografía de publicación científica.
     - Tabla formal en escala de grises para las métricas cuantitativas empíricas.
     - Reglas estrictas de paginación (`page-break-inside: avoid; break-inside: avoid`) y márgenes oficiales de documento carta (`1.8cm 1.5cm`).

### Non-Goals
- No introducir librerías binarias pesadas de generación de PDF (`jspdf`, `pdfkit`) preservando el principio YAGNI y la ligereza del bundle.
- No alterar los textos ni las cifras de la investigación base.
- No modificar otras páginas del aplicativo.

---

## 1. Criterios de Aceptación (Acceptance Criteria)

- **AC-01 [functional]**: Eliminación total de la duplicidad de botones de imprimir. Se remueve el botón `.btn-toc-print` de [AcademicSidebarToc.jsx](../../frontend/src/features/landing/components/AcademicSidebarToc.jsx) y sus estilos en [evidence.css](../../frontend/src/styles/academic/evidence.css), dejando un único punto de acción accesible en [AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx).
- **AC-02 [functional]**: Transformación integral en Documento / Dossier Académico Formal en `@media print` en [footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css). Supresión de artefactos de pantalla web (cajas de fondo oscuro, sombras web, padding de contenedor) y adopción de estructura de informe técnico con membrete universitario institucional.
- **AC-03 [functional]**: Maquetación estructurada de resultados cuantitativos en impresión. En `@media print`, las métricas de campo (84.3%, 76.5%, r = -0.428) se diagraman como un informe cuantitativo formal en blanco y negro con tipografía tabular, suprimiendo las barras de progreso web.
- **AC-04 [functional]**: Reglas de paginación documental y saltos limpios (`page-break-inside: avoid; break-inside: avoid`) en hojas tamaño carta con márgenes formales `@page { size: letter portrait; margin: 1.8cm 1.5cm; }`, garantizando una exportación a PDF impecable.
- **AC-05 [functional]**: Verificación técnica: compuertas de calidad (`npm run lint`, `npm test`, `npm run build`) aprobadas con código 0 y Lighthouse Accesibilidad sostenido en 100/100.
