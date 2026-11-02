# [PLAN-030] Medición y prueba integrada

1.Medir buildactual con hookRollup de observación,bytes/gzip y módulos; comparar inicial estático y carga de ruta sin confundir suma de todosloschunks conbytes realmente requeridos. ReferenciasReact.lazy yVite6 secontrastan con versionesinstaladas; no usaropcionesRolldown deVite8.
2.Dividir páginas en lazy imports estables a nivelmódulo. Reusar rutas/ProtectedRoute yconservar layout. Suspense yerrorboundary acotadosa carga de páginas con estado/acceso/foco revisados porbetter. Sinreorganización defeatures niCSS global sinmedición.
3.Reusar aislamientoDBtest yfixtures dechat existentes. Crear cuentas únicas deagente/SST con consentimientodeprueba como precondición; servir buildproducción,HTTP ySocket reales enpuertosloopback. Navegadores/almacenamientos separados,accionesUI medianteDOM verificadas contra resultado persistido. NoCDP ni intercepción para falsificaréxito.
4.Ejercitar recorrido,medir recursos ypersistencia; limpiar solo losIDs propios,detener servidores/perfiles propios. Ejecutar scripts existentes yregresiones; revisar fuente/evidencia antesdelbindingOmni.

Recuperación:revertir parchesacotados si fallanservicios/foco; no reset destructivo ni rollback deBD productiva. No se tocaesquema. La pruebaE2E puedecrear/eliminar susfixtures temporales en la base técnica yaautorizada por elusuario; guardias explicitas contraBD principal. Un recorrido local nopru ebadespliegue niinput físico.
