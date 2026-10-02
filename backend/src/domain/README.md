# P08 · Domain — Invariantes de Bienestar, Ética y Privacidad (SDD)

## 1. Identificación y Filosofía
* **Paquete Arquitectónico**: `P08 · domain`
* **Naturaleza**: Lógica pura de dominio e invariantes de negocio. Totalmente desacoplada de la base de datos, del protocolo HTTP y de librerías externas.
* **Misión**: Salvaguardar la seguridad psicológica y los derechos fundamentales del operador de Contact Center frente a la vigilancia laboral y el acoso.

---

## 2. Invariantes Fundamentales de Dominio

---

### Regla 1: Invariante Matemático de $k$-Anonimato ($k \ge 5$)

Para impedir cualquier intento de inferencia o reidentificación de respuestas de bienestar en equipos o campañas de Contact Center:

$$\text{Decisión}(n) = \begin{cases} 
\text{PERMITIR\_AGREGACION}, & \text{si } n \ge 5 \\ 
\text{ESTADO\_PROTEGIDO}, & \text{si } n < 5 
\end{cases}$$

Donde:
* $n = \text{cardinalidad de participantes únicos en la cohorte evaluada } (\text{COUNT(DISTINCT usuario\_id)})$.
* Si $n < 5$, el dominio prohíbe la emisión de promedios, medianas, sumas o cualquier indicador cuantitativo.
* La respuesta de dominio es un valor inmutable:
  ```json
  {
    "protected": true,
    "reason": "Muestra insuficiente para garantizar k-anonimato (k < 5)",
    "cohort_count": n,
    "k_threshold": 5,
    "metrics": null
  }
  ```

---

### Regla 2: Invariante de Aislamiento de la Bitácora Personal (RF-04)

* **Definición de Dominio**: La bitácora es una herramienta de desahogo y autorreflexión, no de evaluación de desempeño.
* **Restricción de Acceso**:
  $$\text{PuedeAccederBitacora}(\text{usuario\_activo}, \text{bitacora}) \iff \text{usuario\_activo.id} = \text{bitacora.usuario\_id}$$
* **Prohibición de Negocio**: Ningún supervisor, líder de campaña, directivo ni profesional de SST tiene autorización ni privilegio en el sistema para acceder a la bitácora individual de un agente.

---

### Regla 3: Espacio Métrico del Check-in Diario (6 Dimensiones)

Cada registro de check-in debe verificar que todas las 6 dimensiones pertenezcan estrictamente al conjunto discreto de enteros:

$$D = \{\text{energia}, \text{carga\_emocional}, \text{recuperacion}, \text{apoyo}, \text{distanciamiento}, \text{ineficacia}\}$$
$$\forall d \in D, \quad d \in \{1, 2, 3, 4, 5\}$$

Cualquier valor fraccionario, nulo o fuera del intervalo $[1, 5]$ es inválido en el dominio y debe ser rechazado inmediatamente.

---

### Regla 4: Matriz de Consentimiento Granular C1..C5 (Ley 1581 de 2012)

El tratamiento de datos sensibles requiere autorización previa, expresa e informada por cada finalidad independiente:

| Finalidad | Variable | Funcionalidad Condicionada | Acción en Ausencia de Consentimiento |
| :--- | :--- | :--- | :--- |
| **C1** | `c1_checkin` | Registro diario de check-in emocional. | Bloqueo de registro (`CONSENT_C1_REQUIRED`). |
| **C2** | `c2_bitacora` | Creación de bitácora y desahogo de turno. | Bloqueo de creación (`CONSENT_C2_REQUIRED`). |
| **C3** | `c3_apoyo` | Canal de solicitud de acompañamiento psicosocial. | Deshabilitación de solicitudes de apoyo. |
| **C4** | `c4_analitica` | Inclusión de métricas anonimizadas en tendencias grupales. | Exclusión de sus datos en reportes de $k$-anonimato. |
| **C5** | `c5_contacto` | Notificaciones proactivas de pausas y autocuidado. | Supresión de avisos directos. |

---

### Regla 5: Clasificación Léxica Determinista (NLP sin Cajas Negras)

1. El motor de análisis procesa el texto de la bitácora exclusivamente mediante diccionarios léxicos versionados (`versiones_lexico`).
2. **Prohibición**: Se prohíbe el uso de LLMs remotos probabilísticos para emitir diagnósticos clínicos no supervisados.
3. Todo análisis automático emite una sugerencia preliminar que el propio agente tiene el derecho inalienable de confirmar, corregir o descartar (`revisiones_nlp`), en concordancia con el principio de autodeterminación informativa.
