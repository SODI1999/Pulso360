# [TASKS-012] Scope-Derived Work: Agent Scope Perfection

---

- [x] **TASK-01 / AC-01**: Documentación JSDoc formal en la capa de Servicios y Catálogos de Datos.  
  - *Archivos afectados:* `frontend/src/features/agent/services/` (8 archivos) y `frontend/src/features/agent/data/` (4 archivos).  
  - *Acción:* Añadir bloques `/** ... */` con descripciones de dominio BPO, contratos `@param`, tipos `@type` y retornos `@returns`.  
  - *Verificación:* Script de verificación de cobertura JSDoc en services y data alcanzando 100%.

- [x] **TASK-02 / AC-01**: Documentación JSDoc formal en la capa de Custom Hooks.  
  - *Archivos afectados:* `frontend/src/features/agent/hooks/` (9 archivos).  
  - *Acción:* Añadir documentación JSDoc en cada hook (`useAgentDashboard`, `useCheckinWizard`, `useJournal`, `useMyWellbeing`, `useSupportChannel`, `useMyDataPrivacy`, `useCrisisSupport`, `useBpoPause`, `useAgentModalAccessibility`), documentando parámetros y el objeto reactivo retornado.  
  - *Verificación:* Script de verificación de cobertura JSDoc en hooks alcanzando 100%.

- [x] **TASK-03 / AC-01**: Documentación JSDoc formal en Páginas y Componentes de Interfaz.  
  - *Archivos afectados:* `frontend/src/features/agent/pages/` (7 archivos), `ConsentPage.jsx`, `frontend/src/features/agent/components/` (36 archivos) y `UserProfileModal.jsx`.  
  - *Acción:* Añadir documentación JSDoc en las funciones de componente exportadas y sus subcomponentes, tipando props y describiendo propósito UI/UX.  
  - *Verificación:* Script de verificación de cobertura JSDoc total en `features/agent/` y `UserProfileModal.jsx` alcanzando el 100% (65/65 archivos documentados).

- [x] **TASK-04 / AC-02**: Estandarización del Botón de Reintentar (`Retry`) en los Estados de Error de UI.  
  - *Archivos afectados:*  
    - `frontend/src/features/agent/pages/AgentDashboardPage.jsx`  
    - `frontend/src/features/agent/pages/CheckinWizardPage.jsx`  
    - `frontend/src/features/agent/pages/JournalPage.jsx`  
    - `frontend/src/features/agent/pages/MyWellbeingPage.jsx`  
    - `frontend/src/features/agent/pages/SupportChannelPage.jsx`  
    - `frontend/src/features/agent/pages/MyDataPrivacyPage.jsx`  
  - *Acción:* Implementar el patrón `<button type="button" className="btn btn-secondary btn-sm" onClick={retry}>Reintentar</button>` en el bloque de alerta de `loadError`.  
  - *Verificación:* Comprobación de existencia de botón de reintento en el estado de error de cada página.

- [x] **TASK-05 / AC-03 & AC-04**: Resiliencia Runtime y Pulido de Microcopy / Markup.  
  - *Archivos afectados:*  
    - `frontend/src/features/agent/pages/SupportChannelPage.jsx` (eliminar catch silencioso y manejar estado degradado elegante).  
    - `frontend/src/features/agent/hooks/useCrisisSupport.jsx` (fallback reactivo sin `console.warn` descontrolado).  
    - `frontend/src/features/agent/pages/CrisisSupportPage.jsx` (eliminar contenedor `<details>` redundante).  
    - `frontend/src/features/auth/pages/ConsentPage.jsx` (formato de fecha legible en español).  
    - `frontend/src/features/agent/pages/AgentDashboardPage.jsx` (saludo sanitizado sin espacio previo a coma).  
    - `frontend/src/features/agent/components/CrisisSupportModal.jsx` (referencia a C3).  
  - *Verificación:* Inspección de código, renderizado limpio y validación de ausencia de warnings en consola.

- [x] **TASK-06 / AC-05 & AC-06**: Verificación Final de Calidad Técnica y Cero Regresiones.  
  - *Acción:* Ejecutar `npm run lint`, `npm test` (frontend + backend) y `npm run build`.  
  - *Verificación:* 0 errores de linter, 0 warnings, 100% tests pasando (55 frontend, 132 backend) y build de producción limpio.
