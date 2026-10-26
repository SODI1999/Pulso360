# [PLAN-018] Plan Técnico: Elevación Editorial y Dossier PDF de Fundamentación

## 1. Evidencia y Arquitectura Existente

- **Rutas afectadas**:
  - Página pública: `/fundamentacion` ([AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx)).
- **Componentes y estilos involucrados**:
  - [AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx): TOC temático y botón de impresión.
  - [AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx): Citación y enlace a repositorio.
  - [AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx): Métricas cuantitativas y vector psicométrico.
  - [evidence.css](../../frontend/src/styles/academic/evidence.css): Estilos del TOC, distribución y tipografía.
  - [footer-responsive.css](../../frontend/src/styles/academic/footer-responsive.css): Reglas `@media print`.

---

## 2. Cambios Propuestos

### Eje 1: Depuración de Impresión PDF (`footer-responsive.css`)
- Añadir `.landing-header` y `.btn-scroll-top` a la lista de elementos excluidos en `@media print`.
- En [AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx), añadir un encabezado exclusivo para impresión (`.print-editorial-header.only-print`) que muestre el membrete oficial del Tecnológico de Antioquia, el título de la investigación y la fecha de emisión formateada (`new Date().toLocaleDateString('es-CO', ...)`).
- Asignar `page-break-inside: avoid` y `break-inside: avoid` en todas las tarjetas de autores, evidencia, transferencia y marco normativo.

### Eje 2: TOC Sticky y ScrollSpy Reactivo (`AcademicHeader.jsx` & `evidence.css`)
- Actualizar `.academic-toc-strip` en CSS:
  ```css
  .academic-toc-strip {
    position: sticky;
    top: 64px;
    z-index: 40;
    backdrop-filter: blur(8px);
    background: rgba(250, 248, 245, 0.94);
  }
  ```
- Implementar un efecto reactivo en [AcademicFoundationPage.jsx](../../frontend/src/features/landing/pages/AcademicFoundationPage.jsx) o [AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx) con `IntersectionObserver` (o listener pasivo con throttle) que registre qué sección del dossier está en el viewport (`#autores`, `#evidencia-empirica`, `#transferencia`, `#antivigilancia`, `#citacion`, `#marco-legal`), pasando la sección activa para aplicar `.is-active` y `aria-current="true"` al enlace correspondiente.

### Eje 3: Enlace Activo a Repositorio DSpace TdeA (`AcademicCitation.jsx`)
- En la fila de acciones o pie de la tarjeta de citación, renderizar:
  ```jsx
  <a
    href={CITATION_DATA.repositoryUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-repository-link"
  >
    <Icon name="BookOpen" size={14} />
    <span>Consultar en Repositorio Digital TdeA</span>
    <Icon name="externalLink" size={13} className="ext-icon" />
  </a>
  ```
- Estilar el enlace con borde sutil, tokens semánticos y foco accesible visible.

### Eje 4: Ergonomía Tipográfica y Numerales Tabulares (`evidence.css`)
- Aplicar `font-variant-numeric: tabular-nums` en clases de valores numéricos (`.number-val`, `.dist-bar-text`, `.aside-metric`, `.correlation-sig-badge`).
- Añadir `max-width: 68ch` en párrafos largos de prosa (`.section-prose`, `.pillar-desc`, `.legal-item-body`, `.academic-hero-lead`) para confort de lectura continua.
- Refinar el bloque de correlación en `AcademicEvidence.jsx` para que exprese con claridad visual cómo el apoyo amortigua el agotamiento.

---

## 3. Contratos y Compatibilidad

- **Contratos RBAC**: No se modifican. La ruta `/fundamentacion` permanece pública e idéntica en permisos.
- **Persistencia**: Cero impacto en `pulsoStore` o APIs de backend.
- **Compatibilidad con Navegadores**: `position: sticky` e `IntersectionObserver` cuentan con soporte nativo unificado en navegadores modernos.

---

## 4. Decisiones de Tecnología y Documentación

- **Stack**: React 18, CSS modular existente, Lucide icons vía componente `Icon`.
- **Convención de código**: JSDoc en componentes y helpers creados. Nomenclatura en inglés en código, español en UI.
- **Commits**: Formato Conventional Commits (`feat(foundation): ...`).

---

## 5. Diseño de Interfaz & Interacción

- **Composición**: Franja TOC horizontal sticky que no interfiere con el navbar. En móvil, se mantiene deslizable horizontalmente con `-webkit-overflow-scrolling: touch`.
- **4 Estados de Interacción del TOC**:
  - *Default*: Fondo blanco con borde neutro.
  - *Hover*: Fondo menta sutil (`--landing-mint`) con texto esmeralda.
  - *Active (ScrollSpy)*: Borde y texto en verde esmeralda con fondo enriquecido y `aria-current="true"`.
  - *Focus-visible*: Anillo de foco de 2px sólido (`--landing-emerald`) con offset de 2px.

---

## 6. Verificación

- Inspección de CSS emulando `@media print` en Chrome DevTools.
- Evaluación del ScrollSpy haciendo scroll progresivo a través de las 6 secciones.
- Ejecución de gates de calidad: `npm run lint`, `npm test`, `npm run build`.
- Snapshot de Lighthouse para verificar 100/100 en Accesibilidad.

---

## 7. Reversibilidad

- Cambios confinados a archivos de landing (`features/landing/*` y `styles/academic/*`).
- Reversión inmediata con `git checkout` o `git revert` sin migración de datos.
