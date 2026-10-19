# [SPEC-004] Rediseño Editorial de la Bitácora del Agente con Avatar 3D ("Modo Desahogo")

Date: 2026-10-18
Status: IN_PROGRESS
Type: feature

## 0. Fase de Clarificación y Supuestos

- **Propósito confirmado**: Elevar la experiencia de la Bitácora Laboral (`/agente/bitacora`) para transformar una interfaz utilitaria y plana ("estilo formulario de tickets") en un espacio visualmente cálido, acogedor y de verdadero desahogo psicológico para el operador de Contact Center.
- **Activo visual verificado**: Se reutiliza el activo 3D oficial generado para este propósito: `frontend/public/assets/fotos/bpo-agent-journal-calm.jpg` (operadora BPO concentrada y serena escribiendo en su cuaderno físico).
- **Invariantes inviolables**:
  - Aislamiento absoluto de privacidad: las notas de bitácora pertenecen exclusivamente al titular (`usuario_id = $1` en backend y cliente). Nunca se muestran en vistas agregadas de supervisores ni SST.
  - El motor NLP léxico determinista local permanece inalterado funcionalmente (sin llamadas a LLMs remotos ni diagnósticos clínicos no autorizados).
  - Los protocolos de consentimiento C2 (bitácora personal) y C3 (análisis NLP) se respetan estrictamente.
  - El protocolo centinela de crisis y la corrección humana permanecen funcionales.

## 1. Need and scope

- **¿Quién lo necesita?**: El agente de Contact Center/BPO.
- **¿Por qué?**: Tras jornadas de alta tensión operativa (colas saturadas, clientes hostiles, presión de AHT), el agente necesita procesar el desgaste emocional. Actualmente la interfaz de bitácora es una caja de texto plana sin empatía que no invita al desahogo ni transmite la atmósfera de confianza y refugio que promete el producto.
- **Alcance**:
  - Incorporar un **Empty State ilustrado con el avatar 3D** (`bpo-agent-journal-calm.jpg`) en el panel de entradas previas cuando el usuario aún no tiene notas.
  - Rediseñar visualmente la tarjeta de **Modo Desahogo** (`JournalEditor.jsx`) con detalles editoriales y somáticos (tipografía de diario de trabajo, encabezado acogedor, selector contextual y contador ergonómico).
  - Mejorar la armonización del banner de privacidad de terceros y del panel de análisis NLP explicable.
  - Asegurar contraste accesible (WCAG AA), estados interactivos y adaptabilidad móvil.
- **Non-Goals**:
  - No se modifica el motor de análisis `nlpEngine.jsx` ni sus diccionarios de términos.
  - No se modifican los contratos de API (`/api/v1/agent/journal`).
  - No se agregan nuevas dependencias ni librerías de estilos.
  - No se expone ningún dato de bitácora a roles superiores (supervisores, SST o administradores).

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (Empty State con Avatar 3D)**: Cuando el agente no tiene notas registradas (`journals.length === 0`), `JournalEntryList` renderiza un contenedor ilustrado con `bpo-agent-journal-calm.jpg`, copy empático de orientación y un llamado a la acción claro para redactar su primera entrada.
- **AC-02 (Rediseño Editorial de Modo Desahogo)**: `JournalEditor` adopta una superficie de trabajo cuidada ("diario de bienestar personal"), con tipografía legible, bordes armónicos, contador de caracteres ergonómico y un selector de contexto operativo intuitivo.
- **AC-03 (Preservación de Invariantes de Privacidad & Consentimiento)**: Si el agente carece de consentimiento C2, se mantiene el bloqueo pedagógico explicativo. Las bitácoras continúan aisladas exclusivamente para su autor y registradas en auditoría sin filtrar texto privado.
- **AC-04 (Continuidad del Análisis NLP Explicable y Corrección)**: El panel `NlpAnalysisPanel` mantiene la exhibición de factores orientativos, evidencia en `#hashtag`, modales de corrección humana, historial y protocolo centinela de crisis sin regresiones.
- **AC-05 (Calidad Técnica y Gates de Entrega)**: Validación limpia en `npm run lint` (0 errores / 0 advertencias), compilación exitosa con Vite en `npm run build`, y suites de tests unitarios de frontend y backend operativas.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | SÍ | Las notas de bitácora pueden contener desahogos sensibles. Se mantiene la advertencia pedagógica de privacidad ante datos de terceros y el aislamiento local por `userId`. |
| **Does it expose cross-tenant data?** | NO | Cada agente solo accede a sus propios registros vía autorización estricta en repositorio y store. |
| **Does it require audit logging?** | SÍ | Se registran eventos de auditoría (`REGISTRO_BITACORA`, `ACTUALIZACION_BITACORA`, `ELIMINACION_BITACORA`, `CORRECCION_NLP`) registrando metadatos pero **nunca el texto íntimo de la bitácora**. |
| **¿Accede o procesa datos sensibles?** | SÍ | Procesamiento léxico 100% en el dispositivo del usuario (`nlpEngine.jsx`), sin transmisión de texto a servicios externos ni a roles de supervisión. |

## 4. Experiencia y límites

- **Estado vacío**: Tarjeta con avatar 3D escribiendo en libreta, mensaje de bienvenida cálido e invitación a escribir.
- **Estado de escritura**: Textarea ergonómico con contador dinámico y advertencia pedagógica reactiva al detectar posibles nombres o documentos.
- **Estado de carga y guardado**: Indicador de análisis visual (`isAnalyzing`) en botón principal ("Analizando…").
- **Estado restringido**: Banner centinela explicativo si la finalidad C2 de consentimiento está desactivada.
- **Accesibilidad**: Etiquetas `htmlFor`/`id` accesibles, roles ARIA en estados dinámicos y navegación completa por teclado.

## 5. Traceability

| Criterio | Plan / Componentes Afectados | Archivos Clave | Verificación |
| :--- | :--- | :--- | :--- |
| **AC-01** | Empty state ilustrado | `frontend/src/features/agent/components/JournalEntryList.jsx`, `frontend/src/styles/bitacora.css` | Inspección visual y render condicional `journals.length === 0` |
| **AC-02** | Rediseño editorial | `frontend/src/features/agent/components/JournalEditor.jsx`, `frontend/src/styles/bitacora.css` | Inspección de layout, textarea y estilos |
| **AC-03** | Privacidad y C2 | `frontend/src/features/agent/pages/JournalPage.jsx`, `frontend/src/features/agent/hooks/useJournal.jsx` | Verificación con/sin consentimiento C2 |
| **AC-04** | Análisis NLP & Corrección | `frontend/src/features/agent/components/NlpAnalysisPanel.jsx`, `frontend/src/core/nlp/nlpEngine.jsx` | Pruebas de análisis léxico y corrección de factores |
| **AC-05** | Quality Gates | `frontend/`, `backend/` | `npm run lint`, `npm run build`, `npm test` |
