# Capítulo 11: Diccionario Maestro A-Z y Glosario

> **Objetivo del capítulo**: Proporcionar una enciclopedia de consulta rápida con la totalidad de las funciones principales exportadas en el código de Pulso360, sus parámetros, retornos y consumidores, acompañada de un glosario riguroso de términos técnicos y del dominio de salud laboral en Contact Centers.

---

## 1. Diccionario Maestro de Funciones A-Z

### A
- **`advanceHabeasRequest(requestId, nextStatus, note)`**
  - **Archivo**: `src/features/admin/services/habeasDataService.jsx`
  - **Parámetros**: `requestId` (string con el ID de la solicitud), `nextStatus` (`'En trámite'` o `'Resuelta'`), `note` (texto de resolución).
  - **Qué hace**: Avanza el estado de una petición de Habeas Data bajo la Ley 1581, calculando los plazos en días hábiles y registrando la respuesta administrativa.
  - **Retorno**: Objeto de solicitud actualizado.
  - **Consumidores**: `useHabeasData.jsx` y `HabeasAdvanceModal.jsx`.

- **`analyzeText(text)`**
  - **Archivo**: `src/core/nlp/nlpEngine.jsx`
  - **Parámetros**: `text` (string con el texto libre de la bitácora del agente).
  - **Qué hace**: Normaliza el texto a minúsculas, remueve tildes, busca coincidencias con `NLP_CATEGORIES` y `CRISIS_PHRASES`. Calcula la densidad de términos de sobrecarga y evalúa si se debe activar el protocolo de crisis.
  - **Retorno**: `{ categories: Array<string>, hasCrisisPhrase: boolean, tensionScore: number }`.
  - **Consumidores**: `NlpAnalysisPanel.jsx`, `useJournal.jsx` y `useCheckinWizard.jsx`.

- **`approveAlertRule(ruleId)`**
  - **Archivo**: `src/features/admin/services/systemParamsService.jsx`
  - **Parámetros**: `ruleId` (string con el identificador de la regla).
  - **Qué hace**: Cambia el estado de una regla preventiva propuesta por SST de `'Pendiente'` a `'Activa'`, permitiendo que el motor de evaluación comience a monitorearla.
  - **Retorno**: Lista actualizada de reglas.
  - **Consumidores**: `PendingAlertRules.jsx` y `useSystemParams.jsx`.

- **`authService.login(email, password)`**
  - **Archivo**: `src/core/auth/authService.jsx`
  - **Parámetros**: `email` (string), `password` (string).
  - **Qué hace**: Valida si el usuario está bloqueado por fuerza bruta (`getRemainingLockMs`). Busca en `pulsoStore.get().users`. Si es correcto, guarda la sesión en `sessionStorage` y emite un log de auditoría inmutable.
  - **Retorno**: `{ success: boolean, user?: Object, message?: string, locked?: boolean }`.
  - **Consumidores**: `useLogin.jsx` y `LoginForm.jsx`.

- **`authService.logout()`**
  - **Archivo**: `src/core/auth/authService.jsx`
  - **Parámetros**: Ninguno.
  - **Qué hace**: Elimina la clave de sesión de `sessionStorage`, audita la salida del usuario en `pulsoStore` y redirige a la pantalla de login.
  - **Retorno**: `void`.
  - **Consumidores**: `AppLayout.jsx` (botón de cerrar sesión).

- **`authService.getCurrentUser()`**
  - **Archivo**: `src/core/auth/authService.jsx`
  - **Parámetros**: Ninguno.
  - **Qué hace**: Recupera y deserializa el usuario guardado en `sessionStorage`. Comprueba que el usuario siga existiendo en la base de datos y que su estado sea `'Activo'`. Si fue suspendido, limpia la sesión y retorna `null`.
  - **Retorno**: Objeto de usuario autenticado o `null`.
  - **Consumidores**: `App.jsx`, `ProtectedRoute.jsx`, `AppLayout.jsx` y casi todos los hooks del sistema.

---

### C
- **`createAmbientSound()`**
  - **Archivo**: `src/features/agent/services/ambientSound.jsx`
  - **Parámetros**: Ninguno.
  - **Qué hace**: Inicializa un nodo `AudioContext` en el navegador. Genera ruido rosa continuo mediante una aproximación matemática de Paul Kellet y añade dos osciladores armónicos en 110 Hz y 164.81 Hz. Modula el filtro pasabajos dinámicamente según el ritmo de respiración guiada.
  - **Retorno**: Objeto con métodos `{ start(), stop(), setPhase(phase) }`.
  - **Consumidores**: `useBpoPause.jsx` y `MyWellbeingPage.jsx`.

- **`createIntervention(interventionData)`**
  - **Archivo**: `src/features/sst/services/interventionsService.jsx`
  - **Parámetros**: `interventionData` (objeto con título, campaña objetivo, supervisor asignado, tipo y fechas).
  - **Qué hace**: Registra un nuevo plan de acción preventivo en `pulsoStore` y emite una notificación al supervisor correspondiente.
  - **Retorno**: Objeto de intervención creado con ID único.
  - **Consumidores**: `NewInterventionForm.jsx` y `InterventionsPage.jsx`.

- **`createUser(newUserData)`**
  - **Archivo**: `src/features/admin/services/usersRolesService.jsx`
  - **Parámetros**: `newUserData` (objeto con nombre, correo, rol, campaña y turno).
  - **Qué hace**: Asigna un ID (`usr-...`), establece la contraseña inicial, inicializa las preferencias de consentimiento por defecto y persiste el nuevo usuario en el almacén central.
  - **Retorno**: Lista de usuarios actualizada.
  - **Consumidores**: `CreateUserModal.jsx` y `useUsersRoles.jsx`.

---

### D
- **`dismissAlert(alertId, reason)`**
  - **Archivo**: `src/features/sst/services/alertsInboxService.jsx`
  - **Parámetros**: `alertId` (string), `reason` (string con la justificación obligatoria).
  - **Qué hace**: Marca una alerta como descartada/resuelta, archivando la justificación del profesional de SST y dejando registro inmutable en auditoría.
  - **Retorno**: Lista actualizada de alertas.
  - **Consumidores**: `DismissAlertModal.jsx` y `AlertsInboxPage.jsx`.

- **`DownloadLink({ content, fileName, mimeType, children })`**
  - **Archivo**: `src/core/components/DownloadLink.jsx`
  - **Parámetros**: Contenido a exportar, nombre sugerido de archivo y tipo MIME (`application/json`, `text/csv`).
  - **Qué hace**: Genera un objeto `Blob` y una URL temporal mediante `URL.createObjectURL()`, forzando la descarga del archivo en el navegador de manera accesible.
  - **Retorno**: Elemento JSX `<a>` estilizado como botón.
  - **Consumidores**: `MyDataPrivacyPage.jsx`, `AuditLogPage.jsx` y `ReportsPage.jsx`.

---

### G
- **`getPreferences()` / `savePreferences(prefs)`**
  - **Archivo**: `src/core/storage/preferences.jsx`
  - **Parámetros**: Objeto de preferencias de interfaz (modo de sonido, recordatorios, vistas compactas).
  - **Qué hace**: Lee y escribe configuraciones puramente estéticas y personales del navegador sin alterar la base de datos principal de `pulsoStore`.
  - **Retorno**: Objeto de preferencias.
  - **Consumidores**: `useNotifications.jsx` y `AppLayout.jsx`.

---

### L
- **`localData.getItem(key)` / `localData.setItem(key, value)`**
  - **Archivo**: `src/core/storage/browserStorage.jsx`
  - **Parámetros**: Clave y valor en string.
  - **Qué hace**: El **único punto de contacto de la aplicación con `window.localStorage`**. Envuelve cada operación en `try / catch` para evitar que la aplicación falle si el usuario está en modo privado estricto o no tiene cuota de disco disponible.
  - **Retorno**: String con los datos o `null`.
  - **Consumidores**: `pulsoStore.jsx` y `authService.jsx`.

---

### P
- **`pulsoStore.get()`**
  - **Archivo**: `src/core/storage/pulsoStore.jsx`
  - **Parámetros**: Ninguno.
  - **Qué hace**: Lee el JSON central de la aplicación. Si no existe o está corrupto, carga la semilla inicial (`seed.jsx`), la normaliza con `normalizeStoredData.jsx`, aplica migraciones (`migrations.jsx`) y la guarda.
  - **Retorno**: Objeto con todas las colecciones (`users`, `campaigns`, `checkins`, `journals`, `alerts`, `auditLogs`, `settings`).
  - **Consumidores**: Todos los servicios del sistema.

- **`pulsoStore.audit({ actor, action, target, status })`**
  - **Archivo**: `src/core/storage/pulsoStore.jsx`
  - **Parámetros**: Quién ejecutó la acción, qué acción hizo, sobre qué elemento y el resultado (`ÉXITO`/`FALLA`).
  - **Qué hace**: Inserta un registro en la cabeza de la lista `auditLogs` generando un hash criptográfico enlazado al registro anterior (`prevHash`), garantizando inmutabilidad.
  - **Retorno**: ID del log generado (`aud-...`).
  - **Consumidores**: Todos los módulos cuando ocurre un evento relevante.

---

### T
- **`TrendLineChart({ data, width, height, color })`**
  - **Archivo**: `src/core/components/TrendLineChart.jsx`
  - **Parámetros**: Arreglo de números (0-100), dimensiones en píxeles y color de trazo.
  - **Qué hace**: Calcula matemáticamente las coordenadas `(x, y)` escaladas y genera una curva SVG nativa (`<path d="M... C...">`) con área sombreada semitransparente, sin requerir librerías pesadas como Chart.js.
  - **Retorno**: Elemento visual SVG interactivo.
  - **Consumidores**: `MyAnalysisPage.jsx`, `TeamDashboardPage.jsx` y `SstDashboardPage.jsx`.

---

### U
- **`useCheckinWizard()`**
  - **Archivo**: `src/features/agent/hooks/useCheckinWizard.jsx`
  - **Qué hace**: Orquesta el formulario somático de 3 pasos: controla el paso activo, valida respuestas, guarda borradores automáticos y almacena el check-in final en `pulsoStore`.
  - **Retorno**: Estado del formulario, funciones de avance y manejo de envío.
  - **Consumidores**: `CheckinWizardPage.jsx`.

- **`useJournal()`**
  - **Archivo**: `src/features/agent/hooks/useJournal.jsx`
  - **Qué hace**: Administra el editor de texto de la bitácora privada, dispara el análisis de `nlpEngine` con temporizador anti-rebote (debounce) y gestiona la lista de notas pasadas del agente.
  - **Retorno**: Texto actual, categorías NLP detectadas, función de guardado y eliminación.
  - **Consumidores**: `JournalPage.jsx`.

---

## 2. Glosario Técnico y de Negocio

- **AHT (*Average Handle Time* / Tiempo Medio Operativo)**: Indicador de productividad en Contact Centers que mide cuántos minutos y segundos tarda un agente en resolver una interacción con un cliente. La presión excesiva por reducir el AHT es una de las principales fuentes de estrés psicosocial.
- **Append-Only Log (Registro de Solo Adición)**: Estructura de base de datos donde la información solo se puede agregar al final, pero nunca modificar ni borrar. Es el fundamento de la auditoría forense en Pulso360.
- **BPO (*Business Process Outsourcing*)**: Industria de tercerización de procesos operativos (servicios al cliente, soporte, telemercadeo y cobranzas) caracterizada por alta rotación de personal y turnos intensivos.
- **Burnout (Síndrome de Agotamiento Profesional)**: Condición reconocida por la OMS resultante del estrés crónico en el lugar de trabajo. Comprende tres dimensiones: agotamiento emocional extremo, despersonalización (cinismo o apatía hacia los clientes) y sensación de ineficacia personal.
- **Consentimiento Granular C1-C5**: Modelo ético de Pulso360 donde el agente puede aceptar o revocar individualmente cinco finalidades de tratamiento de datos, garantizando su autonomía sobre su información sensible.
- **Debounce (Anti-rebote)**: Técnica de programación que retrasa la ejecución de una función costosa (como el análisis léxico NLP) hasta que el usuario deja de escribir en el teclado por una fracción de segundo (ej. 300 ms), evitando saturar el procesador.
- **FCR (*First Contact Resolution*)**: Porcentaje de solicitudes de clientes resueltas en la primera llamada sin requerir retransferencias.
- **Grounding 5-4-3-2-1**: Ejercicio de anclaje sensorial utilizado en psicología de emergencia para reducir ataques de ansiedad o despersonalización tras llamadas hostiles.
- **Habeas Data (Ley 1581 de 2012)**: Marco legal colombiano que otorga a cualquier ciudadano el derecho constitucional de conocer, actualizar, rectificar o solicitar la supresión de sus datos personales en cualquier base de datos.
- **HMR (*Hot Module Replacement*)**: Característica de Vite que reemplaza módulos de código en el navegador en tiempo real mientras programas, sin reiniciar la aplicación ni borrar los estados.
- **k-Anonimato (*k-Anonymity*)**: Propiedad matemática de privacidad que exige que cualquier dato grupal exhibido en pantalla esté compuesto por al menos $k$ personas ($k \ge 5$ en Pulso360), impidiendo que un supervisor deduzca a quién corresponde una respuesta específica.
- **Maslach Burnout Inventory (MBI)**: El instrumento psicométrico estándar de oro a nivel mundial para evaluar el desgaste ocupacional, referenciado en la fundamentación académica de la plataforma.
- **NLP Léxico Determinista**: Procesamiento de lenguaje natural basado en reglas matemáticas y diccionarios objetivos de palabras clave locales, sin recurrir a inteligencias artificiales generativas externas en la nube.
- **RBAC (*Role-Based Access Control*)**: Modelo de seguridad donde los permisos de navegación y visualización de datos se asignan exclusivamente en función del rol verificado del usuario (`agente`, `supervisor`, `sst`, `auditor`, `admin`).
- **Resolución 2764 de 2022**: Norma del Ministerio del Trabajo de Colombia que reglamenta la evaluación, vigilancia e intervención periódica de los factores de riesgo psicosocial en todas las empresas del país.
- **Ruido Rosa (*Pink Noise*)**: Tipo de señal de audio donde cada octava transporta una cantidad igual de energía sonora (densidad espectral inversamente proporcional a la frecuencia $1/f$). Suena natural y relajante (como olas o lluvia suave) y es ideal para desacelerar la actividad neuronal.
- **Separation of Duties (Separación de Funciones)**: Principio de control interno donde ninguna acción crítica (como activar una regla de alarma operativa) puede ser ejecutada por una sola persona: SST diseña y propone; el Administrador autoriza.
- **SPA (*Single Page Application*)**: Aplicación web que carga un solo archivo HTML y actualiza dinámicamente sus vistas mediante JavaScript y React Router sin recargar el navegador.
- **Web Audio API**: Interfaz de programación avanzada de los navegadores web modernos que permite sintetizar y procesar señales de audio en tiempo real directamente con el hardware del computador, sin requerir archivos de sonido externos.

---

🎉 **¡Felicitaciones! Has completado el Libro Técnico Definitivo de Pulso360.**  
Ahora conoces cada rincón de la arquitectura, sus decisiones éticas, sus componentes, estilos y funciones. Con este conocimiento, tienes todas las herramientas para mantener, auditar o expandir la plataforma con total maestría.

👉 [Volver al Índice Maestro](./INDICE_MAESTRO.md)
