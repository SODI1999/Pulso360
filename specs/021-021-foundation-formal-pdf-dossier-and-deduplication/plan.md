# [PLAN-021] Plan de Implementación: Dossier Académico Formal en PDF y Desduplicación de Controles

## 1. Arquitectura y Solución Técnica

1. **Desduplicación de Controles de Impresión**:
   - En [AcademicSidebarToc.jsx](../../frontend/src/features/landing/components/AcademicSidebarToc.jsx):
     - Eliminar el bloque de pie `.toc-sidebar-footer` que contenía el botón duplicado `.btn-toc-print`.
     - Eliminar la prop `handlePrint` de la firma del componente.
   - En [AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx):
     - Retirar el paso de la prop `handlePrint` a `<AcademicSidebarToc />`.
   - En [evidence.css](../../frontend/src/styles/academic/evidence.css):
     - Limpiar los selectores obsoletos `.toc-sidebar-footer` y `.btn-toc-print`.
   - En [AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx):
     - Mantener el control primario e institucional de impresión con su accesibilidad WCAG íntegra.

2. **Dossier Académico Formal en `@media print` ([footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css))**:
   - **Márgenes y formato de página**:
     - Configurar `@page { size: letter portrait; margin: 1.8cm 1.5cm; }` con tipografía de publicación técnica.
   - **Eliminación de artefactos de software web**:
     - Ocultar `.landing-header`, `.academic-sidebar-rail`, `.btn-scroll-top`, `.breadcrumbs`, `.academic-quick-nav`, `.academic-back-nav`.
   - **Membrete Universitario Institucional**:
     - Activar y maquetar `.print-editorial-header` para encabezar el documento impreso:
       - *"TECNOLÓGICO DE ANTIOQUIA — INSTITUCIÓN UNIVERSITARIA"*
       - *"Facultad de Educación y Ciencias Sociales | Grupo de Investigación"*
       - *"DOSSIER TÉCNICO Y FUNDAMENTACIÓN METODOLÓGICA DE PULSO360"*
       - Metadatos formales de radicación y fecha.
   - **Restructuración Editorial de Tarjetas y Secciones**:
     - Convertir las tarjetas con fondos oscuros (`#antivigilancia`) a cajas impresas con fondo blanco, bordes finos de 1pt (`#cbd5e1`), texto negro azabache (`#0f172a`) y excelente legibilidad.
     - En la sección de evidencia cuantitativa: ocultar barras de progreso web (`.distribution-bar-track`) y formatear la descomposición psicométrica como un sumario tabular formal con cifras alineadas y bordes divisorios sutiles.
     - En la matriz de transferencia y marco legal: estructurar en bloques editoriales sobrios con tablas o cuadrículas de 2 columnas con tipografía de reporte técnico.
   - **Control de Paginación y Saltos de Página**:
     - Aplicar `page-break-inside: avoid; break-inside: avoid;` en todas las secciones principales (`.academic-section`, `.anti-surveillance-card`, `.legal-card`, `.evidence-stat-card`, `.academic-author-card`).
     - Aplicar `page-break-after: avoid; break-after: avoid;` en títulos `h2, h3` para evitar títulos huérfanos al pie de página.
     - Pie de página institucional formal para auditoría y archivo académico.

---

## 2. Archivos Afectados

- [frontend/src/features/landing/components/AcademicSidebarToc.jsx](../../frontend/src/features/landing/components/AcademicSidebarToc.jsx)
- [frontend/src/features/landing/pages/AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx)
- [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css)
- [frontend/src/styles/academic/footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css)
- [specs/021-021-foundation-formal-pdf-dossier-and-deduplication/tasks.md](tasks.md)
- [specs/021-021-foundation-formal-pdf-dossier-and-deduplication/acceptance.json](acceptance.json)

---

## 3. Data Contracts and API Contracts (N/A Justification)

- **Contratos de Datos / API Contracts**: N/A (Justificado). Esta especificación aborda la desduplicación de controles y la hoja de estilos de exportación a impresión / PDF (`@media print`) en el frontend de la página institucional de fundamentación. No altera endpoints REST, esquemas de base de datos ni contratos en `specs/contracts.json`.
- **Persistencia**: Cero impacto en el estado local o persistido de la plataforma.

---

## 4. Rollback and Migration Reversal Strategy (N/A Justification)

- **Migraciones de Base de Datos**: N/A (Justificado). No hay esquemas ni migraciones involucradas.
- **Estrategia de Reversión (Rollback)**: Reversión inmediata mediante `git checkout` o `git revert` sobre los 4 archivos modificados del frontend.
