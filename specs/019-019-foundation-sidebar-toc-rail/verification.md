# [VERIFICATION-019] Reestructuración Editorial: Rail Lateral Izquierdo Sticky para el Índice del Dossier

## 1. Resumen de Resultados

- **Total de Criterios**: 5
- **Aprobados (PASSED)**: 5
- **Fallidos (FAILED)**: 0
- **Fecha de Verificación**: 2026-10-26
- **Especificación Activa**: `019-019-foundation-sidebar-toc-rail`
- **Puntuación Lighthouse Accesibilidad**: 100/100 (0 fallos)
- **Puntuación Lighthouse Mejores Prácticas**: 100/100

---

## 2. Mapeo Criterio a Evidencia

### AC-01: Cuadrícula editorial de dos columnas (`.academic-body-layout`)
- **Resultado**: PASSED
- **Método**: Inspection / DOM Structure & Runtime Evaluation
- **Evidencia**:
  - En [frontend/src/features/landing/pages/AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx), se implementó `.academic-body-layout` dividiendo el espacio en el rail lateral izquierdo (`.academic-sidebar-rail`) y el flujo editorial (`.academic-content-flow`).
  - Se modularizaron los componentes en [AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx), [AcademicSidebarToc.jsx](../../frontend/src/features/landing/components/AcademicSidebarToc.jsx) y [AcademicAuthors.jsx](../../frontend/src/features/landing/components/AcademicAuthors.jsx).
  - La inspección en el navegador confirmó `layoutDisplay: "grid"` y `layoutGridCols: "240px 754.4px"`.

### AC-02: Rail lateral sticky continuo a `top: 84px` con ScrollSpy reactivo
- **Resultado**: PASSED
- **Método**: Inspection / Chrome DevTools MCP Runtime Evaluation & Screenshots
- **Evidencia**:
  - En [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css), se configuró `.academic-sidebar-rail` con `position: sticky; top: 84px; z-index: 20; max-height: calc(100vh - 104px); overflow-y: auto;`.
  - La evaluación de scroll en el navegador comprobó que `rect.top` permanece anclado en `84px` desde el inicio hasta la última sección (`#marco-legal`), erradicando la desaparición prematura del TOC.
  - Al desplazarse por las 6 secciones (`#autores`, `#evidencia-empirica`, `#transferencia`, `#antivigilancia`, `#citacion`, `#marco-legal`), la clase `.is-active` y `aria-current="true"` se sincronizan con 100% de precisión.

### AC-03: Adaptabilidad responsive en pantallas `< 960px`
- **Resultado**: PASSED
- **Método**: Inspection / CSS Media Queries
- **Evidencia**:
  - En [frontend/src/styles/academic/footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css), se declaró `@media (max-width: 959px)` con `grid-template-columns: 1fr` y `.academic-sidebar-rail { position: static; max-height: none; }`.
  - La lista de saltos temáticos se reorganiza en una cuadrícula fluida (`grid-template-columns: repeat(auto-fit, minmax(170px, 1fr))`), eliminando barras flotantes que tapen el contenido en dispositivos móviles.

### AC-04: Eliminación total del rail lateral en impresión (`@media print`)
- **Resultado**: PASSED
- **Método**: Inspection / CSS Print Rules
- **Evidencia**:
  - En [frontend/src/styles/academic/footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css), `.academic-sidebar-rail` y `.btn-toc-print` poseen `display: none !important` y clase utilitaria `.no-print`.
  - `.academic-body-layout` y `.academic-content-flow` se fuerzan a `display: block !important` con márgenes optimizados para papel y PDF formal.

### AC-05: Verificación de calidad técnica, linter, tests y Lighthouse
- **Resultado**: PASSED
- **Método**: Automated quality gates execution & Lighthouse Snapshot Audit
- **Evidencia**:
  - `cd frontend && npm run lint`: 0 errores, 0 warnings (código 0).
  - `cd frontend && npm test`: 55 de 55 pruebas unitarias exitosas (código 0).
  - `cd frontend && npm run build`: Compilación Vite completada limpiamente en 5.48s (código 0).
  - Lighthouse Accessibility Score: **100 / 100** (0 fallos).
  - Lighthouse Best Practices Score: **100 / 100**.
  - Sincronización WCAG 2.5.3 (Label in Name) validada en botón de impresión del sidebar (`aria-label="Imprimir Ficha PDF del dossier metodológico"`).

---

## 3. Síntesis de la Transformación Editorial

1. **Fin de la "Barra Flotante Rara"**:
   - Se eliminó la barra horizontal intermedia que flotaba en el centro del artículo y se despegaba al scrollear.
2. **Navegación Lateral Continua**:
   - El nuevo rail lateral se siente natural, elegante y funcional a lo largo de todo el dossier, guiando la lectura académica sin estorbar.
3. **Ergonomía de Lectura**:
   - La columna de contenido respeta los `68ch` de medida de lectura confortable con alineación tabular en las estadísticas y gráficos.
