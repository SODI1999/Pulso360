# [PLAN-004] Technical plan: Rediseño Editorial de la Bitácora del Agente

## Evidence and existing architecture

- **Página principal**: `frontend/src/features/agent/pages/JournalPage.jsx` gestiona el estado global de la bitácora mediante `useJournal.jsx` y estructura el layout en dos paneles (`JournalEntryList` a la izquierda y `JournalEditor` a la derecha).
- **Lista de entradas**: `frontend/src/features/agent/components/JournalEntryList.jsx` actualmente despliega un texto plano `<p>` cuando `journals.length === 0`, generando una percepción de pantalla vacía y formulario frío.
- **Área de escritura**: `frontend/src/features/agent/components/JournalEditor.jsx` contiene el selector contextual, advertencia de datos de terceros, el `<textarea>` de desahogo y el panel explicable `NlpAnalysisPanel.jsx`.
- **Activo visual disponible**: `frontend/public/assets/fotos/bpo-agent-journal-calm.jpg` generado específicamente con la identidad visual 3D oficial de la operadora BPO escribiendo con calma en su libreta de notas.
- **Estilos existentes**: `frontend/src/styles/bitacora.css` centraliza los estilos de chips, factores y layout de desahogo.

## Proposed change

1. **Empty State con Avatar 3D en `JournalEntryList.jsx`**:
   - Reemplazar el párrafo plano por un contenedor `.journal-empty-state`.
   - Incorporar la imagen `bpo-agent-journal-calm.jpg` con alt descriptivo accesible.
   - Añadir microcopy empático que explique el valor del desahogo personal y reafirme la garantía de confidencialidad absoluta (no visible para supervisores ni SST).
2. **Superficie Editorial en `JournalEditor.jsx`**:
   - Refinar el encabezado con insignia de espacio privado y tipografía cercana.
   - Mejorar el confort visual del `<textarea>` (interlineado `1.6`, espaciado ergonómico, bordes armónicos con tokens de diseño).
   - Integrar de forma más armónica el banner pedagógico de advertencia de terceros y el contador de caracteres.
3. **Estilos de Soporte en `bitacora.css`**:
   - Definir clases para el contenedor del empty state, proporción de la imagen, badges de confidencialidad y adaptación responsive para pantallas móviles y escritorios.
4. **Preservación Invariable**:
   - Mantener intactas las firmas de `useJournal.jsx`, `nlpEngine.jsx` y los servicios de persistencia `journalService.jsx`.

## Contracts and compatibility

- **APIs y almacenamiento**: N/A (No se modifican esquemas de base de datos ni contratos HTTP `/api/v1/agent/journal`).
- **Interfaces React**: Las props de `JournalEntryList` y `JournalEditor` se mantienen totalmente compatibles.
- **Compatibilidad**: Compatible con navegadores modernos y responsive hasta anchos de 320px.

## Verification

- **AC-01**: Comprobar visualmente que en ausencia de notas previas se renderice la imagen de la operadora y el mensaje empático en `JournalEntryList`.
- **AC-02**: Verificar que el editor permita escribir fluidamente, seleccionar contexto y visualizar el contador dinámico.
- **AC-03**: Probar que la falta de consentimiento C2 mantenga el bloqueo preventivo y que los datos no sean accesibles fuera del usuario.
- **AC-04**: Ejecutar una nota con términos de prueba (ej: "cliente agresivo", "llamadas difíciles") y validar que `NlpAnalysisPanel` identifique los factores y permita corrección.
- **AC-05**: Ejecutar `npm run lint` y `npm run build` en `frontend/`.

## Rollback / recovery

En caso de fallo o regresión, revertir los cambios en `JournalEntryList.jsx`, `JournalEditor.jsx` y `bitacora.css` mediante `git restore`.
