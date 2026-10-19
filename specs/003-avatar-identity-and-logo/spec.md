# [SPEC-003] Avatar Identity, Checkin State and Professional Logo Redesign

Fecha: 2026-10-18  
Estado: ESPECIFICADO / EN PROCESO

## 0. Fase de Clarificación y Supuestos

- **Dirección de Arte y Consistencia de Avatar**: No se reutilizarán imágenes existentes para el nuevo estado; se generarán activos rasterizados nuevos que preservan estrictamente la identidad de la protagonista 3D: misma fisionomía (ojos castaños/miel, cabello recogido en moño profesional bajo, uniforme beige BPO con credencial teal al cuello y diadema ergonómica de Contact Center).
- **Rediseño de Logotipo Institucional**: Se descartó categóricamente sustituir el logotipo por la cara del avatar. En su lugar, se rediseña el logotipo institucional de Pulso360 en formato vectorial puro (SVG) con el concepto de **Pulso Orbital 360°** (dos arcos armónicos envolventes que representan el monitoreo continuo e integral y convergen en una onda suave de ritmo vital). El logotipo ofrece transparencia total, escalabilidad vectorial y separación nítida entre Isotipo (para barra lateral compacta y favicon) e Imagotipo (para vistas amplias).
- **Tarjeta Restauradora en Check-in (`/agente/checkin`)**: El estado plano y sin salida actual en `CheckinWizardPage.jsx` se transforma en una superficie restauradora con la nueva imagen del avatar en descanso ergonómico, mensaje cálido de turno completado y botones funcionales de navegación (`Volver al panel`, `Ir a mi bitácora`, `Pausa de respiración`).
- **Foto de Perfil del Agente**: En `AppLayout.jsx`, se sustituye la inicial estática de texto (la letra "L") por un retrato en primer plano (*headshot*) del avatar en proporción 1:1, aportando calidez humana y protegiendo la privacidad del operador frente a fotos personales reales.

## 1. Need and scope

- **Necesidad**: La interfaz de check-in cuando la ventana de edición ha cerrado se percibe desolada y plana, dejando al agente sin orientación ni refuerzo de autocuidado. Asimismo, la identidad visual de la plataforma está fragmentada con iniciales de texto frías en el perfil y un logotipo rasterizado antiguo (`logo.webp`) con tipografía empastada y metáfora de clínica general que no representa el estándar tecnológico ni la seriedad institucional de Pulso360.
- **Alcance**:
  1. Diseñar el nuevo sistema de logotipo vectorial SVG (Isotipo e Imagotipo) en `frontend/public/assets/marca/`.
  2. Actualizar las referencias de marca en `AppLayout.jsx`, `LoginManifesto.jsx`, `Navbar.jsx`, `Footer.jsx` y `index.html` (favicon).
  3. Generar la nueva imagen del avatar en pose de descanso y turno cumplido para el estado de check-in ya registrado.
  4. Rediseñar el estado de check-in registrado en `CheckinWizardPage.jsx` y sus estilos en `agent.css`.
  5. Generar la imagen de perfil (*headshot*) del avatar e integrarla en el avatar circular de `AppLayout.jsx`.
  6. Generar las imágenes complementarias para la bitácora y pausa somática para consolidar la biblioteca de activos.
  7. Verificar accesibilidad (WCAG AA, textos alternativos precisos) y superar los quality gates (`npm run lint` y `npm run build`).
- **Non-Goals (Fuera de alcance)**:
  - No reemplazar el logo institucional por la cara del personaje 3D.
  - No forzar la subida de fotos privadas de empleados reales en el BPO.
  - No modificar la lógica de cálculo de la ventana de 2 horas ni el almacenamiento de respuestas.

## 2. Acceptance Criteria and Non-Goals

- **AC-01 (Nuevo Logotipo Vectorial Pulso Orbital 360°)**: Creación de `logo.svg` y `symbol.svg` vectoriales con arcos envolventes 360° y onda de pulso vital en la paleta institucional (Teal `#0D9488`, Navy `#0F172A`, Menta `#10B981`), transparentes y escalables sin pixelación.
- **AC-02 (Integración del Logotipo en Shell y Favicon)**: Actualización en `AppLayout.jsx`, pantallas de autenticación, landing y cabecera HTML con el nuevo isotipo nítido a 34px y favicon actualizado.
- **AC-03 (Generación de Nueva Imagen de Check-in Cumplido)**: Generación de activo visual 3D con la misma protagonista en pose de tranquilidad y satisfacción en su puesto BPO, diadema en reposo, guardada en `frontend/public/assets/fotos/bpo-agent-checkin-completed.webp`.
- **AC-04 (Rediseño de Pantalla de Check-in Ya Registrado)**: `CheckinWizardPage.jsx` presenta una tarjeta balanceada con la nueva imagen, copy reforzador y botones directos a "Volver al panel", "Ir a mi bitácora" y "Pausa de respiración".
- **AC-05 (Foto de Perfil del Avatar en Navegación)**: Sustitución de la inicial de texto ("L") por el nuevo headshot circular del avatar en el botón de cuenta y en el popover inferior de `AppLayout.jsx`.
- **AC-06 (Activos Nuevos Complementarios del Avatar)**: Generación de imágenes para bitácora reflexiva (`bpo-agent-journal-calm.webp`) y pausa guiada (`bpo-agent-breathing-guide.webp`).
- **AC-07 (Quality Gates y Cero Regresiones)**: Aprobación sin advertencias de `npm run lint` y compilación limpia con `npm run build` en el frontend.

## 3. Domain applicability

| Security & Compliance Control | Required? | Technical Enforcement |
| :--- | :---: | :--- |
| **¿Toca datos personales sensibles (PII)?** | N/A | El avatar es sintético y protege la imagen de trabajadores reales. No se almacenan fotos personales. |
| **¿Expone datos cross-tenant?** | N/A | Monotenant organizacional. |
| **¿Requiere registro de auditoría?** | N/A | Modificaciones estéticas y de navegación de cliente; no alteran registros de SST. |
| **¿Accede o procesa datos sensibles?** | N/A | No hay telemetría ni envío de datos a servicios externos de IA. |

## 4. Experiencia y límites

- **Estados visuales en Check-in**:
  - *Ventana abierta:* Muestra el tiempo restante y botón "Editar registro".
  - *Ventana cerrada:* Muestra la nueva ilustración, mensaje cálido de turno registrado y botones de escape a bitácora y panel.
- **Accesibilidad**: Textos alternativos (`alt`) descriptivos y precisos sobre la postura ergonómica y el rol en BPO, sin frases redundantes.

## 5. Traceability

- **AC-01, AC-02** -> Plan: Sistema de Marca Vectorial | Tareas: T-01, T-02
- **AC-03, AC-04** -> Plan: Check-in Restaurador | Tareas: T-03, T-04
- **AC-05, AC-06** -> Plan: Avatar de Perfil y Biblioteca | Tareas: T-05, T-06
- **AC-07** -> Plan: Quality Gates | Tareas: T-07
