# [RCA-017] Investigación de Causa Raíz (Fundamentación A11y & UX)

## Evidence and hypotheses

1. **Hipótesis 1 (Contraste en barra de prevalencia en `evidence.css`)**:
   - *Evidencia*: En [frontend/src/styles/academic/evidence.css:141-143](../../frontend/src/styles/academic/evidence.css#L141-L143), `.dist-mid` usa `#D97706` (ámbar medio) con texto blanco. El contraste medido por axe-core y Lighthouse es de 3.18:1 frente al umbral exigido de 4.5:1.
   - *Mecanismo demostrado*: Los tonos ámbar `#D97706` no alcanzan la luminancia requerida para contrastar contra blanco en texto menor a 18px. Al oscurecer el tono a `#B45309` (ámbar quemado) o aplicar texto oscuro `#1C1917`, el contraste sube por encima de 4.5:1.

2. **Hipótesis 2 (Contraste en badge de correlación en `evidence.css`)**:
   - *Evidencia*: En [frontend/src/styles/academic/evidence.css:424-429](../../frontend/src/styles/academic/evidence.css#L424-L429), `.correlation-sig-badge` combina `color: #64748B` sobre `background: #F1F5F9`.
   - *Mecanismo demostrado*: `#64748B` sobre `#F1F5F9` rinde 4.34:1, ligeramente por debajo del umbral 4.5:1. Al elevar a `#334155` (slate 700), el contraste alcanza 7.2:1.

3. **Hipótesis 3 (Label in Name en botones de acción en `AcademicHeader.jsx` y `AcademicCitation.jsx`)**:
   - *Evidencia*: Los atributos `aria-label` fueron redactados de forma descriptiva amplia sin incorporar las palabras exactas visibles de los botones (`"Guardar / Imprimir Ficha"` y `"Copiar cita"`).
   - *Mecanismo demostrado*: WCAG 2.5.3 estipula que para usuarios de control de voz, el nombre accesible debe contener la cadena visible. Al omitir las palabras iniciales visibles, el software de dictado por voz no puede activar el control.

4. **Hipótesis 4 (Semántica ARIA incompleta en Citación y Prevalencia)**:
   - *Evidencia*: `AcademicCitation.jsx` implementó `role="tablist"` para APA/BibTeX sin asignarle `role="tabpanel"` al contenedor de texto. En `AcademicEvidence.jsx`, la barra con `role="progressbar"` carecía de valores de rango `aria-valuemin`/`aria-valuemax`.
   - *Mecanismo demostrado*: Los lectores de pantalla reportan controles compuestos desvinculados o métricas sin límites claros de interpretación.

5. **Hipótesis 5 (Fatiga defensiva de copy en datos empíricos)**:
   - *Evidencia*: En `academicFoundationData.jsx`, la misma nota de deslinde legal y metodológico ("Dato correspondiente al estudio formativo de referencia... sin constituir certificación epidemiológica formal...") fue copiada y pegada en tres propiedades distintas de la misma sección.
   - *Mecanismo demostrado*: Genera fricción y pesadez en la lectura de los datos sin aportar valor legal adicional a lo ya cubierto en la sección de marco normativo.

## Root cause

Inconsistencias menores en valores de color heredados y atributos `aria-label` que no incorporaron literalmente las etiquetas visibles, junto con la duplicación defensiva de párrafos de advertencia legal en la estructura de datos empíricos.
