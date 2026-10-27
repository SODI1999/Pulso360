import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

DOC_PATH = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\PPI_Pulso360_1er_Entregable.docx"
BACKUP_PATH = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\PPI_Pulso360_1er_Entregable.backup.docx"
IMG_DIR = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\Pulso360\docs\diagramas_img"

print(f"1. Verificando copia de seguridad: {BACKUP_PATH}...")
if not os.path.exists(BACKUP_PATH):
    shutil.copy2(DOC_PATH, BACKUP_PATH)
    print("   [OK] Copia de seguridad creada.")
else:
    print("   [OK] Copia de seguridad ya existente.")

doc = docx.Document(DOC_PATH)

# ==============================================================================
# 1. ACTUALIZAR REGISTRO DE ACTUALIZACIONES (TABLA 0)
# ==============================================================================
print("2. Actualizando tabla de control de versiones...")
table0 = doc.tables[0]
new_row = table0.add_row()
cells = new_row.cells
cells[0].text = "27/10/2026"
cells[1].text = "2.0"
cells[2].text = (
    "Actualización integral del diseño del sistema web: Propuesta de solución técnica "
    "(Express 5, React 18, PostgreSQL 18, NLP determinista local), especificación de arquitectura "
    "física y lógica (C4 Contenedores Nivel 2 y Componentes por Capas), diagrama de despliegue Docker "
    "Compose, estructura modular de paquetes, diagrama de clases del modelo de dominio y actualización "
    "del prototipo funcional conectado a base de datos real."
)
cells[3].text = "Brahian Ospina / Leonardo Otalvaro / Andres Trujillo"

for c in cells:
    for p in c.paragraphs:
        p.style = "Table Contents"
print("   [OK] Fila Versión 2.0 agregada a la tabla de control.")

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
def remove_p(p):
    p_elem = p._p
    p_elem.getparent().remove(p_elem)

def find_heading_paragraph(prefix):
    """Busca exclusivamente párrafos con estilo Heading (evitando la Tabla de Contenido)."""
    for i, p in enumerate(doc.paragraphs):
        if p.style.name.startswith("Heading") and p.text.strip().startswith(prefix):
            return i, p
    return None, None

def add_caption(p_before, text):
    cap = p_before.insert_paragraph_before(text, style="Caption" if "Caption" in doc.styles else "Text body")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if cap.runs:
        cap.runs[0].font.italic = True
        cap.runs[0].font.size = Pt(9.5)
        cap.runs[0].font.color.rgb = RGBColor(90, 90, 90)
    return cap

def add_img(p_before, img_filename, width_inches=6.2, caption_text=None):
    img_path = os.path.join(IMG_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"   [WARN] No existe la imagen {img_path}")
        return None
    p_img = p_before.insert_paragraph_before("", style="Text body")
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p_img.add_run()
    run.add_picture(img_path, width=Inches(width_inches))
    if caption_text:
        add_caption(p_before, caption_text)
    return p_img

# ==============================================================================
# 2. SECCIÓN 4.1 PROPUESTA DE SOLUCIÓN
# ==============================================================================
print("3. Redactando 4.1. Propuesta de solución...")
idx, h_41 = find_heading_paragraph("4.1. Propuesta de solución")
if h_41:
    p_41 = doc.paragraphs[idx + 1]
    solucion_textos = [
        "La propuesta de solución tecnológica de Pulso360 responde a la necesidad crítica de identificar tempranamente "
        "tendencias de riesgo psicosocial en centros de contacto (BPO), garantizando estricta confidencialidad bajo la "
        "legislación colombiana (Ley 1581 de 2012 y Resolución 2764 de 2022 de MinTrabajo). El sistema se concibe como una "
        "plataforma web desacoplada en arquitectura Monorepo, estructurada en capas diferenciadas de presentación, aplicación, "
        "dominio e infraestructura persistente.",

        "Componentes Frontend (Capa de Presentación):\n"
        "• Lenguajes y Sintaxis: JavaScript moderno (ECMAScript 2022 / ES Modules) y JSX, estructurado con HTML5 semántico.\n"
        "• Framework Principal: React 18 en conjunto con React DOM 18 para la construcción de una Single Page Application (SPA) reactiva, modular y con alta accesibilidad (WCAG 2.2 nivel AA).\n"
        "• Enrutamiento y Seguridad de Vistas: React Router DOM v6 con implementación de guardas de navegación centralizadas (ProtectedRoute), gobernadas estrictamente por el rol del usuario autenticado (RBAC).\n"
        "• Sistema de Estilos y Ergonomía Visual: CSS3 nativo mediante arquitectura de Design Tokens desacoplados (variables CSS en tokens.css). Se descartan deliberadamente frameworks utilitarios genéricos o gradientes artificiales para prevenir la fatiga visual de los operadores en turnos rotativos, asegurando un Cumulative Layout Shift (CLS) igual a 0.\n"
        "• Herramienta de Construcción (Bundler): Vite v6.4.4, optimizando la transpilación ultrarrápida, Hot Module Replacement (HMR) y compresión modular de producción.",

        "Componentes Backend (Capa de Aplicación y API REST):\n"
        "• Entorno de Ejecución: Node.js (versiones 20 y 22 LTS), garantizando alta concurrencia mediante programación asíncrona basada en eventos (Event Loop no bloqueante).\n"
        "• Framework de Servidor: Express.js 5.0, gestionando la exposición de endpoints RESTful bajo el estándar OpenAPI 3.1.\n"
        "• Seguridad y Autenticación: JSON Web Tokens (jsonwebtoken) firmados mediante algoritmo HMAC-SHA256 con tiempo de vida estricto de 8 horas (coincidente con la jornada laboral estándar). Hashing unidireccional de contraseñas mediante bcryptjs aplicando 10 rondas de salt criptográfico.\n"
        "• Comunicación en Tiempo Real: Socket.io para canales bidireccionales cifrados durante el soporte de crisis psicosocial entre el agente y el profesional SST.\n"
        "• Evaluador Periódico (Scheduler): Motor interno semanal (weeklyAlertService.js) que ejecuta agregaciones temporales estadísticas sobre los cortes de domingo a las 23:59:59, generando alertas tempranas sin duplicación.",

        "Gestor de Bases de Datos (Capa de Persistencia):\n"
        "• Motor de Base de Datos: PostgreSQL 18 (motor relacional empresarial con estricto cumplimiento ACID).\n"
        "• Diseño Relacional: 31 tablas relacionales normalizadas (26 tablas de dominio operativo BPO y 5 tablas técnicas de auditoría, control de jobs y lemas léxicos).\n"
        "• Conectividad y Resiliencia: Driver nativo pg (node-postgres) configurado mediante un pool de conexiones optimizado, transacciones concurrentes parametrizadas para inmunidad frente a inyecciones SQL y aislamiento serializable en operaciones críticas de bitácoras y consentimientos.",

        "Inteligencia Artificial y Procesamiento de Lenguaje Natural (NLP Privado y Determinista):\n"
        "• Enfoque de Privacidad: Se prohíbe el envío de desahogos privados de los agentes a APIs remotas de Inteligencia Artificial Generativa o Modelos de Lenguaje Masivos (LLMs comerciales como OpenAI o Google Gemini), protegiendo el secreto profesional y la confidencialidad médica (Ley 1581).\n"
        "• Motor Léxico Local: Implementación de un pipeline NLP determinista desarrollado 100% en JavaScript que se ejecuta localmente en el navegador del operador (nlpEngine.jsx). Cuenta con:\n"
        "  - Sanitizador morfológico de teclado (nlpSanitizer.jsx): normaliza elongaciones ('estoooyyy' -> 'estoy') y limpia caracteres parásitos preservando la letra 'ñ'.\n"
        "  - Lematizador para el idioma español (spanishStemmer.jsx): reduce flexiones verbales y de género a su raíz léxica canónica.\n"
        "  - Corrector de erratas tipográficas (damerauLevenshtein.jsx): tolerancia a errores de digitación por distancia de edición <= 1.\n"
        "  - Inferencia de factores de riesgo: detecta sobrecarga de llamadas, fricción con supervisión, desgaste físico y tensión mediante reglas de contexto y negación heurística (estilo NegEx).\n"
        "  - Rendimiento: latencia de análisis local inferior a 50 milisegundos por entrada.\n"
        "  - Autodeterminación Informativa: el agente tiene el derecho inalienable de reclasificar, corregir o anular las sugerencias automáticas mediante un modal accesible de corrección (NlpCorrectionModal.jsx).",

        "Protocolos de Comunicación y Seguridad de Red:\n"
        "• HTTPS / TLS 1.3: Toda la comunicación entre cliente y servidor viaja sobre canales cifrados.\n"
        "• WSS (WebSocket Secure): Canal bidireccional cifrado para el chat de crisis.\n"
        "• TCP Nativo (Puerto 5432): Comunicación entre el backend y PostgreSQL aislada en red interna.\n"
        "• Trazabilidad Criptográfica: Cadena inmutable de registros en auditoria_logs con cálculo de huella SHA-256 por evento.",

        "Requisitos Mínimos de Infraestructura:\n"
        "• Servidor de Aplicación y Base de Datos:\n"
        "  - Procesador: 2 vCPU x86_64 o ARM64 a 2.0 GHz o superior.\n"
        "  - Memoria RAM: 4 GB mínimo (8 GB recomendados en entornos multi-campaña con más de 500 agentes).\n"
        "  - Almacenamiento: 20 GB en unidad de estado sólido (SSD NVMe) para soportar alto I/O transaccional.\n"
        "  - Sistema Operativo: Linux (Ubuntu Server 22.04 LTS / Debian 12) o Windows Server 2022.\n"
        "• Conectividad de Red:\n"
        "  - Ancho de banda: Canal de internet corporativo simétrico con mínimo 10 Mbps dedicados.\n"
        "  - Latencia: < 80 ms a nivel nacional.\n"
        "• Estaciones de Trabajo de los Usuarios (Clientes BPO):\n"
        "  - Procesador: Dual-Core 1.8 GHz o superior.\n"
        "  - Memoria RAM: 4 GB mínimo.\n"
        "  - Pantalla: Resolución mínima de 1280x720 píxeles (óptima recomendada: 1920x1080 Full HD).\n"
        "  - Navegadores Web Compatibles: Google Chrome 110+, Microsoft Edge 110+, Mozilla Firefox 115+, Safari 16+.\n"
        "  - Dispositivos Móviles: Compatibilidad responsiva completa en navegadores móviles (iOS 15+, Android 10+)."
    ]
    for t in solucion_textos:
        p_41.insert_paragraph_before(t, style="Text body")
    remove_p(p_41)
    print("   [OK] Sección 4.1 redactada completamente.")

# ==============================================================================
# 3. SECCIÓN 4.2 ESPECIFICACIÓN DE LA ARQUITECTURA
# ==============================================================================
print("4. Redactando 4.2. Especificación de la arquitectura...")
idx, h_42 = find_heading_paragraph("4.2. Especificación de la arquitectura")
if h_42:
    p_42 = doc.paragraphs[idx + 1]
    arq_textos = [
        "La arquitectura de Pulso360 adopta un patrón en capas desacoplado (Layered Architecture) complementado "
        "por principios de Puertos y Adaptadores (Hexagonal Architecture) en el backend, y un modelo orientado a "
        "características funcionales (Feature-Driven Architecture) en el frontend.",

        "Arquitectura Física y Lógica de Componentes:\n"
        "1. Capa de Presentación (Frontend SPA):\n"
        "   Construida sobre React 18, se ejecuta íntegramente en el navegador web del usuario. Se divide en módulos "
        "   centrales reutilizables ('core/') que gestionan autenticación, almacenamiento seguro, cliente HTTP (apiClient), "
        "   y diseño visual, y módulos de características ('features/') que encapsulan la lógica y vistas de cada rol canónico "
        "   (Agente, Supervisor, Profesional SST, Auditor, Administrador).\n"
        "2. Capa de Aplicación y Dominio (Backend Express 5):\n"
        "   Estructura la lógica de negocio en casos de uso puros ('application/services/'). La seguridad está gobernada "
        "   por filtros interceptores ('middlewares/') que validan la identidad criptográfica (authMiddleware), el rol canónico "
        "   (rbacMiddleware) y la consistencia de los datos. El dominio ('domain/') define reglas puras inviolables, destacando "
        "   la función matemática evaluarKAnonimato() que suprime automáticamente métricas agregadas cuando el tamaño de cohorte "
        "   es menor a 5 personas (k < 5).\n"
        "3. Capa de Infraestructura y Persistencia:\n"
        "   Los repositorios ('infrastructure/repositories/') encapsulan el acceso a datos mediante consultas SQL directas sobre "
        "   PostgreSQL 18. Esta capa gobierna transacciones ACID mediante el pool de conexiones nativo, garantizando que un fallo "
        "   durante la radicación de apoyos o el registro de intervenciones revierta completamente el estado sin dejar filas huérfanas."
    ]
    for t in arq_textos:
        p_42.insert_paragraph_before(t, style="Text body")

    add_img(p_42, "01_arquitectura_c4_contenedores.png", width_inches=6.2, caption_text="Ilustración 4.2.1: Diagrama de Arquitectura de Sistema (C4 Modelo Nivel 2: Contenedores).")

    p_42.insert_paragraph_before(
        "A nivel modular, el siguiente diagrama de componentes detalla la segregación de responsabilidades dentro del "
        "repositorio Monorepo, evidenciando el flujo unidireccional estricto de dependencias (features -> core en cliente, "
        "e interfaces -> application -> domain <- infrastructure en servidor):",
        style="Text body"
    )

    add_img(p_42, "07_componentes_paquetes.png", width_inches=6.2, caption_text="Ilustración 4.2.2: Diagrama de Componentes y Arquitectura de Capas del Sistema.")
    remove_p(p_42)
    print("   [OK] Sección 4.2 redactada con C4 y Componentes.")

# ==============================================================================
# 4. SECCIÓN 4.3 DIAGRAMA DE DESPLIEGUE
# ==============================================================================
print("5. Redactando 4.3. Diagrama de despliegue...")
idx, h_43 = find_heading_paragraph("4.3. Diagrama de despliegue")
if h_43:
    p_43 = doc.paragraphs[idx + 1]
    despliegue_textos = [
        "El despliegue de Pulso360 se encuentra completamente contenerizado mediante Docker y orquestado a través de "
        "Docker Compose. Esta arquitectura asegura paridad absoluta entre los entornos de desarrollo, pruebas automatizadas "
        "y producción institucional, aislando las dependencias y facilitando la escalabilidad horizontal.",

        "Topología de Contenedores y Red:\n"
        "• Contenedor pulso360-frontend: Ejecuta la aplicación React empaquetada mediante Vite bajo Node.js 20 Alpine, exponiendo el puerto HTTP 5173 hacia el host para el acceso de los navegadores de los operadores.\n"
        "• Contenedor pulso360-backend: Ejecuta la API REST y el servidor de WebSockets en Node.js 20/22 Alpine sobre el puerto 3000, integrando el evaluador automático de alertas semanales (weeklyAlertService).\n"
        "• Contenedor pulso360-database: Aloja el motor PostgreSQL 18 Alpine sobre el puerto interno 5432. Para evitar la pérdida de información ante reinicios, utiliza el volumen persistente montado 'pgdata_pulso360'.\n"
        "• Red Bridge Aislada (pulso360_network): Los contenedores se comunican a través de una red virtual privada interna. El puerto de la base de datos no requiere ser expuesto a internet público, ya que únicamente el contenedor del backend tiene visibilidad sobre él."
    ]
    for t in despliegue_textos:
        p_43.insert_paragraph_before(t, style="Text body")

    add_img(p_43, "11_despliegue_docker.png", width_inches=6.2, caption_text="Ilustración 4.3.1: Diagrama de Despliegue en Contenedores Docker Compose.")
    remove_p(p_43)
    print("   [OK] Sección 4.3 redactada con Docker Compose.")

# ==============================================================================
# 5. SECCIÓN 4.4 DIAGRAMA DE PAQUETES
# ==============================================================================
print("6. Redactando 4.4. Diagrama de paquetes...")
idx, h_44 = find_heading_paragraph("4.4. Diagrama de paquetes")
if h_44:
    p_44 = doc.paragraphs[idx + 1]
    paquetes_textos = [
        "La organización de código de Pulso360 sigue un estándar estricto de empaquetamiento modular dentro de un monorepo, "
        "diseñado para maximizar la cohesión funcional y minimizar el acoplamiento transversal.",

        "Estructura de Paquetes en el Frontend ('frontend/src/'):\n"
        "• core/api: Servicios de transporte HTTP (apiClient.jsx), normalización de respuestas y manejo de tokens.\n"
        "• core/auth: Componentes de autenticación, verificación de sesión (authService.jsx) y guardas RBAC (ProtectedRoute.jsx).\n"
        "• core/components: Componentes reutilizables de UI (Icon.jsx, TrendLineChart.jsx, PrivacyBlockedCard.jsx).\n"
        "• core/nlp: Motor de lenguaje natural local (nlpEngine.jsx, nlpSanitizer.jsx, spanishStemmer.jsx, damerauLevenshtein.jsx).\n"
        "• core/storage: Abstracción de persistencia local resiliente ante fallos (browserStorage.jsx).\n"
        "• features/agent: Vistas y lógica del operador (check-in somático, bitácora privada, solicitudes de apoyo y pausas activas).\n"
        "• features/supervisor: Vistas analíticas agregadas protegidas por k-anonimato y módulo de seguimiento a planes de acción.\n"
        "• features/sst: Vistas epidemiológicas de SST, gestión de alertas automáticas, diseño de intervenciones y buzón de crisis.\n"
        "• features/auditor: Explorador de bitácoras inmutables y verificación criptográfica de hashes de auditoría.\n"
        "• features/admin: Configuración organizativa (campañas, equipos, usuarios) y administración de políticas legales de privacidad.\n"
        "• styles/: Definición canónica de tokens de diseño ergonómicos, tipografías y temas por rol.",

        "Estructura de Paquetes en el Backend ('backend/src/'):\n"
        "• interfaces/http: Rutas de Express ('routes/') y controladores desacoplados ('controllers/').\n"
        "• middlewares/: Interceptores de autenticación JWT, autorización de roles (RBAC) y manejo centralizado de errores.\n"
        "• application/services/: Casos de uso de negocio (authService, checkinService, weeklyAlertService, supervisorService, sstService, auditService).\n"
        "• domain/: Entidades y reglas puras de dominio sin dependencias externas (privacyRules.js, weeklyAlertRules.js).\n"
        "• infrastructure/: Adaptadores de base de datos (db.js), repositorios SQL (userRepository, sstRepository, journalRepository, etc.) y sockets en tiempo real."
    ]
    for t in paquetes_textos:
        p_44.insert_paragraph_before(t, style="Text body")
    remove_p(p_44)
    print("   [OK] Sección 4.4 redactada.")

# ==============================================================================
# 6. SECCIÓN 4.5 DIAGRAMA DE CLASES
# ==============================================================================
print("7. Redactando 4.5. Diagrama de clases...")
idx, h_45 = find_heading_paragraph("4.5. Diagrama de clases")
if h_45:
    p_45 = doc.paragraphs[idx + 1]
    clases_textos = [
        "El modelo de clases del sistema representa las entidades de negocio, sus atributos tipificados, métodos de dominio "
        "y cardinalidades de asociación. El diseño desacopla intencionalmente las entidades de seguimiento individual respecto "
        "a las entidades de análisis grupal, garantizando a nivel de modelo que una alerta psicosocial pertenezca al colectivo "
        "(Equipo) y nunca al individuo.",

        "Entidades de Dominio Principales:\n"
        "• Usuario: Modela a los colaboradores del Contact Center, almacenando credenciales con hash bcrypt, rol canónico y estado de bloqueo.\n"
        "• Campana y Equipo: Estructura organizativa del BPO. La clase Equipo implementa el método cumpleKAnonimato() que evalúa el umbral mínimo de 5 integrantes con consentimiento activo.\n"
        "• DailyCheckin: Representa el registro somático diario del agente, evaluando las 6 dimensiones estandarizadas de bienestar laboral (1 a 5) y calculando el índice de fatiga.\n"
        "• Bitacora y AnalisisNLP: Modela el diario íntimo privado del operador y las sugerencias léxicas preliminares procesadas de forma aislada.\n"
        "• SstAlerta y SstIntervencion: Representa las desviaciones estadísticas detectadas automáticamente en un equipo y las acciones correctivas orquestadas por SST hacia el supervisor.\n"
        "• SolicitudApoyo y SesionChatSoporte: Canal de acompañamiento psicosocial voluntario, habilitando comunicación bidireccional anónima o identificada según la elección del agente."
    ]
    for t in clases_textos:
        p_45.insert_paragraph_before(t, style="Text body")

    add_img(p_45, "08_clases_modelo_dominio.png", width_inches=6.0, caption_text="Ilustración 4.5.1: Diagrama de Clases del Modelo de Dominio de Software.")
    remove_p(p_45)
    print("   [OK] Sección 4.5 redactada con Diagrama de Clases.")

# ==============================================================================
# 7. SECCIÓN 4.6 PROTOTIPO (ACTUALIZAR INTRODUCCIÓN)
# ==============================================================================
print("8. Actualizando introducción de 4.6 Prototipo...")
for p in doc.paragraphs:
    if p.text.strip().startswith("Las siguientes capturas corresponden a la maqueta funcional"):
        p.text = (
            "Las siguientes capturas de pantalla corresponden a la interfaz gráfica de usuario de Pulso360 en su "
            "estado completamente implementado, funcional y conectado. La plataforma opera integrada en tiempo real "
            "a la API REST de Node.js / Express y al gestor relacional PostgreSQL 18, ejecutando flujos reales sobre un "
            "ecosistema operativo simulado de BPO (Contact Center Liberty / MásMóvil) con 100 agentes distribuidos en "
            "5 campañas operativas, 2.000 check-ins acumulados en 4 semanas y 7 alertas tempranas generadas matemáticamente "
            "por el motor de vigilancia psicosocial de SST."
        )
        print("   [OK] Introducción de prototipo actualizada.")
        break

# ==============================================================================
# 8. SECCIONES 3.1 Y 3.2 (DIAGRAMAS MAESTROS)
# ==============================================================================
print("9. Verificando secciones 3.1 y 3.2...")
idx, h_31 = find_heading_paragraph("3.1. Diagrama de secuencia")
if h_31:
    p_31 = doc.paragraphs[idx + 1]
    p_31.insert_paragraph_before(
        "El siguiente diagrama de secuencia maestro ilustra el ciclo de vida de autenticación segura en Pulso360, "
        "abarcando desde la validación de credenciales con bcrypt en PostgreSQL, la firma digital del JSON Web Token (JWT) "
        "con vigencia de 8 horas, y la posterior verificación de claims de rol (RBAC) en cada petición HTTP hacia rutas protegidas:",
        style="Text body"
    )
    add_img(p_31, "12_secuencia_autenticacion_rbac.png", width_inches=6.2, caption_text="Ilustración 3.1.1: Diagrama de Secuencia de Autenticación Segura y Control de Acceso RBAC.")
    print("   [OK] Diagrama de secuencia maestro incorporado.")

idx, h_32 = find_heading_paragraph("3.2. Diagrama de casos de uso")
if h_32:
    p_32 = doc.paragraphs[idx + 1]
    p_32.insert_paragraph_before(
        "El catálogo maestro de interacción del sistema mapea los 16 casos de uso funcionales (CU-01 a CU-16) frente a "
        "los 5 roles canónicos de la plataforma, delimitando las fronteras operativas entre la experiencia privada del agente "
        "y los módulos colectivos de supervisión, auditoría y seguridad y salud en el trabajo:",
        style="Text body"
    )
    add_img(p_32, "02_casos_de_uso_uml.png", width_inches=4.8, caption_text="Ilustración 3.2.1: Diagrama de Casos de Uso Global (UML) y Roles Canónicos.")
    print("   [OK] Diagrama de casos de uso maestro incorporado.")

# ==============================================================================
# GUARDAR DOCUMENTO
# ==============================================================================
print(f"10. Guardando documento en: {DOC_PATH}...")
doc.save(DOC_PATH)
print("   [ÉXITO TOTAL] Documento Word actualizado y guardado correctamente.")
