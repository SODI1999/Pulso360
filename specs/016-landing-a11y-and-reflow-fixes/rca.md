# [RCA-016] Investigación de Causa Raíz (Landing Page A11y & Reflow)

## Evidence and hypotheses

1. **Hipótesis 1 (Contraste Nivel 4 en `agent-demo.css`)**:
   - *Evidencia*: En [frontend/src/styles/landing/agent-demo.css:211](../../frontend/src/styles/landing/agent-demo.css#L211), la regla `.factor-chip.selected .chip-hint` define `color: rgba(255, 255, 255, 0.88);`. Al seleccionarse el factor 4 (`.factor-level-4.selected`, fondo `#c2410c`), la opacidad del 88% produce un blanco atenuado `#f8e8e2`.
   - *Resultado del análisis*: axe-core y Lighthouse calculan un ratio de contraste de 4.34:1. Dado que el tamaño de fuente es `0.68rem` (~10.88px, texto normal pequeño), el criterio WCAG 1.4.3 Nivel AA exige al menos 4.5:1. Con `color: #ffffff;`, el contraste resultante es 4.88:1, superando el umbral normativo.

2. **Hipótesis 2 (Desbordamiento a 320px en `hero.css`)**:
   - *Evidencia*: En [frontend/src/styles/landing/hero.css:470-478](../../frontend/src/styles/landing/hero.css#L470-L478), `.disconnection-safeguards-grid` declara `grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px;`.
   - *Resultado del análisis*: A 320px de ancho total, con un contenedor padre restringido a ~296px utilizables, dos columnas de tarjetas con relleno y gap requieren al menos 308px, empujando `.safeguard-item` a `right: 331px` (11px de desbordamiento horizontal fuera del viewport). La falta de una consulta de medios para móviles estrechos (< 420px) rompe WCAG 1.4.10 (Reflow).

3. **Hipótesis 3 (Ausencia de Foco Visible en `Navbar`)**:
   - *Evidencia*: En [frontend/src/features/landing/components/Navbar.jsx](../../frontend/src/features/landing/components/Navbar.jsx), los controles `.nav-link-mobile-cta` y `.mobile-toggle` poseen `tabindex="0"` implícito pero carecen de una regla específica `:focus-visible` en [frontend/src/styles/landing/navbar.css](../../frontend/src/styles/landing/navbar.css).
   - *Resultado del análisis*: Al recibir foco vía teclado, el navegador aplica `outline: none` heredado de normalizaciones globales sin proveer un reemplazo accesible, violando WCAG 2.4.7.

4. **Hipótesis 4 (Discrepancia en Nombre Accesible de Marca)**:
   - *Evidencia*: En [frontend/src/features/landing/components/Navbar.jsx:93](../../frontend/src/features/landing/components/Navbar.jsx#L93), el enlace `.brand` declara `aria-label="Pulso360, volver al inicio"`. Dentro del enlace residen `<span className="brand-name">Pulso360</span>` y `<span className="brand-context">Bienestar laboral</span>`, además de la imagen con `alt="Pulso360"`.
   - *Resultado del análisis*: El árbol de accesibilidad calcula el nombre accesible suprimiendo el texto visible *"Bienestar laboral"*. Los usuarios de navegación por voz que dicten *"Click Bienestar laboral"* no logran activar el elemento, violando WCAG 2.5.3 (Label in Name).

5. **Hipótesis 5 (Semántica ARIA incompleta en selector de escenarios)**:
   - *Evidencia*: En [frontend/src/features/landing/components/AgentDemoPanel.jsx:87](../../frontend/src/features/landing/components/AgentDemoPanel.jsx#L87), las píldoras de escenario usan `role="tab"` dentro de `role="tablist"` sin un `role="tabpanel"` mapeado mediante `aria-controls`.
   - *Resultado del análisis*: Rompe el patrón ARIA APG de pestañas. Los lectores de pantalla anuncian un rol compuesto sin panel de contenido asociado.

## Root cause

La causa raíz es la ausencia de reglas CSS específicas para estados extremos de accesibilidad (contraste en fondos terracota y reflow en 320px), combinada con atributos ARIA que sobrescribieron indebidamente el contenido visible o añadieron roles compuestos incompletos en la maquetación editorial inicial.
