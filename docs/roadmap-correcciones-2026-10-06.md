# Correcciones de auditoría local · 2026-10-06

Alcance autorizado: corregir los hallazgos de la auditoría, conservar comportamiento y arquitectura, y demostrar cierre. No desplegar ni enviar correos externos. Conservar el cambio previo de README.md.

| Bloque | Trabajo | Cierre requerido | Estado |
|---|---|---|---|
| 1. Autenticación y operación | H01 JWT, H02 mínimo privilegio PostgreSQL, H12 health | Clave pública rechazada, login válido, usuario API sin superusuario ni CREATE en public, health sanitizado | Completado |
| 2. Privacidad y consentimiento | H03 finalidad C3, H04 mock encapsulado, H05 esquema/parser CSV | C3/C5 correctos, escrituras mock condicionadas, CSV desconocido/malformado rechazado | Completado |
| 3. Flujos y accesibilidad | H06 teclado CSV, H07 modales, H08 navegación, H09 periodos, H10 auditoría | Navegador por rol, teclado/foco, fechas reales, resultados no inventados | Completado en los controles afectados; accesibilidad global pendiente |
| 4. Pruebas y mantenimiento | H11 limpieza, H13 dependencias, H14 documentación | Suites repetidas, audit completo/runtime cero avisos, instrucciones corregidas y gates completos | Completado |
| 5. Integración y revisión | Recorridos pendientes de la auditoría y Delivery Gate DESIGN.md | Reporte, apoyo y Habeas Data contrastados con PostgreSQL; C3 revocada 403; limpieza propia | Cierre de correcciones comprobado; entrega integral NO-GO por cobertura pendiente |

Cada bloque reutiliza los contratos existentes. Las mejoras opcionales de bundle o código candidato a muerto solo se aplican si su beneficio y consumidores están comprobados. La indisponibilidad de SMTP no se convierte en una funcionalidad ficticia.

Validación final: frontend npm test dos veces, npm run lint y npm run build; backend npm run test:db y npm test en base separada; navegador y persistencia para cambios relevantes. Las operaciones técnicas en la base principal deben quedar identificadas; no restaurar ni reinicializar datos.

Resultado: frontend 32/32 dos veces; backend 113/113 en 44 suites, repetido; lint/build aprobados; 7/7 gates automáticos. Las últimas correcciones de copy se comprobaron nuevamente en navegador y con los cuatro gates frontend. Se retiraron los nueve usuarios de navegador y sus entidades; auditoría conservada.

Continuación priorizada: transporte SMTP y recuperación real; descargas a archivo; scheduler habilitado y migración desde versión anterior en destinos técnicos; recorridos UI restantes de gobernanza/intervenciones y CRUD; accesibilidad global. Requieren evidencia, no simplemente más cambios de código. Bundle y candidatos a código muerto continúan como mejoras opcionales.

Informe detallado: `docs/audits/correcciones-preflight-audit-2026-10-06.md`. Roadmap e informe son documentos locales ignorados por la política actual; no se cambió su publicación en Git.
