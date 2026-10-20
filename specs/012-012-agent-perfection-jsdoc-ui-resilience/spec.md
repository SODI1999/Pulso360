# [SPEC-012] Agent Scope Perfection: JSDoc & UI Resilience Polish

Date: 2026-10-20  
Type: feature (Quality, Documentation & UI Resilience Polish)  
Status: IN_PROGRESS  

---

## 0. Fase de Clarificación y Supuestos

- **Origen**: Resultado de la auditoría integral multidimensional de 4 agentes en `/omni-discuss` sobre el alcance completo del rol de Agente en Pulso360.
- **Evidencia Observada**:
  - `qa-resilience-runner`: 55 de 66 archivos en `features/agent/` carecen de documentación JSDoc estructurada con tags `@param` y `@returns`.
  - `bpo-ui-craftsman`: Los estados de error de carga en 6 páginas del agente carecen de acción interactiva para reintentar (`Retry`), infringiendo la regla de los 4 estados de UI obligatorios de OmniSpec.
  - `bpo-copy-strategist`: Pequeñas discrepancias de microcopy y markup: `<details>` anidado en `CrisisSupportPage.jsx`, fecha ISO sin formatear en `ConsentPage.jsx`, saludo con espacio antes de coma en `AgentDashboardPage.jsx`, y referencia a C5 en lugar de C3 en `CrisisSupportModal.jsx`.
  - `sst-privacy-guardian`: Privacidad, aislamiento de bitácoras y k-anonimato verificados al 100%; se debe preservar sin ninguna regresión.

---

## 1. Need and scope

- **Necesidad**: Certificar al 100% el alcance y las vistas del rol de **Agente** en Pulso360 antes de transicionar a otros roles (Supervisor / SST), eliminando deudas técnicas de documentación, robusteciendo la resiliencia de la interfaz ante fallos transitorios de red, y afinando detalles de microcopy y accesibilidad.
- **Alcance**:
  - `frontend/src/features/agent/` (carpetas `components/`, `pages/`, `hooks/`, `services/`, `data/`).
  - `frontend/src/features/auth/pages/ConsentPage.jsx`.
  - `frontend/src/core/components/UserProfileModal.jsx`.
- **Non-Goals**:
  - No alterar contratos de API ni estructuras de base de datos.
  - No modificar la lógica determinista del motor léxico `nlpEngine.js`.
  - No tocar componentes ni flujos de los roles Supervisor, SST, Auditor o Administrador.

---

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (JSDoc Enterprise)**: Documentar exhaustivamente todos los componentes, hooks, servicios y funciones públicas de `features/agent/` y `UserProfileModal.jsx` con bloques JSDoc formales (`@param`, `@returns`, `@type`) y descripciones de dominio BPO/SST.
- **AC-02 (Retry Action en Estados de Error)**: Incorporar el botón `<button type="button" className="btn btn-secondary btn-sm" onClick={retry}>Reintentar</button>` en los estados de error de carga de las 6 páginas principales del agente (`AgentDashboardPage`, `CheckinWizardPage`, `JournalPage`, `MyWellbeingPage`, `SupportChannelPage`, `MyDataPrivacyPage`).
- **AC-03 (Resiliencia Runtime y Manejo Robusto)**:
  - Eliminar el bloque `catch` silencioso en `SupportChannelPage.jsx` informando estado de conexión o degradación elegante sin fallar la UI.
  - Implementar detección reactiva segura de `window.speechSynthesis` en `useCrisisSupport.jsx` sin emitir `console.warn` descontrolado.
- **AC-04 (Pulido de Microcopy y Markup)**:
  - Eliminar el doble acordeón `<details>` en `CrisisSupportPage.jsx` integrando directamente `CrisisLegalDetails`.
  - Formatear la fecha ISO cruda de la política en `ConsentPage.jsx` a formato de fecha legible en español.
  - Corregir el espacio espurio antes de la coma en el saludo de `AgentDashboardPage.jsx` (`{greeting.trim()}, {name}`).
  - Unificar la referencia semántica a la finalidad de acompañamiento psicosocial como `Finalidad C3` en `CrisisSupportModal.jsx`.
- **AC-05 (Invariantes de Privacidad y Anti-Slop)**:
  - Preservar el aislamiento absoluto de bitácoras de desahogo y los umbrales de agregación $k \ge 5$.
  - Preservar la paleta de tokens ergonómicos de `tokens.css` sin introducir degradados arbitrarios o componentes genéricos.
- **AC-06 (Calidad y Cero Regresiones)**:
  - `npm run lint` pasa con 0 errores y 0 warnings.
  - `npm test` en frontend (55 tests) y backend (132 tests) pasan al 100%.
  - `npm run build` genera compilación limpia en producción.

---

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **Does it touch sensitive personal data (PII)?** | YES | Bitácoras del agente se mantienen aisladas; derechos ARCO y consentimiento C1-C5 operan sin alterar almacenamiento. |
| **Does it expose cross-tenant data?** | NO | N/A. No aplica arquitectura multi-tenant en este cambio. |
| **Does it require audit logging?** | YES | Preservar trazabilidad opaca en `pulsoStore.audit` sin registrar contenido libre de notas. |
| **¿Accede o procesa datos sensibles?** | YES | Cumplimiento estricto de Ley 1581 de 2012 (Habeas Data) y Resoluciones 2646/2008 y 2764/2022. |

---

## 4. Experiencia y límites

- Cada vista debe ofrecer feedback claro en sus 4 estados: Loading, Empty, Error (con botón visible de Reintentar), y Protected (bloqueo reflexivo por C1, C2 o $k < 5$).

---

## 5. Traceability

- **AC-01** -> Tarea T-01: Documentación JSDoc integral de la suite del agente.
- **AC-02** -> Tarea T-02: Implementación de botones de reintento en las 6 páginas de agente.
- **AC-03** -> Tarea T-03: Robustecimiento de resiliencia en SupportChannel y useCrisisSupport.
- **AC-04** -> Tarea T-04: Micro-ajustes de copy, formato de fecha y desanidado de detalles legales.
- **AC-05** -> Tarea T-05: Validación de salvaguardas de privacidad y tokens visuales.
- **AC-06** -> Tarea T-06: Verificación de calidad automatizada (Lint, Tests, Build).
