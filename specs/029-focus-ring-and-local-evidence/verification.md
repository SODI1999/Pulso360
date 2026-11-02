# Verificación029 · foco y capturas locales

## Alcance y resultado

Corrección deRouteAccessibility/CSS bajo direcciónbetter-interface: entrada/recarga/puntero sinmarco, teclado/salto conindicador; conservar foco/títulos y posición inicial/restaurada. Gitignore limita capturas locales. Revisión/preparación de los cambios027/028/029 para commit ypush autorizados.

| Criterio | Evidencia | Resultado |
|---|---|---|
| AC-01 visual |9observaciones enacceptance.json y evidence/ui-observations.json;capturas reales deapp a320/1366 | Entrada/recarga/puntero conquiet+outline:none,foco y títulos presentes,doc<=client;landingfresh/reloadscroll0. Salto previo115px corregido. |
| AC-02 accessibility |3observaciones deapp y harnessChrome13grupos(evidence/modal-browser.json/.log) | TecladoSPA yskipindicator2px,campo conborde20,112,90 yhalo3px. TestStrictMode conserva scroll200 ySPArevela. Eventos de modalidad simuladosDOM; no input físiconativo ni lector este turno. |
| AC-03 functional |.gitignore ygitcheck-ignore; índicerevisado |621capturas originales~66MB máslas nuevas029 conservadaslocalmente;0imágenes nuevas candidatas ni staged;34activosproducto versionados;sin borrados. |
| AC-04 functional |gate-1/2/3/4 ejecutados/vinculadosporverify029 | Backend132/132,frontend55/55,lint/build0 enpasepreparatorio; CLIrepitepara huellafinal. Warningchunk>500kBconservado. Publicaciónnormal autorizada se ejecuta después yseconfirma mediantehashremoto, no porpasarchecks. |

## Evidencia yentorno

Chrome156 headless dumpDOM/Windows,appreal eniframe sameorigin conviewport medido,perfiltemporal. Sesión1fb7c764-07b1-4655-9ffc-2e32050c84ff antes de observaciones. Deskapreview sinventana;CUAhost/pipe indisponible. La revisiónautomática de permisosrechazóarranqueCDP; no se reintentó. Harness yChromeCLI permitidos ejecutados realmente.

Las capturas dePNGsonlocales ylasaceptacionesreferencian rutas dentrodeesta spec; Git no laspublica porpetición delusuario. Metadatos/textos/fuente síversionados. Elartifactsirveunaselecciónportable. Medicióninput:dumpDOM mantenía CSStransition en0ms,por lo que elfixture finaliza soloesastransiciones para leer elestado finaldelCSSreal; no se altera laaplicación.

Elbaseline de20:21UTC fue observadoantesdelparche. La medición más detallada se añadiódespués; after-ring-render.json registra elestadointermedio sincambio descroll, no se atribuye albaseline. after-render.json ymodosreload/keyboard/pointer/skip/control documentan elcierre. No credenciales/login real ni datosdeproducto enviados enestas pruebas.

## Revisión final y gate único

Ver better-review.md:seisdisciplinas ygateúnicoDESIGN. Coordinadorcontrasta código/CSSconrutasrenderizadas; sinhallazgosaccionables conocidos enalcance. Se eliminó unalíneavacía extra alEOFdesupport-chat.css detectada alrevisar índice. gitdiff--cached--check0 trasajuste. Escaneo limitado dearchivos noignorados:sin.env,llaves/tokenscomunes nimarcadoresdeconflicto; no auditoríaintegral.

Scripts ejecutadosen suscwd originales:backend npmtest;frontend npmtest/lint/build;harnessnode tests/modal-accessibility.browser.mjs aparte. Resultadoautoritativo dehuella/checks enverification.jsongenerado porCLI; no seescribeamano. No modificar código/documentos despuésdelbinding sinreverificar. Commit/push no ejecutan despliegue.
