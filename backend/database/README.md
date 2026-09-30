# P11 · Persistence — Especificación del Modelo de Datos (PostgreSQL)

## 1. Identificación del Componente
* **Paquete Arquitectónico**: `P11 · persistence`
* **Componente C4**: `C08 · PostgreSQL`
* **Motor**: PostgreSQL 18 (Relacional nativo con driver `pg`)
* **Base de Datos**: `pulso360_db`

---

## 2. Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    USERS ||--o| USER_CONSENTS : "posee (1:1)"
    USERS ||--o{ DAILY_CHECKINS : "registra (1:N)"
    USERS ||--o{ JOURNALS : "escribe (1:N privada)"
    USERS ||--o{ SUPPORT_REQUESTS : "solicita (1:N)"
    USERS ||--o{ HABEAS_DATA_REQUESTS : "radica (1:N)"
    USERS ||--o{ AUDIT_LOGS : "genera accion (1:N)"
    SST_ALERTS ||--o{ SST_INTERVENTIONS : "motiva (1:N)"

    USERS {
        VARCHAR(50) id PK
        VARCHAR(150) email UK
        VARCHAR(255) password_hash
        VARCHAR(120) name
        VARCHAR(30) role
        VARCHAR(50) team_id
        VARCHAR(100) team_name
        VARCHAR(100) campaign
        INT shift_start_hour
        VARCHAR(20) status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    USER_CONSENTS {
        VARCHAR(50) user_id PK, FK
        BOOLEAN policy_accepted
        VARCHAR(20) policy_version
        BOOLEAN c1_checkin
        BOOLEAN c2_bitacora
        BOOLEAN c3_apoyo
        BOOLEAN c4_analitica
        BOOLEAN c5_contacto
        TIMESTAMP updated_at
    }

    DAILY_CHECKINS {
        VARCHAR(50) id PK
        VARCHAR(50) user_id FK
        VARCHAR(20) journey_key
        DATE checkin_date
        TIMESTAMP submitted_at
        INT energia
        INT carga_emocional
        INT recuperacion
        INT apoyo
        INT distanciamiento
        INT ineficacia
    }

    JOURNALS {
        VARCHAR(50) id PK
        VARCHAR(50) user_id FK
        DATE entry_date
        VARCHAR(50) context
        TEXT content
        JSONB analysis
        JSONB corrected_categories
        TEXT correction_note
        TIMESTAMP created_at
    }

    SUPPORT_REQUESTS {
        VARCHAR(50) id PK
        VARCHAR(30) code UK
        VARCHAR(20) mode
        VARCHAR(50) owner_user_id FK
        VARCHAR(50) identity_user_id FK
        DATE request_date
        VARCHAR(100) reason
        TEXT description
        VARCHAR(20) urgency
        VARCHAR(30) contact_preference
        VARCHAR(50) time_window
        VARCHAR(30) status
        VARCHAR(50) assigned_to FK
        VARCHAR(30) sla
        TIMESTAMP created_at
    }

    HABEAS_DATA_REQUESTS {
        VARCHAR(50) id PK
        VARCHAR(50) user_id FK
        VARCHAR(50) type
        TIMESTAMP created_at
        VARCHAR(30) status
        DATE deadline
        TEXT note
    }

    SST_ALERTS {
        VARCHAR(50) id PK
        VARCHAR(150) rule_name
        VARCHAR(100) campaign
        VARCHAR(100) team_name
        DATE alert_date
        VARCHAR(20) severity
        INT respondents
        VARCHAR(30) status
        VARCHAR(50) owner_id FK
        TEXT description
        JSONB evidence
        TIMESTAMP created_at
    }

    SST_INTERVENTIONS {
        VARCHAR(50) id PK
        VARCHAR(150) title
        VARCHAR(80) type
        VARCHAR(100) campaign
        VARCHAR(100) team_name
        VARCHAR(50) creator_id FK
        VARCHAR(50) assigned_to FK
        VARCHAR(30) status
        DATE start_date
        DATE end_date
        VARCHAR(100) indicator
        NUMERIC baseline
        NUMERIC after_val
        INT progress
        TEXT target_desc
        BOOLEAN external_action
        TIMESTAMP created_at
    }

    AUDIT_LOGS {
        BIGSERIAL id PK
        VARCHAR(50) user_id FK
        VARCHAR(30) role
        VARCHAR(80) action
        VARCHAR(80) resource
        VARCHAR(50) resource_id
        JSONB details
        VARCHAR(45) ip_address
        TIMESTAMP created_at
    }
```

---

## 3. Principios y Reglas Inviolables de Privacidad

1. **Aislamiento Técnico de la Bitácora (`JOURNALS`)**:
   * Las consultas SQL a `JOURNALS` **deben** incluir obligatoriamente el filtro `WHERE user_id = $1`.
   * Ningún endpoint de supervisión ni de SST tiene autorización para ejecutar `SELECT * FROM journals` sin filtrar por el usuario autenticado propietario.
2. **k-Anonimato en Vistas Agregadas**:
   * Para calcular promedios de `DAILY_CHECKINS` por campaña o equipo, la consulta SQL debe verificar `COUNT(DISTINCT user_id) >= 5`.
   * Si no se cumple la cohorte mínima, la capa de dominio/servicio suprime el valor numérico para evitar la reidentificación de los operadores.
3. **Consentimiento Informado (Ley 1581 de 2012)**:
   * Ningún registro en `DAILY_CHECKINS` o `JOURNALS` puede procesarse si el usuario no tiene activo su consentimiento informado (`c1_checkin = true`).
