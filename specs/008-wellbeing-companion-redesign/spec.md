# [SPEC-008] Rediseño Ergonómico de la Vista "Mi Bienestar" ("Compañero de Turno")

Date: 2026-10-19  
Status: IN_PROGRESS  
Type: feature  

## 0. Fase de Clarificación y Supuestos

- **Propósito confirmado**: Erradicar el **slop propio** y el aplanamiento estéril en la vista de bienestar del agente ([`MyWellbeingPage.jsx`](../../frontend/src/features/agent/pages/MyWellbeingPage.jsx)), transformando una interfaz fría tipo "planilla de auditoría médica" en una experiencia cálida, ergonómica y accionable de **Compañero de Turno** para operadores de Contact Center / BPO.
- **Evidencia base**: Diagnosticado formalmente en [Auditoría 037](../../archive/anti-slop/audit-037-2026-10-19.md) y validado en runtime sobre `http://localhost:5173/agente/mi-bienestar`.
- **Activos visuales verificados**:
  - Imagen oficial de bienestar BPO en puesto de trabajo: [`bpo-agent-pause-completed.jpg`](../../frontend/public/assets/fotos/bpo-agent-pause-completed.jpg) para el empty state.
  - Modal de descompresión somática in-situ ya implementado y testeado: [`SomaticBreathingModal.jsx`](../../frontend/src/features/agent/components/SomaticBreathingModal.jsx).
- **Invariantes inviolables**:
  - Privacidad absoluta del titular: las jornadas y dimensiones somáticas pertenecen exclusivamente al agente (`userId = currentUser.id`). Nunca se exponen de forma individual a supervisores ni a SST.
  - Los datos continúan proviniendo del repositorio centralizado en [`pulsoStore.js`](../../frontend/src/core/storage/pulsoStore.js) y [`agentQueries.jsx`](../../frontend/src/features/agent/services/agentQueries.jsx).
  - Cero dependencias externas nuevas (se utilizan React 18, Canvas 2D nativo y tokens oficiales de [`tokens.css`](../../frontend/src/styles/tokens.css)).
  - Sin diagnósticos clínicos automáticos: las dimensiones son descriptivas de fatiga ocupacional y ergonomía de turno, no diagnósticos patológicos.

## 1. Need and scope

- **¿Quién lo necesita?**: El agente de Contact Center / BPO que consulta su histórico de turnos.
- **¿Por qué?**: Tras jornadas de alta demanda telefónica, el agente necesita comprender cómo se distribuye su fatiga y qué acciones puede tomar para recuperarse. Actualmente la pantalla es una tabla monótona con números gigantes (`4 / 5`, `5 / 5`), divisores estériles, promesas incumplidas en copy (dice ofrecer recomendaciones ergonómicas pero no las tiene) y un callejón sin salida cuando la tensión es crítica.
- **Alcance**:
  - **Matriz Somática Táctil en dos bloques temáticos**: Sustituir la lista continua plana por tarjetas somáticas ergonómicas agrupadas en *Bloque 1: Cuerpo & Vitalidad* (Batería, Tensión por usuarios, Descanso) y *Bloque 2: Operación & Entorno* (Respaldo en línea, Piloto automático, Eficacia de sistemas), con iconografía semántica Lucide y barras de avance contenidas.
  - **Micro-recomendaciones ergonómicas reales**: Implementar en [`myWellbeingHelpers.jsx`](../../frontend/src/features/agent/services/myWellbeingHelpers.jsx) consejos prácticos de piso de llamadas según el nivel de cada dimensión (estiramientos cervicales, descanso visual 20-20, hidratación, pausas de desconexión auditiva).
  - **Accionabilidad inmediata ante tensión alta**: Si la tensión por llamadas o la fricción técnica es crítica (≥ 4), habilitar un llamado directo a la acción para abrir la *Pausa de Descompresión Somática* ([`SomaticBreathingModal.jsx`](../../frontend/src/features/agent/components/SomaticBreathingModal.jsx)) o registrar un desahogo en la Bitácora.
  - **Síntesis cualitativa de vitalidad semanal**: Acompañar el gráfico de tendencia ([`WellbeingHistory.jsx`](../../frontend/src/features/agent/components/WellbeingHistory.jsx)) con una tarjeta de interpretación humana del ciclo reciente, superando la fría media aritmética ("3.9 / 5").
  - **Selector de jornadas ergonómico y accesible**: Enriquecer cada pestaña de turno con micro-indicadores visuales del estado del turno y habilitar navegación por teclado completa (`ArrowLeft`, `ArrowRight`, `Home`, `End`) conforme al estándar WAI-ARIA.
  - **Empty state ilustrado y erradicación de disclaimers burocráticos**: Usar fotografía documental oficial en estado vacío y consolidar la garantía de privacidad en un micro-sello sobrio en cabecera, eliminando los avisos técnicos repetitivos al pie.
- **Non-Goals**:
  - No se modifican los contratos de API ni los esquemas de datos del backend.
  - No se altera la lógica del motor NLP léxico (`nlpEngine.jsx`).
  - No se introducen librerías externas de UI o gráficos adicionales a `TrendLineChart`.

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (Matriz Somática Ergonómica en Dos Bloques)**: Las 6 dimensiones de la jornada se presentan agrupadas visualmente en dos bloques funcionales (*Cuerpo & Vitalidad* y *Operación & Entorno*). Cada dimensión cuenta con iconografía semántica representativa, nivel cualitativo destacado y barra de progreso contenida sin estiramientos.
- **AC-02 (Catálogo de Recomendaciones Ergonómicas Reales)**: Cada dimensión somática despliega una micro-recomendación ergonómica aplicable y específica al nivel reportado (ej. pauta de descanso ocular ante alta fricción técnica, estiramiento de trapecios/cuello ante tensión en llamadas), cumpliendo la promesa del copy.
- **AC-03 (Accionabilidad y Descompresión Somática Activa)**: Cuando la jornada seleccionada presenta tensión en llamadas o sobrecarga crítica (valor ≥ 4), la interfaz presenta un banner/botón de acción rápida para iniciar una pausa somática asistida in-situ mediante `SomaticBreathingModal.jsx`.
- **AC-04 (Síntesis de Vitalidad en Gráfico de Tendencia)**: `WellbeingHistory.jsx` presenta el gráfico `TrendLineChart` junto a una tarjeta de lectura que contextualiza el promedio con un diagnóstico de ritmo amable (ej. *"Ritmo estable con buena recuperación interdiaria"*), sustituyendo el texto aislado puramente aritmético.
- **AC-05 (Selector de Jornadas Accesible WAI-ARIA)**: El selector horizontal de turnos implementa navegación por teclado con flechas (`ArrowLeft` / `ArrowRight`) y selección con foco controlado. Cada pestaña muestra un micro-indicador de vitalidad del turno.
- **AC-06 (Empty State Ilustrado y Limpieza de Slop Propio)**: Cuando el agente carece de registros, se renderiza un empty state cálido con `bpo-agent-pause-completed.jpg`. Se eliminan las notas técnicas redundantes de privacidad al pie, sustituidas por un micro-sello de confidencialidad integrado en cabecera.
- **AC-07 (Quality Gates y Cero Regresiones)**: `npm run lint` finaliza con 0 errores, `npm run build` compila limpiamente y todas las suites de pruebas unitarias (`npm test`) se mantienen 100% aprobadas.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | SÍ | Las respuestas somáticas reflejan el estado de fatiga y tensión del operador. Se garantiza que solo se consultan registros propios mediante `currentUser.id`. |
| **Does it expose cross-tenant data?** | NO | Aislamiento estricto por cuenta de usuario en store y consultas locales. |
| **Does it require audit logging?** | NO | La consulta del historial propio de bienestar no genera eventos de auditoría adicionales a la autenticación ya registrada. |
| **¿Accede o procesa datos sensibles?** | SÍ | Lectura local exclusiva en la estación del titular; ninguna métrica individual es accesible por supervisores ni por SST. |

## 4. Experiencia y límites

- **Estado con datos (Principal)**: Visualización del ciclo semanal con gráfico de tendencia enriquecido, selector interactivo de las últimas jornadas y matriz somática estructurada con recomendaciones ergonómicas y puentes de acción.
- **Estado vacío**: Tarjeta acogedora con fotografía documental BPO, copy empático sobre el cuidado personal en el turno e invitación a completar el primer check-in.
- **Estado de carga**: Indicador accesible con `role="status"` y texto sobrio.
- **Estado de error**: Notificación semántica en banner de alerta sin bloquear el retorno a la navegación principal.
- **Accesibilidad**: Navegación de pestañas conforme a WAI-ARIA con flechas de dirección, foco visible en tokens de color institucional (`--c-primario`) y contraste WCAG AA en todas las combinaciones de texto y superficie.

## 5. Traceability

| Criterio | Plan / Componentes Afectados | Archivos Clave | Verificación |
| :--- | :--- | :--- | :--- |
| **AC-01** | Rediseño de matriz somática en 2 bloques | `frontend/src/features/agent/pages/MyWellbeingPage.jsx`, `frontend/src/styles/bienestar.css` | Inspección visual en runtime y estructura DOM |
| **AC-02** | Catálogo de recomendaciones | `frontend/src/features/agent/services/myWellbeingHelpers.jsx` | Pruebas de renderizado de consejos según nivel |
| **AC-03** | Puente a descompresión somática | `frontend/src/features/agent/pages/MyWellbeingPage.jsx`, `frontend/src/features/agent/components/SomaticBreathingModal.jsx` | Apertura e interacción con el modal de respiración |
| **AC-04** | Síntesis cualitativa de vitalidad | `frontend/src/features/agent/components/WellbeingHistory.jsx`, `frontend/src/styles/bienestar.css` | Inspección del gráfico y bloque interpretativo |
| **AC-05** | Selector accesible WAI-ARIA | `frontend/src/features/agent/pages/MyWellbeingPage.jsx`, `frontend/src/features/agent/hooks/useMyWellbeing.jsx` | Prueba de teclado con flechas `ArrowLeft`/`ArrowRight` |
| **AC-06** | Empty state y limpieza de disclaimers | `frontend/src/features/agent/pages/MyWellbeingPage.jsx`, `frontend/src/styles/bienestar.css` | Render condicional en `checkinRecords.length === 0` |
| **AC-07** | Integración y Quality Gates | `frontend/` | `npm run lint`, `npm run build`, `npm test` |
