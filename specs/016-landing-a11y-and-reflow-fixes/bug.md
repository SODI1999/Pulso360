# [BUG-016] Correcciones de Accesibilidad (A11y), Contraste y Reflow en Landing Page

## Reproduction and environment

- **Entorno de ejecución**: Navegador web en `http://localhost:5173/#inicio` (SPA Vite/React 18 con layout de aterrizaje en [frontend/src/features/landing/pages/LandingPage.jsx](../../frontend/src/features/landing/pages/LandingPage.jsx)).
- **Herramientas de diagnóstico**: Auditoría automatizada Lighthouse Snapshot, inspección con Chrome DevTools MCP y evaluación de árbol de accesibilidad axe-core.
- **Pasos de reproducción de los defectos observados**:
  1. *Fallo de Contraste (WCAG 1.4.3 AA)*: Inspeccionar el botón `.factor-level-4.selected` (chip de factor *Saturado*) en el simulador interactivo de check-in ([frontend/src/features/landing/components/AgentDemoPanel.jsx](../../frontend/src/features/landing/components/AgentDemoPanel.jsx)). El texto `.chip-hint` tiene color `rgba(255, 255, 255, 0.88)` sobre fondo `#c2410c`. Contraste medido: 4.34:1 (inferior al umbral requerido de 4.5:1).
  2. *Desbordamiento a 320px (WCAG 1.4.10 AA)*: Emular un viewport móvil estrecho de 320×640px. Las tarjetas `.safeguard-item` dentro de `.disconnection-safeguards-grid` ([frontend/src/styles/landing/hero.css](../../frontend/src/styles/landing/hero.css)) conservan 2 columnas fijas y desbordan el borde derecho de la pantalla por 11px (`right: 331px`).
  3. *Ausencia de Foco Visible (WCAG 2.4.7 AA)*: Navegar con el teclado (tecla Tab) en la cabecera fija ([frontend/src/features/landing/components/Navbar.jsx](../../frontend/src/features/landing/components/Navbar.jsx)). Al posicionar el foco sobre el botón toggle del menú móvil (`.mobile-toggle`) y el enlace CTA móvil (`.nav-link-mobile-cta`), el indicador de foco (`outline`) desaparece.
  4. *Discrepancia Nombre Accesible vs Texto Visible (WCAG 2.5.3 A)*: Inspeccionar el enlace de marca principal (`<Link className="brand">`). Muestra visualmente *"Pulso360 Bienestar laboral"*, pero su atributo `aria-label="Pulso360, volver al inicio"` omite el texto visible secundario y duplica el nombre en el `alt` del logotipo.
  5. *Semántica ARIA incompleta*: Las píldoras de escenario de piso en `AgentDemoPanel.jsx` definen `role="tab"` dentro de un `role="tablist"` sin un `role="tabpanel"` enlazado por `aria-controls`.

## Expected behavior and acceptance criteria

- **AC-01 [functional]**: El texto explicativo `.factor-chip.selected .chip-hint` en [frontend/src/styles/landing/agent-demo.css](../../frontend/src/styles/landing/agent-demo.css) debe utilizar `color: #ffffff;`, asegurando un contraste medido de al menos 4.88:1 sobre el fondo `#c2410c`, cumpliendo con WCAG 2.2 SC 1.4.3 Nivel AA.
- **AC-02 [functional]**: La grilla `.disconnection-safeguards-grid` en [frontend/src/styles/landing/hero.css](../../frontend/src/styles/landing/hero.css) debe incorporar una regla `@media (max-width: 420px)` que colapse a 1 columna (`grid-template-columns: 1fr;`), garantizando que en un ancho de 320px no exista desbordamiento horizontal (`scrollWidth <= clientWidth`), cumpliendo con WCAG 2.2 SC 1.4.10 Nivel AA.
- **AC-03 [functional]**: Las clases `.nav-link-mobile-cta` y `.mobile-toggle` en [frontend/src/styles/landing/navbar.css](../../frontend/src/styles/landing/navbar.css) deben implementar estilos `:focus-visible` con `outline: 2px solid var(--landing-emerald); outline-offset: 2px;`, satisfaciendo WCAG 2.2 SC 2.4.7 Nivel AA.
- **AC-04 [functional]**: El componente [frontend/src/features/landing/components/Navbar.jsx](../../frontend/src/features/landing/components/Navbar.jsx) debe actualizar el enlace de marca a `aria-label="Pulso360 Bienestar laboral, volver al inicio"` y marcar el logotipo con `alt=""` decorativo, satisfaciendo WCAG 2.2 SC 2.5.3 Nivel A.
- **AC-05 [functional]**: Las píldoras de selección de escenarios interactivos en [frontend/src/features/landing/components/AgentDemoPanel.jsx](../../frontend/src/features/landing/components/AgentDemoPanel.jsx) deben utilizar elementos de botón nativo `<button type="button" aria-pressed={activeScenario === id}>` sin declarar roles de pestaña incompletos (`role="tab"` / `role="tablist"` sin `tabpanel`), siguiendo las directrices WAI-ARIA APG.
- **AC-06 [regression]**: La suite completa de calidad del frontend (`npm run lint`, `npm test` y `npm run build`) debe ejecutarse exitosamente con código de salida 0 sin advertencias críticas ni regresiones funcionales.

## Scope and Non-Goals

- **Alcance**:
  - [frontend/src/styles/landing/agent-demo.css](../../frontend/src/styles/landing/agent-demo.css)
  - [frontend/src/styles/landing/hero.css](../../frontend/src/styles/landing/hero.css)
  - [frontend/src/styles/landing/navbar.css](../../frontend/src/styles/landing/navbar.css)
  - [frontend/src/features/landing/components/Navbar.jsx](../../frontend/src/features/landing/components/Navbar.jsx)
  - [frontend/src/features/landing/components/AgentDemoPanel.jsx](../../frontend/src/features/landing/components/AgentDemoPanel.jsx)
- **Non-Goals**:
  - No modificar la lógica de autenticación ni los módulos de los roles internos (`agente`, `supervisor`, `sst`, `auditor`, `admin`).
  - No introducir nuevas dependencias npm ni frameworks de diseño externos.
  - No alterar las rutas públicas de fundamentación ni contacto.
