# [SPEC-019] Reestructuración Editorial: Rail Lateral Izquierdo Sticky para el Índice del Dossier

## 0. Clarification & Assumptions (Anti-Hallucination Gate)

- **Problema Observado**: El índice de navegación `.academic-toc-strip` estaba alojado dentro del `<header className="academic-hero-header">`. Al hacer scroll y rebasar el encabezado, el elemento sticky se despegaba y desaparecía del viewport porque su contenedor padre finalizaba. Además, una barra horizontal centrada a `top: 64px` invadía la altura de lectura vertical, compitiendo con la barra de navegación web.
- **Solución Acordada**: Separar la cabecera editorial (`AcademicHeader`) del cuerpo del artículo y estructurar este último en un layout de 2 columnas (`academic-body-layout`). Alojar el índice temático en un `<aside className="academic-sidebar-rail">` a la izquierda, con orientación vertical, `position: sticky; top: 88px;`, ScrollSpy reactivo y persistencia durante el 100% del recorrido del artículo.
- **Dispositivos Móviles / Tablets**: En anchos de pantalla `< 960px`, el layout degrada a 1 columna donde el índice se sitúa como tarjeta de navegación no intrusiva al inicio del contenido, sin tapar el texto.
- **Impresión (@media print)**: El rail lateral se oculta por completo (`display: none !important`), permitiendo que el flujo de contenido ocupe el 100% del ancho de papel disponible.

### Non-Goals
- No alterar los textos, datos empíricos ni el contenido de las secciones ya auditadas.
- No modificar el Navbar global ni los componentes de otras páginas de la aplicación.
- No introducir librerías externas de layout ni dependencias adicionales.

---

## 1. Criterios de Aceptación (Acceptance Criteria)

- **AC-01 [functional]**: El cuerpo del artículo tras el encabezado hero se organiza en una cuadrícula de dos columnas (`.academic-body-layout`) compuesta por el rail lateral (`.academic-sidebar-rail`) a la izquierda y el contenedor de secciones (`.academic-content-flow`) a la derecha.
- **AC-02 [functional]**: El rail lateral `<aside className="academic-sidebar-rail">` permanece sticky (`position: sticky; top: 88px; z-index: 20`) durante todo el desplazamiento por el artículo (desde `#autores` hasta `#marco-legal`), mostrando el enlace activo con clase `.is-active`, indicador visual y `aria-current="true"` mediante ScrollSpy.
- **AC-03 [functional]**: En pantallas estrechas (`@media (max-width: 959px)`), la cuadrícula se transforma a 1 sola columna (`grid-template-columns: 1fr`) y el rail lateral se desactiva como sticky (`position: static`), garantizando CLS = 0 y evitando superposiciones.
- **AC-04 [functional]**: En `@media print`, el rail lateral se oculta (`display: none !important`) y el contenedor de contenido ocupa el ancho completo para maximizar la legibilidad en PDF/papel.
- **AC-05 [functional]**: Todas las compuertas de calidad (`npm run lint`, `npm test`, `npm run build`) pasan exitosamente con código de salida 0; Lighthouse Accesibilidad se mantiene en 100/100.
