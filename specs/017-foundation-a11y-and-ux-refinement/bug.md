# [BUG-017] Corrección de Accesibilidad (A11y), Contraste y Pulido UX en Página de Fundamentación

## Reproduction and environment

- **Entorno de ejecución**: Navegador web en `http://localhost:5173/fundamentacion` (Página pública institucional en [frontend/src/features/landing/pages/AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx)).
- **Herramientas de diagnóstico**: Auditoría automatizada Lighthouse Snapshot, Chrome DevTools MCP y evaluación axe-core.
- **Defectos reproducidos y observados**:
  1. *Fallo de Contraste en Barra de Prevalencia (WCAG 1.4.3 AA)*: En [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css#L142), el segmento medio `.dist-mid` (`background: #D97706`) con texto blanco `.dist-bar-text` produce una relación de contraste de **3.18:1** (inferior al umbral mínimo de 4.5:1 para texto de 12px bold).
  2. *Fallo de Contraste en Badge de Correlación (WCAG 1.4.3 AA)*: En [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css#L424), la clase `.correlation-sig-badge` declara `color: #64748B` sobre `background: #F1F5F9`, generando un contraste de **4.34:1** (inferior a 4.5:1).
  3. *Discrepancia en Botón de Impresión (WCAG 2.5.3 A - Label in Name)*: En [frontend/src/features/landing/components/AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx#L20), el botón `.btn-print-dossier` tiene `aria-label="Imprimir ficha metodológica"` pero su contenido visible es `Guardar / Imprimir Ficha`. El nombre accesible no incluye las palabras visibles iniciales.
  4. *Discrepancia en Botón de Copia de Citación (WCAG 2.5.3 A - Label in Name)*: En [frontend/src/features/landing/components/AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx#L50), el botón `.btn-copy-citation` declara `aria-label="Copiar referencia bibliográfica al portapapeles"` pero el texto visible es `Copiar cita`.
  5. *Semántica ARIA incompleta en Citación y Prevalencia*:
     - En `AcademicCitation.jsx`, las pestañas APA/BibTeX definen `role="tablist"` y `role="tab"` pero el contenedor de texto de la cita carece de `role="tabpanel"` y `aria-labelledby`.
     - En `AcademicEvidence.jsx`, la barra con `role="progressbar"` carece de `aria-valuemin`, `aria-valuemax` y `aria-valuetext`.
  6. *Slop de copy defensivo / redundancia*: En [frontend/src/features/landing/data/academicFoundationData.jsx](../../frontend/src/features/landing/data/academicFoundationData.jsx), el mismo descargo metodológico legalista se repite tres veces consecutivas en cada sub-tarjeta de la sección de evidencia.

## Expected behavior and acceptance criteria

- **AC-01 [functional]**: En [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css), la regla `.dist-mid` o su texto `.dist-bar-text` debe asegurar un contraste medido $\ge 4.5:1$ (mediante `.dist-mid { background: #B45309; }` o texto oscuro en segmento intermedio), cumpliendo con WCAG 2.2 SC 1.4.3 Nivel AA.
- **AC-02 [functional]**: En [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css), la regla `.correlation-sig-badge` debe usar `color: #334155;`, garantizando una relación de contraste $\ge 4.5:1$ sobre fondo `#F1F5F9` (WCAG 2.2 SC 1.4.3 Nivel AA).
- **AC-03 [functional]**: En [frontend/src/features/landing/components/AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx), el botón de impresión debe sincronizar su nombre accesible asignando `aria-label="Guardar / Imprimir Ficha metodológica en PDF"` (WCAG 2.2 SC 2.5.3 Nivel A).
- **AC-04 [functional]**: En [frontend/src/features/landing/components/AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx), el botón de copia debe sincronizar su nombre accesible asignando `aria-label="Copiar cita bibliográfica al portapapeles"` (WCAG 2.2 SC 2.5.3 Nivel A).
- **AC-05 [functional]**: En [frontend/src/features/landing/components/AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx), [frontend/src/features/landing/components/AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx) y [frontend/src/features/landing/data/academicFoundationData.jsx](../../frontend/src/features/landing/data/academicFoundationData.jsx), se debe completar el patrón WAI-ARIA (`role="tabpanel"` en cita, atributos de rango en barra) y consolidar las notas al pie redundantes en una única nota metodológica rigurosa.
- **AC-06 [functional]**: Los quality gates del proyecto (`npm run lint`, `npm test` y `npm run build` en `frontend/`) deben concluir con código de salida 0 sin advertencias críticas ni regresiones funcionales.

## Scope and Non-Goals

- **Alcance**:
  - [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css)
  - [frontend/src/features/landing/components/AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx)
  - [frontend/src/features/landing/components/AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx)
  - [frontend/src/features/landing/components/AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx)
  - [frontend/src/features/landing/data/academicFoundationData.jsx](../../frontend/src/features/landing/data/academicFoundationData.jsx)
- **Non-Goals**:
  - No alterar las referencias legales sustantivas (Ley 23/1982, Res. 2764/2022, Ley 1581/2012, Ley 2191/2022).
  - No modificar la lógica de exportación ni la funcionalidad de copiado de citación en el portapapeles.
  - No cambiar la paleta tipográfica ni los módulos autenticados del sistema.
