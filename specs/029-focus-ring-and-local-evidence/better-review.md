# Revisión better029: foco, entrada y capturas locales

Alcance: corrección compartida sobre los destinos de ruta h1/h2/main; entrada/recarga de landing,403 ylogin; navegaciónSPA, salto y controles. Preparación de publicación de027/028/029 autorizada por el usuario. React/JSX,Vite,servicios,roles ypersistencia conservados. Better-interface dirige; better-accessibility corrigió fuente yregresión; coordinador revisó fuente,estilos ycapturas de rutasreales.

## Cobertura de las seis disciplinas

| Disciplina | Evidencia | Resultado |
|---|---|---|
| Accessibility | RouteAccessibility, tokens,layout,landing/base;13gruposDOMChrome y12observacionesdeapp | Foco/título conservados; entrada/puntero sinmarco,teclado/salto conindicador,controlesintactos. |
| Layout | Capturas reales a320/1366; posición inicial de landing | Sin overflow deldocumento. Se eliminó saltoinicial115px conservando posición nativa/restaurada. |
| Writing | No se cambió copydeproducto; informe/contrato distinguen foco de selección | Clear enalcance.No nuevohallazgoaccionable. |
| Typography | Títulos sinmarco, sin cambios de fuente/tamaño/jerarquía | Clear: no se altera composición,legibilidad ni texto. |
| Colors | Tokens existentes; foco2pxrgb15,118,110 al teclado; input conserva borde/halo propio | Clear enpares afectados; no nueva paleta ni certificaciónglobal. |
| UI | Modalidadcapturada sinprevenir eventos; marcadorlimpiadoalblur; scroll yStrictMode | Cierres confirmados porregresión yrender; sin nuevasanimaciones. |

## Hallazgos y cierre

| Severidad | Disciplina | Ubicación | Antes | Después | Comprobación |
|---|---|---|---|---|---|
| MEDIUM | Accessibility | frontend/src/core/components/RouteAccessibility.jsx;styles/tokens.css197 | Foco programático inicial recibía :focus-visible global yparecía selección de título | Destino estático marcadoquiet al entrar/puntero;keyboard al navegarcon teclado; el CSS solo alcanza h1/h2/main marcados |9observaciones deentrada/recarga/puntero sinoutline; foco y título presentes. TecladoSPA yskipconoutline2px. |
| MEDIUM | Layout | RouteAccessibility.focusContent | scrollIntoView almontar landing forzaba scrollY115 sininteracción | Montaje conserva scrollnativo; cambioSPA ysaltoexplicito revelan destino. Refsresisten dobleeffectStrictMode | Landingfresh/reloadscrollY0; harnessconservascroll200preexistente ydespuésSPA revela. |
| MEDIUM | Mantenimiento | .gitignore |621PNGnuevas de revisión,66,466,057bytes candidatas aGit | Ignorar solo imágenes specs/*/evidence; conservar archivos locales,JSON y34assetsdeproducto versionados |gitcheck-ignore,0imágenes nuevas candidatas,sin imágenesstaged; archivoslocales conservados. |

## Verificación y límites

Chrome156 real,headless,dumpDOM,perfiles temporales separados. Appreal mediante iframe delmismoorigen con viewport medido320×768/1366×768; no se confunde tamaño dePNG conviewportCSS. Seinspeccionaron capturas. Los eventos de modalidad y activación de controles están simulados conDOM; no son input físico ni un paseCDP nativo. Recargadeframe real observada conload2. No datosintroducidos/login/envíos/cierres reales.

El harnessDOM Chrome ejecutó13grupos exit0, incluidos los11anteriores y2regresiones nuevas. Al medir elinput en dumpDOM, su transiciónCSS quedaba encurrentTime0:elfixture la finaliza para comprobar el estilo final real(borde20,112,90 yhalo3px); no se modifica CSSdeproducto para la prueba. No se afirma lector depantalla ni prueba en todoslosroles/motores.

Deskapreview sigue sinventana yCUAhost/pipe indisponibles. La revisión automática depermisos rechazó elarranque deChromecon depuraciónremota; no se volvió a intentar. Se usó elharnesspermitido ycapturasCLI delnavegador. Artifactlist volvióa funcionar.

Los cuatrogates delproyecto y su vinculación final corresponden a verification.json generado porCLI. Elwarningdebundle>500kB se conserva; no se inventa un problema de rendimiento sinmedición. La revisión antes de publicar no detectó .env/llaves/tokenscomunes ni conflictos entrelos archivoscandidatos en elescaneo limitado; no es auditoríaintegral de seguridad.

## Único gate de DESIGN

| Criterio | Estado | Evidencia |
|---|---|---|
| Tarea y composición | VERIFICADO | Encabezados conservan rol/jerarquía yse abandona apariencia de selección trasentrada/puntero. |
| Proporción yresponsive | VERIFICADO |6renders principales a320/1366;doc<=client. No cambiosdedimensiones. |
| Funcionamiento yestados | VERIFICADO | Entrar,recargar,SPA porpuntero/teclado,salto,campo yStrictMode;async/modalcubrimiento existenteharness. |
| Privacidad,roles yevidencia | VERIFICADO dentrodelcambio | Sin modificarservicios,permisos,NLP,datos ocopy; activacionesDOM noenvían formularios. |
| Accesibilidad | VERIFICADO enalcance observado | Foco real/estilos computados,marcadorlimpiado,teclado13grupos; no inputfísico olector este turno. |
| Integración técnica | VERIFICADO por scripts ejecutados; vínculo final en verification.json | Cuatro gates actuales ejecutados yvinculados porverify029; harness separado. |

**Veredicto better-interface:Approve dentrodelalcance observado.** Sin hallazgosaccionables conocidos abiertos sobre estos cambios. Commit/push constituye entrega posterior al gate yse informa porhash remoto; este documento no afirma que publicar hayaocurrido antesdeejecutarlo.

Fuentes técnicas consultadas2026-11-02:[MDN focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible),[MDN HTMLElement.focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus). No seintrodujoAPIexperimental o dependencia.
