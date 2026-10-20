# [PLAN-008] Technical Plan: Rediseño Ergonómico de la Vista "Mi Bienestar" ("Compañero de Turno")

## Evidence and existing architecture

- **Página principal**: [`frontend/src/features/agent/pages/MyWellbeingPage.jsx`](../../frontend/src/features/agent/pages/MyWellbeingPage.jsx) orquesta la vista mediante el hook [`useMyWellbeing.jsx`](../../frontend/src/features/agent/hooks/useMyWellbeing.jsx), renderizando actualmente:
  1. Subnavegación secundaria con botón de retorno (`agent-back-btn`).
  2. Encabezado editorial con título y botón de "Nuevo check-in".
  3. Componente [`WellbeingHistory.jsx`](../../frontend/src/features/agent/components/WellbeingHistory.jsx) con un canvas de [`TrendLineChart.jsx`](../../frontend/src/core/components/TrendLineChart.jsx) y un pie puramente aritmético (*"Promedio de energía disponible: 3.9 / 5"*).
  4. Selector horizontal de turnos con botones rectangulares uniformes sin feedback de vitalidad.
  5. Una lista continua `.wellbeing-matrix-list` con 6 filas idénticas, barras horizontales de 6px y puntaje numérico crudo `X / 5` destacado en 22px negrita.
  6. Una caja redundante al pie `.wellbeing-window-note` con disclaimers técnicos repetidos de privacidad.
- **Catálogo y evaluadores**: [`frontend/src/features/agent/services/myWellbeingHelpers.jsx`](../../frontend/src/features/agent/services/myWellbeingHelpers.jsx) define `DIMENSION_DEFINITIONS` con evaluadores textuales básicos (`calm`, `warm`, `alert`), pero **carece de recomendaciones ergonómicas**.
- **Activos y modales disponibles**:
  - Modal de descompresión somática: [`SomaticBreathingModal.jsx`](../../frontend/src/features/agent/components/SomaticBreathingModal.jsx) probado y verificado en la especificación 007.
  - Activo visual oficial para empty state: [`frontend/public/assets/fotos/bpo-agent-pause-completed.jpg`](../../frontend/public/assets/fotos/bpo-agent-pause-completed.jpg).
  - Catálogo de iconos en [`frontend/src/core/components/Icon.jsx`](../../frontend/src/core/components/Icon.jsx): incluye `Zap`, `Headphones`, `Wind`, `Users`, `Shield`, `Activity`, `HeartPulse`, `Clock`, `Sparkles`.

## Proposed change

La solución transforma la pantalla de una planilla médica pasiva a una herramienta viva de **Compañero de Turno**:

```
+-------------------------------------------------------------------------------------------------+
|  <- Volver al panel                                                                             |
|                                                                                                 |
|  Mi tendencia de bienestar                                         [ + Registrar Check-in ]     |
|  Historial somático y ritmo de recuperación en tus turnos BPO.                                  |
|  [ Sello sobrio: Registros confidenciales · Solo visibles para ti ]                             |
+-------------------------------------------------------------------------------------------------+
|  NIVEL 1: SÍNTESIS DE VITALIDAD DEL CICLO                                                       |
|  +----------------------------------------------------+ +-------------------------------------+ |
|  | [TrendLineChart: Curva de energía de 7 turnos]     | | Resumen Cualitativo de Vitalidad    | |
|  | Bandas de referencia suaves (Recarga / Vitalidad)  | | "Ritmo Estable: 3.9 / 5"            | |
|  |                                                    | | Lectura ergonómica del ciclo y      | |
|  |                                                    | | balance de recuperación semanal.    | |
|  +----------------------------------------------------+ +-------------------------------------+ |
+-------------------------------------------------------------------------------------------------+
|  NIVEL 2: SELECTOR DE JORNADAS ERGONÓMICO (WAI-ARIA CON FLECHAS DE TECLADO)                     |
|  [ 19 Oct (Hoy) · 3/5 ]  [ 18 Oct · 5/5 ]  [ 14 Oct · 4/5 ]  [ 09 Oct · 5/5 ] ...               |
+-------------------------------------------------------------------------------------------------+
|  NIVEL 3: DETALLE SOMÁTICO DE LA JORNADA SELECCIONADA (TARJETAS AGRUPADAS)                      |
|                                                                                                 |
|  GRUPO 1: CUERPO & VITALIDAD                                                                    |
|  +---------------------------------------+ +--------------------------------------------------+ |
|  | [Zap] Batería de Turno                | | [Headphones] Tensión por Usuarios                | |
|  | 3 / 5 · Energía estándar de turno     | | 4 / 5 · Alta tensión acumulada                   | |
|  | Barra contenida                       | | Barra alerta + [Botón: Pausa Respiración 2m]     | |
|  | Consejo: Aprovecha la pausa para      | | Consejo: Retira auriculares 1 min y haz          | |
|  | estirar antebrazos y muñecas.         | | estiramientos suaves de trapecios.               | |
|  +---------------------------------------+ +--------------------------------------------------+ |
|  | [Wind] Recuperación y Descanso        |                                                      |
|  | 5 / 5 · Descanso reparador adecuado   |                                                      |
|  | Consejo: Mantén tu rutina de desconexión sin pantallas 30m antes de dormir.                 |
|  +---------------------------------------+                                                      |
|                                                                                                 |
|  GRUPO 2: OPERACIÓN & ENTORNO                                                                   |
|  +---------------------------------------+ +--------------------------------------------------+ |
|  | [Users] Respaldo en Línea             | | [Activity] Fluidez de Sistemas                   | |
|  | 4 / 5 · Buen soporte del equipo       | | 5 / 5 · Fricción por fallas técnicas             | |
|  | Consejo: Comparte cualquier bloqueo   | | Consejo: Aplica regla 20-20-20 para fatiga visual| |
|  | en línea con tu soporte de piso.      | | parpadeando y mirando a la distancia.            | |
|  +---------------------------------------+ +--------------------------------------------------+ |
|  | [Shield] Piloto Automático            |                                                      |
|  | 3 / 5 · Automatismo ocasional         |                                                      |
|  | Consejo: Varía la postura y haz respiraciones profundas entre llamadas.                     |
|  +---------------------------------------+                                                      |
+-------------------------------------------------------------------------------------------------+
|  NIVEL 4: ESTADO VACÍO ILUSTRADO (Si no hay check-ins)                                          |
|  Tarjeta cálida con bpo-agent-pause-completed.jpg y bienvenida pedagógica para el primer registro|
+-------------------------------------------------------------------------------------------------+
```

### Componentes y Archivos Afectados

1. **[`frontend/src/features/agent/services/myWellbeingHelpers.jsx`](../../frontend/src/features/agent/services/myWellbeingHelpers.jsx)**:
   - Asignar iconografía semántica a cada dimensión (`Zap`, `Headphones`, `Wind`, `Users`, `Shield`, `Activity`).
   - Incorporar micro-recomendaciones ergonómicas orientadas a la operativa BPO dentro de los evaluadores (`evaluator(val)` retorna `{ text, tone, recommendation }`).
   - Crear función `getVitalitySummary(averageEnergy, recentShifts)` para proveer la narrativa cualitativa de vitalidad semanal.
2. **[`frontend/src/features/agent/components/WellbeingHistory.jsx`](../../frontend/src/features/agent/components/WellbeingHistory.jsx)**:
   - Transformar la sección de tendencia en un layout estructurado de dos columnas (escritorio) y apilado (móvil): gráfico a la izquierda y tarjeta de resumen interpretativo de vitalidad a la derecha.
3. **[`frontend/src/features/agent/pages/MyWellbeingPage.jsx`](../../frontend/src/features/agent/pages/MyWellbeingPage.jsx)**:
   - Dividir la matriz somática en los dos bloques funcionales: *Cuerpo & Vitalidad* y *Operación & Entorno*.
   - Renderizar tarjetas somáticas táctiles con microcopy ergonómico y llamada a la acción ante tensión alta (`cargaEmocional >= 4` activa el botón para abrir `SomaticBreathingModal`).
   - Sincronizar el estado del modal de respiración (`showBreathingModal`, `setShowBreathingModal`).
   - Reemplazar el empty state por una tarjeta ilustrada con `bpo-agent-pause-completed.jpg`.
   - Limpiar disclaimers repetitivos en cabecera y pie, sustituidos por un micro-sello de confidencialidad integrado.
4. **[`frontend/src/features/agent/hooks/useMyWellbeing.jsx`](../../frontend/src/features/agent/hooks/useMyWellbeing.jsx)**:
   - Añadir soporte de navegación accesible con teclado para el tablist de turnos (`handleTabKeyDown` con soporte para `ArrowLeft`, `ArrowRight`, `Home`, `End`).
5. **[`frontend/src/styles/bienestar.css`](../../frontend/src/styles/bienestar.css)**:
   - Añadir estilos para las tarjetas somáticas ergonómicas agrupadas (`.wellbeing-card-grid`, `.wellbeing-somatic-card`, `.wellbeing-group-title`).
   - Añadir estilos para la tarjeta de síntesis de vitalidad (`.wellbeing-vitality-card`).
   - Añadir estilos para el botón de micro-descompresión somática y micro-consejos ergonómicos.
   - Refinar el selector de jornadas con micro-puntos de vitalidad y adaptación responsive fluida.

## Contracts and compatibility

- **Contratos de datos**: Sin cambios en la persistencia de `pulsoStore.js` ni en la estructura de registros de check-in (`id`, `journeyKey`, `date`, `shiftType`, `energia`, `cargaEmocional`, `recuperacion`, `apoyo`, `distanciamiento`, `ineficacia`).
- **Interfaces React**:
  - `WellbeingHistory` mantiene sus props `trendData` y `averageEnergy`.
  - `SomaticBreathingModal` se reutiliza exactamente con su interfaz actual: `isOpen`, `onClose`, `initialContext="wellbeing"`.
- **Compatibilidad con navegadores**: Totalmente compatible con Flexbox/CSS Grid nativo, responsive desde 320px hasta pantallas corporativas ultrapanorámicas.

## Verification

| Criterio | Método de Verificación | Evidencia Esperada |
|---|---|---|
| **AC-01** | Inspección DOM y visual en navegador | Dos grupos temáticos de tarjetas somáticas con iconos y barras contenidas |
| **AC-02** | Renderizado de recomendaciones | Cada tarjeta muestra un consejo ergonómico específico al nivel de la dimensión |
| **AC-03** | Interacción con botón de respiración | Jornada con tensión ≥ 4 despliega acción rápida y abre `SomaticBreathingModal` |
| **AC-04** | Inspección de `WellbeingHistory` | Tarjeta de síntesis de vitalidad visible junto al gráfico de tendencia |
| **AC-05** | Prueba de accesibilidad con teclado | Navegación horizontal en el tablist con teclas de flecha `ArrowLeft`/`ArrowRight` |
| **AC-06** | Inspección de empty state y pie de página | Imagen oficial renderizada en empty state y erradicación de banners redundantes |
| **AC-07** | Ejecución de Quality Gates | `npm run lint` = 0 errores, `npm run build` exitoso, `npm test` 55/55 aprobados |

## Rollback / recovery

Si ocurriera una regresión inesperada durante la implementación, se puede recuperar el estado anterior de forma inmediata mediante:
```bash
git checkout -- frontend/src/features/agent/pages/MyWellbeingPage.jsx frontend/src/features/agent/components/WellbeingHistory.jsx frontend/src/features/agent/services/myWellbeingHelpers.jsx frontend/src/features/agent/hooks/useMyWellbeing.jsx frontend/src/styles/bienestar.css
```
Los datos persistidos en el almacenamiento local del navegador permanecerán intactos, ya que no se alteran esquemas de datos.
