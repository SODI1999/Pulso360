# Pulso360 — Compendio Maestro de Diagramas de Arquitectura y Software

Este documento reúne la especificación formal y el catálogo maestro de diagramas de ingeniería de software para **Pulso360**. Ha sido diseñado en sintaxis estándar **Mermaid** ejecutable y estructurado para respaldar la evaluación del **Proyecto Pedagógico Integrador (PPI)** y la materia de **Construcción de Software 3** (Tecnológico de Antioquia).

---

## 🗺️ Índice de Diagramas

1. [Diagrama 1: Arquitectura de Sistema (C4 Modelo Nivel 2: Contenedores)](#1-diagrama-de-arquitectura-c4-nivel-2-contenedores)
2. [Diagrama 2: Casos de Uso del Sistema (UML)](#2-diagrama-de-casos-de-uso-uml)
3. [Diagrama 3: Jerarquía y Flujo de Navegación de UI (Sitemap)](#3-diagrama-de-ui-sitemap-y-flujo-de-navegación)
4. [Diagrama 4: Flujos de Procesos Principales (Activity Diagrams)](#4-diagramas-de-flujo-de-procesos-principales)
   - [4.1 Check-in Diario y Bitácora Emocional con NLP](#41-flujo-de-check-in-diario-y-bitácora-emocional)
   - [4.2 Motor de Vigilancia Psicosocial y Alertas SST](#42-flujo-de-detección-y-generación-de-alertas-sst)
   - [4.3 Solicitud de Apoyo y Chat de Crisis en Tiempo Real](#43-flujo-de-solicitud-de-apoyo-y-chat-de-crisis)
5. [Diagrama 5: Diagrama de Componentes (Arquitectura de Capas Monorepo)](#5-diagrama-de-componentes-arquitectura-de-capas)
6. [Diagrama 6: Diagrama de Clases (Modelo de Dominio de Software)](#6-diagrama-de-clases-modelo-de-dominio)
7. [Diagrama 7: Diagrama Entidad-Relación (ER Conceptual/Lógico)](#7-diagrama-entidad-relación-er-conceptual)
8. [Diagrama 8: Diagrama Relacional (Modelo Físico de Base de Datos - PostgreSQL)](#8-diagrama-relacional-modelo-físico-postgresql)
9. [Diagrama 9: Diagrama de Despliegue (Infraestructura Docker Compose)](#9-diagrama-de-despliegue-docker-compose)
10. [Diagrama 10: Diagrama de Secuencia (Autenticación Segura y RBAC)](#10-diagrama-de-secuencia-autenticación-y-rbac)
11. [Diagrama 11: Diagrama de Estados (Ciclo de Vida de Alertas SST)](#11-diagrama-de-estados-alertas-sst)

---

## 1. Diagrama de Arquitectura (C4 Nivel 2: Contenedores)

Describe los subsistemas de alto nivel, protocolos de comunicación y fronteras de datos de Pulso360.

```mermaid
flowchart TD
    subgraph GrupoUsuarios ["Actores del Ecosistema BPO"]
        Agente["Agente de Contact Center"]
        Supervisor["Supervisor Operativo"]
        SST["Profesional de SST"]
        Auditor["Auditor de Cumplimiento"]
        Admin["Administrador de Plataforma"]
    end

    subgraph Pulso360System ["Frontera del Sistema Pulso360 (Monorepo)"]
        subgraph ClienteWeb ["Frontend SPA (Cliente Ligero)"]
            SPA["React 18 + Vite 6<br>Tokens CSS & Lucide Icons<br>Puerto: 5173"]
            NLPLocal["Motor NLP Léxico Determinista<br>(Ejecución 100% en Navegador / Privado)"]
            SPA --- NLPLocal
        end

        subgraph ServidorAPI ["Backend (API REST & Tiempo Real)"]
            API["Servidor Express.js 5 REST API<br>Ruta Base: /api/v1<br>Puerto: 3000"]
            AuthMiddle["Filtros RBAC, JWT & Ley 1581<br>(Validación de Consentimiento C1-C5)"]
            SocketServer["Servidor Socket.io<br>(Canal de Chat Bidireccional en Crisis)"]
            Scheduler["Alert Scheduler Job<br>(Evaluador Semanal de Reglas SST)"]
            
            API --- AuthMiddle
            API --- SocketServer
            API --- Scheduler
        end

        subgraph CapaDatos ["Capa de Datos Persistente"]
            PostgreSQL[("PostgreSQL 18<br>31 Tablas Relacionales (26 Dominio + 5 Técnicas)<br>Puerto: 5432")]
        end
    end

    subgraph Externos ["Sistemas Externos Institucionales"]
        SMTP["Servidor SMTP Institucional<br>(Envío de Alertas Críticas por Correo)"]
    end

    Agente -->|HTTPS / Navegador Web| SPA
    Supervisor -->|HTTPS / Navegador Web| SPA
    SST -->|HTTPS / Navegador Web| SPA
    Auditor -->|HTTPS / Navegador Web| SPA
    Admin -->|HTTPS / Navegador Web| SPA
    SPA -->|JSON REST API / Bearer JWT| API
    SPA <-->|WSS WebSockets| SocketServer
    API -->|Consultas SQL nativas parametrizadas| PostgreSQL
    Scheduler -->|Consultas agregadas k-anonimato| PostgreSQL
    API -->|Notificaciones seguras por correo| SMTP

    classDef container fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    class SPA,API,SocketServer,Scheduler container;
    class PostgreSQL db;
```

---

## 2. Diagrama de Casos de Uso (UML)

Mapea los 16 casos de uso del sistema frente a los 5 roles canónicos del sistema de control de acceso (RBAC).

```mermaid
flowchart LR
    subgraph Actores ["Actores del Sistema"]
        A((Agente))
        S((Supervisor))
        T((Profesional SST))
        U((Auditor))
        M((Administrador))
    end

    subgraph CasosDeUso ["Casos de Uso de Pulso360"]
        CU01(["CU-01: Iniciar Sesión y Gestionar Consentimiento (C1-C5)"])
        CU02(["CU-02: Registrar Check-in Diario Somático (3 Pasos)"])
        CU03(["CU-03: Escribir Bitácora Privada de Desahogo"])
        CU04(["CU-04: Ejecutar Pausas Activas y Reset Emocional"])
        CU05(["CU-05: Solicitar Acompañamiento Psicosocial / Chat"])
        
        CU06(["CU-06: Consultar Tablero de Equipo (Umbral k >= 5)"])
        CU07(["CU-07: Formular y Seguir Planes de Acción Preventivos"])
        
        CU08(["CU-08: Monitorear Vigilancia Psicosocial Agregada"])
        CU09(["CU-09: Gestionar Alertas Tempranas del Algoritmo"])
        CU10(["CU-10: Atender Solicitudes de Apoyo y Chat de Crisis"])
        CU11(["CU-11: Diseñar Intervenciones Colectivas SST"])
        
        CU12(["CU-12: Inspeccionar Trazabilidad de Logs Inmutables"])
        CU13(["CU-13: Validar Cumplimiento Normativo y k-Anonimato"])
        CU14(["CU-14: Atender Solicitudes de Habeas Data (ARCO)"])
        
        CU15(["CU-15: Administrar Usuarios, Equipos y Campañas"])
        CU16(["CU-16: Configurar Reglas de Alerta y Parámetros Globales"])
    end

    A --- CU01
    A --- CU02
    A --- CU03
    A --- CU04
    A --- CU05

    S --- CU01
    S --- CU06
    S --- CU07

    T --- CU01
    T --- CU08
    T --- CU09
    T --- CU10
    T --- CU11

    U --- CU01
    U --- CU12
    U --- CU13
    U --- CU14

    M --- CU01
    M --- CU15
    M --- CU16
```

---

## 3. Diagrama de UI (Sitemap y Flujo de Navegación)

Representa la estructura jerárquica de vistas, pantallas públicas, controles de acceso por rol y rutas transversales.

```mermaid
graph TD
    PublicRoot["/ (Landing Page Institucional)"]
    PublicContact["/contactenos (Formulario de Contacto y Canales)"]
    PublicFundamentacion["/fundamentacion (Fundamentación Académica)"]
    Login["/login (Autenticación & Acceso Rápido para 5 Roles)"]
    Forgot["/recuperar-clave (Recuperación)"]
    Reset["/nueva-clave (Restablecimiento)"]

    PublicRoot --> PublicContact
    PublicRoot --> PublicFundamentacion
    PublicRoot --> Login
    Login --> Forgot
    Forgot --> Reset

    subgraph EspacioProtegido ["Espacio Protegido (ProtectedRoute / JWT RBAC)"]
        Consent["/consentimiento (Consentimiento Informado C1-C5)"]

        subgraph ModuloAgente ["Experiencia del Agente"]
            AgentePanel["/agente/panel (Tablero de Bienestar del Agente)"]
            AgenteCheckin["/agente/checkin (Check-in Somático en 3 Pasos)"]
            AgenteBitacora["/agente/bitacora (Bitácora Privada & Motor NLP)"]
            AgenteBienestar["/agente/mi-bienestar (Pausas Sonoras & Ejercicios)"]
            AgenteApoyo["/agente/apoyo (Canal de Crisis & Chat en Vivo)"]
            AgenteDatos["/agente/mis-datos (Gestión ARCO & Habeas Data)"]

            AgentePanel --> AgenteCheckin
            AgentePanel --> AgenteBitacora
            AgentePanel --> AgenteBienestar
            AgentePanel --> AgenteApoyo
            AgentePanel --> AgenteDatos
        end

        subgraph ModuloSupervisor ["Experiencia del Supervisor"]
            SuperPanel["/supervisor/panel (Tablero Agregado: k-anonimato N >= 5)"]
            SuperAcciones["/supervisor/acciones (Planes Preventivos Asignados)"]
            SuperPanel --> SuperAcciones
        end

        subgraph ModuloSST ["Experiencia de SST"]
            SstPanel["/sst/panel (Vigilancia Psicosocial Epidemiológica)"]
            SstAlertas["/sst/alertas (Gestión de Alertas Tempranas)"]
            SstReglas["/sst/reglas-alertas (Configuración de Umbrales SST)"]
            SstIntervenciones["/sst/intervenciones (Planes Colectivos)"]
            SstBuzon["/sst/buzon (Bandeja de Apoyo y Chat de Crisis)"]

            SstPanel --> SstAlertas
            SstPanel --> SstReglas
            SstPanel --> SstIntervenciones
            SstPanel --> SstBuzon
        end

        subgraph ModuloAuditor ["Experiencia del Auditor"]
            AuditorRedirect["/auditor/panel (Redirección canónica)"]
            AuditorAuditoria["/auditor/auditoria (Trazabilidad & Logs Inmutables)"]
            AuditorRedirect --> AuditorAuditoria
        end

        subgraph ModuloAdmin ["Experiencia del Administrador"]
            AdminRedirect["/admin/panel (Redirección canónica)"]
            AdminOrganizacion["/admin/organizacion (Campañas, Equipos y Turnos)"]
            AdminUsuarios["/admin/usuarios-roles (Control de Usuarios y Roles)"]
            AdminParametros["/admin/parametros (Configuración de Sistema)"]
            AdminImportar["/admin/importar (Importación CSV de Personal)"]
            AdminSolicitudes["/admin/solicitudes (Gestión ARCO & Habeas Data)"]

            AdminRedirect --> AdminOrganizacion
            AdminOrganizacion --> AdminUsuarios
            AdminOrganizacion --> AdminParametros
            AdminOrganizacion --> AdminImportar
            AdminOrganizacion --> AdminSolicitudes
        end

        subgraph ModulosTransversales ["Módulos Transversales"]
            Reportes["/reportes (Generador de Reportes con Hash SHA-256)"]
            Notificaciones["/notificaciones (Avisos Operativos In-App)"]
        end
    end

    Login -->|Rol == AGENTE| AgentePanel
    Login -->|Rol == SUPERVISOR| SuperPanel
    Login -->|Rol == SST| SstPanel
    Login -->|Rol == AUDITOR| AuditorAuditoria
    Login -->|Rol == ADMIN| AdminOrganizacion

    classDef pub fill:#fafafa,stroke:#616161,stroke-width:1px;
    classDef priv fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    class PublicRoot,PublicContact,PublicFundamentacion,Login,Forgot,Reset pub;
```

---

## 4. Diagramas de Flujo de Procesos Principales

### 4.1 Flujo de Check-in Diario y Bitácora Emocional

```mermaid
flowchart TD
    Inicio([Inicio de Turno: Agente ingresa a Pulso360]) --> ValidaHoy{¿Check-in completado hoy?}
    ValidaHoy -- Sí --> VerDashboard[Mostrar métricas personales y accesos a pausas]
    ValidaHoy -- No --> Paso1[Paso 1: Evaluar dimensiones de energía y recuperación]
    
    Paso1 --> Paso2[Paso 2: Registrar sobrecarga percibida y apoyo de equipo]
    Paso2 --> Paso3[Paso 3: Redactar bitácora emocional opcional]
    
    Paso3 --> ContieneTexto{¿Agente ingresó texto en bitácora?}
    ContieneTexto -- Sí --> NLPClient[Ejecutar motor léxico determinista local en el navegador]
    NLPClient --> Normalizar[Normalización léxica: minúsculas, remoción de tildes y stemmer]
    Normalizar --> Clasificar[Clasificación determinista en dimensiones de fatiga/carga]
    Clasificar --> GuardarBitacora[(Persistir bitácora aislada en PostgreSQL - Cero acceso a líderes)]
    ContieneTexto -- No --> GuardarCheckin
    
    GuardarBitacora --> GuardarCheckin[(Persistir registro en daily_checkins vía API REST)]
    GuardarCheckin --> EvalSeveridad{¿Puntaje crítico en dimensiones somáticas?}
    EvalSeveridad -- Sí --> OfrecerReset[Recomendar ejercicio 5-4-3-2-1 y habilitar canal voluntario SST]
    EvalSeveridad -- No --> FinCheckin([Check-in completado satisfactoriamente])
    OfrecerReset --> FinCheckin
```

### 4.2 Flujo de Detección y Generación de Alertas SST

```mermaid
flowchart TD
    TriggerJob([Planificador Semanal: alertScheduler.js]) --> BuscarEquipos[Consultar campañas y equipos activos]
    BuscarEquipos --> ValidarK{¿Total de agentes con check-in en el periodo >= 5?}
    
    ValidarK -->|"No (k < 5)"| SupresionK[Aplicar supresión estricta por k-anonimato]
    SupresionK --> LogK[Registrar evento técnico de supresión de privacidad]
    
    ValidarK -->|"Sí (k >= 5)"| Promediar[Calcular promedios agregados de energía, carga y apoyo]
    Promediar --> CompararReglas[Evaluar contra reglas activas en reglas_alerta]
    
    CompararReglas --> SuperaUmbral{¿Desviación supera el umbral configurado?}
    SuperaUmbral -->|Sí| EmitirAlerta[(Crear registro en sst_alertas con estado PENDIENTE)]
    EmitirAlerta --> NotificarSST[Emitir notificación in-app y correo institucional a SST]
    SuperaUmbral -->|No| ContinuarEq[Avanzar al siguiente equipo]
    
    NotificarSST --> RevisionSST[Especialista SST revisa panel de alertas]
    RevisionSST --> CrearPlan[(Formular sst_intervenciones: taller, rotación o pausas asistidas)]
    CrearPlan --> FinAlerta([Alerta intervenida y en seguimiento])
    ContinuarEq --> FinAlerta
```

### 4.3 Flujo de Solicitud de Apoyo y Chat de Crisis

```mermaid
flowchart TD
    AgenteSiente([Agente percibe sobrecarga emocional o crisis]) --> AbreModulo[Navega a /agente/apoyo]
    AbreModulo --> EligeTipo{¿Desea solicitar apoyo de forma anónima o identificada?}
    
    EligeTipo -->|Anónimo| RadicaAnon[Radica solicitud con seudónimo técnico sin datos de perfil]
    EligeTipo -->|Identificado| RadicaIdent[Radica solicitud vinculada a su cuenta institucional]
    
    RadicaAnon --> PersisteSol[(Insertar en solicitudes_apoyo con estado PENDIENTE)]
    RadicaIdent --> PersisteSol
    
    PersisteSol --> NotificaBuzon[Notificación inmediata al buzón de SST]
    NotificaBuzon --> SSTToma[Profesional SST acepta y abre sesión de chat]
    SSTToma --> AbreSocket[(Crear registro en sesiones_chat_soporte y conectar Socket.io)]
    
    AbreSocket --> Intercambio[Intercambio confidencial de mensajes en tiempo real]
    Intercambio --> TerminaSesion{¿Crisis mitigada o caso canalizado?}
    TerminaSesion -- Sí --> CierraChat[Profesional SST finaliza sesión y registra notas clínicas aisladas]
    CierraChat --> FinChat([Sesión cerrada y registrada en auditoría con hash SHA-256])
```

---

## 5. Diagrama de Componentes (Arquitectura de Capas)

Muestra la separación física y lógica entre el cliente React y los paquetes de backend.

```mermaid
flowchart TD
    subgraph FrontendModule ["Módulo Frontend (Single Page Application)"]
        subgraph CoreFront ["Capa Core (src/core/)"]
            Router["App.jsx (Enrutador Central)"]
            AuthModule["core/auth (authService, ProtectedRoute, roleNavigation)"]
            APIModule["core/api (apiClient, chatService)"]
            NLPModule["core/nlp (nlpEngine, spanishStemmer, damerauLevenshtein)"]
            SocketModule["core/socket (socketClient, useChatDelivery)"]
            LayoutModule["core/layout (AppLayout, Navbar, Sidebar)"]
            StorageModule["core/storage (browserStorage, preferences)"]
        end

        subgraph FeaturesFront ["Capa de Features (src/features/)"]
            AgentFeat["features/agent (Check-in, Bitácora, Pausas)"]
            SuperFeat["features/supervisor (Métricas k >= 5, Planes)"]
            SstFeat["features/sst (Vigilancia, Alertas, Buzón, Chat)"]
            AuditorFeat["features/auditor (Trazabilidad, Habeas Data)"]
            AdminFeat["features/admin (Organización, Usuarios, Reglas)"]
            ReportsFeat["features/reports (Reportes Consolidados SHA-256)"]
        end
        
        AgentFeat --> APIModule
        SuperFeat --> APIModule
        SstFeat --> APIModule
        AuditorFeat --> APIModule
        AdminFeat --> APIModule
        ReportsFeat --> APIModule
    end

    subgraph BackendModule ["Módulo Backend (Servidor Node.js Express 5)"]
        subgraph SubP05 ["P05 · interfaces/http"]
            Routes["interfaces/routes/ (Routers Express)"]
            Controllers["interfaces/controllers/ (Controladores Req/Res)"]
        end

        subgraph SubP06 ["P06 · middlewares/"]
            AuthMid["authMiddleware (Verificación JWT)"]
            RbacMid["rbacMiddleware (Control RBAC)"]
            ValidMid["validationMiddleware (Esquemas)"]
            ErrorMid["errorMiddleware (Manejo Centralizado)"]
        end

        subgraph SubP07 ["P07 · application/"]
            Services["application/services/ (Casos de Uso de Negocio)"]
        end

        subgraph SubP08 ["P08 · domain/"]
            PrivacyDomain["domain/privacyRules (k-anonimato, validaciones)"]
            WeeklyDomain["domain/weeklyAlertRules (Algoritmo de Alertas)"]
        end

        subgraph SubP10 ["P10 · infrastructure/"]
            Repositories["infrastructure/repositories/ (Consultas SQL)"]
            DBConnection["infrastructure/db.js (Pool de Conexiones pg)"]
            SocketHandler["infrastructure/socket.js (Gestor WebSockets)"]
        end

        Routes --> AuthMid
        AuthMid --> RbacMid
        RbacMid --> Controllers
        Controllers --> Services
        Services --> PrivacyDomain
        Services --> Repositories
        Repositories --> DBConnection
    end

    APIModule -->|Peticiones HTTP/HTTPS| Routes
    SocketModule <-->|Eventos WSS Bidireccionales| SocketHandler
    DBConnection -->|Protocolo TCP Nativo| PostgreSQL[(PostgreSQL 18)]
```

---

## 6. Diagrama de Clases (Modelo de Dominio)

Estructura de clases que rige la lógica de entidades, servicios y reglas de negocio del sistema.

```mermaid
classDiagram
    class Usuario {
        +UUID id
        +String correo_institucional
        +String contrasena_hash
        +String nombres
        +String apellidos
        +String rol_codigo
        +String estado
        +Integer intentos_fallidos
        +DateTime bloqueado_hasta
        +Boolean validarPassword(String plainPassword)
        +Boolean estaActivo()
    }

    class Campana {
        +UUID id
        +String nombre
        +String descripcion
        +String estado
    }

    class Equipo {
        +UUID id
        +UUID campana_id
        +String nombre
        +UUID supervisor_id
        +Boolean cumpleKAnonimato(Integer agentesActivos)
    }

    class DailyCheckin {
        +UUID id
        +UUID usuario_id
        +Date fecha
        +Integer energia
        +Integer carga_trabajo
        +Integer recuperacion
        +Integer apoyo_lider
        +Integer distanciamiento
        +Integer ineficacia
        +Boolean validarRangos()
        +Float calcularIndiceFatiga()
    }

    class Bitacora {
        +UUID id
        +UUID usuario_id
        +DateTime fecha_hora
        +String contenido_cifrado
        +Boolean es_privada
    }

    class AnalisisNLP {
        +UUID id
        +UUID bitacora_id
        +String dimension_detectada
        +Float puntaje_confianza
        +JSON evidencias_lexicas
    }

    class SstAlerta {
        +UUID id
        +UUID regla_id
        +UUID campana_id
        +UUID equipo_id
        +String severidad
        +String estado
        +DateTime creada_en
        +Void cambiarEstado(String nuevoEstado)
    }

    class SstIntervencion {
        +UUID id
        +UUID alerta_id
        +UUID responsable_sst_id
        +String tipo_intervencion
        +String descripcion
        +String estado
    }

    class SolicitudApoyo {
        +UUID id
        +UUID usuario_id
        +Boolean es_anonima
        +String estado
        +DateTime solicitada_en
    }

    class SesionChatSoporte {
        +UUID id
        +UUID solicitud_id
        +UUID agente_id
        +UUID sst_id
        +String estado
        +DateTime iniciada_en
        +DateTime finalizada_en
    }

    Usuario "1" --> "0..*" DailyCheckin : registra
    Usuario "1" --> "0..*" Bitacora : escribe
    Bitacora "1" --> "0..1" AnalisisNLP : procesada_por
    Campana "1" --> "0..*" Equipo : contiene
    Equipo "1" --> "0..*" Usuario : asigna
    Equipo "1" --> "0..*" SstAlerta : genera_agregada
    SstAlerta "1" --> "0..*" SstIntervencion : mitiga
    Usuario "1" --> "0..*" SolicitudApoyo : radica
    SolicitudApoyo "1" --> "0..1" SesionChatSoporte : apertura
```

---

## 7. Diagrama Entidad-Relación (ER Conceptual)

Modelo lógico conceptual que define las relaciones cardinales entre las áreas de negocio de Pulso360.

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : "clasifica"
    CAMPANAS ||--o{ EQUIPOS : "agrupa"
    EQUIPOS ||--o{ ASIGNACIONES_USUARIO_EQUIPO : "recibe"
    USUARIOS ||--o{ ASIGNACIONES_USUARIO_EQUIPO : "cumple"
    
    POLITICAS_PRIVACIDAD ||--o{ CONSENTIMIENTOS : "versiona"
    USUARIOS ||--o{ CONSENTIMIENTOS : "otorga"
    
    USUARIOS ||--o{ DAILY_CHECKINS : "registra_diario (1:N)"
    USUARIOS ||--o{ BITACORAS : "escribe_privada"
    
    BITACORAS ||--o| ANALISIS_NLP : "analizada_por"
    VERSIONES_LEXICO ||--o{ ANALISIS_NLP : "utiliza"
    CATEGORIAS_NLP ||--o{ ANALISIS_NLP : "clasifica_en"
    ANALISIS_NLP ||--o{ REVISIONES_NLP : "auditada_por_agente"
    
    REGLAS_ALERTA ||--o{ SST_ALERTAS : "gatilla"
    CAMPANAS ||--o{ SST_ALERTAS : "ocurre_en"
    EQUIPOS ||--o{ SST_ALERTAS : "focaliza_agregada"
    
    SST_ALERTAS ||--o{ SST_INTERVENCIONES : "motiva"
    SST_INTERVENCIONES ||--o{ SEGUIMIENTOS_INTERVENCION : "traza"
    
    USUARIOS ||--o{ SOLICITUDES_APOYO : "radica"
    SOLICITUDES_APOYO ||--o{ SEGUIMIENTOS_APOYO : "gestiona"
    
    SOLICITUDES_APOYO ||--o| SESIONES_CHAT_SOPORTE : "vincula_radicado"
    USUARIOS ||--o{ SESIONES_CHAT_SOPORTE : "solicita (agente)"
    USUARIOS ||--o{ SESIONES_CHAT_SOPORTE : "atiende (SST)"
    SESIONES_CHAT_SOPORTE ||--o{ MENSAJES_CHAT_SOPORTE : "contiene"
    USUARIOS ||--o{ MENSAJES_CHAT_SOPORTE : "remite"
    
    USUARIOS ||--o{ SOLICITUDES_HABEAS_DATA : "ejerce_ARCO"
    USUARIOS ||--o{ NOTIFICACIONES : "recibe"
    USUARIOS ||--o{ AUDITORIA_LOGS : "genera_evento"
```

---

## 8. Diagrama Relacional (Modelo Físico PostgreSQL)

Esquema físico detallado de las 26 tablas canónicas de dominio de `backend/database/schema.sql`, con tipos de datos nativos, PKs, FKs y restricciones de integridad.

```mermaid
erDiagram
    roles {
        varchar codigo PK
        varchar nombre
        text descripcion
        timestamptz creado_en
    }

    campanas {
        uuid id PK
        varchar nombre
        text descripcion
        varchar estado
        timestamptz creado_en
    }

    equipos {
        uuid id PK
        uuid campana_id FK
        varchar nombre
        uuid supervisor_id FK
        timestamptz creado_en
    }

    usuarios {
        uuid id PK
        varchar correo_institucional
        varchar contrasena_hash
        varchar nombres
        varchar apellidos
        varchar rol_codigo FK
        varchar estado
        integer intentos_fallidos
        timestamptz bloqueado_hasta
        timestamptz creado_en
    }

    asignaciones_usuario_equipo {
        uuid id PK
        uuid usuario_id FK
        uuid equipo_id FK
        varchar turno
        boolean activo
        timestamptz asignado_en
    }

    politicas_privacidad {
        uuid id PK
        varchar version
        text contenido_legal
        boolean activa
        timestamptz publicada_en
    }

    consentimientos {
        uuid id PK
        uuid usuario_id FK
        uuid politica_id FK
        boolean finalidad_c1
        boolean finalidad_c2
        boolean finalidad_c3
        boolean finalidad_c4
        boolean finalidad_c5
        timestamptz otorgado_en
    }

    daily_checkins {
        uuid id PK
        uuid usuario_id FK
        date fecha
        integer energia
        integer carga_trabajo
        integer recuperacion
        integer apoyo_lider
        integer distanciamiento
        integer ineficacia
        timestamptz creado_en
    }

    bitacoras {
        uuid id PK
        uuid usuario_id FK
        timestamptz creado_en
        text contenido
        boolean tiene_analisis
    }

    versiones_lexico {
        uuid id PK
        varchar version
        text descripcion
        boolean activa
    }

    categorias_nlp {
        uuid id PK
        varchar codigo
        varchar nombre
        text descripcion
    }

    analisis_nlp {
        uuid id PK
        uuid bitacora_id FK
        uuid version_lexico_id FK
        varchar dimension_predominante
        numeric puntaje_confianza
        jsonb metadata
        timestamptz creado_en
    }

    revisiones_nlp {
        uuid id PK
        uuid analisis_nlp_id FK
        uuid usuario_id FK
        varchar dimension_corregida
        text justificacion
        timestamptz revisado_en
    }

    reglas_alerta {
        uuid id PK
        varchar codigo
        varchar metrica
        varchar operador
        numeric umbral
        varchar severidad
        boolean activa
    }

    sst_alertas {
        uuid id PK
        uuid regla_id FK
        uuid campana_id FK
        uuid equipo_id FK
        varchar severidad
        varchar estado
        timestamptz creada_en
    }

    sst_intervenciones {
        uuid id PK
        uuid alerta_id FK
        uuid sst_usuario_id FK
        varchar tipo
        text plan_accion
        varchar estado
        timestamptz iniciada_en
    }

    seguimientos_intervencion {
        uuid id PK
        uuid intervencion_id FK
        uuid sst_usuario_id FK
        text nota_evolucion
        timestamptz registrado_en
    }

    solicitudes_apoyo {
        uuid id PK
        uuid usuario_id FK
        boolean es_anonima
        varchar estado
        timestamptz solicitada_en
    }

    seguimientos_apoyo {
        uuid id PK
        uuid solicitud_id FK
        uuid sst_usuario_id FK
        text notas_confidenciales
        timestamptz registrado_en
    }

    solicitudes_habeas_data {
        uuid id PK
        uuid usuario_id FK
        varchar tipo_derecho
        varchar estado
        timestamptz radicada_en
    }

    reportes_generados {
        uuid id PK
        uuid generado_por_usuario_id FK
        varchar tipo_reporte
        varchar sha256_hash
        timestamptz creado_en
    }

    notificaciones {
        uuid id PK
        uuid usuario_id FK
        varchar titulo
        text mensaje
        boolean leida
        timestamptz creada_en
    }

    auditoria_logs {
        uuid id PK
        uuid usuario_id FK
        varchar accion
        varchar entidad
        uuid entidad_id
        varchar sha256_hash
        timestamptz creado_en
    }

    configuracion_sistema {
        varchar clave PK
        text valor
        text descripcion
        timestamptz actualizado_en
    }

    sesiones_chat_soporte {
        uuid id PK
        uuid solicitud_id FK
        uuid agente_id FK
        uuid profesional_sst_id FK
        varchar estado
        timestamptz iniciada_en
        timestamptz finalizada_en
    }

    mensajes_chat_soporte {
        uuid id PK
        uuid sesion_id FK
        uuid remitente_id FK
        text contenido
        timestamptz enviado_en
    }

    roles ||--o{ usuarios : "rol_codigo"
    campanas ||--o{ equipos : "campana_id"
    equipos ||--o{ asignaciones_usuario_equipo : "equipo_id"
    usuarios ||--o{ asignaciones_usuario_equipo : "usuario_id"
    politicas_privacidad ||--o{ consentimientos : "politica_id"
    usuarios ||--o{ consentimientos : "usuario_id"
    usuarios ||--o{ daily_checkins : "usuario_id"
    usuarios ||--o{ bitacoras : "usuario_id"
    bitacoras ||--o| analisis_nlp : "bitacora_id"
    versiones_lexico ||--o{ analisis_nlp : "version_lexico_id"
    analisis_nlp ||--o{ revisiones_nlp : "analisis_nlp_id"
    reglas_alerta ||--o{ sst_alertas : "regla_id"
    campanas ||--o{ sst_alertas : "campana_id"
    equipos ||--o{ sst_alertas : "equipo_id"
    sst_alertas ||--o{ sst_intervenciones : "alerta_id"
    sst_intervenciones ||--o{ seguimientos_intervencion : "intervencion_id"
    usuarios ||--o{ solicitudes_apoyo : "usuario_id"
    solicitudes_apoyo ||--o{ seguimientos_apoyo : "solicitud_id"
    solicitudes_apoyo ||--o| sesiones_chat_soporte : "solicitud_id"
    sesiones_chat_soporte ||--o{ mensajes_chat_soporte : "sesion_id"
    usuarios ||--o{ solicitudes_habeas_data : "usuario_id"
    usuarios ||--o{ reportes_generados : "generado_por_usuario_id"
    usuarios ||--o{ notificaciones : "usuario_id"
    usuarios ||--o{ auditoria_logs : "usuario_id"
```

---

## 9. Diagrama de Despliegue (Docker Compose)

Ilustra la orquestación en contenedores del entorno local y de evaluación.

```mermaid
flowchart TD
    subgraph HostEnv ["Entorno Host (Linux / macOS / Windows)"]
        Docker["Docker Engine & Docker Compose"]

        subgraph DockerNet ["Red Bridge Aislada: pulso360_network"]
            subgraph ContenedorFrontend ["Contenedor: pulso360-frontend"]
                ViteServer["Node.js 20 Alpine / Vite Dev Server<br>Puerto Interno: 5173"]
            end

            subgraph ContenedorBackend ["Contenedor: pulso360-backend"]
                ExpressApp["Node.js 20/22 Alpine / Express 5 API<br>WebSockets & Alert Scheduler<br>Puerto Interno: 3000"]
            end

            subgraph ContenedorDB ["Contenedor: pulso360-database"]
                PostgresEngine["PostgreSQL 17/18 Alpine Engine<br>Base de Datos: pulso360_db<br>Puerto Interno: 5432"]
                PersistentVolume[("Volumen Persistente<br>pgdata_pulso360")]
                PostgresEngine --- PersistentVolume
            end
        end

        HostPort5173["localhost:5173 (Acceso Web)"]
        HostPort3000["localhost:3000 (API & Sockets)"]
        HostPort5432["localhost:5432 (Acceso psql opcional)"]
    end

    HostPort5173 <-->|HTTP| ViteServer
    HostPort3000 <-->|HTTP / WSS| ExpressApp
    HostPort5432 <-->|TCP / Protocolo Postgres| PostgresEngine

    ViteServer <-->|Llamadas REST / API Gateway| ExpressApp
    ExpressApp <-->|Consultas SQL nativas| PostgresEngine
```

---

## 10. Diagrama de Secuencia (Autenticación y RBAC)

Representa el ciclo de vida de emisión, validación e inspección del JSON Web Token y control de acceso.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Agente / Usuario
    participant SPA as Cliente Web (React 18)
    participant AuthMid as authMiddleware (Express)
    participant AuthService as authService (Backend)
    participant Repo as userRepository (PostgreSQL)
    participant JWT as JWT Engine

    Usuario->>SPA: Ingresa correo y contraseña en /login
    SPA->>AuthService: POST /api/v1/auth/login
    AuthService->>Repo: findByEmail(correo)
    Repo-->>AuthService: Registro del usuario (hash bcrypt, rol, estado)
    
    alt Usuario inexistente o contraseña errónea
        AuthService->>Repo: Incrementar intentos_fallidos
        AuthService-->>SPA: 401 Unauthorized (Credenciales inválidas)
        SPA-->>Usuario: Mostrar alerta de error
    else Credenciales válidas
        AuthService->>JWT: sign({ id, correo, rol }, JWT_SECRET, 8h)
        JWT-->>AuthService: Token firmado
        AuthService-->>SPA: 200 OK + { token, usuario: { id, nombres, rol } }
        SPA->>SPA: Guardar token en estado de sesión segura
        SPA-->>Usuario: Redireccionar al panel de su rol (/agente/panel)
    end

    opt Acceso a Ruta Protegida por Rol
        Usuario->>SPA: Navega a vista restringida
        SPA->>AuthMid: GET /api/v1/agent/checkin (Header: Bearer <token>)
        AuthMid->>AuthMid: Verificar firma criptográfica y expiración
        AuthMid->>AuthMid: Validar rol del payload == 'AGENTE'
        AuthMid-->>SPA: 200 OK (Datos de la ruta permitida)
    end
```

---

## 11. Diagrama de Estados (Alertas SST)

Máquina de estados finita que gobierna la evolución de una alerta psicosocial en el módulo SST.

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE : Algoritmo detecta desviación psicosocial en equipo (k >= 5)
    
    PENDIENTE --> EN_REVISION : Profesional SST abre alerta en panel
    PENDIENTE --> DESCARTADA : Falso positivo / justificación operativa documentada
    
    EN_REVISION --> INTERVENIDA : SST aprueba y asigna plan de intervención
    
    INTERVENIDA --> EN_SEGUIMIENTO : Se ejecutan pausas, rotación o talleres
    
    EN_SEGUIMIENTO --> RESUELTA : Indicador se normaliza en medición subsiguiente
    EN_SEGUIMIENTO --> ESCALADA : Riesgo persiste tras 3 ciclos de evaluación
    
    ESCALADA --> INTERVENIDA : Reformulación de estrategia SST
    RESUELTA --> [*]
    DESCARTADA --> [*]
```
