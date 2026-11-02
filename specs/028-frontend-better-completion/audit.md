# [DEBT-028] Completar la revisión y corrección del frontend con better

## Evidencia y costo actual

El usuario pide completar todas las correcciones, mejoras y refactorizaciones dirigidas por better y exige revisión en navegador. La deuda027 corrigió audit-001, con57 observaciones guardadas en dos pasadas, pero no recorrió cada ruta. App.jsx declara34 rutas/entradas; el inventario de esta deuda registra cada una y distingue páginas de redirecciones.

Inspección de fuente detecta candidatos concretos: inspector auditor sin manejo completo de foco; filtro de rol sin nombre; consentimiento/inactividad con gestión modal incompleta; foco/título de ruta; copy que dice bitácora solo local pese a journalService REST; formulario contacto que confirma envío sin transmitir; garantías laborales sin respaldo; exportación cuyo alcance se exagera; SLA fijo sin dato real; feedback de solicitud fallida presentado como éxito; fechas/grids/modales potencialmente recortados. Los hallazgos de layout se confirmarán por render, no por presencia de un patrón.

Roles afectados: público, agente, supervisor, SST, auditor y administración. Datos: cuentas académicas existentes y muestras técnicas claramente marcadas; no escribir, borrar ni cerrar registros reales. Servicios/auth/consentimiento/límites de privacidad se preservan.

## Alcance, criterios y no objetivos

- AC-01 [visual]: CUANDO se complete la revisión, cada entrada de App.jsx DEBERÁ tener resultado de render o redirección con rol autorizado; las páginas DEBERÁN revisarse a320/768/1366CSSpx con evidencia y sin contenido o acciones inaccesibles por clipping.
- AC-02 [interaction]: CUANDO se ejerciten los flujos principales y estados posibles del inventario, las acciones DEBERÁN comunicar resultado/cancelación/error y recuperación; las mutaciones de revisión DEBERÁN usar transporte de muestra sin afectar datos reales.
- AC-03 [accessibility]: CUANDO se navegue por rutas, formularios y diálogos afectados, el sistema DEBERÁ ofrecer nombres accesibles, foco comprensible, salida/ciclo modal y retorno, sin interacción con el fondo del modal; las acciones de copia DEBERÁN anunciar éxito solo tras confirmación.
- AC-04 [functional]: CUANDO se expliquen almacenamiento, participación, acceso, contacto, exportación o atención, el copy DEBERÁ corresponder al servicio implementado y distinguir capacidades locales de backend sin inventar garantías, plazos ni políticas.
- AC-05 [visual]: CUANDO se usen pantallas estrechas, reflow o espaciado ampliado, formularios, datos largos y modales DEBERÁN conservar acciones alcanzables, texto legible y pares de contraste medidos; la revisión seguirá las seis disciplinas better y el gate único DESIGN.
- AC-06 [functional]: DESPUÉS de las refactorizaciones, se DEBERÁ conservar stack, interfaces de servicios, persistencia, privacidad y límites de rol, sin dependencias entre features hermanas ni lógica duplicada de autorización.
- AC-07 [functional]: DESPUÉS de corregir y revisar, los cuatro gates vigentes DEBERÁN pasar y quedar vinculados por verify028, con límites y warnings conservados.
- AC-08 [functional]: CUANDO se cierre el trabajo, todo hallazgo accionable detectado dentro del alcance DEBERÁ tener corrección y comprobación de cierre; la matriz DEBERÁ distinguir revisado de no verificado y no atribuir aprobación global a observaciones parciales.

Fuera de alcance: nuevos productos/roles/endpoints, cambios de stack, base de datos/migraciones, garantías clínicas/legales inventadas, datos reales modificados, commits y despliegues. No se promete certificación global de accesibilidad ni revisión de todos los motores/dispositivos. Lector de pantalla y móvil físico se registran según disponibilidad real.

Autorización: solicitud explícita de finalización y orquestación por better del2026-11-02. Dirección better-interface con responsabilidades acotadas de accesibilidad, layout/tipografía/UI y escritura/veracidad; coordinador valida render, decide y consolida. Convención de APIs: JSDoc. La revisión de fuentes independiente no sustituye navegador.
