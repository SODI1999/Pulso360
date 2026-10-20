# Verification evidence: [SPEC-010] Rediseño del Canal de Acompañamiento y Chat SST del Agente

Date: 2026-10-20  
Status: VERIFIED  
Scope: `frontend/src/features/agent/pages/SupportChannelPage.jsx` y componentes de acompañamiento con SST  

## 1. Mapeo de Criterios de Aceptación a Evidencia

| Criterio | Descripción | Método | Evidencia Registrada | Resultado |
| :--- | :--- | :--- | :--- | :---: |
| **AC-01** | Navegación Ergonómica por Pestañas WAI-ARIA | Manual / DOM | Implementado en [`SupportChannelPage.jsx`](../../frontend/src/features/agent/pages/SupportChannelPage.jsx) con `role="tablist"`, `role="tab"`, `role="tabpanel"`, navegación accesible por teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`) y selección inteligente según casos activos. Probado en runtime sobre `http://localhost:5173/agente/apoyo`. | **PASSED** |
| **AC-02** | Sala de Diálogo en Vivo Desacoplada | Manual / Funcional / WS | [`SupportChatCard.jsx`](../../frontend/src/features/agent/components/SupportChatCard.jsx) desacoplado del acordeón hacia un panel de diálogo maestro-detalle ergonómico con cabecera de especialista SST, atajos de teclado (`Enter` para enviar, `Shift+Enter` para salto de línea) y confirmación por WebSockets. | **PASSED** |
| **AC-03** | Trazabilidad Institucional del Radicado (Res. 2646) | Manual / Visual | Creado [`SupportTimelineBadge.jsx`](../../frontend/src/features/agent/components/SupportTimelineBadge.jsx) que ilustra el avance en 4 fases (*Radicación* → *Revisión SST* → *Orientación* → *Cierre*) sin chips genéricos con radius 9999px. | **PASSED** |
| **AC-04** | Formulario Guiado con Motivos Operativos BPO | Manual / Funcional | Creado [`SupportRequestForm.jsx`](../../frontend/src/features/agent/components/SupportRequestForm.jsx) con tarjetas de selección de modalidad (Anónima con radicado vs. Confidencial), tarjetas interactivas de motivos BPO (*Sobrecarga en llamadas*, *Desgaste emocional*, *Tensión*, *Prevención*), contador de caracteres y nota legal del CCL. | **PASSED** |
| **AC-05** | Integración Inédita del Avatar Situado y Diversidad de Género BPO | Visual / Asset | Generado con `bpo-asset-designer` el activo documental [`bpo-agent-support-dialogue.jpg`](../../frontend/public/assets/fotos/bpo-agent-support-dialogue.jpg) y `.webp`, situando a un operador masculino de BPO en diálogo sereno y profesional con la especialista de SST (incorporando representación de género masculino en el rol de agente para contact center). Integrado en el hero banner sin deformaciones ni reutilización. | **PASSED** |
| **AC-06** | Puente a Ruta Inmediata de Crisis y Descompresión | Manual / Funcional | Integrada barra de acceso rápido con apertura in-situ de [`SomaticBreathingModal.jsx`](../../frontend/src/features/agent/components/SomaticBreathingModal.jsx) (respiración somática 4-2-6) y enlace hacia primeros auxilios (Línea 106). | **PASSED** |
| **AC-07** | Salvaguarda de Consentimiento C3 y Quality Gates | Automatizado | Compuerta de consentimiento C3 bajo Ley 1581 preservada; 0 errores de ESLint, build exitoso de Vite, 55/55 pruebas unitarias de frontend y 132/132 pruebas de contrato de backend aprobadas. | **PASSED** |

## 2. Inspección Visual y Responsive en Navegador (Chrome DevTools MCP)

1. **Desktop (1440px)**:
   - Hero banner institucional con la fotografía de Laura Gómez y la especialista de SST.
   - Disposición en 2 columnas maestras: Columna izquierda con listado de radicados e indicadores de ciclo de vida (SupportTimelineBadge); Columna derecha con la sala de chat en vivo y compositor accesible.
2. **Tablet (768px)**:
   - Reflow vertical fluido, apilando la imagen sobre el texto y ajustando las columnas sin provocar desbordamiento lateral (`overflow-x: hidden`).
3. **Modal de Respiración Somática**:
   - Apertura interactiva in-situ probada con círculo de ritmo 4-2-6 y cierre con botón accesible y `Escape`.

## 3. Quality Gates Ejecutados

* **Linting (`npm run lint` en `frontend/`):** Exitoso (código 0, 0 errores, 0 advertencias).
* **Compilación de Producción (`npm run build` en `frontend/`):** Exitoso (código 0, Vite 6.4.4 generó assets de producción limpiamente).
* **Suite de Pruebas Unitarias (`npm test` en `frontend/`):** Exitoso (código 0, 55 pruebas ejecutadas, 55 aprobadas, 0 fallos).
* **Suite de Pruebas de Contratos (`npm test` en `backend/`):** Exitoso (código 0, 132 pruebas ejecutadas, 132 aprobadas, 0 fallos).
