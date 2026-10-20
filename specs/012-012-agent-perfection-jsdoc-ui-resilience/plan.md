# [PLAN-012] Technical Plan: Agent Scope Perfection (JSDoc & UI Resilience)

Date: 2026-10-20  
Specification: [SPEC-012] 012-012-agent-perfection-jsdoc-ui-resilience  

---

## 1. Evidence and existing architecture

- **Componentes y Alcance:**
  - `frontend/src/features/agent/` cuenta con 64 archivos (`components/`, `pages/`, `hooks/`, `services/`, `data/`).
  - Satélites directos: `frontend/src/features/auth/pages/ConsentPage.jsx` y `frontend/src/core/components/UserProfileModal.jsx`.
- **Hallazgos de la Auditoría Multidimensional:**
  1. **Documentación JSDoc:** 55 de 66 archivos carecen de bloques JSDoc estructurados; 10 poseen cabeceras descriptivas sin `@param` ni `@returns`. Solo 1 posee JSDoc formalizado.
  2. **Estados de UI (Retry en Errores):** Seis (6) páginas del agente capturan errores de carga (`loadError`) pero renderizan únicamente una caja de texto sin botón de reintento (`Retry`), incumpliendo la regla obligatoria de los 4 estados de UI (Loading, Empty, Error con retry, Protected).
  3. **Resiliencia:** Bloque `catch` silencioso en `SupportChannelPage.jsx:61` y advertencia en consola en `useCrisisSupport.jsx:54`.
  4. **Microcopy / Markup:** Doble `<details>` en `CrisisSupportPage.jsx`, fecha ISO en `ConsentPage.jsx`, espacio previo a la coma en saludo en `AgentDashboardPage.jsx`, y referencia a C5 en vez de C3 en `CrisisSupportModal.jsx`.

---

## 2. Proposed change

La intervención se estructurará en 4 fases quirúrgicas y ordenadas:

### Fase 1: Incorporación Integral de Documentación JSDoc Enterprise (AC-01)
- Redactar bloques formales `/** ... */` con descripciones de dominio BPO/SST, tipos de props `@param`, retornos `@returns` y definiciones `@type` en:
  - **Servicios (8 archivos):** `journalService.jsx`, `supportChannelService.jsx`, `myDataPrivacyService.jsx`, `checkinWizardService.jsx`, `ambientSound.jsx`, `agentQueries.jsx`, `agentDashboardHelpers.jsx`, `myWellbeingHelpers.jsx`.
  - **Hooks (9 archivos):** `useAgentDashboard.jsx`, `useCheckinWizard.jsx`, `useJournal.jsx`, `useMyWellbeing.jsx`, `useSupportChannel.jsx`, `useMyDataPrivacy.jsx`, `useCrisisSupport.jsx`, `useBpoPause.jsx`, `useAgentModalAccessibility.jsx`.
  - **Datos y Catálogos (4 archivos):** `checkinWizardData.jsx`, `bpoPauseData.jsx`, `crisisSupportData.jsx`, `nlpFactorMetadata.jsx`.
  - **Páginas (8 archivos):** `AgentDashboardPage.jsx`, `CheckinWizardPage.jsx`, `JournalPage.jsx`, `MyWellbeingPage.jsx`, `SupportChannelPage.jsx`, `MyDataPrivacyPage.jsx`, `CrisisSupportPage.jsx`, `ConsentPage.jsx`.
  - **Componentes (37 archivos):** Todos los componentes en `components/` y subcarpetas (`grounding/`, etc.) más `UserProfileModal.jsx`.

### Fase 2: Estandarización de Botón de Reintento en Estados de Error (AC-02)
- Integrar la acción `Reintentar` (`retry`) utilizando el componente o patrón estándar de botón secundario ergonómico:
  ```jsx
  <div className="alert alert-error alert-dismissible" role="alert">
    <span>{loadError}</span>
    <button type="button" className="btn btn-secondary btn-sm" onClick={handleRetry}>
      Reintentar
    </button>
  </div>
  ```
- Implementado en:
  - `AgentDashboardPage.jsx` (recarga del dashboard).
  - `CheckinWizardPage.jsx` (recarga de datos de turno/borrador).
  - `JournalPage.jsx` (recarga de bitácoras).
  - `MyWellbeingPage.jsx` (recarga de tendencias somáticas).
  - `SupportChannelPage.jsx` (recarga de tickets y radicados).
  - `MyDataPrivacyPage.jsx` (recarga de registros y solicitudes ARCO).

### Fase 3: Resiliencia Runtime y Manejo Robusto (AC-03)
- `SupportChannelPage.jsx:61`: Reemplazar el `catch` silencioso por un manejo que asigne un estado visual sutil de sincronización degradada si falla la carga en tiempo real de chats activos.
- `useCrisisSupport.jsx:54`: Validar reactivamente la disponibilidad de `window.speechSynthesis` antes de invocar `speak()`, exponiendo `isVoiceAvailable` en el hook y evitando `console.warn` en entornos sin síntesis de voz.

### Fase 4: Pulido de Microcopy y Markup (AC-04 & AC-05)
- `CrisisSupportPage.jsx`: Eliminar el `<details className="crisis-legal-details">` exterior redundante, permitiendo que `<CrisisLegalDetails />` gestione su propio colapso limpio.
- `ConsentPage.jsx`: Formatear `settings.policyEffectiveDate` con `formatDate` o `Intl.DateTimeFormat` en español (ej. *"15 de octubre de 2026"*).
- `AgentDashboardPage.jsx`: Sanitizar el saludo a `{greeting.trim()}, {currentUser?.name || 'Agente'}`.
- `CrisisSupportModal.jsx`: Corregir la referencia textual a `"Finalidad C3 (Acompañamiento y Canal de Apoyo)"`.

---

## 3. Contracts and compatibility

- **Invariantes Arquitectónicas:**
  - Ningún cambio altera firmas de red existentes ni modifica `pulsoStore.js`.
  - Se preservan las dependencias `features → core` y el aislamiento de datos del Agente.
- **Tokens de Diseño:**
  - Uso exclusivo de tokens de `src/styles/tokens.css` (`--c-primario`, `--c-calma-*`, `--radius-*`, `--space-*`).
  - No se añaden estilos arbitrarios ni degradados incompatibles.

---

## 4. Verification

| Criterio | Verificación Automatizada / Manual | Directorio |
|---|---|---|
| **AC-01 (JSDoc)** | Script de inspección de cobertura verificando `HasJSDoc === true` en 66 archivos. | `frontend/` |
| **AC-02 (Retry Action)** | Inspección de renderizado y props en las 6 vistas. | `frontend/src/features/agent/pages/` |
| **AC-03 (Resiliencia)** | Verificación de captura en `SupportChannelPage` y fallback de voz en `useCrisisSupport`. | `frontend/src/features/agent/` |
| **AC-04 (Microcopy)** | Snapshot DOM sin acordeón duplicado y fecha legible en `ConsentPage`. | `frontend/src/` |
| **AC-05 (Privacidad & Anti-Slop)** | Comprobación de aislamiento en `journalService` y ausencia de clases degradadas. | `frontend/` |
| **AC-06 (Calidad)** | `npm run lint`, `npm test` (frontend + backend) y `npm run build`. | Raíz / `frontend/` / `backend/` |

---

## 5. Rollback / recovery

- Si algún cambio genera inconsistencias o rompe pruebas existentes, se ejecuta `git checkout -- <archivo>` para restablecer el estado previo sin riesgo.
