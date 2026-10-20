# [SPEC-010] Rediseño del Canal de Acompañamiento y Chat SST del Agente

Fecha: 2026-10-20
Ruta principal: `http://localhost:5173/agente/apoyo`
Componentes objetivo:
- [`SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx)
- [`SupportRequestForm.jsx`](../../frontend/src/features/agent/components/SupportRequestForm.jsx)
- [`SupportChatCard.jsx`](../../frontend/src/features/agent/components/SupportChatCard.jsx)
- [`apoyo.css`](../../frontend/src/styles/apoyo.css)

---

## 0. Fase de Clarificación y Supuestos

- **Evidencia Observada (UI en ejecución)**: La vista actual presenta un monolito vertical donde un formulario estático de 800px antecede a una lista repetitiva de 9 radicados. El chat interactivo en tiempo real con SST (p. ej. radicado `APO-2026-7AAA82`) está atrapado dentro de un acordeón comprimido dentro de una tarjeta de lista, provocando una experiencia de usuario fragmentada y una estética genérica similar a una mesa de ayuda de tickets de TI.
- **Directriz de Avatar e Identidad**: Se cuenta con el avatar de la agente (Laura Gómez). De acuerdo con la directriz explícita del usuario, **no se permite reutilizar imágenes existentes** de otras vistas (como pausas activas o perfil). Se generará un nuevo activo fotográfico documental coherente mediante el especialista visual para situar a Laura en un contexto realista, profesional y digno de orientación de bienestar laboral BPO.
- **Gobernanza de Datos y Privacidad**: Todo contacto con SST está amparado por el consentimiento C3 (Ley 1581 de 2012 / Dec. 1377 de 2013). La información de acompañamiento permanece estrictamente confidencial entre el agente y el especialista de SST; queda prohibida cualquier visibilidad o reporte hacia supervisores operativos, coordinadores de campaña o WFM.

---

## 1. Necesidad y Alcance

### Necesidad del Usuario (Agente BPO / Laura Gómez)
En operaciones de Contact Center, solicitar orientación a Seguridad y Salud en el Trabajo (SST) representa un acto de vulnerabilidad ante la sobrecarga de llamadas, la tensión postural o el desgaste emocional. Laura necesita:
1. Acceder de inmediato a su conversación activa con el especialista de SST sin tener que desplazarse por un formulario masivo en blanco.
2. Contar con un espacio de diálogo ergonómico, amplio y confiable (chat en vivo) con trazabilidad clara de su radicado.
3. Si desea crear una nueva solicitud, disponer de un flujo guiado, humano y sobrio, que distinga con total claridad la Modalidad Anónima de la Modalidad Confidencial Identificada.
4. Sentirse respaldada por una interfaz profesional, cálida y representativa de su realidad operativa mediante el avatar situado de Laura Gómez.

### Alcance
- Reorganizar la página en un espacio de trabajo navegable con pestañas accesibles WAI-ARIA (`Mis Casos & Chat SST` y `Nueva Solicitud a SST`).
- Desacoplar el chat interactivo en vivo (`SupportChatCard`) para brindarle un contenedor de diálogo digno, ergonómico y enfocado.
- Visualizar el ciclo de vida del radicado institucional (Radicado → Asignación SST → Orientación → Recomendaciones / Cierre).
- Generar e incorporar una nueva fotografía documental inédita del avatar de Laura Gómez orientada al bienestar y acompañamiento preventivo.
- Proporcionar un puente directo a la ruta de apoyo en crisis (Línea 106) y descompresión somática para momentos de urgencia aguda.

### No-Objetivos (Non-Goals)
- No transformar la plataforma en un servicio de diagnóstico psiquiátrico ni emitir juicios clínicos automatizados.
- No alterar los contratos REST ni la arquitectura WebSocket existentes (`/api/v1/agent/support`, `/api/v1/chat`, eventos de socket).
- No permitir visibilidad de radicados individuales a roles distintos de Agente (titular) y SST (especialista).
- No utilizar chatbots de IA generativa ni LLMs remotos para simular respuestas de SST; la orientación es humana y profesional.

---

## 2. Criterios de Aceptación (Acceptance Criteria)

### AC-01: Navegación Ergonómica por Pestañas WAI-ARIA
- **Dado** que el agente navega a `/agente/apoyo` con consentimiento C3 activo.
- **Cuando** carga la pantalla.
- **Entonces** se presenta una estructura de pestañas WAI-ARIA (`role="tablist"`, `role="tab"`, `role="tabpanel"`) con navegación por teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`):
  1. `Mis Casos & Chat SST`: Vista prioritaria que muestra la lista de radicados y la sala de conversación. Si el agente cuenta con al menos una solicitud registrada o un chat en vivo activo, esta pestaña se selecciona automáticamente por defecto.
  2. `Nueva Solicitud`: Formulario guiado y enfocado para radicar una nueva solicitud ante SST.

### AC-02: Espacio de Diálogo en Vivo Desacoplado y Ergonómico
- **Dado** un radicado con sesión de chat interactivo habilitada por SST (p. ej. `APO-2026-7AAA82` con estado `activa`).
- **Cuando** el agente selecciona la conversación.
- **Entonces** el chat se renderiza en un panel de diálogo enfocado y accesible (sin colapsos dentro de tarjetas de lista estrechas), mostrando:
  - Cabecera con especialista asignado, badge de disponibilidad y estado de confidencialidad.
  - Historial de mensajes con timestamps locales y scroll automático reactivo.
  - Compositor de mensajes accesible con atajo de teclado (`Enter` para enviar, `Shift+Enter` para salto de línea).
  - Feedback visual no intrusivo del estado de entrega vía WebSockets.

### AC-03: Trazabilidad del Ciclo de Vida del Radicado (Resolución 2646 / SG-SST)
- **Dado** un radicado registrado por el agente.
- **Cuando** se visualiza su detalle o tarjeta en la lista de casos.
- **Entonces** se visualiza una línea de progreso institucional de 4 fases claras:
  1. *Radicado emitido* (con código de seguimiento formal).
  2. *Revisión SST* (evaluación de nivel de urgencia y asignación de profesional).
  3. *Orientación activa* (intervención sincrónica o asincrónica).
  4. *Cierre preventivo* (recomendaciones ergonómicas/psicosociales y archivo).
- Con diferenciación nítida y sobria entre Modalidad Anónima y Modalidad Confidencial Identificada sin badges genéricos de `border-radius: 9999px`.

### AC-04: Formulario de Radicación Guiado con Motivos Operativos BPO
- **Dado** que el agente selecciona la pestaña de "Nueva Solicitud".
- **Cuando** completa el formulario.
- **Entonces** dispone de:
  - Selector de modalidad con explicación transparente de la reserva de identidad.
  - Motivos de orientación contextualizados a la operación BPO (*Sobrecarga por colas de llamadas*, *Desgaste emocional*, *Tensión postural / ergonomía*, *Bienestar psicosocial preventivo*).
  - Tiempos de atención estimados (SLA ordinario de 24 h hábiles vs. atención pronta para urgencia alta).
  - Nota institucional sobre las competencias del Comité de Convivencia Laboral (CCL - Ley 1010 de 2006).

### AC-05: Integración Visual del Avatar con Nueva Fotografía Inédita
- **Dado** el requerimiento estricto de identidad visual sin reutilización de activos.
- **Cuando** se despliega la cabecera del espacio de acompañamiento.
- **Entonces** se exhibe una nueva imagen fotográfica documental y profesional creada específicamente para situar a Laura Gómez en una escena auténtica de pausa y orientación en un centro de contacto (respetando los lineamientos de `DESIGN.md` y sin ilustraciones cliché de IA).

### AC-06: Puente a Ruta Inmediata de Crisis y Descompresión Somática
- **Dado** que un agente puede experimentar un momento de crisis aguda o sobrecarga durante el turno que no puede esperar el tiempo de gestión de SST.
- **Cuando** observa el canal de acompañamiento.
- **Entonces** dispone de un enlace directo y visible hacia la ruta de primeros auxilios (Línea 106 de Bogotá) y la apertura in-situ del modal de respiración somática 4-2-6 (`SomaticBreathingModal`).

### AC-07: Salvaguarda de Consentimiento C3 y Calidad de Estados
- **Dado** un agente que tiene inactiva la finalidad C3 en su consentimiento informado.
- **Cuando** intenta acceder a `/agente/apoyo`.
- **Entonces** el sistema bloquea el acceso a la radicación individual y despliega el panel explicativo protegido bajo la Ley 1581 de 2012, con enlace directo para gestionar su consentimiento o acceder a la ruta pública de apoyo en crisis.
- **Y** se garantizan los estados obligatorios: Carga, Vacío (sin radicados previos con llamado a la acción empático) y Error con reintento.

---

## 3. Aplicabilidad de Dominio y Cumplimiento

| Control de Seguridad & Cumplimiento | ¿Requerido? | Aplicación Técnica en la Especificación |
| :--- | :---: | :--- |
| **¿Toca datos personales sensibles (PII / Salud)?** | **SÍ** | Protegido bajo Ley 1581/2012 y Res. 2646/2008. Los radicados y mensajes solo son visibles para el agente titular y el equipo de SST. Cero exposición a supervisores o dashboards colectivos. |
| **¿Expone datos entre campañas o tenants?** | **NO** | Cada radicado está vinculado estrictamente al `userId` del agente autenticado o a su sesión con código único si es anónimo. |
| **¿Requiere registro de auditoría?** | **SÍ** | Toda radicación y cambio de estado genera eventos de auditoría institucional (`RADICADO_CREADO`, `ORIENTACION_INICIADA`, `RADICADO_CERRADO`). |
| **¿Cero IA generativa en el chat?** | **SÍ** | El chat es estrictamente humano entre el agente y el especialista de SST mediante WebSockets y persistencia relacional. Cero envío a LLMs. |

---

## 4. Experiencia de Usuario y Estados Obligatorios

1. **Estado Normal**: Espacio de trabajo de acompañamiento dividido en pestañas, con chat en vivo destacado y trazabilidad de radicados.
2. **Estado Vacío**: Ilustración/mensaje empático cuando el agente no tiene radicados previos, guiándolo a abrir una solicitud cuando lo necesite sin generar sensación de desamparo.
3. **Estado de Bloqueo por C3**: Panel institucional explicando la necesidad de consentimiento informado para la gestión individual con SST.
4. **Estado de Carga y Error**: Indicador accesible de carga de radicados y banner de error con botón de reintento si la red o el socket fallan.

---

## 5. Trazabilidad

| Criterio | Componente / Archivo | Método de Verificación |
| :--- | :--- | :--- |
| **AC-01** | [`SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx) | Inspección de navegación por pestañas y teclado WAI-ARIA. |
| **AC-02** | [`SupportChatCard.jsx`](../../frontend/src/features/agent/components/SupportChatCard.jsx) | Verificación de chat en vivo con especialista, WebSockets y envío accesible. |
| **AC-03** | `frontend/src/features/agent/components/SupportRequestList.jsx` | Inspección de timeline de fases y badges sobrios. |
| **AC-04** | [`SupportRequestForm.jsx`](../../frontend/src/features/agent/components/SupportRequestForm.jsx) | Verificación de validación de campos, motivos BPO y switch de anonimato. |
| **AC-05** | `frontend/public/assets/fotos/` | Generación e inspección de la nueva fotografía documental del avatar. |
| **AC-06** | [`SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx) | Verificación de enlaces a Línea 106 y modal de respiración somática. |
| **AC-07** | [`SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx) | Test de bloqueo sin C3, estados de carga, vacío y suites de test del proyecto. |
