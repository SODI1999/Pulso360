# [MIGRATION-028] Finalización del frontend bajo better

## Estrategia y contratos

Inventariar rutas/roles desde App.jsx y usar la aplicación existente como referencia. Mantener React/JSX/Vite, tokens y arquitectura features→core. Preservar cambios027 y trabajo previo sin reescrituras amplias. Reproducir hallazgos por bloques y corregir su responsabilidad compartida cuando corresponda.

1. Revisar rutas públicas/auth/consentimiento y todas las páginas de cinco roles, más reportes/avisos compartidos. Guardar observaciones tipadas y capturas; marcar redirecciones explícitas. Proteger contenido sensible con GET de muestra cuando sea necesario y bloquear mutaciones reales salvo login/logout de cuentas académicas.
2. Completar hooks/componentes de foco/modal existentes: auditor, consentimiento, inactividad, cuenta/perfil y consumidores. Evaluar aislamiento inert de hermanos y apilamiento, foco al abrir/cerrar y controles dinámicos ocultos/deshabilitados. Agregar salto y foco/título de ruta usando router actual sin mezclar dominios.
3. Corregir copy engañoso en sus consumidores. Diferenciar análisis léxico local y persistencia REST; contactos de demostración; participación y finalidades; alcance de exportación y acceso SST. Mantener políticas/servicios existentes, no inventar endpoint ni cambiar autorización.
4. Corregir layout solo cuando render muestre fallo: modales en pantallas anchas/bajas, formularios de reglas/reportes, hash largo y medidas móviles. Reusar clases/tokens, retirar estilos inline duplicados cuando la responsabilidad responsive lo requiera. Revisar contraste efectivo y movimiento.
5. Recorrer el resultado integrado tras las últimas correcciones, cerrar cada hallazgo con evidencia, revisar independencia/claridad de código, ejecutar gates y converger.

Referencias técnicas consultadas2026-11-02: MDN inert (inactividad y exclusión del árbol accesible), ReactRouter useLocation (reacción a cambios de ubicación). Se mantienen versiones instaladas; no se adopta una nueva librería. Decisiones específicas se contrastan con sus consumidores.

## Verificación y recuperación

Scripts: backend npm test; frontend npm test, npm run lint y npm run build. Pruebas apropiadas para lógica compartida/servicios y regresiones verificables; no tests que copian CSS o simulan afirmar render. EvidenciaUI manual real requiere sesión render disponible previa, pasos, esperado/actual, fecha, captura y viewport en criterios visuales.

Comparar límites de foco/nombres mediante teclado y árbolAX, medir boundingrect respecto a contenedores además de scrollWidth para detectar clipping oculto; contrastar copy con servicios. Simular fallos solo en navegador aislado para recuperar estados existentes, sin justificar carga ficticia en producto. Reflow200% equivalente se distingue de menú de zoom nativo. No certificar screenreader/Safari/dispositivo sin ejecución.

Recuperación: revertir únicamente parches de028 si una regresión no puede resolverse; preservar027 y cambios previos. Sin migraciones ni nuevos datos persistidos. Estados/error/reintento usan contratos existentes. El único gate de entrega visual es DESIGN.md; reporte better consolidado y matriz enlazada en verification.md.
