import json
import os

def req(name, method, path, headers=None, body=None, pre=None, test=None, desc=''):
    url_parts = [p for p in path.strip('/').split('/') if p]
    url_obj = {
        'raw': '{{baseUrl}}/' + path.strip('/'),
        'host': ['{{baseUrl}}'],
        'path': url_parts
    }
    
    header_list = [{'key': 'Content-Type', 'value': 'application/json', 'type': 'text'}]
    if headers:
        for k, v in headers.items():
            header_list.append({'key': k, 'value': v, 'type': 'text'})
            
    r = {
        'name': name,
        'request': {
            'method': method,
            'header': header_list,
            'url': url_obj,
            'description': desc
        },
        'response': []
    }
    
    if body is not None:
        r['request']['body'] = {
            'mode': 'raw',
            'raw': json.dumps(body, indent=2, ensure_ascii=False) if isinstance(body, (dict, list)) else str(body),
            'options': {'raw': {'language': 'json'}}
        }
        
    events = []
    if pre:
        events.append({
            'listen': 'prerequest',
            'script': {'type': 'text/javascript', 'exec': pre if isinstance(pre, list) else [line.rstrip() for line in pre.strip().split('\n')]}
        })
    if test:
        events.append({
            'listen': 'test',
            'script': {'type': 'text/javascript', 'exec': test if isinstance(test, list) else [line.rstrip() for line in test.strip().split('\n')]}
        })
    if events:
        r['event'] = events
        
    return r

folders = []

# ==============================================================================
# FOLDER 1: DEMO RAPIDA CRUD COMPLETO (Demostración al Docente)
# ==============================================================================
folders.append({
    'name': '⭐ 1. DEMO RÁPIDA CRUD COMPLETO (Demostración al Docente)',
    'item': [
        req(
            '1.1 [POST] Iniciar Sesión (Login Agente)',
            'POST',
            'auth/login',
            body={'correo': 'agente@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Token JWT generado exitosamente", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.data.token).to.be.a("string");
    pm.environment.set("token_agente", res.data.token);
    pm.environment.set("token", res.data.token);
});''',
            desc='Paso 1: Autenticación del Agente. Al presionar Send, el script captura el token JWT y lo inyecta en {{token}} para las siguientes peticiones.'
        ),
        req(
            '1.2 [POST] [C]REATE — Crear Bitácora Personal',
            'POST',
            'agent/journal',
            headers={'Authorization': 'Bearer {{token}}'},
            body={
                'context': 'Sustentación Docente CRUD',
                'content': 'Entrada de bitácora creada en vivo para demostrar el ciclo completo Create, Read, Update, Delete.'
            },
            test='''pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Registro creado con ID único", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.data.id).to.be.a("string");
    pm.environment.set("journal_id", res.data.id);
});''',
            desc='Paso 2 [CREATE]: Envía una nueva bitácora a la API. Guarda automáticamente el ID único generado en {{journal_id}}.'
        ),
        req(
            '1.3 [GET] [R]EAD — Listar Bitácoras y Verificar Creación',
            'GET',
            'agent/journal',
            headers={'Authorization': 'Bearer {{token}}'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("El registro recién creado aparece en el listado", function () {
    var res = pm.response.json();
    var createdId = pm.environment.get("journal_id");
    var found = res.data.some(function(item) { return item.id === createdId; });
    pm.expect(found).to.be.true;
});''',
            desc='Paso 3 [READ]: Consulta todas las bitácoras del usuario autenticado y verifica que el registro {{journal_id}} está presente.'
        ),
        req(
            '1.4 [PUT] [U]PDATE — Modificar Contenido de la Bitácora',
            'PUT',
            'agent/journal/{{journal_id}}',
            headers={'Authorization': 'Bearer {{token}}'},
            body={
                'context': 'Sustentación Docente (Actualizado)',
                'content': 'EDICIÓN EN VIVO: Se verificó la actualización del registro mediante petición PUT exitosa.'
            },
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Campos actualizados correctamente en base de datos", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.data.context).to.eql("Sustentación Docente (Actualizado)");
    pm.expect(res.data.content).to.include("EDICIÓN EN VIVO");
});''',
            desc='Paso 4 [UPDATE]: Envía PUT con nuevos datos sobre el ID {{journal_id}} y verifica que se reflejen los cambios.'
        ),
        req(
            '1.5 [DELETE] [D]ELETE — Eliminar la Bitácora Creada',
            'DELETE',
            'agent/journal/{{journal_id}}',
            headers={'Authorization': 'Bearer {{token}}'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Confirmación de borrado físico en base de datos", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.data.deleted).to.be.true;
});''',
            desc='Paso 5 [DELETE]: Elimina permanentemente la bitácora {{journal_id}} de la base de datos.'
        ),
        req(
            '1.6 [GET] [R]EAD Post-Borrado — Verificar que ya NO existe',
            'GET',
            'agent/journal',
            headers={'Authorization': 'Bearer {{token}}'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("El registro eliminado ya NO existe en la base de datos", function () {
    var res = pm.response.json();
    var deletedId = pm.environment.get("journal_id");
    var found = res.data.some(function(item) { return item.id === deletedId; });
    pm.expect(found).to.be.false;
});''',
            desc='Paso 6 [VERIFICACIÓN POST-BORRADO]: Reconsulta las bitácoras y confirma que el ID eliminado ya no aparece.'
        )
    ]
})

# ==============================================================================
# FOLDER 2: DEMO CRUD ADMINISTRACION (Usuarios)
# ==============================================================================
folders.append({
    'name': '⭐ 2. DEMO CRUD ADMINISTRACIÓN (Gestión de Usuarios)',
    'item': [
        req(
            '2.1 [POST] Iniciar Sesión (Login Administrador)',
            'POST',
            'auth/login',
            body={'correo': 'admin@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Token Admin generado", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.environment.set("token_admin", res.data.token);
    pm.environment.set("token", res.data.token);
});''',
            desc='Autenticación como Administrador del sistema. Guarda token en {{token_admin}} y {{token}}.'
        ),
        req(
            '2.2 [GET] [R]EAD — Listar Usuarios del Sistema',
            'GET',
            'admin/users',
            headers={'Authorization': 'Bearer {{token}}'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Listado de usuarios obtenido correctamente", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.data).to.be.an("array");
    pm.expect(res.data.length).to.be.above(0);
});''',
            desc='READ: Consulta el directorio completo de usuarios del centro de operaciones.'
        ),
        req(
            '2.3 [POST] [C]REATE — Crear Nuevo Usuario Agente',
            'POST',
            'admin/users',
            headers={'Authorization': 'Bearer {{token}}'},
            pre='''var rnd = Math.floor(Math.random() * 9000 + 1000);
pm.environment.set("dynamic_user_email", "agente_postman_" + rnd + "@pulso360.co");''',
            body={
                'rolCodigo': 'AGENTE',
                'correo': '{{dynamic_user_email}}',
                'nombres': 'Operador',
                'apellidos': 'Prueba Postman',
                'contrasena': 'Pulso360#2026',
                'status': 'Activo',
                'shiftStartHour': 8
            },
            test='''pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Usuario creado y guardado en {{new_user_id}}", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.data.id).to.be.a("string");
    pm.environment.set("new_user_id", res.data.id);
});''',
            desc='CREATE: Registra un nuevo usuario en la base de datos y guarda su ID en {{new_user_id}}.'
        ),
        req(
            '2.4 [PATCH] [U]PDATE — Modificar Estado de Usuario (Suspendido)',
            'PATCH',
            'admin/users/{{new_user_id}}',
            headers={'Authorization': 'Bearer {{token}}'},
            body={'status': 'Suspendido'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Usuario modificado exitosamente", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
});''',
            desc='UPDATE: Modifica atributos del usuario recién creado.'
        ),
        req(
            '2.5 [PATCH] [U]PDATE Status — Cambiar Estado a Inactivo',
            'PATCH',
            'admin/users/{{new_user_id}}/status',
            headers={'Authorization': 'Bearer {{token}}'},
            body={'status': 'Inactivo'},
            test='''pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Estado de usuario actualizado", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.true;
});''',
            desc='UPDATE STATUS: Actualiza el estado administrativo del usuario en el sistema.'
        )
    ]
})

# ==============================================================================
# FOLDER 3: Autenticación y Control de Acceso (5 Roles)
# ==============================================================================
folders.append({
    'name': '3. Autenticación y Control de Acceso (5 Roles)',
    'item': [
        req(
            '3.1 [POST] Login Agente (agente@pulso360.co)',
            'POST',
            'auth/login',
            body={'correo': 'agente@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.environment.set("token_agente", res.data.token);
pm.environment.set("token", res.data.token);''',
            desc='Inicio de sesión para el rol AGENTE.'
        ),
        req(
            '3.2 [POST] Login Supervisor (supervisor@pulso360.co)',
            'POST',
            'auth/login',
            body={'correo': 'supervisor@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.environment.set("token_supervisor", res.data.token);
pm.environment.set("token", res.data.token);''',
            desc='Inicio de sesión para el rol SUPERVISOR.'
        ),
        req(
            '3.3 [POST] Login SST (sst@pulso360.co)',
            'POST',
            'auth/login',
            body={'correo': 'sst@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.environment.set("token_sst", res.data.token);
pm.environment.set("token", res.data.token);''',
            desc='Inicio de sesión para el rol SST (Salud y Seguridad en el Trabajo).'
        ),
        req(
            '3.4 [POST] Login Administrador (admin@pulso360.co)',
            'POST',
            'auth/login',
            body={'correo': 'admin@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.environment.set("token_admin", res.data.token);
pm.environment.set("token", res.data.token);''',
            desc='Inicio de sesión para el rol ADMIN.'
        ),
        req(
            '3.5 [POST] Login Auditor (auditor@pulso360.co)',
            'POST',
            'auth/login',
            body={'correo': 'auditor@pulso360.co', 'contrasena': 'Pulso360#2026'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.environment.set("token_auditor", res.data.token);
pm.environment.set("token", res.data.token);''',
            desc='Inicio de sesión para el rol AUDITOR (Ley 1581 e integridad).'
        ),
        req(
            '3.6 [GET] Consultar Perfil del Usuario Autenticado (/auth/me)',
            'GET',
            'auth/me',
            headers={'Authorization': 'Bearer {{token}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.expect(res.success).to.be.true;
pm.expect(res.data.usuario).to.have.property("correo");''',
            desc='Verifica la identidad y claims decodificados desde el JWT.'
        ),
        req(
            '3.7 [POST] Solicitar Reseteo de Contraseña',
            'POST',
            'auth/password-reset/request',
            body={'correo': 'agente@pulso360.co'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Genera el token temporal de recuperación de contraseña.'
        )
    ]
})

# ==============================================================================
# FOLDER 4: Módulo Agente (Bienestar & Privacidad)
# ==============================================================================
folders.append({
    'name': '4. Módulo Agente (Bienestar & Privacidad)',
    'item': [
        req(
            '4.1 [POST] Registrar Check-in Diario (6 Dimensiones)',
            'POST',
            'agent/checkin',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            body={
                'dimensiones': {
                    'animo': 4,
                    'energia': 3,
                    'estres': 2,
                    'claridad': 4,
                    'carga': 3,
                    'sueno': 4
                },
                'sintomas': ['fatiga_visual']
            },
            test='''pm.test("Status code is 201 Created o 200 OK", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});''',
            desc='Envío del check-in multidimensional del operador.'
        ),
        req(
            '4.2 [GET] Consultar Check-in de Hoy',
            'GET',
            'agent/checkin/today',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Verifica si el agente ya completó su pulso en el turno actual.'
        ),
        req(
            '4.3 [GET] Consultar Historial de Check-ins',
            'GET',
            'agent/checkin/history',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Historial privado de evaluaciones del operador.'
        ),
        req(
            '4.4 [GET] Consultar Consentimiento Granular Activo',
            'GET',
            'agent/consent',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Consulta las cláusulas de consentimiento C1..C5.'
        ),
        req(
            '4.5 [PUT] Actualizar Consentimiento Granular (C1..C5)',
            'PUT',
            'agent/consent',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            body={
                'c1_metricas_agregadas': True,
                'c2_nlp_desahogo': True,
                'c3_alertas_preventivas': True,
                'c4_analisis_predictivo': False,
                'c5_compartir_estadisticas_sst': True
            },
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Actualiza los consentimientos informados del trabajador bajo Ley 1581.'
        ),
        req(
            '4.6 [POST] Solicitar Apoyo Psicosocial Preventivo',
            'POST',
            'sst/support-requests',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            body={
                'tipo': 'EMOCIONAL',
                'motivo': 'Sobrecarga de llamadas consecutivas en turno matutino.',
                'prioridad': 'MEDIA'
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });
var res = pm.response.json();
if (res.data && res.data.id) {
    pm.environment.set("support_request_id", res.data.id);
}''',
            desc='Radica una solicitud privada de apoyo y guarda {{support_request_id}}.'
        ),
        req(
            '4.7 [GET] Consultar Mis Solicitudes de Apoyo',
            'GET',
            'agent/support-requests',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Consulta el estado de las solicitudes radicadas por el agente.'
        ),
        req(
            '4.8 [POST] Radicar Solicitud Habeas Data (Ley 1581)',
            'POST',
            'agent/habeas-data',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            body={
                'tipo': 'ACCESO',
                'detalles': 'Solicitud formal de acceso a historial de check-ins bajo Ley 1581.'
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });''',
            desc='Canal formal de ejercicio de derechos ARCO / Habeas Data.'
        ),
        req(
            '4.9 [GET] Consultar Mis Solicitudes Habeas Data',
            'GET',
            'agent/habeas-data',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Listado de derechos de petición Habeas Data del agente.'
        )
    ]
})

# ==============================================================================
# FOLDER 5: Módulo SST & Salud Ocupacional
# ==============================================================================
folders.append({
    'name': '5. Módulo SST & Salud Ocupacional',
    'item': [
        req(
            '5.1 [GET] Consultar Métricas Psicosociales Agregadas (k-anonimato)',
            'GET',
            'sst/metrics',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Indicadores agregados y anónimos (k>=5) para análisis epidemiológico.'
        ),
        req(
            '5.2 [GET] Consultar Alertas Psicosociales Activas',
            'GET',
            'sst/alerts',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
if (res.data && res.data.length > 0) {
    pm.environment.set("alert_id", res.data[0].id);
}''',
            desc='Listado de alertas preventivas. Guarda la primera alerta en {{alert_id}}.'
        ),
        req(
            '5.3 [PATCH] Cambiar Estado de Alerta (En Revisión)',
            'PATCH',
            'sst/alerts/{{alert_id}}',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            body={
                'status': 'EnRevision',
                'notas': 'Revisión preventiva iniciada por especialista SST.'
            },
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Actualiza el ciclo de vida de una alerta en {{alert_id}}.'
        ),
        req(
            '5.4 [GET] Consultar Solicitudes de Apoyo Recibidas',
            'GET',
            'sst/support-requests',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Bandeja de solicitudes de apoyo de trabajadores para el equipo SST.'
        ),
        req(
            '5.5 [PATCH] Cambiar Estado de Solicitud de Apoyo (Asignada)',
            'PATCH',
            'sst/support-requests/{{support_request_id}}/status',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            body={'estado': 'ASIGNADA'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Pasa la solicitud {{support_request_id}} a estado asignada.'
        ),
        req(
            '5.6 [GET] Consultar Planes de Intervención',
            'GET',
            'sst/interventions',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
if (res.data && res.data.length > 0) {
    pm.environment.set("intervention_id", res.data[0].id);
}''',
            desc='Planes de intervención en desarrollo. Guarda {{intervention_id}}.'
        ),
        req(
            '5.7 [POST] Crear Plan de Intervención Estratégico',
            'POST',
            'sst/interventions',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            body={
                'titulo': 'Programa de Pausas Activas Asistidas Postman',
                'descripcion': 'Intervención de ergonomía y pausas activas para mitigar sobrecarga.',
                'tipo': 'ERGONOMICA',
                'nivelRiesgo': 'MEDIO',
                'idCampana': None,
                'idEquipo': None
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });
var res = pm.response.json();
if (res.data && res.data.id) {
    pm.environment.set("intervention_id", res.data.id);
}''',
            desc='Crea un plan de intervención institucional y guarda su ID en {{intervention_id}}.'
        ),
        req(
            '5.8 [GET] Consultar Reglas de Alerta Activas',
            'GET',
            'sst/rules',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Reglas y umbrales configurados para disparar alertas automáticas.'
        ),
        req(
            '5.9 [POST] Proponer Nueva Regla de Alerta Preventiva',
            'POST',
            'sst/rules',
            headers={'Authorization': 'Bearer {{token_sst}}'},
            body={
                'nombre': 'Regla Fatiga Acumulada Postman',
                'tipo': 'ESTRES_ELEVADO',
                'umbral': 4.0,
                'diasConsecutivos': 2,
                'descripcion': 'Alerta disparada al superar 4.0 de estrés en 2 turnos consecutivos.'
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });''',
            desc='Propone una regla que entrará a validación o aprobación.'
        )
    ]
})

# ==============================================================================
# FOLDER 6: Módulo Supervisor (Operación BPO)
# ==============================================================================
folders.append({
    'name': '6. Módulo Supervisor (Operación BPO)',
    'item': [
        req(
            '6.1 [GET] Consultar Acciones e Intervenciones Asignadas',
            'GET',
            'supervisor/actions',
            headers={'Authorization': 'Bearer {{token_supervisor}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Acciones e intervenciones asignadas al equipo del supervisor.'
        ),
        req(
            '6.2 [POST] Registrar Avance y Seguimiento de Intervención',
            'POST',
            'supervisor/actions/{{intervention_id}}/followup',
            headers={'Authorization': 'Bearer {{token_supervisor}}'},
            body={
                'progreso': 65,
                'comentarios': 'Se realizaron 2 sesiones asistidas con 85% de asistencia de operadores.',
                'estado': 'EnProgreso'
            },
            test='''pm.test("Status code is 200 OK o 201 Created", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});''',
            desc='Registra el porcentaje de avance operativo sobre la intervención {{intervention_id}}.'
        )
    ]
})

# ==============================================================================
# FOLDER 7: Módulo Administración (Empresa, Campañas, Parámetros)
# ==============================================================================
folders.append({
    'name': '7. Módulo Administración (Empresa, Campañas, Parámetros)',
    'item': [
        req(
            '7.1 [GET] Consultar Estructura Organizacional',
            'GET',
            'admin/organization',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Árbol institucional de campañas, equipos y líderes operativos.'
        ),
        req(
            '7.2 [POST] Crear Campaña Operativa',
            'POST',
            'admin/campaigns',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            body={
                'nombre': 'Campaña Soporte Postman',
                'descripcion': 'Campaña de operaciones de prueba',
                'cliente': 'Liberty BPO'
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });
var res = pm.response.json();
if (res.data && res.data.id) {
    pm.environment.set("campaign_id", res.data.id);
}''',
            desc='Crea una campaña y guarda su ID en {{campaign_id}}.'
        ),
        req(
            '7.3 [PATCH] Modificar Campaña Operativa',
            'PATCH',
            'admin/campaigns/{{campaign_id}}',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            body={'descripcion': 'Descripción actualizada desde suite Postman'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Actualiza la información de la campaña {{campaign_id}}.'
        ),
        req(
            '7.4 [POST] Crear Equipo de Trabajo',
            'POST',
            'admin/teams',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            body={
                'nombre': 'Equipo Gamma Postman',
                'id_campana': '{{campaign_id}}'
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });
var res = pm.response.json();
if (res.data && res.data.id) {
    pm.environment.set("team_id", res.data.id);
}''',
            desc='Crea un equipo en la campaña y guarda {{team_id}}.'
        ),
        req(
            '7.5 [PATCH] Modificar Equipo de Trabajo',
            'PATCH',
            'admin/teams/{{team_id}}',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            body={'nombre': 'Equipo Gamma Postman (Actualizado)'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Modifica el nombre del equipo {{team_id}}.'
        ),
        req(
            '7.6 [GET] Consultar Parámetros de Sistema',
            'GET',
            'admin/params',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Parámetros de configuración global del sistema.'
        ),
        req(
            '7.7 [PUT] Modificar Parámetro de Sistema',
            'PUT',
            'admin/params/alert_threshold_score',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            body={'valor': '75'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Modifica el umbral global de score de alerta.'
        ),
        req(
            '7.8 [POST] Crear y Publicar Política de Privacidad',
            'POST',
            'admin/policies',
            headers={'Authorization': 'Bearer {{token_admin}}'},
            body={
                'titulo': 'Política de Privacidad y Tratamiento de Datos v2.1',
                'contenido': 'Reglamento de privacidad y confidencialidad bajo Ley 1581 de 2012.',
                'version': '2.1.0'
            },
            test='''pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });''',
            desc='Publica una nueva versión de política de datos.'
        )
    ]
})

# ==============================================================================
# FOLDER 8: Módulo Auditoría & Ley 1581 (Trazabilidad Inmutable)
# ==============================================================================
folders.append({
    'name': '8. Módulo Auditoría & Ley 1581 (Trazabilidad Inmutable)',
    'item': [
        req(
            '8.1 [GET] Consultar Logs de Auditoría Inmutables',
            'GET',
            'auditor/logs',
            headers={'Authorization': 'Bearer {{token_auditor}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.expect(res.data).to.be.an("array");''',
            desc='Consulta el registro inmutable de auditoría con huellas criptográficas.'
        ),
        req(
            '8.2 [GET] Verificar Integridad Criptográfica de Registros',
            'GET',
            'auditor/integrity',
            headers={'Authorization': 'Bearer {{token_auditor}}'},
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });
var res = pm.response.json();
pm.expect(res.data.status).to.eql("INTEGRO");''',
            desc='Verifica la validez y consistencia del encadenamiento criptográfico.'
        ),
        req(
            '8.3 [POST] Exportar Reporte de Cumplimiento Normativo',
            'POST',
            'auditor/export',
            headers={'Authorization': 'Bearer {{token_auditor}}'},
            body={
                'formato': 'JSON',
                'tipo': 'AUDITORIA_COMPLETA'
            },
            test='''pm.test("Status code is 200 OK", function () { pm.response.to.have.status(200); });''',
            desc='Exporta el paquete de auditoría forense para organismos de control.'
        )
    ]
})

# ==============================================================================
# FOLDER 9: Middlewares, Seguridad y Validación (Pruebas Negativas Fail-Fast)
# ==============================================================================
folders.append({
    'name': '9. Middlewares, Seguridad y Validación (Pruebas Negativas)',
    'item': [
        req(
            '9.1 [GET] Token Ausente (Espera 401 Unauthorized)',
            'GET',
            'agent/journal',
            test='''pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Código de error AUTH_TOKEN_MISSING", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.false;
    pm.expect(res.error.code).to.eql("AUTH_TOKEN_MISSING");
});''',
            desc='Verifica que authMiddleware bloquea peticiones sin header Authorization.'
        ),
        req(
            '9.2 [GET] Token Falso o Corrupto (Espera 401 Unauthorized)',
            'GET',
            'agent/journal',
            headers={'Authorization': 'Bearer token_falso_y_corrupto_123'},
            test='''pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Código de error AUTH_TOKEN_INVALID", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.false;
    pm.expect(res.error.code).to.eql("AUTH_TOKEN_INVALID");
});''',
            desc='Verifica que el middleware valida criptográficamente la firma del JWT.'
        ),
        req(
            '9.3 [GET] Violación RBAC - Supervisor accede a Bitácora Privada (Espera 403 Forbidden)',
            'GET',
            'agent/journal',
            headers={'Authorization': 'Bearer {{token_supervisor}}'},
            test='''pm.test("Status code is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});
pm.test("Código de error AUTH_FORBIDDEN_ROLE", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.false;
    pm.expect(res.error.code).to.eql("AUTH_FORBIDDEN_ROLE");
});''',
            desc='Verifica el aislamiento de privacidad: un supervisor no puede leer bitácoras privadas de agentes.'
        ),
        req(
            '9.4 [POST] Body Vacío en Login (Espera 400 Bad Request)',
            'POST',
            'auth/login',
            body={},
            test='''pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Código de error AUTH_MISSING_FIELDS", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.false;
    pm.expect(res.error.code).to.eql("AUTH_MISSING_FIELDS");
});''',
            desc='Verifica la validación inmediata (Fail-Fast) ante cuerpos vacíos.'
        ),
        req(
            '9.5 [POST] Longitud Mínima Insuficiente en Bitácora (Espera 400 Bad Request)',
            'POST',
            'agent/journal',
            headers={'Authorization': 'Bearer {{token_agente}}'},
            body={
                'context': 'Prueba',
                'content': 'abc'
            },
            test='''pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Código de error JOURNAL_CONTENT_EMPTY", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.false;
    pm.expect(res.error.code).to.eql("JOURNAL_CONTENT_EMPTY");
});''',
            desc='Verifica la regla de dominio que restringe entradas menores a 5 caracteres.'
        ),
        req(
            '9.6 [GET] Ruta Inexistente (Espera 404 Not Found)',
            'GET',
            'esta-ruta-no-existe-en-el-backend-pulso360',
            test='''pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Código de error RESOURCE_NOT_FOUND", function () {
    var res = pm.response.json();
    pm.expect(res.success).to.be.false;
    pm.expect(res.error.code).to.eql("RESOURCE_NOT_FOUND");
});''',
            desc='Verifica que notFoundHandler responde con el sobre de error canónico.'
        )
    ]
})

collection = {
    'info': {
        '_postman_id': 'pulso360-full-suite-2026',
        'name': 'Pulso360 — Suite de Pruebas API (CRUD Completo, Roles, Seguridad & Ley 1581)',
        'description': 'Colección integral de pruebas para la API REST de Pulso360 (Express 5 + PostgreSQL 18).\n\nIncluye:\n1. Flujo CRUD completo de demostración en vivo (Create, Read, Update, Delete con verificación post-borrado).\n2. CRUD de gestión de usuarios para administración.\n3. Flujos multi-rol para Agente, Supervisor, SST, Administrador y Auditor.\n4. Pruebas negativas y de seguridad para middlewares de autenticación, RBAC y validadores Fail-Fast.',
        'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    'item': folders
}

output_path = 'Pulso360_Postman_Collection.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print(f'Successfully generated {output_path} with {len(folders)} folders.')
