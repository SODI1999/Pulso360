# [FIX-017] Estrategia de Corrección (Fundamentación A11y & UX)

## Minimal change and compatibility

- **Archivos afectados**:
  1. `frontend/src/styles/academic/evidence.css`: Ajustar fondo de `.dist-mid` a `#B45309` y color de `.correlation-sig-badge` a `#334155`.
  2. `frontend/src/features/landing/components/AcademicHeader.jsx`: Sincronizar `aria-label="Guardar / Imprimir Ficha metodológica en PDF"`.
  3. `frontend/src/features/landing/components/AcademicCitation.jsx`: Sincronizar `aria-label="Copiar cita bibliográfica al portapapeles"` y vincular `role="tabpanel"` en `.citation-body-box`.
  4. `frontend/src/features/landing/components/AcademicEvidence.jsx`: Añadir atributos `aria-valuemin="0"`, `aria-valuemax="100"` y `aria-valuetext` en la barra de prevalencia.
  5. `frontend/src/features/landing/data/academicFoundationData.jsx`: Consolidar las notas redundantes en una única nota metodológica rigurosa.
- **Riesgo**: Bajo. No afecta endpoints, contratos RBAC ni lógica de backend.
- **Reversibilidad**: Inmediata mediante Git.

## Regression verification

- **Verificación previa**:
  - Lighthouse Accessibility score: 97/100 (2 fallos de contraste, 2 fallos de Label in Name).
  - Notas al pie repetidas 3 veces en sección de evidencia.
- **Verificación posterior**:
  - Lighthouse Accessibility score: 100/100 (0 fallos de accesibilidad).
  - Cero desbordamientos o regresiones en navegación por teclado o impresión PDF.
  - Ejecución de `npm run lint`, `npm test` y `npm run build` en `frontend/` con código de salida 0.

## Tasks

- [x] **TASK-01 [Styles/Colors]**: Corregir contraste de `.dist-mid` (`#B45309`) y `.correlation-sig-badge` (`#334155`) en [frontend/src/styles/academic/evidence.css](../../frontend/src/styles/academic/evidence.css) (AC-01, AC-02).
- [x] **TASK-02 [Components/A11y]**: Sincronizar el `aria-label` del botón de impresión en [frontend/src/features/landing/components/AcademicHeader.jsx](../../frontend/src/features/landing/components/AcademicHeader.jsx) con su etiqueta visible (AC-03).
- [x] **TASK-03 [Components/A11y]**: Sincronizar el `aria-label` del botón de copia y completar el patrón `role="tabpanel"` en [frontend/src/features/landing/components/AcademicCitation.jsx](../../frontend/src/features/landing/components/AcademicCitation.jsx) (AC-04, AC-05).
- [x] **TASK-04 [Components/Semantics]**: Declarar atributos de accesibilidad de rango en la barra de progreso de [frontend/src/features/landing/components/AcademicEvidence.jsx](../../frontend/src/features/landing/components/AcademicEvidence.jsx) (AC-05).
- [x] **TASK-05 [Data/AntiSlop]**: Unificar notas al pie redundantes de evidencia empírica en [frontend/src/features/landing/data/academicFoundationData.jsx](../../frontend/src/features/landing/data/academicFoundationData.jsx) (AC-05).
- [x] **TASK-06 [Verification/Quality]**: Validar en vivo con Lighthouse Snapshot y ejecutar suite completa de linter, tests y build (AC-06).
