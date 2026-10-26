# [PLAN-022] Plan Técnico: Elevación Editorial, Erradicación de Slop y Ficha de Radicación Institucional en Contáctenos

## 1. Evidencia y Arquitectura Existente

- **Archivos actuales inspeccionados**:
  - [frontend/src/features/landing/pages/ContactenosPage.jsx](../../frontend/src/features/landing/pages/ContactenosPage.jsx): Vista pública de 2 columnas con titular publicitario, iconos en contenedores mint y disclaimers desinflantes.
  - [frontend/src/features/landing/components/ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx): Formulario con tarjeta flotante, banner de error rojo `#FEF2F2`, botón pasivo `Ver resumen` y confirmación basada en 3 cajas anidadas.
  - [frontend/src/features/landing/hooks/useContactForm.jsx](../../frontend/src/features/landing/hooks/useContactForm.jsx): Hook de estado controlado para los campos del formulario.
  - [frontend/src/styles/contactenos.css](../../frontend/src/styles/contactenos.css): Hoja de estilos con sombras pesadas, anidamiento de tarjetas ("card-itis") y colores saturados.

---

## 2. Cambios Propuestos por Ejes Better

### A. Better-UI & Better-Layout: Erradicación de Card-itis y Composición Simétrica
1. **Des-cardificación y Eliminación de Sombras**:
   - Suprimir `box-shadow: 0 8px 30px rgba(17, 38, 35, 0.04)` en `.form-panel`. Aplicar fondo `#FFFFFF` plano con borde de reporte `1px solid var(--landing-line, #E5E0D6)` y esquinas moderadas de 8px.
   - Eliminar los contenedores mint cuadrados (`.channel-icon` de 36×36px) en la columna izquierda. Los iconos se presentan limpios, alineados a la línea base tipográfica o en marcos sobrios de 28×28px con color de trazo institucional.
   - Transformar la sección de separación de flujos en un **Protocolo de Aislamiento y Confidencialidad Técnica** integrado armoniosamente a la columna izquierda.

### B. Better-Writing & Copywriting BPO
1. **Titular y Canales Institucionales en [ContactenosPage.jsx](../../frontend/src/features/landing/pages/ContactenosPage.jsx)**:
   - Tag: `ATENCIÓN INSTITUCIONAL & SST`
   - H1: `Enlace Operativo, Coordinación de Pilotos y Transferencia Tecnológica`
   - Lead: Descripción rigurosa del propósito del enlace entre centros de contacto (BPO) y el equipo de investigación del Tecnológico de Antioquia.
   - Reestructuración de 3 canales oficiales:
     1. **Coordinación de Pilotos en Contact Centers** (Operaciones & SST).
     2. **Investigación Formativa & Vinculación** (Facultad de Ingeniería TdeA).
     3. **Consultoría Metodológica en k-Anonimato** (Prevención de Riesgo Psicosocial y Res. 2764).
2. **Microcopy del Formulario en [ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx)**:
   - Sustituir *"Esta demo no envía mensajes"* por: `Diligencia los parámetros de tu operación para generar una ficha formal de enlace técnico en entorno controlado (Sandbox institucional).`
   - Sustituir el botón `Ver resumen` con icono de ojo por: `Radicar Solicitud Institucional` con icono formal `FileText`.

### C. Better-Interface: Implementación de los 4 Estados Obligatorios
1. **Estado Reposo**: Formulario con campos nítidos, labels semánticos y placeholders contextualizados en operaciones BPO (ej. AHT, turnos rotativos, dimensionamiento).
2. **Estado Validación Guiada**: Sustituir el banner rojo chillón por un callout ámbar/neutro sutil con mensajes de error por campo precisos y no punitivos.
3. **Estado Procesamiento / Loading**: Introducir en [useContactForm.jsx](../../frontend/src/features/landing/hooks/useContactForm.jsx) el estado `isSubmitting` con una latencia simulada de ~350ms, mostrando un spinner sobrio y `aria-busy="true"`.
4. **Estado Ficha Técnica de Radicación Institucional (Éxito)**:
   - Eliminar el anidamiento de cajas (`.contact-success-card` dentro de `.form-panel` dentro de `.contact-success-details`).
   - Crear una **Ficha Técnica Oficial de Radicación**:
     - Encabezado formal con denominación institucional TdeA.
     - Código de radicado único generado: `RAD-TDEA-2026-BPO-###`.
     - Sello de tiempo oficial con zona horaria COT.
     - Desglose de parámetros en tabla técnica de 2 columnas (Empresa, Contacto, Motivo, Teléfono, Detalle del requerimiento).
     - Cláusula de confidencialidad y no persistencia en servidores de terceros (Ley 1581).
     - Acciones claras: botón para imprimir la constancia en PDF y botón para radicar una nueva solicitud.

### D. Better-Accessibility (WCAG 2.2 AA)
- Contraste superior a 4.5:1 en todos los textos.
- Indicador `:focus-visible` de 2px con offset de 2px en campos y botones.
- Enlaces semánticos con `aria-required`, `aria-invalid` y `aria-describedby` asociados a los mensajes de error.
- Foco automático accesible en el primer campo inválido al intentar enviar.

---

## 3. Archivos Afectados

- [frontend/src/styles/contactenos.css](../../frontend/src/styles/contactenos.css): Rediseño integral de estilos, erradicación de card-itis, sombras y clichés visuales.
- [frontend/src/features/landing/pages/ContactenosPage.jsx](../../frontend/src/features/landing/pages/ContactenosPage.jsx): Refactorización editorial de H1, canales institucionales y garantía de aislamiento.
- [frontend/src/features/landing/components/ContactForm.jsx](../../frontend/src/features/landing/components/ContactForm.jsx): Implementación de los 4 estados, micro-estado de carga y ficha técnica de radicación.
- [frontend/src/features/landing/hooks/useContactForm.jsx](../../frontend/src/features/landing/hooks/useContactForm.jsx): Incorporación de `isSubmitting` y generación de código de radicado formal `RAD-TDEA-2026-BPO-###`.
- [frontend/src/features/landing/data/landingData.jsx](../../frontend/src/features/landing/data/landingData.jsx): Normalización de labels en `CONTACT_SUBJECTS`.

---

## 4. Data Contracts and API Contracts (N/A Justification)

- **Contratos de Datos / API Contracts**: N/A (Justificado). Esta especificación opera en el frontend público de la landing de Contáctenos. No agrega ni modifica endpoints de backend, modelos de base de datos ni contratos en `specs/contracts.json`.
- **Persistencia**: Cero impacto en base de datos. Los datos permanecen estrictamente confinados al estado reactivo local del navegador para proteger la privacidad de los visitantes.

---

## 5. Rollback and Migration Reversal Strategy (N/A Justification)

- **Migraciones de Base de Datos**: N/A (Justificado). No hay esquemas ni migraciones involucradas.
- **Estrategia de Reversión (Rollback)**: Reversión inmediata mediante `git checkout` o `git revert` sobre los 5 archivos modificados del frontend.
