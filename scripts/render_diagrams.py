import os
import re
import base64
import urllib.request
import urllib.error

DIAGRAMS_MD = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\Pulso360\docs\DIAGRAMAS.md"
OUTPUT_DIR = r"C:\Users\brahi\OneDrive\Escritorio\TdeA\4to semestre\Construccion3\Pulso360\docs\diagramas_img"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(DIAGRAMS_MD, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find sections and mermaid code blocks
pattern = re.compile(r"##\s+([0-9]+(?:\.[0-9]+)?\.?\s+[^\n]+).*?```mermaid\n(.*?)```", re.DOTALL)
matches = pattern.findall(content)

print(f"Found {len(matches)} mermaid diagrams in {DIAGRAMS_MD}")

diagram_map = {
    "1": "01_arquitectura_c4_contenedores.png",
    "2": "02_casos_de_uso_uml.png",
    "3": "03_sitemap_navegacion_ui.png",
    "4.1": "04_flujo_checkin_nlp.png",
    "4.2": "05_flujo_alertas_sst.png",
    "4.3": "06_flujo_chat_apoyo.png",
    "5": "07_componentes_paquetes.png",
    "6": "08_clases_modelo_dominio.png",
    "7": "09_er_conceptual.png",
    "8": "10_relacional_fisico_postgresql.png",
    "9": "11_despliegue_docker.png",
    "10": "12_secuencia_autenticacion_rbac.png",
    "11": "13_estados_alertas_sst.png"
}

rendered_files = {}

for title, mcode in matches:
    title_clean = title.strip()
    num = title_clean.split()[0].replace(":", "").replace(".", "")
    if title_clean.startswith("4.1"):
        num = "4.1"
    elif title_clean.startswith("4.2"):
        num = "4.2"
    elif title_clean.startswith("4.3"):
        num = "4.3"

    filename = diagram_map.get(num, f"diagram_{num}.png")
    out_path = os.path.join(OUTPUT_DIR, filename)

    print(f"Rendering [{title_clean}] -> {filename}...")

    # Encode for mermaid.ink
    # mermaid.ink accepts base64 json: {"code": mcode, "mermaid": {"theme": "default"}}
    json_obj = {"code": mcode, "mermaid": {"theme": "default"}}
    import json
    json_bytes = json.dumps(json_obj).encode("utf-8")
    b64_str = base64.b64encode(json_bytes).decode("ascii")
    url = f"https://mermaid.ink/img/{b64_str}?bgColor=FFFFFF"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            img_data = resp.read()
            with open(out_path, "wb") as out_f:
                out_f.write(img_data)
            print(f"  [OK] Saved {len(img_data)} bytes to {out_path}")
            rendered_files[num] = out_path
    except Exception as e:
        print(f"  [ERROR] Failed to render {title_clean}: {e}")

print(f"\nDone! Rendered {len(rendered_files)} / {len(matches)} diagrams.")
