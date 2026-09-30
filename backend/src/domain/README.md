# P08 · Domain — Reglas de Bienestar, Ética y Privacidad

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P08 · domain`
* **Naturaleza**: Lógica pura de negocio, reglas de bienestar ocupacional e invariantes de privacidad (independiente de frameworks web y bases de datos).

---

## 2. Invariantes Fundamentales de Privacidad (Inviolables)

### Regla 1: Aislamiento Criptográfico y Lógico de la Bitácora Personal (RF-04)
* La bitácora laboral es un espacio de desahogo privado y confidencial para el operador de Contact Center.
* **Invariante**: Bajo ninguna circunstancia se permite la exposición del contenido textual de una bitácora a roles jerárquicos (`supervisor`) ni organizacionales (`sst`).
* **Verificación**: Toda operación de lectura o actualización debe asociarse estrictamente al `userId` del token de sesión activo.

### Regla 2: k-Anonimato en Indicadores Agregados (RF-07)
* Para prevenir la reidentificación de operadores o el señalamiento individual:
* **Umbral Mínimo**: Toda consulta de métricas de bienestar agregadas por campaña o equipo exige un mínimo de **5 participantes distintos ($k \ge 5$)**.
* **Estado Protegido**: Si el número de participantes de una cohorte en un corte temporal es inferior a 5, el servicio debe emitir una respuesta de protección:
  ```json
  {
    "protected": true,
    "reason": "Muestra insuficiente para garantizar k-anonimato (k < 5)",
    "metrics": null
  }
  ```

### Regla 3: Dimensiones Operativas del Check-in (RF-03)
* Cada check-in evalúa 6 dimensiones en escala 1 a 5:
  1. `energia`: Percepción de vigor y disposición psicofísica.
  2. `carga_emocional`: Nivel de tensión y desgaste por interacciones complejas.
  3. `recuperacion`: Calidad del descanso previo a la jornada.
  4. `apoyo`: Percepción de respaldo por parte del equipo y líderes.
  5. `distanciamiento`: Desconexión cínica o despersonalización frente al usuario.
  6. `ineficacia`: Sensación de falta de logro o competencia laboral.
