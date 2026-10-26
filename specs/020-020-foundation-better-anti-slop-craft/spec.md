# [SPEC-020] Elevación Integral Better & Erradicación Anti-Slop en Fundamentación

## 0. Clarification & Assumptions (Anti-Hallucination Gate)

- **Problema 1 (Slop en Índice Sidebar - Imagen 2)**: El ítem activo del índice temático en el rail lateral (`.toc-sidebar-link.is-active`) presentaba una caja blanca flotante con sombra (`box-shadow`), anidada dentro de la caja beige del sidebar, y un borde verde esmeralda curvo que parecía una pastilla/pestaña artificial de SaaS de juguete ("slop del colorcito").
- **Problema 2 (Hacinamiento en Anti-vigilancia - Imagen 1)**: La sección de salvaguardas anti-vigilancia (`#antivigilancia`) forzaba 4 columnas horizontales (`repeat(4, 1fr)`) dentro de una columna de 754px, comprimiendo cada tarjeta a escasos ~134px de texto útil, provocando que títulos como *"Separación de bienestar y evaluación de desempeño"* se partieran en 6 renglones verticales con palabras aisladas y párrafos ultra estrechos.
- **Problema 3 (Duplicidad Textual en Evidencia)**: La tarjeta de prevalencia en `AcademicEvidence.jsx` repetía exactamente el mismo texto *"Prevalencia de Agotamiento Emocional en Muestra de Referencia"* en el tag superior y en el título inferior inmediatamente tras la cifra `84.3%`.
- **Problema 4 (Sobriedad en Transferencia y Marco Jurídico)**: Borde superior verde oscuro grueso descolgado en el marco legal y jerarquías de badges que requerían alineación al sistema de diseño sobrio sin "card-itis".
- **Ecosistema Better**: Se aplica la revisión interdisciplinaria coordinada por `better-interface`: `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors` y `better-ui`.

### Non-Goals
- No alterar las métricas psicométricas reportadas por la investigación base (n = 51, 84.3% agotamiento, r = -0.428).
- No modificar el Navbar global ni los componentes de otras páginas de la aplicación.
- No añadir librerías adicionales ni alterar la persistencia del sistema.

---

## 1. Criterios de Aceptación (Acceptance Criteria)

- **AC-01 [functional]**: Erradicación del "slop de colorcito" en el rail lateral (`AcademicSidebarToc.jsx` & `evidence.css`). Eliminación de cajas anidadas (`card-itis`), sombras de botón y pestañas curvas verdes artificiales en `.toc-sidebar-link.is-active`. Sustitución por sobriedad editorial: tipografía tinta profunda (`font-weight: 700; color: var(--landing-ink, #112623)`), fondo sutil plano sin sombras, y encabezado de índice sobrio y neutral.
- **AC-02 [functional]**: Reestructuración ergonómica de la cuadrícula de salvaguardas anti-vigilancia (`#antivigilancia` en `ethics.css` & `footer-responsive.css`). Sustitución del apretado `repeat(4, 1fr)` por una cuadrícula balanceada 2x2 (`repeat(2, 1fr)` con `gap: 20px`), otorgando ~350px de ancho a cada tarjeta para erradicar el salto de línea vertical partido en títulos y descripciones.
- **AC-03 [functional]**: Desduplicación textual y jerarquía en tarjetas de evidencia empírica (`AcademicEvidence.jsx` & `evidence.css`). Diferenciación entre el tag del indicador (`INDICADOR CENTRAL`) y la descripción de la métrica (`Prevalencia de Agotamiento Emocional en la Muestra Evaluada`), eliminando la repetición textual idéntica arriba y abajo del `84.3%`.
- **AC-04 [functional]**: Armonización tipográfica y espacial en Transferencia Metodológica (`AcademicTransfer.jsx`) y Marco Normativo (`AcademicLegalFramework.jsx`). Eliminación de bordes decorativos huérfanos y refinamiento de espaciado y contraste tipográfico editorial.
- **AC-05 [functional]**: Aprobación de todas las puertas de calidad (`npm run lint`, `npm test`, `npm run build`), cero fallos en Lighthouse Accesibilidad (100/100) y cero regresiones en responsive.
