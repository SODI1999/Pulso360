# [FIX-016] Estrategia de Corrección (Landing Page A11y & Reflow)

## Minimal change and compatibility

- **Archivos afectados**:
  1. `frontend/src/styles/landing/agent-demo.css`: Ajustar color de `.factor-chip.selected .chip-hint` a `#ffffff`.
  2. `frontend/src/styles/landing/hero.css`: Añadir media query `@media (max-width: 420px)` para colapsar `.disconnection-safeguards-grid` a 1 columna.
  3. `frontend/src/styles/landing/base.css`: Definir `:focus-visible` con `outline: 2px solid var(--landing-emerald); outline-offset: 2px;` para `.header-login`, `.nav-link-mobile-cta` y `.mobile-toggle`.
  4. `frontend/src/features/landing/components/Navbar.jsx`: Ajustar enlace de marca eliminando `aria-label` redundante y marcando logotipo con `alt=""` decorativo para cumplir WCAG 2.5.3 (Label in Name).
  5. `frontend/src/features/landing/components/AgentDemoPanel.jsx`: Reemplazar roles de pestaña por botones nativos con `aria-pressed={selectedSituation.id === s.id}`.
- **Riesgo**: Bajo. Intervenciones mínimas de CSS y accesibilidad semántica que preservan el estado y la arquitectura.
- **Reversibilidad**: Inmediata mediante control de versiones.

## Regression verification

- **Verificación previa a la corrección**:
  - Contraste medido: 4.34:1 en factor 4 (fallo WCAG 1.4.3).
  - Ancho de scroll a 320px: `safeguard-item` en 331px (desborde de 11px, fallo WCAG 1.4.10).
  - Foco visible ausente en controles interactivos de cabecera (fallo WCAG 2.4.7).
  - Discrepancia de etiqueta visible en enlace de marca (fallo WCAG 2.5.3).
- **Verificación posterior a la corrección**:
  - Contraste medido $\ge$ 4.88:1 en factor 4 (Lighthouse Accessibility: 100/100).
  - Cero desbordamiento horizontal en viewport de 320px (`scrollWidth <= clientWidth`, 0 elementos fuera de límite).
  - Anillo de foco de 2px visible en todos los elementos interactivos comprobado por evaluación de DOM (`missingFocusCount: 0`).
  - Sincronización exacta de nombre accesible y texto visible (0 fallos de accesibilidad en auditoría axe/Lighthouse).
  - Ejecución de `npm run lint`, `npm test` y `npm run build` en `frontend/` exitosa con código 0.

## Tasks

- [x] **TASK-01 [Styles/Colors]**: Corregir la regla `.factor-chip.selected .chip-hint` en [frontend/src/styles/landing/agent-demo.css](../../frontend/src/styles/landing/agent-demo.css) asignando `color: #ffffff;` para superar el umbral de 4.5:1 (AC-01).
- [x] **TASK-02 [Styles/Layout]**: Agregar regla `@media (max-width: 420px)` en [frontend/src/styles/landing/hero.css](../../frontend/src/styles/landing/hero.css) para colapsar `.disconnection-safeguards-grid` a 1 columna y prevenir el desborde a 320px (AC-02).
- [x] **TASK-03 [Styles/A11y]**: Incorporar estilos de foco accesible `:focus-visible` en [frontend/src/styles/landing/base.css](../../frontend/src/styles/landing/base.css) para `.header-login`, `.nav-link-mobile-cta` y `.mobile-toggle` (AC-03).
- [x] **TASK-04 [Components/A11y]**: Actualizar el enlace de marca y la imagen del logo en [frontend/src/features/landing/components/Navbar.jsx](../../frontend/src/features/landing/components/Navbar.jsx) para cumplir Label in Name (AC-04).
- [x] **TASK-05 [Components/Semantics]**: Simplificar los selectores de escenario en [frontend/src/features/landing/components/AgentDemoPanel.jsx](../../frontend/src/features/landing/components/AgentDemoPanel.jsx) utilizando botones nativos con `aria-pressed` (AC-05).
- [x] **TASK-06 [Verification/Quality]**: Ejecutar linter, tests y build de producción en `frontend/` y validar en vivo con Chrome DevTools (AC-06).
