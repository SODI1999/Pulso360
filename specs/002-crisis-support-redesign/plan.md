# [PLAN-002] Plan Técnico de Rediseño de Apoyo en Crisis (Espacio de Contención Serena y Respiración In-Situ)

Fecha: 2026-10-18  
Estado: IMPLEMENTADO  
Especificación asociada: [spec.md](spec.md)

---

## 1. Evidencia y Arquitectura Existente

### Archivos e Implementación
- **Página Principal**: [../../frontend/src/features/agent/pages/CrisisSupportPage.jsx](../../frontend/src/features/agent/pages/CrisisSupportPage.jsx) (Punto de entrada de `/apoyo-crisis`).
- **Componentes Clave**:
  - [../../frontend/src/features/agent/components/ZenBreathingOrb.jsx](../../frontend/src/features/agent/components/ZenBreathingOrb.jsx) (Orbe de respiración somática in-situ con ritmo 4-2-6).
  - [../../frontend/src/features/agent/components/CrisisContactLines.jsx](../../frontend/src/features/agent/components/CrisisContactLines.jsx) (Líneas 106, 123 y 155 en formato de lista ergonómica con llamada directa).
  - [../../frontend/src/features/agent/components/CrisisLegalDetails.jsx](../../frontend/src/features/agent/components/CrisisLegalDetails.jsx) (Marco legal colombiano al pie).
  - [../../frontend/src/features/agent/pages/AgentDashboardPage.jsx](../../frontend/src/features/agent/pages/AgentDashboardPage.jsx) (Panel del agente vinculado directamente a la pausa de respiración).
  - [../../frontend/src/features/agent/components/CheckinConfirmation.jsx](../../frontend/src/features/agent/components/CheckinConfirmation.jsx) (Confirmación de check-in vinculada a la pausa de respiración).
- **Hojas de Estilos**:
  - [../../frontend/src/styles/crisis.css](../../frontend/src/styles/crisis.css) (Estilos del módulo de crisis y orbe zen).
  - [../../frontend/src/styles/agent.css](../../frontend/src/styles/agent.css) (Estilos del panel y check-in).

### Invariantes y Restricciones Confirmadas
1. **Sin dependencias pesadas (Cero Three.js)**: En cumplimiento de [../../AGENTS.md](../../AGENTS.md) y [spec.md](spec.md), no se incorporaron librerías 3D que incrementen el bundle o comprometan terminales virtuales de contact center.
2. **Cero modales redundantes ni rompecabezas cognitivos**: Se desmanteló `BpoResetModal` y se erradicaron las interfaces de búsqueda visual/hotspots que saturaban al asesor estresado.
3. **Privacidad y No-Vigilancia**: No se almacena información de crisis ni se crean eventos de telemetría individual.

---

## 2. Componentes y Flujo Implementado

### 2.1 Orbe de Respiración Somática In-Situ (`ZenBreathingOrb.jsx`)
* **Cadencia Fisiológica**: Ciclo automático de 12 segundos (4s Inhala · 2s Sostén · 6s Exhala) para desacelerar taquicardia tras llamadas complejas.
* **Cero clics forzados**: Al abrir la página, el orbe ya está pulsando suavemente con gradientes de calma (`#14b8a6` a `#0f766e`).
* **Control único**: Botón sutil `Pausar compás` / `Reanudar` para detener el movimiento a voluntad.
* **Accesibilidad**: `@media (prefers-reduced-motion: reduce)` silencia animaciones continuas; soporte `aria-live="polite"` para lectores de pantalla.

### 2.2 Lista Ergonómica de Líneas Oficiales (`CrisisContactLines.jsx`)
* **Línea 106**: Salud Mental y Escucha 24/7 (Ministerio de Salud). Botón `Llamar 106`.
* **Línea 123**: Emergencias y Seguridad Vital. Botón `Marcar 123`.
* **Línea 155**: Orientación confidencial 24/7 ante violencias basadas en género (Policía Nacional). Botón `Marcar 155`.
* Enlaces directos `tel:` accesibles con alto contraste WCAG AA.
* Fuentes oficiales fechadas y referenciadas al pie de la tarjeta.

### 2.3 Desmantelamiento de Modales y Enlaces Directos desde "Mi panel"
* Eliminación definitiva de `BpoResetModal.jsx` y `immersive-pause.css`.
* En `AgentDashboardPage.jsx`, el botón en el hero principal navega directamente mediante `<Link to="/apoyo-crisis">` a la pausa de respiración, eliminando clics redundantes.
* En `CheckinConfirmation.jsx`, el botón posterior al check-in conduce de forma directa y serena a la pausa en puesto.

### 2.4 Marco Legal y SST Plegado
* El acordeón `<details className="crisis-legal-details">` mantiene disponible la solicitud voluntaria con SST y la fundamentación (Ley 1010 de 2006 y Res. 3461 de 2025) en la base de la pantalla sin interrumpir la contención.

---

## 3. Contratos y Verificación

| Criterio | Método de Verificación | Resultado |
| :--- | :--- | :--- |
| **AC-01** (Layout Limpio sin Scroll) | Inspección visual en viewport 1440×900 px | Completado y verificado |
| **AC-02** (Respiración Somática Pasiva) | Ciclo 4-2-6 automático en `ZenBreathingOrb` | Verificado en navegador |
| **AC-03** (Reduced Motion) | Reglas `@media (prefers-reduced-motion: reduce)` | Verificado |
| **AC-04** (Líneas Telefónicas Accesibles) | Botones `tel:` 106, 123 y 155 con contraste AA | Verificado |
| **AC-05** (Retiro de BpoResetModal y Atajos) | Eliminación de archivos y enlaces directos en panel y check-in | Verificado (0 referencias) |
| **AC-06** (Marco Legal y SST Plegados) | Contenedor `<details>` al pie | Verificado |
| **AC-07** (Quality Gates) | `npm run lint` y `npm run build` limpios | Exitoso (cero errores) |

---

## Rollback / recovery

En caso de requerir reversión de esta implementación:
1. Restaurar las versiones anteriores de `CrisisSupportPage.jsx`, `AgentDashboardPage.jsx`, `CheckinWizardPage.jsx` y `CheckinConfirmation.jsx` mediante control de versiones de Git (`git checkout`).
2. La arquitectura no introdujo migraciones de base de datos, esquemas de almacenamiento ni dependencias externas en `package.json`, por lo que el rollback no presenta riesgos de inconsistencia de datos ni ruptura de contratos en backend.

