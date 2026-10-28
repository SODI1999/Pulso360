# Capítulo 06: Módulo del Supervisor Operativo (`src/features/supervisor/`)

> **Objetivo del capítulo**: Analizar cómo un supervisor de operaciones lidera sus turnos, monitorea la salud colectiva de su equipo y ejecuta planes de acción preventivos sin invadir la intimidad de los trabajadores ni violar el k-anonimato ($k \ge 5$).

---

## 1. El Dilema del Supervisor: Entre la Meta Operativa y el Agotamiento

En un contact center, el **Supervisor de Turno** se encuentra atrapado entre dos fuegos:
1. **La Gerencia de Operaciones**, que le exige cumplir metas de llamadas por hora, nivel de servicio (SLA) y adherencia a los turnos.
2. **Los Agentes a su cargo**, que sufren estrés, desgaste vocal y desmotivación por la intensidad de la labor.

Si un sistema le dijera al supervisor: *"El agente Juan Pérez reportó hoy que está al borde del llanto"*, el supervisor podría usar esa información de forma punitiva (reprender a Juan, asignarle más llamadas para que "aprenda" o calificarlo negativamente en su evaluación).

Por esta razón, la arquitectura de Pulso360 impone un **Muro Técnico Infranqueable**:
> **El supervisor NUNCA ve nombres individuales, ni textos de bitácoras, ni resultados de check-in persona por persona. Solo ve promedios consolidados de equipo cuando el grupo cumple las reglas de k-anonimato ($k \ge 5$).**

---

## 2. El Pipeline de Agregación y k-Anonimato en Servidor

```mermaid
graph TD
    subgraph Datos Individuales Protegidos en PostgreSQL
        A1[Check-in Agente 1: Carga 4/5]
        A2[Check-in Agente 2: Carga 5/5]
        A3[Check-in Agente 3: Carga 3/5]
        A4[Check-in Agente 4: Carga 4/5]
        A5[Check-in Agente 5: Carga 4/5]
    end

    A1 & A2 & A3 & A4 & A5 --> API[GET /api/v1/sst/metrics]
    API --> Strip[1. Excluir agentes sin consentimiento C4 activo]
    Strip --> Count[2. Contar tamaño efectivo del grupo N]
    Count --> Eval{¿N >= Umbral Mínimo 5?}
    
    Eval -->|Sí: N=5 >= 5| Show[Retorna HTTP 200 OK<br>Promedio de Tensión: 4.0/5<br>Participación: 100%]
    Eval -->|No: N < 5| Block[Retorna data: { isProtected: true }<br>Renderiza PrivacyBlockedCard en cliente]

    style Show fill:#e8f5e9,stroke:#2e7d32
    style Block fill:#ffebee,stroke:#c62828
```

---

## 3. Anatomía de Páginas (`src/features/supervisor/pages/`)

### `TeamDashboardPage.jsx`
Es el panel de mando del supervisor:
- **Barra de Filtros Contextuales**: Permite alternar entre los equipos asignados a su supervisión (`GET /api/v1/auth/me`).
- **Control de Bloqueo por Privacidad (`isBlocked`)**: Si el supervisor selecciona un grupo pequeño donde $N < 5$, el panel oculta automáticamente todas las gráficas y KPIs, mostrando en su lugar el componente `<PrivacyBlockedCard />`.
- **Auditoría Transparente de Consultas**: Cada vez que el supervisor consulta un equipo, el servidor Express registra automáticamente un log de auditoría inmutable en la tabla `auditoria_sistema` con el detalle del ámbito y período consultado.

### `ActionsPage.jsx`
Es la pantalla de **Corresponsabilidad Preventiva**:
- Muestra los planes de acción colectivos asignados por el área de SST para ese equipo (`GET /api/v1/supervisor/actions`), por ejemplo: *"Rotación anticipada de colas difíciles"*, *"Pausa activa de descompresión cervical a las 15:00"*.
- Permite abrir el modal `ActionFollowupModal.jsx` para registrar observaciones del avance operativo (`POST /api/v1/supervisor/actions/:id/followup`): *"Se ejecutó la pausa colectiva con 12 agentes; se observó mejoría en la disposición del turno"*.
- **Prevención IDOR**: El backend verifica criptográficamente que la intervención pertenezca al equipo supervisado por el usuario autenticado; si un supervisor intenta reportar avance sobre un equipo ajeno, el servidor rechaza con `403 Forbidden` (`IDOR_ATTEMPT`).

---

## 4. Componentes Especializados (`src/features/supervisor/components/`)

### 1. `TeamKpiGrid.jsx`
Despliega cuatro tarjetas métricas fundamentales del equipo calculadas por el servidor:
- **Índice de Energía del Turno**: Promedio grupal de vitalidad de 1 a 5.
- **Tensión Operativa Acumulada**: Nivel de estrés reportado en las llamadas.
- **Balance de Recuperación**: Porcentaje de agentes que reportaron haber tenido un descanso adecuado antes de iniciar el turno.
- **Tasa de Participación Voluntaria**: Qué porcentaje del equipo decidió completar el check-in (respetando que no es obligatorio).

### 2. `TeamFactorsTable.jsx`
Una tabla analítica que categoriza las **causas objetivas del desgaste**:
- Muestra factores como *"Llamadas consecutivas sin respiro"*, *"Fallas en el CRM"* o *"Exigencia por tiempo de atención (AHT)"*.
- Esto orienta al supervisor hacia **soluciones de proceso**, evitando que culpe a los individuos por problemas derivados de la carga de trabajo.

### 3. `ActionFollowupModal.jsx`
Ventana modal con foco accesible para registrar notas de seguimiento a las intervenciones, cambiando estados entre `Pendiente`, `En progreso` y `Completada`.

---

## 5. Prevención de Ataques de Re-identificación

¿Qué ocurre si un supervisor filtra sucesivamente hasta aislar a un solo operador?

Pulso360 previene esto mediante dos salvaguardas:
1. **Límite de dos dimensiones simultáneas**: El sistema no permite combinaciones infinitas de filtros anidados.
2. **Evaluación dinámica del umbral $k \ge 5$ en base de datos**: Si cualquier combinación de filtros arroja un resultado con menos de 5 registros activos que tengan la cláusula C4 encendida, la consulta responde con datos protegidos.

---

En el siguiente capítulo analizaremos el rol opuesto: el área de Salud Ocupacional (SST), que sí puede intervenir clínicamente los riesgos detectados.

👉 **Siguiente paso**: [Capítulo 07: Módulo SST (Salud y Seguridad en el Trabajo)](./07_modulo_sst.md)
