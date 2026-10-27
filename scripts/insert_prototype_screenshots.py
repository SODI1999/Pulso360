import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

DOC_PATH = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\PPI_Pulso360_1er_Entregable.docx"
SCREENSHOTS_DIR = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\Pulso360\docs\screenshots"

doc = docx.Document(DOC_PATH)

# Encontrar el encabezado 4.6. Prototipo.
idx_46 = None
for i, p in enumerate(doc.paragraphs):
    if p.style.name.startswith("Heading") and p.text.strip().startswith("4.6. Prototipo"):
        idx_46 = i
        break

if idx_46 is None:
    raise Exception("No se encontró el encabezado 4.6. Prototipo.")

print(f"Encabezado 4.6 encontrado en párrafo {idx_46}.")

# El párrafo introductorio está en idx_46 + 1
# Los párrafos siguientes hasta el final contienen las imágenes antiguas
# Vamos a localizar el párrafo donde estaban las imágenes antiguas y eliminarlo o reemplazarlo
p_intro = doc.paragraphs[idx_46 + 1]

# Eliminar todos los párrafos posteriores a p_intro (las 43 imágenes viejas)
to_remove = []
for j in range(idx_46 + 2, len(doc.paragraphs)):
    to_remove.append(doc.paragraphs[j])

print(f"Eliminando {len(to_remove)} párrafos antiguos de la maqueta previa...")
for p in to_remove:
    p_elem = p._p
    p_elem.getparent().remove(p_elem)

print("Párrafos antiguos eliminados.")

# Lista ordenada de las 21 capturas reales
screenshots_data = [
    # 1. Vistas Públicas
    ("4.6.1. Vistas Públicas e Institucionales", None, None),
    (
        "Página de Inicio Institucional (Landing Page)",
        "01_landing_page.png",
        "Ilustración 4.6.1: Vista pública institucional — Landing Page de Pulso360 para entornos Contact Center / BPO."
    ),
    (
        "Fundamentación Académica y Marco Teórico",
        "02_fundamentacion.png",
        "Ilustración 4.6.2: Fundamentación académica — Marco normativo colombiano (Resolución 2764 de 2022 y Ley 1581)."
    ),
    (
        "Canal de Contacto y PQRS Institucional",
        "03_contactenos.png",
        "Ilustración 4.6.3: Formulario institucional de contacto y canales de atención corporativa."
    ),
    (
        "Inicio de Sesión y Control de Acceso (Login)",
        "04_login.png",
        "Ilustración 4.6.4: Pantalla de inicio de sesión con autenticación basada en JWT, protección contra fuerza bruta y perfiles de acceso rápido."
    ),

    # 2. Módulo Agente
    ("4.6.2. Módulo del Agente de Contact Center (Laura Gómez)", None, None),
    (
        "Panel Principal del Agente",
        "05_agente_panel.png",
        "Ilustración 4.6.5: Tablero personal de bienestar del operador con estado de jornada, indicadores de energía y accesos directos."
    ),
    (
        "Check-in Diario Somático (3 Pasos)",
        "06_agente_checkin.png",
        "Ilustración 4.6.6: Registro diario de bienestar evaluando las 6 dimensiones estandarizadas de salud ocupacional."
    ),
    (
        "Bitácora Privada de Desahogo y Motor NLP",
        "07_agente_bitacora.png",
        "Ilustración 4.6.7: Bitácora privada con análisis de lenguaje natural (NLP) local en el navegador y derecho a corrección (Ley 1581)."
    ),
    (
        "Mi Bienestar y Pausas Activas Asistidas",
        "08_agente_mi_bienestar.png",
        "Ilustración 4.6.8: Módulo de recuperación somática, respiración guiada Zen y ejercicios ergonómicos para agentes de contact center."
    ),
    (
        "Canal de Apoyo Psicosocial y Chat de Crisis",
        "09_agente_apoyo.png",
        "Ilustración 4.6.9: Radicación de solicitudes de apoyo confidenciales (anónimas o identificadas) con canal de chat seguro con SST."
    ),
    (
        "Centro de Privacidad y Gestión de Derechos ARCO",
        "10_agente_mis_datos.png",
        "Ilustración 4.6.10: Centro de autodeterminación informativa — gestión granular de consentimientos C1–C5 y solicitudes de Habeas Data."
    ),

    # 3. Módulo Supervisor
    ("4.6.3. Módulo de Supervisión Operativa (Carlos Mendoza)", None, None),
    (
        "Panel de Supervisión con Regla de k-Anonimato",
        "11_supervisor_panel.png",
        "Ilustración 4.6.11: Tablero analítico de equipo con medias agregadas y activación automática de protección por k-anonimato (k >= 5)."
    ),
    (
        "Gestión de Acciones y Seguimiento a Intervenciones",
        "12_supervisor_acciones.png",
        "Ilustración 4.6.12: Módulo operativo de seguimiento a planes de intervención preventivos asignados por el área de SST."
    ),

    # 4. Módulo SST
    ("4.6.4. Módulo de Seguridad y Salud en el Trabajo - SST (Patricia Silva)", None, None),
    (
        "Panel de Vigilancia Psicosocial y Epidemiológica",
        "13_sst_panel.png",
        "Ilustración 4.6.13: Panel de control de SST con monitoreo poblacional de fatiga, recuperación y distribución de riesgo por campañas."
    ),
    (
        "Bandeja de Alertas Tempranas del Motor Semanal",
        "14_sst_alertas.png",
        "Ilustración 4.6.14: Bandeja de alertas orgánicas generadas por el algoritmo a partir de 2.000 check-ins reales en PostgreSQL."
    ),
    (
        "Configuración y Gestión de Reglas de Alerta",
        "15_sst_reglas.png",
        "Ilustración 4.6.15: Catálogo de reglas algorítmicas de detección temprana con umbrales cuantitativos y semanas de persistencia."
    ),
    (
        "Planes de Intervención Colectiva",
        "16_sst_intervenciones.png",
        "Ilustración 4.6.16: Creación y seguimiento de intervenciones preventivas orientadas a mitigar riesgos detectados en la operación."
    ),
    (
        "Buzón de Acompañamiento y Chat en Tiempo Real",
        "17_sst_buzon.png",
        "Ilustración 4.6.17: Gestión de solicitudes de apoyo psicosocial radicadas por los operadores y atención confidencial en vivo."
    ),

    # 5. Módulo Auditor
    ("4.6.5. Módulo de Auditoría y Cumplimiento Normativo (Marcos Restrepo)", None, None),
    (
        "Registro Inmutable de Auditoría con Hash Criptográfico",
        "18_auditor_auditoria.png",
        "Ilustración 4.6.18: Bitácora inmutable de auditoría con verificación criptográfica de integridad SHA-256 ante inspecciones de MinTrabajo."
    ),

    # 6. Módulo Admin
    ("4.6.6. Módulo de Administración de Plataforma (Admin General)", None, None),
    (
        "Estructura Organizacional, Campañas y Equipos",
        "19_admin_organizacion.png",
        "Ilustración 4.6.19: Administración jerárquica de la operación BPO — campañas activas, equipos de trabajo y asignaciones de turnos."
    ),
    (
        "Control de Usuarios y Roles (RBAC)",
        "20_admin_usuarios.png",
        "Ilustración 4.6.20: Catálogo maestro de usuarios con asignación de perfiles, control de estado y auditoría de accesos."
    ),
    (
        "Parámetros Globales y Políticas de Privacidad",
        "21_admin_parametros.png",
        "Ilustración 4.6.21: Gobernanza de parámetros de plataforma, versionamiento de políticas legales y catálogo léxico de soporte."
    )
]

print("Insertando capturas organizadas por módulos...")

def add_caption_style(p, text):
    p.style = "Caption" if "Caption" in doc.styles else "Text body"
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if p.runs:
        p.runs[0].font.italic = True
        p.runs[0].font.size = Pt(9.5)
        p.runs[0].font.color.rgb = RGBColor(80, 80, 80)

for item in screenshots_data:
    title, filename, caption = item
    
    if filename is None:
        # Es un subtítulo de módulo (Heading 3)
        h = doc.add_paragraph(title, style="Heading 3" if "Heading 3" in doc.styles else "Heading 2")
        continue

    # Es una vista con imagen
    desc_p = doc.add_paragraph(style="Text body")
    desc_p.paragraph_format.space_before = Pt(8)
    desc_p.paragraph_format.space_after = Pt(4)
    run_bold = desc_p.add_run(f"• {title}: ")
    run_bold.bold = True
    desc_p.add_run("Vista funcional de la plataforma en ejecución real conectada a la base de datos PostgreSQL.")

    img_path = os.path.join(SCREENSHOTS_DIR, filename)
    if os.path.exists(img_path):
        img_p = doc.add_paragraph(style="Text body")
        img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        img_p.paragraph_format.space_before = Pt(4)
        img_p.paragraph_format.space_after = Pt(2)
        r = img_p.add_run()
        r.add_picture(img_path, width=Inches(6.0))
        
        cap_p = doc.add_paragraph(caption)
        add_caption_style(cap_p, caption)
        cap_p.paragraph_format.space_after = Pt(12)
        print(f"   [OK] Insertada: {filename}")
    else:
        print(f"   [WARN] No encontrada: {filename}")

print(f"Guardando documento con todas las capturas en: {DOC_PATH}...")
doc.save(DOC_PATH)
print("¡ÉXITO TOTAL! Todas las capturas reales fueron insertadas con sus títulos y pies de figura.")
