# Pulso360 · cierre de frontend dirigido por better

Fecha:2026-11-02. TrabajoOmni028, continuación de027. Estado de revisión de interfaz: **Approve dentro del alcance observado**; ningún hallazgo accionable conocido queda abierto. Los gates finales y cierre deOmni se consultan en verification.json, generado por el CLI. Una revisión finita no certifica todo dispositivo, estado o ausencia de defectos futuros.

## Alcance y cobertura

Se revisaron las34 entradas de App.jsx:30 páginas y4 redirecciones. Las rutas compartidas se recorrieron con sus roles:reportes con supervisor/SST/admin; avisos con los cinco roles. La matriz final contiene108 renders estables a 320/768/1366CSSpx (36 combinaciones página/rol). La fuente de cobertura es [route-inventory.json](route-inventory.json) y [final-route-matrix.json](evidence/final-route-matrix.json), no el número de capturas históricas. Se esperaron350ms al cambiar de ancho para no juzgar una transición a mitad de recorrido.

Stack conservado:React18,JavaScript/JSX,Vite,ReactRouter,servicios REST y CSS/tokens existentes. Convenciones consultadas:AGENTS raíz y frontend/src/roles,CONSTITUTION,DESIGN,pulso360-ui-craft y antislop pertinentes. better-interface coordinó accesibilidad, layout, escritura, tipografía, colores y UI; tres revisores con responsabilidades acotadas aportaron fuente y correcciones. El coordinador ejecutó el navegador y consolidó resultados. Un auditor independiente revisó fuente y detectó el fallo confirmado de refresco en Mis datos; quedó corregido y vuelto a comprobar.

| Disciplina | Evidencia inspeccionada | Resultado |
|---|---|---|
| Accessibility | useModalA11y,RouteAccessibility,cuenta/perfil,auditor,consentimiento,inactividad,pestañas y nombresAX; teclado real y harnessDOM | Corregidos foco/aislamiento/retorno, nombres, tabs, foco pendiente y copia.36 combinacionesAX sin controles sin nombre en los estados inspeccionados. |
| Layout | Renders108, modales1366×400, reglas/reportes, hash64caracteres, subtabHabeas,header | Corregidos mínimos intrínsecos, wrapping y altura. Sin overflow lateral del documento en matriz final. Tablas conservan scroll local para comparación. |
| Writing | Servicios efectivos, consentimiento, exportación, contacto, apoyo/SST, datos y origen académico | Copy describe capacidades comprobadas y resultados confirmados. La investigación es actividad de aula de una materia. |
| Typography | Cinco etiquetas en las seis dimensiones del check-in; texto largo/hash, espaciado ampliado y reflow | Eliminado truncado que impedía decidir; etiquetas completas y botones que envuelven. |
| Colors | Tokens compartidos, barrido de texto en36 combinaciones, pares computados de acciones/roles/estados | Pares fallidos corregidos con colores existentes. Mediciones y exclusiones en contrast-measurements.json. |
| UI | Estados de envío/copia/confirmación, cuenta/perfil, modales y movimiento reducido | Un resultado confirma lo ocurrido; errores conservan borradores y ofrecen recuperación. Sin efectos nuevos sin función. |

## Hallazgos consolidados y cierre

Son causas compartidas, no una lista por componente. La severidad expresa el perjuicio reproducido antes de corregir. Todos están cerrados en este pase.

| Severidad | Disciplina | Ubicación | Antes | Después | Perjuicio y comprobación |
|---|---|---|---|---|---|
| HIGH | Accessibility | frontend/src/core/hooks/useModalA11y.jsx:106; consumidores auditor/consentimiento/inactividad/perfil | Foco fuera, fondo operable, ciclos con controles ocultos o superficie anterior | Stack único,inert reversible,foco visible/disponible,Tab/Escape superior,retorno y foco en superficie si todo está disabled | Impedía operar con teclado; harness11 grupos y fixed-auditor-dialog-copy,fixed-sst-pending-focus,perfil/policy/inactividad. |
| HIGH | Accessibility | frontend/src/core/components/RouteAccessibility.jsx:34; core/components/tabNavigation.js:7; admin/UsersRolesPage; core/auth/AccessDenied.jsx:16 | Navegación sin foco/título; filtro sin nombre; tabs sin flechas; /403 inventaba rol sin sesión | Salto/main/título/foco de ruta,labels,tabs con flechas/Home/End y panel asociado; sin sesión ofrece/login | AX36, fixed-spa-route-focus,fixed-admin-tabs-keyboard,fixed-notifications-tabs-keyboard y delivered-public-403-320. |
| HIGH | Interaction | frontend/src/features/agent/hooks/useMyDataPrivacy.jsx:19; components/SuppressionConfirmModal.jsx | Dos envíos durante pendiente y cierre del modal tras fallo | Guardia síncrona por operación,controles pending,confirmación retenida,error visible | fixed-habeas-pending-error y fixed-suppression-pending-error:unPOST;draft/confirmación permanecen. |
| HIGH | Writing | frontend/src/features/agent/hooks/useMyDataPrivacy.jsx:92; pages/MyDataPrivacyPage.jsx; hooks/useSupportChannel.jsx:40 | POST confirmado seguido de GET fallido ocultaba resultado o confundía recuperación con nueva radicación | Snapshot conservado,éxito independiente,advertencia de actualización y reintentoGET | fixed-habeas-confirmed-refresh-error,fixed-habeas-refresh-get-only y soporte confirmado:unPOST antes/después de retry. |
| HIGH | Writing | frontend/src/features/auth/hooks/useConsent.jsx:17; agent/SupportRequestForm; reports/useReports.jsx; auditor/AuditLogTable.jsx:94 | Errores presentados como éxito; Copiado antes de resolver Clipboard | Feedback tipado por resultado,rolesalert/status; awaitClipboard; limpieza protegida de borradores | fixed-consent-error-feedback,consent-pending-controls,support-request-error-feedback,fixed-auditor-copy-return/error. |
| HIGH | Writing | frontend/src/features/agent/components/PrivacyVisibilityMatrix.jsx:8; auth/consentData; landing/demos y LoginPage | Bitácora solo local,acceso exclusivo y garantías laborales/legales sin implementación suficiente | Distingue análisis léxico local y registrosREST,acceso por tipo/rol,participación y límites reales; auth indica prototipo estudiantil | Fuente contrastada con servicios/auth/consentimiento; fixed-privacy-truth. No cambia permisos ni introduce diagnóstico. |
| HIGH | Writing | frontend/src/features/landing/hooks/useContactForm.jsx:10; ContactForm,ContactenosPage | Mensaje enviado y recepción prometida sin canal conectado | Preparar resumen local,demo explícita,validación y foco; sin correo ni endpoint inventado | fixed-contact-local-summary:0solicitudesAPI; errores de formulario y reset de foco comprobados. |
| HIGH | Writing | frontend/src/features/landing/data/academicFoundationData.jsx:10; AcademicHeader,Authors,Citation,Evidence,Backing,landingData | Presentación que atribuía publicación/semillero/alcance institucional sin fuente | Actividad de aula dentro de una materia;datos de esa actividad originan la idea. Atribución de material no publicado, sin DSpace/aval ni generalización sectorial | Decisión explícita del usuario,classroom-provenance,classroom-print-view y render final. No se auditó el dataset original. |
| HIGH | Typography | frontend/src/styles/agent/checkin.css:327 | Etiquetas visibles S…/B…/J… en columna estrecha | Lista de cinco opciones de ancho disponible,etiquetas completas que envuelven | fixed-checkin-six-scales-mobile registra30etiquetas sinclamp; delivered-agente-agente-checkin-320 y texto ampliado. |
| HIGH | Layout | styles/shared/primitives.css,feedback.css,responsive.css;reports.css;sst.css:133;admin.css:155;agent/my-data-privacy.css:690;layout.css:1207 | Reportes/hash/reglas/gridsHabeas/fieldset y acciones desbordaban; modal en1366×400 fuera de vista | min-width0,grids adaptables,hash envolvente,accioneswrap,modal con gutter/scroll y header que crece | Matriz108 sinoverflow; fixed-report-hash,fixed-modal-low-desktop,rules-catalog-mobile-readable,delivered-habeas-actions-mobile,delivered-suppression-mobile-actions y closure-*-text-spacing. |
| HIGH | Colors | frontend/src/styles/tokens.css:80;99;layout.css;notifications.css;crisis.css | Texto/cuentas/contadores y acciones con pares por debajo del mínimo | Tokens semánticos existentes más oscuros y tinta de estado apropiada | sidebar6.92,admin4.84,caption7.58,info5.57;106: 5.47/155: 16.30/123: 7.60. Ver mediciones y límites. |
| MEDIUM | Writing | ConsentSummaryCard;HabeasDataActionCenter;NotificationsPage;CrisisSupportPage | Flags faltantes asumidosactivos,exportación exagerada,avisos descritos solo personales y cierres/pausas sin contexto | Flags normalizados,alcanceJSON/CSV explícito,avisos cuenta/rol y acciones comprensibles | consent-summary-contract.test.mjs5casos y render; exportación describe datos disponibles, sin prometer copia total. |

## Verificación ejecutada y límites

Navegador:Chrome 156 aislado por CDP,Windows,Vite local. Sesión41377bbe-f56e-474b-92a1-abdf704609d9 anterior a las observaciones. El usuario autorizó ChromeDevTools como alternativa; Deska no tenía ventana en el último intento y no se determinó la causa.

La evidencia incremental [browser-observations.json](evidence/browser-observations.json) conserva reproducciones fallidas, diagnósticos y pasadas intermedias: un resultado histórico fallido no es el estado final. El inventario y la matriz final apuntan a la comprobación de cierre correcta. Las observaciones manuales registran actor,sesión,pasos,esperado,actual,fecha,viewport y artefacto. Se inspeccionaron capturas móviles de todas las páginas y capturas representativas de escritorio; las acciones críticas se ejercitaron, no se dedujeron de screenshots.

Casos revisados: login/denegación/redirecciones; recuperación503 y token ausente; consentimiento/política/pending; cuenta/perfil y tabs; check-in seis preguntas y guardado fallido; bitácora con borrador fallido; apoyo inicialerror/reintento y POSTconfirmado+GETfallido; Misdatos rectificación/supresión/error/pending/refresco; contacto localvalidación/resumen/reset; CSV columnas rechazadas y una fila válida comprobada sinimportación; campaña y seguimiento supervisor con error deguardado; reportes/hash; auditor modal/copia denegada y confirmada; conversaciónSST/agente, borrador,acuse local,error,sololectura,cancelar,cierreerror y pendiente.

Para SST/chat se reutilizó la muestra técnica del trabajo027 en el navegador:GET/POST/Socket interceptados, textosMUESTRA-UI. No se enviaron mensajes ni se cerraron casos reales, no se radicaron solicitudes/campañas reales ni se enviaron correos. Login/logout de cuentas académicas sí se ejecutaron. Un acuse local no demuestra entregaE2E entre cuentas; los contratos de servidor se verifican aparte en sus tests.

[Harness de DOM real](evidence/modal-browser-final.log): node tests/modal-accessibility.browser.mjs desdefrontend,exit0,11 grupos. Complementa las interacciones de aplicación con aislamiento,stack,superficies dinámicas,handlersReact,pendiente y tabs. No es parte del glob npmtest y se informa separado.

[Contraste](evidence/contrast-measurements.json) usa colores computados y composiciónalfa sobre superficies opacas. El barrido de texto excluye imágenes/gradientes,opacity<1 y disabled. Se revisaron los candidatos decorativos:separadores•/·/slash sin significado propio y flecha con significado repetido,ratio3.14como gráfico. No se convierte ese barrido en certificaciónWCAG global.

Reflow equivalente200% aCSS 683×384DPR2 y espaciado de texto(lineheight1.5,letter.12em,word.16em,paragraph2em) comprobados en flujos exigentes. Se respetó prefers-reduced-motion. No se operó zoom nativo ni lector de pantalla,Safari/Firefox,móvil físico o todas las combinaciones de contenido/errores de cada endpoint. El hook useBpoPause no tiene consumidor montado:su cambio de infraestructura es inspección+harness, sin afirmar recorrido de un flujo inexistente.

El pase final de tests detectó dos referencias al nombre no registrado CheckCircle en confirmaciones de trámites; se reutilizó CheckCircle2 del catálogo existente. Ambos éxitos se comprobaron después en navegador sin data-icon-missing. Al revisar ese modal a 320 se corrigió además su footer:Cancelar ya no queda fuera por la izquierda; Tab con texto ampliado lo revela mediante scroll interno.

## Gate único de DESIGN

| Criterio | Estado | Evidencia |
|---|---|---|
| Tarea y composición | VERIFICADO | Rutas y roles del inventario; empleado conserva tareas personales, organización vistas agregadas. Contacto y origen explican su contexto real. |
| Proporción y responsive | VERIFICADO |108 renders finales320/768/1366; modales anchos/bajos,hash largo,escala,subtabHabeas y catálogoreglas. |
| Funcionamiento y estados | VERIFICADO en flujos descritos | Interacciones reales,error/pending/empty/read-only/cancelación/reintento; transporte de muestra especificado. No todos los endpoints/variantes posibles. |
| Privacidad,roles y evidencia | VERIFICADO dentro del cambio | Contratos de acceso/servicios conservados; denegaciónadmin→SST; agregadosprotegidos;copy yprocedencia corregidos. No auditoría integral de seguridad ni validación clínica. |
| Accesibilidad | VERIFICADO en comprobaciones descritas | AX36,teclado,focus/inert/stack,contraste,reflow,espaciado,movimientoreducido. Lector de pantalla y móvil físico:NO VERIFICADO. |
| Integración técnica | VERIFICADO por comandos ejecutados; vínculo final en verification.json | Cuatro gates configurados se ejecutan mediante verify028; harnessDOM11 y diff--check0 separados. Warning de chunk>500kB conservado. |

## Fuentes técnicas consultadas

Consultadas2026-11-02: [MDN inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert),[ReactRouter useLocation](https://reactrouter.com/api/hooks/useLocation). No cambio de versiones/stack. Teléfonos contrastados con [Minsalud106](https://www.minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx) y [MinTransporte155](https://mintransporte.gov.co/publicaciones/11241/linea-155-para-orientacion-a-mujeres-victimas-de-violencia-basada-en-genero/); no se realizaron llamadas ni se verificó disponibilidad operativa llamando.

**Veredicto better-interface:Approve para el alcance y estados observados.** Sin HIGH/MEDIUM/LOW accionables conocidos pendientes en ese alcance. Los límites de cobertura anteriores permanecen explícitos. No se hizo commit,push,despliegue,migración ni publicación.
