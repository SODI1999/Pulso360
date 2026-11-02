# Verificación028 · frontend bajo better

Fecha2026-11-02. Alcance34 entradas/30 páginas/4 redirecciones; cinco roles ypúblico. Autoridad de revisión: solicitud expresa delusuario; better-interface coordina seis disciplinas y el gate únicoDESIGN. ConvenciónJSDoc. No commits,push,deploy,migraciones o registros reales modificados por los flujos de revisión.

## Criterios revisados

| Criterio | Evidencia | Resultado y límite |
|---|---|---|
| AC-01 visual | [Inventario](route-inventory.json),[108 rendersfinales](evidence/final-route-matrix.json),aceptación117observaciones |34 entradas verificadas; documento sinoverflowlateral a 320/768/1366. Rutascompartidas porrol y4 redirecciones. No todos los datos/dispositivos. |
| AC-02 interaction | acceptance.json28observaciones; [registroincremental](evidence/browser-observations.json) y [reportebetter](better-report.md) | Flujos principales/cancelación/error/pending/retry/empty/protected. Mutaciones yacuses de muestra; no entregaE2E real. |
| AC-03 accessibility |16observaciones; [AX36](evidence/ax-names-matrix.json);[harnessChrome](evidence/modal-browser-final.log) | Teclado/foco/inert/stack/nombres/tabs/pending/copia confirmados;11 gruposharness0. No lector de pantalla. |
| AC-04 functional | PrivacyVisibilityMatrix,ConsentSummaryCard,ConsentPreferences,servicios,landing,academicFoundationData ydecisionclassroom-research-provenance | Copycorresponde a capacidades/datos. Aclaraciónusuario:aula/materia,únicafuente datosdeesaactividad; no avalpublicaciónuniversitaria. No auditado datasetoriginal. |
| AC-05 visual |15observaciones, [contraste](evidence/contrast-measurements.json),[barridofinal](evidence/final-contrast-scan.json),gateDESIGNenreportebetter | Escalas30etiquetas,hash,modalbajo,trámites,reglas,spacing yreflowequivalente200%. No menú dezoomnativo/gradientes/fotos/certificaciónAAglobal. |
| AC-06 functional | Revisiones de fuente independientes ycoordinador; backend/servicios/auth/roles/almacenamiento yNLP conservados | Refactorizacionesacotadas,features→core; sin nuevasdependencias/stack/permisos/endpoints. Tests relacionados se vinculan porAC07; noauditoríaintegralseguridad. |
| AC-07 functional | gate-1/2/3/4 ejecutadosporCLIverify028→verification.json | Elregistroautomáticofinal es autoridad de ejecución. Resultadosdirectos anteriores15:44UTC son históricos; no cerrar por ellos. Warningchunk>500kB conservado. |
| AC-08 functional |12causasconsolidadas [better-report.md](better-report.md), matricesactuales ycierresporobservación | Hallazgosaccionables conocidos cerrados enalcance. Baselines fallidos ypasadasintermedias conservados ydistintos delestadofinal. |

## Entorno y transporte

Windows,Node 24.22.1,Vite6.4.4,Chrome 156/CDPaislado enloopback; CLI0.8.1igualmanifest. Sesiónrender41377bbe-f56e-474b-92a1-abdf704609d9 previa aobservaciones. Deskapreview no tenía ventanadisponible enúltimointento,causanoestablecida; ChromeDevTools autorizadoporusuario yusado realmente. Sin inspección de navegadorespersonales.

GETsensiblesdejournal/checkin/habeas se vaciaron para revisión; chat/casos/textosMUESTRA-UI. Todaslas mutaciones deproducto seinterceptaron localmente salvo autenticación académica. No llamadas/errores/contactos reales enviados. Capturasconcuentas/nombres de la demo preexistente; no evidencia de entregaE2E.

## Comprobaciones complementarias ejecutadas

- node tests/modal-accessibility.browser.mjs desdefrontend:exit0,11 grupos;[metadatos](evidence/modal-browser-final.json). UsaDOMreal yperfiltemporalpropio, no simula afirmar rendering.
- git -c core.safecrlf=false diff --check:exit0.
- ÁrbolAX renderizado en36 combinaciones:0controlesinteractivos sin nombre enlosestadosinspeccionados; no sustituye uso delector.
- Parescomputados:sidebar6.92,admin4.84,SSTcaption7.58,info5.57,acciones106: 5.47/155: 16.30/123: 7.60. Excluidosgradientes/fotos/opacity<1/disabled; separadoresdecorativosexentos.
- Textoampliado320 trasúltimoparche:doc305=client305, etiquetas completas; reflowCSS 683×384DPR2 doc668=client668. No menúzoomnativo.

La capturadefinidapor cadaobservación se conserva dentrodeesta spec. El artifactDeska es un extracto portable conreporte/matrices/capturas seleccionadas porlímite depayload; el conjuntocompleto quedaencheckout. No se presenta esereportecomoaplicación conectada.

## Ejecución automática final

Comando final: node specs/.omni/runtime/bin/omni-spec.mjs verify 028. El JSON generado registra comandos,códigos,duración y vínculos de aceptación; complete028 solo procede si ese resultado es exitoso y vigente. El contexto y los documentos no sustituyen ese registro ni se escribe verification.json a mano.

Pase directo de preparación: backend132/132(44suites),frontend55/55,lint0,build0. Las salidas y metadatos final-* se conservan; el posterior ajuste CSS del footer de supresión también pasó lint/build. El build actual produce JS962.12kB(gzip268.47kB) y advierte chunk>500kB. El CLI vuelve a ejecutar los gates para vincularlos a la huella final del código/documentos, como exigeOmni.

El fallo intermedio de iconografía por CheckCircle se corrigió reutilizando CheckCircle2. Confirmaciones de rectificación y supresión comprobadas en navegador después de corregir:0data-icon-missing. Footer móvil de supresión corregido y alcanzado con Tab/scroll interno a 320 y texto ampliado.
