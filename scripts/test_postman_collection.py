import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import urllib.request
import urllib.error

base_url = 'http://localhost:3000/api/v1'

def run_request(method, path, headers=None, body=None):
    url = f"{base_url}/{path.lstrip('/')}"
    req_headers = {'Content-Type': 'application/json'}
    if headers:
        req_headers.update(headers)
        
    data = None
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
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

def main():
    print("Iniciando validación de la suite completa de Postman...")
    env = {}

    # 1. Login Agente
    code, res = run_request('POST', 'auth/login', body={'correo': 'agente@pulso360.co', 'contrasena': 'Pulso360#2026'})
    assert code == 200 and res['success'], f"Fallo Login Agente: {code}"
    env['token_agente'] = res['data']['token']
    env['token'] = res['data']['token']
    print("✔ 1.1 Login Agente: 200 OK")

    # 1.2 Create Journal
    code, res = run_request('POST', 'agent/journal', headers={'Authorization': f"Bearer {env['token']}"}, body={'context': 'Postman Test', 'content': 'Demostración de ciclo CRUD completo.'})
    assert code == 201 and res['success'], f"Fallo Create Journal: {code}"
    env['journal_id'] = res['data']['id']
    print(f"✔ 1.2 [CREATE] Bitácora: 201 Created (ID: {env['journal_id']})")

    # 1.3 Read Journal
    code, res = run_request('GET', 'agent/journal', headers={'Authorization': f"Bearer {env['token']}"})
    assert code == 200 and res['success'], f"Fallo Read Journal: {code}"
    found = any(item['id'] == env['journal_id'] for item in res['data'])
    assert found, "El journal recién creado no se encontró en la lista"
    print("✔ 1.3 [READ] Listar Bitácoras: 200 OK (Registro presente)")

    # 1.4 Update Journal
    code, res = run_request('PUT', f"agent/journal/{env['journal_id']}", headers={'Authorization': f"Bearer {env['token']}"}, body={'context': 'Postman Test Modificado', 'content': 'EDICION EXITOSA.'})
    assert code == 200 and res['success'], f"Fallo Update Journal: {code}"
    assert res['data']['context'] == 'Postman Test Modificado'
    print("✔ 1.4 [UPDATE] Modificar Bitácora: 200 OK (Campos actualizados)")

    # 1.5 Delete Journal
    code, res = run_request('DELETE', f"agent/journal/{env['journal_id']}", headers={'Authorization': f"Bearer {env['token']}"})
    assert code == 200 and res['success'], f"Fallo Delete Journal: {code}"
    assert res['data']['deleted'] is True
    print("✔ 1.5 [DELETE] Eliminar Bitácora: 200 OK (deleted: true)")

    # 1.6 Verify Delete
    code, res = run_request('GET', 'agent/journal', headers={'Authorization': f"Bearer {env['token']}"})
    assert code == 200 and res['success']
    found = any(item['id'] == env['journal_id'] for item in res['data'])
    assert not found, "El journal eliminado sigue apareciendo en la lista"
    print("✔ 1.6 [VERIFICAR POST-BORRADO]: 200 OK (Registro efectivamente removido)")

    # 2. Login Admin & Users CRUD
    code, res = run_request('POST', 'auth/login', body={'correo': 'admin@pulso360.co', 'contrasena': 'Pulso360#2026'})
    assert code == 200 and res['success']
    env['token_admin'] = res['data']['token']
    print("✔ 2.1 Login Admin: 200 OK")

    code, res = run_request('GET', 'admin/users', headers={'Authorization': f"Bearer {env['token_admin']}"})
    assert code == 200 and res['success']
    print(f"✔ 2.2 [READ] Listar Usuarios: 200 OK ({len(res['data'])} usuarios)")

    import time
    test_email = f"agente_runner_{int(time.time())}@pulso360.co"
    code, res = run_request('POST', 'admin/users', headers={'Authorization': f"Bearer {env['token_admin']}"}, body={
        'rolCodigo': 'AGENTE',
        'correo': test_email,
        'nombres': 'Operador',
        'apellidos': 'Runner',
        'contrasena': 'Pulso360#2026',
        'status': 'Activo',
        'shiftStartHour': 8
    })
    assert code == 201 and res['success']
    env['new_user_id'] = res['data']['id']
    print(f"✔ 2.3 [CREATE] Usuario Admin: 201 Created (ID: {env['new_user_id']})")

    code, res = run_request('PATCH', f"admin/users/{env['new_user_id']}", headers={'Authorization': f"Bearer {env['token_admin']}"}, body={'status': 'Suspendido'})
    assert code == 200 and res['success']
    print("✔ 2.4 [UPDATE] Modificar Usuario: 200 OK")

    code, res = run_request('PATCH', f"admin/users/{env['new_user_id']}/status", headers={'Authorization': f"Bearer {env['token_admin']}"}, body={'status': 'Inactivo'})
    assert code == 200 and res['success']
    print("✔ 2.5 [UPDATE STATUS] Estado Inactivo: 200 OK")

    # 3. Roles
    for role, email in [('SUPERVISOR', 'supervisor@pulso360.co'), ('SST', 'sst@pulso360.co'), ('AUDITOR', 'auditor@pulso360.co')]:
        code, res = run_request('POST', 'auth/login', body={'correo': email, 'contrasena': 'Pulso360#2026'})
        assert code == 200 and res['success']
        env[f"token_{role.lower()}"] = res['data']['token']
        print(f"✔ 3.{role} Login {role}: 200 OK")

    # 4. SST & Supervisor
    code, res = run_request('GET', 'sst/metrics', headers={'Authorization': f"Bearer {env['token_sst']}"})
    assert code == 200
    print("✔ 5.1 SST Métricas: 200 OK")

    code, res = run_request('GET', 'sst/alerts', headers={'Authorization': f"Bearer {env['token_sst']}"})
    assert code == 200
    print(f"✔ 5.2 SST Alertas: 200 OK ({len(res['data'])} alertas)")

    code, res = run_request('GET', 'supervisor/actions', headers={'Authorization': f"Bearer {env['token_supervisor']}"})
    assert code == 200
    print(f"✔ 6.1 Supervisor Acciones: 200 OK ({len(res['data'])} acciones)")

    # 5. Negativas
    code, res = run_request('GET', 'agent/journal')
    assert code == 401 and res['error']['code'] == 'AUTH_TOKEN_MISSING'
    print("✔ 9.1 Negativa: Token Ausente -> 401 Unauthorized")

    code, res = run_request('GET', 'agent/journal', headers={'Authorization': 'Bearer fake_token'})
    assert code == 401 and res['error']['code'] == 'AUTH_TOKEN_INVALID'
    print("✔ 9.2 Negativa: Token Falso -> 401 Unauthorized")

    code, res = run_request('GET', 'agent/journal', headers={'Authorization': f"Bearer {env['token_supervisor']}"})
    assert code == 403 and res['error']['code'] == 'AUTH_FORBIDDEN_ROLE'
    print("✔ 9.3 Negativa: RBAC Supervisor a Journal -> 403 Forbidden")

    code, res = run_request('POST', 'auth/login', body={})
    assert code == 400 and res['error']['code'] == 'AUTH_MISSING_FIELDS'
    print("✔ 9.4 Negativa: Body Vacío -> 400 Bad Request")

    code, res = run_request('GET', 'ruta-inexistente-404')
    assert code == 404 and res['error']['code'] == 'RESOURCE_NOT_FOUND'
    print("✔ 9.6 Negativa: Ruta 404 -> 404 Not Found")

    print("\n🎉 ¡TODAS LAS PRUEBAS DE LA COLECCIÓN POSTMAN PASARON CON ÉXITO (100%)!")

if __name__ == '__main__':
    main()
