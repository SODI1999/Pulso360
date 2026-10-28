import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import urllib.request
import urllib.error

base_url = 'http://localhost:3000/api/v1'

with open('Pulso360_Postman_Collection.json', 'r', encoding='utf-8') as f:
    col = json.load(f)

env = {
    'baseUrl': base_url,
    'token': '',
    'token_agente': '',
    'token_supervisor': '',
    'token_sst': '',
    'token_admin': '',
    'token_auditor': '',
    'journal_id': '',
    'new_user_id': '',
    'campaign_id': '',
    'team_id': '',
    'intervention_id': '',
    'alert_id': '',
    'support_request_id': '',
    'dynamic_user_email': 'audit_test_user@pulso360.co',
    'dynamic_camp_code': 'CAMP-AUDIT-999',
    'dynamic_team_code': 'TM-AUDIT-999',
    'dynamic_policy_version': '3.999.0'
}

def resolve_vars(text):
    if not isinstance(text, str):
        return text
    for k, v in env.items():
        text = text.replace(f"{{{{{k}}}}}", str(v))
    return text

def execute_req(req_name, method, url_str, headers_list, raw_body):
    resolved_url = resolve_vars(url_str)
    headers = {}
    for h in headers_list:
        headers[h['key']] = resolve_vars(h['value'])
    
    data = None
    if raw_body is not None and method in ['POST', 'PUT', 'PATCH']:
        resolved_body = resolve_vars(raw_body)
        data = resolved_body.encode('utf-8')
        
    req = urllib.request.Request(resolved_url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            parsed = json.loads(content)
        except:
            parsed = {'raw': content}
        return e.code, parsed
    except Exception as e:
        return 0, {'error': str(e)}

print("=== AUDITANDO TODAS LAS PETICIONES DE LA COLECCIÓN POSTMAN ===")

def flatten_requests(items, folder_name=''):
    flat = []
    for it in items:
        if 'item' in it:
            flat.extend(flatten_requests(it['item'], it.get('name', '')))
        elif 'request' in it:
            flat.append((folder_name, it))
    return flat

requests_to_audit = flatten_requests(col['item'])

issues = []

for folder, it in requests_to_audit:
    name = it['name']
    req = it['request']
    method = req['method']
    url = req['url']['raw']
    body = req.get('body', {}).get('raw', None)
    headers = req.get('header', [])

    # Handle pre-request scripts if any
    if 'event' in it:
        for ev in it['event']:
            if ev.get('listen') == 'prerequest':
                script_lines = ev.get('script', {}).get('exec', [])
                if any('dynamic_user_email' in l for l in script_lines):
                    import time
                    env['dynamic_user_email'] = f"audit_agent_{int(time.time()*1000)%100000}@pulso360.co"
                if any('dynamic_camp_code' in l for l in script_lines):
                    import time
                    env['dynamic_camp_code'] = f"CP-{int(time.time()*1000)%10000}"
                if any('dynamic_team_code' in l for l in script_lines):
                    import time
                    env['dynamic_team_code'] = f"TM-{int(time.time()*1000)%10000}"
                if any('dynamic_policy_version' in l for l in script_lines):
                    import time
                    env['dynamic_policy_version'] = f"3.{int(time.time()*1000)%900 + 100}.0"

    code, resp = execute_req(name, method, url, headers, body)
    
    # Save tokens/ids dynamically as Postman tests would do
    if 'token' in str(resp):
        tok = resp.get('data', {}).get('token')
        if tok:
            if 'Agente' in name:
                env['token_agente'] = tok
                env['token'] = tok
            elif 'Supervisor' in name:
                env['token_supervisor'] = tok
                env['token'] = tok
            elif 'SST' in name:
                env['token_sst'] = tok
                env['token'] = tok
            elif 'Admin' in name:
                env['token_admin'] = tok
                env['token'] = tok
            elif 'Auditor' in name:
                env['token_auditor'] = tok
                env['token'] = tok

    if resp.get('data'):
        d = resp['data']
        if isinstance(d, dict) and 'id' in d:
            if 'journal' in url:
                env['journal_id'] = d['id']
            elif 'admin/users' in url and method == 'POST':
                env['new_user_id'] = d['id']
            elif 'admin/campaigns' in url and method == 'POST':
                env['campaign_id'] = d['id']
            elif 'admin/teams' in url and method == 'POST':
                env['team_id'] = d['id']
            elif 'sst/interventions' in url and method == 'POST':
                env['intervention_id'] = d['id']
            elif 'sst/support-requests' in url and method == 'POST':
                env['support_request_id'] = d['id']
        elif isinstance(d, list) and len(d) > 0 and isinstance(d[0], dict) and 'id' in d[0]:
            if 'sst/alerts' in url and not env['alert_id']:
                env['alert_id'] = d[0]['id']
            if 'sst/interventions' in url and not env['intervention_id']:
                env['intervention_id'] = d[0]['id']
            if 'supervisor/actions' in url:
                env['intervention_id'] = d[0]['id']

    # Evaluate expected status
    is_negative = '9.' in folder or 'Negativa' in name or 'Espera 40' in name
    if '3.7' in name:
        if code in [200, 503]:
            print(f"✔ [{code}] {name} (Esperado 200 o 503 sin SMTP)")
        else:
            print(f"❌ [ERROR {code}] {name} -> {resp}")
            issues.append((name, f"Código {code}: {resp}"))
    elif '7.7' in name:
        if code == 409 and resp.get('error', {}).get('code') == 'PARAM_READONLY':
            print(f"✔ [409 PARAM_READONLY] {name} (Invariante protegido confirmado)")
        else:
            print(f"❌ [ERROR {code}] {name} -> {resp}")
            issues.append((name, f"Esperaba 409 PARAM_READONLY pero respondió {code}"))
    elif is_negative:
        if code in [400, 401, 403, 404]:
            print(f"✔ [NEGATIVA ESPERADA {code}] {name}")
        else:
            print(f"❌ [FALLO EN NEGATIVA - CÓDIGO {code}] {name} -> {resp}")
            issues.append((name, f"Esperaba error 4xx pero respondió {code}"))
    else:
        if code in [200, 201]:
            print(f"✔ [{code}] {name}")
        else:
            print(f"❌ [ERROR {code}] {name} -> {resp}")
            issues.append((name, f"Código {code}: {resp}"))

print(f"\n==========================================")
print(f"Total peticiones auditadas: {len(requests_to_audit)}")
print(f"Total problemas encontrados: {len(issues)}")
if issues:
    print("DETALLE DE PROBLEMAS:")
    for name, detail in issues:
        print(f"- {name}: {detail}")
else:
    print("¡No hubo fallos en peticiones directas!")
