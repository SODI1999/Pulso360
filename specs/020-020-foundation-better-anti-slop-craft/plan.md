# [PLAN-020] Plan de Implementación: Elevación Integral Better & Erradicación Anti-Slop

## 1. Arquitectura de Componentes y Flujo de Datos

1. **Eje Better-UI & Better-Colors: Des-slopificación del Rail Lateral TOC**:
   - En [evidence.css](../../frontend/src/styles/academic/evidence.css):
     - Simplificar `.academic-toc-sidebar`: eliminar sombras pesadas y aspecto de "caja sobre caja". Mantener un fondo beige cálido muy sutil (`#FAF8F5`) o transparente con borde fino `1px solid var(--landing-line, #E5E0D6)`.
     - Depurar `.toc-sidebar-header`: usar color neutro de baja saturación (`color: var(--landing-body, #485B58)`), eliminando el verde esmeralda chillón en el título *"ÍNDICE DEL DOSSIER"*.
     - Rediseñar `.toc-sidebar-link.is-active`: erradicar el fondo blanco con `box-shadow` y la pestaña verde curvada de 3px. Aplicar sobriedad tipográfica: texto tinta profunda (`color: var(--landing-ink, #112623)`), `font-weight: 700`, fondo neutro sutilísimo plano (`rgba(17, 38, 35, 0.04)`), y un indicador de línea izquierda recta sin deformaciones de radio (`border-left: 2px solid var(--landing-green-dark, #082F28)`).
     - Botón de impresión en el sidebar: estilo botón secundario neutro, tipografía legible y foco `:focus-visible`.

2. **Eje Better-Layout & Better-Typography: Reestructuración de Salvaguardas Anti-Vigilancia**:
   - En [ethics.css](../../frontend/src/styles/academic/ethics.css):
     - Cambiar `.surveillance-pillars-grid` de `repeat(4, 1fr)` a una cuadrícula de 2x2: `grid-template-columns: repeat(2, 1fr); gap: 20px;`.
     - Esto expande el ancho útil de cada tarjeta de 134px a más de 340px, permitiendo que títulos extensos como *"Separación de bienestar y evaluación de desempeño"* fluyan sin partirse en 6 renglones.
     - Ajustar los encabezados internos de los pilares (`.pillar-title`) con `font-size: 0.92rem; line-height: 1.35;` y las descripciones (`.pillar-desc`) con `font-size: 0.82rem; line-height: 1.5;`.
     - En `@media (max-width: 640px)`: mantener colapso limpio a 1 columna.

3. **Eje Better-Writing & Better-Interface: Desduplicación en Evidencia Empírica**:
   - En [AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx):
     - Diferenciar el tag superior: `INDICADOR PSICOMÉTRICO CENTRAL`.
     - Mantener la cifra grande: `84.3%`.
     - Título descriptivo: `Prevalencia de Agotamiento Emocional en la Muestra Evaluada`.
     - Eliminar la repetición literal y coordinar la leyenda tricolor con la barra de distribución.

4. **Eje Better-UI: Armonización en Transferencia y Marco Jurídico**:
   - En [transfer.css](../../frontend/src/styles/academic/transfer.css) y [legal.css](../../frontend/src/styles/academic/legal.css):
     - Eliminar la franja superior verde gruesa de 3px en el marco legal (`border-top: 3px solid #082F28`) para unificar el marco con las demás tarjetas del dossier.
     - Pulir espaciados y contraste de badges en la matriz de transferencia metodológica.

---

## 2. Archivos Afectados

- [frontend/src/features/landing/components/AcademicSidebarToc.jsx](../../frontend/src/features/landing/components/AcademicSidebarToc.jsx)
- [frontend/src/features/landing/components/AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx)
- [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css)
- [frontend/src/styles/academic/ethics.css](../../frontend/src/styles/academic/ethics.css)
- [frontend/src/styles/academic/legal.css](../../frontend/src/styles/academic/legal.css)
- [frontend/src/styles/academic/footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css)
- [specs/020-020-foundation-better-anti-slop-craft/tasks.md](tasks.md)
- [specs/020-020-foundation-better-anti-slop-craft/acceptance.json](acceptance.json)

---

## 3. Data Contracts and API Contracts (N/A Justification)

- **Contratos de Datos / API Contracts**: N/A (Justificado). Esta especificación se limita a la ergonomía visual, tipografía, composición y erradicación de slop de interfaz en el frontend. No modifica APIs de backend, endpoints REST, esquemas de base de datos ni contratos en `specs/contracts.json`.
- **Persistencia**: Cero impacto en `pulsoStore`.
- **RBAC**: Permanece como ruta pública institucional.

---

## 4. Rollback and Migration Reversal Strategy (N/A Justification)

- **Migraciones de Base de Datos**: N/A (Justificado). No existen transformaciones de esquemas persistidos.
- **Estrategia de Reversión (Rollback)**: Reversión limpia vía control de versiones Git (`git checkout` o `git revert`) sobre los componentes y hojas de estilo de landing modificados.
