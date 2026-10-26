# [SPEC-022] Elevación Editorial, Erradicación de Slop y Ficha de Radicación Institucional en Contáctenos

Fecha: 2026-10-26

## 0. Clarification & Assumptions (Anti-Hallucination Gate)

- **Contexto y Diagnóstico Observado (`OBSERVED`)**:
  - En `http://localhost:5173/contactenos`, la vista actual presenta vicios visuales de SaaS comercial genérico y microcopys que desmerecen la investigación:
    1. **Card-itis y cajas anidadas**: El formulario está contenido en una tarjeta blanca con sombra difusa flotante (`box-shadow: 0 8px 30px rgba(17, 38, 35, 0.04)`). Al confirmarse, anida otra tarjeta dentro de la tarjeta, y una tercera caja gris dentro de la segunda (3 niveles de cajas).
    2. **Iconos en cajitas de golosina ("cookie/pill icons")**: En la columna izquierda, cada canal institucional ubica un icono dentro de un recuadro verde menta de 36×36px con bordes curvos, un cliché típico de plantillas de WordPress.
    3. **Microcopy desinflante y autoflagelante**: Frases como *"Esta demo no envía mensajes"* o *"Los datos se muestran solo en esta pestaña; no se enviaron ni se guardaron en un servidor"* degradan el producto a nivel de maqueta descartable.
    4. **Metáfora confusa del botón**: El botón de envío dice `Ver resumen` con un icono de ojo (`Eye`), transmitiendo pasividad en vez de una acción formal de enlace o radicación.
    5. **Banner de error punitivo**: En caso de validación fallida, aparece un banner rosado chillón `#FEF2F2` con bordes rojos que rompe la serenidad visual.
- **Solución Acordada (`DECLARED`)**:
  - Reemplazar el contenedor flotante por un panel editorial sobrio integrado al fondo con bordes hairline de 1px (`var(--landing-line)`).
  - Sustituir los iconos en cajitas por una alineación tipográfica limpia con icono directo y jerarquía de texto clara.
  - Reformular el microcopy bajo el concepto de **Módulo de Radicación Institucional & Enlace Técnico Sandbox**, comunicando honestidad técnica con dignidad universitaria (TdeA).
  - Implementar los 4 estados obligatorios: reposo, validación constructiva no punitiva, procesamiento institucional (~350ms con spinner sobrio) y **Ficha Técnica de Radicación Institucional** con código único simulado (`RAD-TDEA-2026-BPO-###`), sello de tiempo COT y opción de imprimir constancia.

---

## 1. Necesidad y Alcance (Need and Scope)

- **Usuario / Rol**: Directores de Operaciones BPO, coordinadores de SST, investigadores y evaluadores institucionales que visitan `/contactenos` para coordinar un piloto o solicitar demostración técnica.
- **Objetivo**: Dotar a la página de Contáctenos del mismo nivel de maestría editorial, respeto por el espacio visual y rigor terminológico BPO que tiene la fundamentación científica, eliminando cualquier rastro de "AI Slop".

### Non-Goals
- No implementar persistencia en base de datos ni envío remoto de correos (se mantiene el aislamiento estricto de privacidad del frontend sandbox).
- No modificar el Navbar ni el Footer global del sitio.
- No instalar librerías externas de componentes ni alterar la arquitectura modular del proyecto.

---

## 2. Criterios de Aceptación (Acceptance Criteria)

- **AC-01 [functional]**: Erradicación de "card-itis" y clichés visuales en [contactenos.css](../../frontend/src/styles/contactenos.css). Supresión de sombras flotantes pesadas (`box-shadow`), cajas anidadas y contenedores mint de iconos ("cookie icons"), reemplazándolos por jerarquía tipográfica limpia y bordes finos institucionales.
- **AC-02 [functional]**: Implementación de los 4 estados obligatorios de interfaz en [ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx) y [useContactForm.jsx](../../frontend/src/features/landing/hooks/useContactForm.jsx): reposo, validación guiada sin banner estridente, micro-estado de procesamiento institucional (`isSubmitting` ~350ms) y ficha formal de radicación.
- **AC-03 [functional]**: Refactorización editorial de tono y copywriting BPO en [ContactenosPage.jsx](../../frontend/src/features/landing/pages/ContactenosPage.jsx) y [ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx). Sustitución de frases desinflantes por terminología institucional de investigación formativa y despliegue para centros de contacto (SST, AHT, turnos rotativos, k-anonimato).
- **AC-04 [functional]**: Ficha Técnica de Radicación Institucional en estado de éxito con código de radicado único generado (`RAD-TDEA-2026-BPO-###`), sello de tiempo COT formal, resumen estructurado y botón accesible para imprimir la constancia.
- **AC-05 [functional]**: Preservación estricta de accesibilidad WCAG AA: contraste >= 4.5:1 en todos los textos y badges, labels asociados, `aria-describedby` y `aria-invalid` en campos con error, foco visible `:focus-visible` y navegación 100% por teclado, con verificación en linter, tests y build.

---

## 3. Aplicabilidad de Dominio y Seguridad (Domain Applicability)

| Control de Seguridad & Privacidad | ¿Aplica? | Aplicación Técnica |
| :--- | :---: | :--- |
| **¿Maneja datos personales sensibles (PII)?** | Sí | La advertencia de reserva médica prohíbe explícitamente ingresar datos de salud o diagnósticos clínicos. El checkbox obligatorio de Habeas Data cumple con la Ley 1581 de 2012 y enlaza a la política institucional. |
| **¿Expone datos cross-tenant?** | No | N/A (Justificado). Los datos ingresados se confinan exclusivamente a la memoria local de la sesión en el navegador (Sandbox local) y no se comparten con terceros ni servidores. |
| **¿Requiere registro de auditoría en backend?** | No | N/A (Justificado). Al ser una demostración interactiva pública de radicación sin autenticación ni base de datos, no genera registros en el log inmutable de backend. |
| **¿Almacena contraseñas o tokens?** | No | N/A (Justificado). No interactúa con el subsistema de autenticación ni tokens JWT. |

---

## 4. Experiencia de Usuario y 4 Estados

1. **Estado Reposo (Clean Slate)**: Campos con labels explícitos, placeholders con contexto real de centros de contacto y botón formal `"Radicar Solicitud Institucional"`.
2. **Estado Validación / Error**: Indicadores sutiles de borde, foco automático en el primer campo inválido y mensajes concisos con icono `alertTriangle` sin banners rojos de alarma crítica.
3. **Estado Procesamiento / Loading**: Estado de 350ms con animación de procesamiento sobria y botón inhabilitado (`disabled`) con `aria-busy="true"`.
4. **Estado Ficha de Radicación (Éxito)**: Panel de confirmación institucional formal con código de radicación único, fecha/hora oficial, resumen tabular y botones para imprimir ficha o iniciar nueva solicitud.

---

## 5. Trazabilidad (Traceability)

- **AC-01** $\rightarrow$ [frontend/src/styles/contactenos.css](../../frontend/src/styles/contactenos.css)
- **AC-02** $\rightarrow$ [frontend/src/features/landing/components/ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx), [frontend/src/features/landing/hooks/useContactForm.jsx](../../frontend/src/features/landing/hooks/useContactForm.jsx)
- **AC-03** $\rightarrow$ [frontend/src/features/landing/pages/ContactenosPage.jsx](../../frontend/src/features/landing/pages/ContactenosPage.jsx)
- **AC-04** $\rightarrow$ [frontend/src/features/landing/components/ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx)
- **AC-05** $\rightarrow$ Quality gates: `npm run lint`, `npm test`, `npm run build`, y auditoría de accesibilidad Lighthouse.
