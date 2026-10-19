# [SPEC-002] Crisis Support Redesign (Espacio de Contención Serena y Respiración In-Situ en /apoyo-crisis)

Fecha: 2026-10-18  
Estado: ESPECIFICADO / COMPLETADO

## 0. Fase de Clarificación y Supuestos

- **Descarte Justificado de Three.js**: Se descartó la incorporación de motores 3D o WebGL (como Three.js). Añadiría entre 600 KB y 1 MB al bundle de producción en [../../frontend/package.json](../../frontend/package.json), exigiría aceleración de GPU en terminales de contact center típicamente virtualizadas (VDI/Citrix), y la literatura de intervención en crisis advierte que rotaciones 3D o cámaras dinámicas incrementan la sobrecarga cognitiva en momentos de desregulación fisiológica.
- **Craftsmanship y Calma In-Situ sin Rompecabezas Cognitivos**: Ante el riesgo de frustración del asesor en momentos de estrés agudo, se descartaron diagramas con múltiples puntos de clic o listas de tareas que demanden esfuerzo analítico. La desescalada se resuelve con un **orbe de respiración somática in-situ** ([ZenBreathingOrb.jsx](../../frontend/src/features/agent/components/ZenBreathingOrb.jsx)) con ritmo fisiológico pasivo (4s Inhala · 2s Sostén · 6s Exhala) sin forzar clics ni tareas complejas.
- **Eliminación de Redundancias y Retiro del Modal Inmersivo**: Se desmanteló por completo el modal secundario de pantalla completa (`BpoResetModal` / "Tomar un respiro 2 min") y sus estilos (`immersive-pause.css`). La respiración guiada vive de forma nativa e inmediata en la propia página sin modales emergentes. Los botones en "Mi panel" ([AgentDashboardPage.jsx](../../frontend/src/features/agent/pages/AgentDashboardPage.jsx)) y confirmación de check-in ([CheckinConfirmation.jsx](../../frontend/src/features/agent/components/CheckinConfirmation.jsx)) redirigen directamente a `/apoyo-crisis`.
- **Estructura Equilibrada en Dos Columnas (Zero Scroll)**: Se reestructuró [CrisisSupportPage.jsx](../../frontend/src/features/agent/pages/CrisisSupportPage.jsx) en un layout limpio de dos columnas proporcionadas (`1fr 1.15fr`) que entran completamente en el viewport estándar de escritorio:
  1. **Columna Izquierda:** Pausa de respiración somática en puesto ([ZenBreathingOrb.jsx](../../frontend/src/features/agent/components/ZenBreathingOrb.jsx)) con botón único de pausa/reanudación.
  2. **Columna Derecha:** Líneas oficiales de orientación y emergencias en Colombia ([CrisisContactLines.jsx](../../frontend/src/features/agent/components/CrisisContactLines.jsx)) con Línea 106 (Salud Mental Minsalud 24/7), Línea 123 (Emergencias) y Línea 155 (Violencias de Género) en filas horizontales ergonómicas con botones directos `tel:`.
- **Sección Secundaria Plegada (SST y Marco Legal)**: La solicitud voluntaria con SST y el marco normativo (Ley 1010 de 2006 / Res. 3461 de 2025) se ubican al pie dentro de un `<details>` colapsable sin saturar la atención del asesor.

## 1. Need and scope

- **Necesidad**: En operaciones BPO, las llamadas difíciles o la saturación de colas generan picos agudos de sobrecarga y taquicardia. El asesor estresado necesita contención visual inmediata: respirar para bajar pulsaciones y tener a mano los teléfonos de ayuda de emergencia, sin enfrentarse a un "examen" o rompecabezas de clics, ni a ventanas modales redundantes.
- **Alcance**:
  1. Implementar `ZenBreathingOrb.jsx` con cadencia 4-2-6 automática, anillos concéntricos suaves de pulso y soporte a `prefers-reduced-motion`.
  2. Rediseñar `CrisisContactLines.jsx` con diseño ergonómico de 3 filas accesibles y fuentes verificadas de Minsalud y Policía Nacional.
  3. Desmantelar completamente el modal inmersivo `BpoResetModal` y su archivo de estilos `immersive-pause.css`.
  4. Actualizar el acceso del hero en "Mi panel" (`AgentDashboardPage.jsx`) y la pantalla post check-in (`CheckinConfirmation.jsx`) reemplazando el botón "Tomar un respiro (2 min)" por un enlace directo hacia la pausa de respiración en puesto (`/apoyo-crisis`).
  5. Asegurar un layout balanceado sin scroll vertical forzado en escritorios convencionales (1440×900).
- **Non-Goals (Fuera de alcance)**:
  - No usar Three.js ni dependencias pesadas de WebGL.
  - No conservar modales emergentes redundantes de respiración.
  - No registrar bitácoras o notas de salud mental sin consentimiento explícito.

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (Layout Limpio Bipolar sin Scroll)**: Al ingresar a `/apoyo-crisis`, la pantalla presenta un encabezado sereno y dos columnas equilibradas: izquierda para respiración somática in-situ y derecha para líneas telefónicas de emergencia, visibles sin desplazamiento forzado en 1440×900 px.
- **AC-02 (Respiración Somática Pasiva sin Tareas)**: El componente `ZenBreathingOrb` guía de forma continua y automática el ritmo 4-2-6 para desescalada de taquicardia, sin requerir clics en objetivos pequeños ni checklists cognitivos.
- **AC-03 (Desactivación de Animación bajo Reduced Motion)**: Bajo `@media (prefers-reduced-motion: reduce)`, las transiciones y pulsos del orbe se estabilizan visualmente de manera accesible.
- **AC-04 (Líneas Oficiales Accesibles con Marcado Directo)**: Presentación de Líneas 106, 123 y 155 con enlaces directos accesibles (`tel:`), contraste WCAG AA y citas explícitas a las fuentes institucionales de Minsalud y Policía Nacional.
- **AC-05 (Eliminación Completa de Modales Redundantes)**: Descomisión total de `BpoResetModal` y del estilo `immersive-pause.css`. Reemplazo del botón "Tomar un respiro 2 min" en el panel del agente y confirmación de check-in por enlaces directos hacia `/apoyo-crisis`.
- **AC-06 (Marco Legal y SST Plegados)**: Canales de reporte formal (Ley 1010 de 2006 / Res. 3461 de 2025) y acompañamiento preventivo con SST confinados a un bloque colapsable `<details>` inferior.
- **AC-07 (Quality Gates y Cero Dependencias Nuevas)**: Cero librerías npm añadidas. Superación completa de `npm run lint` y `npm run build` en el frontend.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **¿Toca datos personales sensibles (PII)?** | N/A | La vista es puramente de contención del lado del cliente. No almacena datos de crisis ni registra diagnósticos clínicos. |
| **¿Expone datos cross-tenant?** | N/A | El sistema opera en instancia única organizacional. |
| **¿Requiere registro de auditoría?** | N/A | No se generan eventos de auditoría sobre el uso de la respiración o consulta de líneas de apoyo para proteger la privacidad psicológica del agente. |
| **¿Accede o procesa datos sensibles?** | N/A | No se realiza profiling emocional ni se envían datos a LLMs remotos. |

## 4. Experiencia y límites

- **Estados Obligatorios**:
  - *Normal:* Cabecera serena, orbe pulsando con ritmo 4-2-6, 3 líneas oficiales listas para marcar.
  - *Pausa del compás:* Botón de pausa que congela el contador a voluntad del agente.
  - *Movimiento reducido:* Silenciamiento de animaciones mediante CSS adaptativo.
- **Navegación Unificada**: El botón "Pausa de respiración" del hero en "Mi panel" conduce a `/apoyo-crisis`.

## 5. Traceability

- **AC-01, AC-02, AC-04** -> Plan: Layout Unificado y ZenBreathingOrb | Tareas: T-01, T-02
- **AC-03, AC-07** -> Plan: Estilos y Quality Gates | Tareas: T-01, T-05
- **AC-05, AC-06** -> Plan: Eliminación de Redundancias y Retiro de Modales | Tareas: T-02, T-04
