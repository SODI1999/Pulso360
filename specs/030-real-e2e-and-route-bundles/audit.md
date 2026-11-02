# [DEBT-030] E2E real y carga del frontend

## Necesidad y evidencia

Usuario autoriza el recorridoE2E propuesto con cuentasdeprueba y abordar elbundle. Commitbase58eb868 publicado endevelop,árbol limpio al iniciar. Build029:JS962719bytes,CSS423645bytes; App.jsx importa estáticamente todaslas páginas de cinco roles ylanding. Elcliente visitauna página pero recibe módulos ajenos aesa ruta. Backendya posee fixtures/testDB separados,HTTPExpress real ySocket.IO conpersistenciaPostgreSQL; se reutilizan responsabilidades, no interceptar operaciones para afirmarE2E.

No se proporcionó URL de unentorno desplegado. El recorrido se realizará localmente sobre build deproducción yAPI/PostgreSQL técnicos aislados, con sus límites explícitos; no se presentará comoprueba delhosting deGitHub/producción.

## Criterios

- AC-01 [functional]: CUANDO se mida antes/después con igualbuild, la carga inicial de una ruta DEBERÁ excluir las páginas no visitadas y reducir elJS necesario para landing; se DEBERÁ reportar bytes/gzip ygrafo, sin ocultarwarning aumentando umbrales.
- AC-02 [interaction]: CUANDO dos cuentas técnicas agente/SST usen la aplicación compilada y servicios reales, DEBERÁN completar login,radicación,activación,envío enambos sentidos,recarga/persistencia,cierre ysololectura, con evidencia correlacionada enPostgreSQL ysin transporte falso.
- AC-03 [functional]: MIENTRAS se ejecute elE2E, solo se DEBERÁ usar DB_NAME_TEST verificada distinta deDB_NAME y fixtures propios identificables; la limpieza DEBERÁ limitarse aesos registros conservandoauditoría ysinmigrar/borrar bases.
- AC-04 [accessibility]: CUANDO se cargue una página diferida o falle su chunk, la app DEBERÁ mantener unestado comprensible, acción de recuperación y límites de rol/foco sin desmontar innecesariamente el layout.
- AC-05 [functional]: DESPUÉS del cambio, cuatro gates vigentes,regresiones relevantes y recorridoE2E DEBERÁN tener resultados ejecutados vinculados ylímites explícitos. Publicación normal de cambios yactualización delmismoartifact son entrega posterior autorizada.

## Límites

React18/JSX/Vite6,servicios/auth/NLP/persistencia yroles conservados. Sin nuevas dependencias,umbral dechunk inflado,APIdeproducto inventada,migraciones deapp,datosreales,deploy o forcepush. JSDoc yConventionalCommits enespañol. Si hayajustesvisuales,better-interface dirige diseño yvalidación de estados; optimización ytests no cambianproducto.
