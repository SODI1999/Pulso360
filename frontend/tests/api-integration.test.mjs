import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

function memoryStorage() {
  const values = new Map();
  return { getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key) };
}
async function withApi(run) {
  const previousWindow = globalThis.window;
  const events = [];
  globalThis.window = { document:{},localStorage:memoryStorage(),sessionStorage:memoryStorage(),dispatchEvent:event=>events.push(event.type) };
  const server = await createServer({ configFile:false,root:process.cwd(),logLevel:'silent',appType:'custom',
    server:{ middlewareMode:true,hmr:false,watch:null },optimizeDeps:{ noDiscovery:true,include:[] } });
  try {
    const load=file=>server.ssrLoadModule(file);
    const { env }=await load('/src/core/config/env.jsx');env.useMockStorage=false;
    const { apiClient,setAuthToken }=await load('/src/core/api/apiClient.jsx');setAuthToken('fixture-token');
    const { pulsoStore }=await load('/src/core/storage/pulsoStore.jsx');
    for(const method of ['get','save','audit'])pulsoStore[method]=()=>{throw new Error('API path accessed mock storage: '+method);};
    const reply=(config,data)=>({config,data,status:200,statusText:'OK',headers:{}});
    await run({load,apiClient,reply,events});
  } finally { await server.close();globalThis.window=previousWindow; }
}

test('fechas SST: el día de Bogotá y el cierre a 28 días no cambian con medianoche UTC', async () => {
  await withApi(async ({ load }) => {
    const { bogotaCalendarDate } = await load('/src/core/time/calendarDate.jsx');
    const now = new Date('2026-10-06T00:15:00Z');
    assert.equal(bogotaCalendarDate(now), '2026-10-05');
    assert.equal(bogotaCalendarDate(now, 28), '2026-11-02');
    assert.equal(bogotaCalendarDate(now, -27), '2026-09-08');
    assert.equal(bogotaCalendarDate(new Date('2026-10-06T05:00:00Z')), '2026-10-06');
  });
});

test('API real: el perfil conserva contadores completos y asignaciones sin inicializar dominio demo', async () => {
  await withApi(async ({ load, apiClient, reply }) => {
    apiClient.defaults.adapter = async config => reply(config, { success:true, data:{ id:'fixture-admin',rol_codigo:'ADMIN',estado:'Activo',
      navigation_counts:{ unread:63,habeas:7 },assignments:[{id:'assignment',equipo_id:'team',campana_id:'campaign'}] } });
    const { authService } = await load('/src/core/auth/authService.jsx');
    authService.touchSession({id:'fixture-admin',role:'admin'});
    const profile = await authService.refreshSession();
    assert.equal(profile.navigationCounts.unread,63);assert.equal(profile.navigationCounts.habeas,7);
    assert.equal(profile.assignments[0].id,'assignment');
    assert.equal(profile.assignments[0].equipo_id,'team');
  });
});

test('borradores tras 401: solo RAM, mismo titular, caducidad y limpieza al salir o cambiar cuenta', async () => {
  await withApi(async ({ load }) => {
    const { preferences } = await load('/src/core/storage/preferences.jsx');
    const { authService } = await load('/src/core/auth/authService.jsx');
    preferences.rememberExpiredForm('fixture-a','journal',{text:'Texto técnico'});
    assert.equal(preferences.takeExpiredForm('fixture-b','journal'),null);
    assert.equal(preferences.takeExpiredForm('fixture-a','journal').text,'Texto técnico');
    assert.equal(preferences.takeExpiredForm('fixture-a','journal'),null);
    const originalNow = Date.now;
    try {
      preferences.rememberExpiredForm('fixture-a','journal',{text:'Caducado'});
      Date.now = () => originalNow()+31*60*1000;
      assert.equal(preferences.takeExpiredForm('fixture-a','journal'),null);
    } finally { Date.now = originalNow; }
    preferences.rememberExpiredForm('fixture-a','journal',{text:'Otra cuenta'});
    authService.touchSession({id:'fixture-b',role:'admin'});
    assert.equal(preferences.takeExpiredForm('fixture-a','journal'),null);
    preferences.rememberExpiredForm('fixture-b','campaign',{name:'Campaña técnica'});
    authService.logout();
    assert.equal(preferences.takeExpiredForm('fixture-b','campaign'),null);
    assert.equal(window.localStorage.getItem('pulso360_data_v2'),null);
    assert.equal(window.sessionStorage.getItem('pulso360_data_v2'),null);
  });
});

test('sesión API: una respuesta atrasada no recupera contadores antiguos ni reabre una sesión cerrada', async () => {
  await withApi(async ({ load, apiClient, reply }) => {
    const { authService } = await load('/src/core/auth/authService.jsx');
    authService.touchSession({id:'fixture-admin',role:'admin'});
    const release = [];
    apiClient.defaults.adapter = config => new Promise(resolve => release.push(unread => resolve(reply(config,{success:true,
      data:{id:'fixture-admin',rol_codigo:'ADMIN',estado:'Activo',navigation_counts:{unread}}}))));
    const earlier = authService.refreshSession(), later = authService.refreshSession();
    await new Promise(resolve=>setTimeout(resolve,0));
    release[1](2); await later;
    release[0](3); await earlier;
    assert.equal(authService.getCurrentUser().navigationCounts.unread,2);
    const pending = authService.refreshSession();
    await new Promise(resolve=>setTimeout(resolve,0));
    authService.logout(); release[2](4); await pending;
    assert.equal(authService.getCurrentUser(),null);
  });
});

test('API real: solo mutaciones confirmadas refrescan contadores y un 401 retiene antes de revocar', async () => {
  await withApi(async ({apiClient,reply,events}) => {
    apiClient.defaults.adapter = async config=>reply(config,{success:true,data:{updated:1}});
    await apiClient.patch('/sst/alerts/fixture',{status:'DESCARTADA'});
    assert.deepEqual(events,['pulso360-api-mutation']);
    events.length=0;
    apiClient.defaults.adapter = async config=>reply(config,{success:false,error:{message:'No guardado'}});
    await assert.rejects(apiClient.patch('/sst/alerts/fixture',{}),/No guardado/);
    assert.deepEqual(events,[]);
    apiClient.defaults.adapter = async config=>{const error=new Error('Sesión expirada');error.response={status:401};error.config=config;throw error;};
    await assert.rejects(apiClient.patch('/sst/alerts/fixture',{}),/expirada/);
    assert.deepEqual(events,['pulso360-session-expired','pulso360-session-changed']);
  });
});
test('API real: análisis/corrección esperan respuesta, conservan hash y jamás escriben mock',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    const {saveJournalAnalysis,saveCorrection}=await load('/src/features/agent/services/journalService.jsx');
    let release,captured;
    apiClient.defaults.adapter=config=>new Promise(resolve=>{captured=JSON.parse(config.data);release=()=>resolve(reply(config,{success:true,data:{id:'entry',content_hash:'hash'}}));});
    let settled=false;
    const pending=saveJournalAnalysis({id:'entry',content_hash:'hash'},{version:'lexico-v1.2',categories:[]},{id:'agent',role:'agente'}).then(result=>{settled=true;return result;});
    await new Promise(resolve=>setTimeout(resolve,10));
    assert.equal(settled,false);assert.equal(captured.contentHash,'hash');release();
    assert.equal((await pending).journalPayload.id,'entry');
    apiClient.defaults.adapter=async config=>{captured=JSON.parse(config.data);return reply(config,{success:true,data:{id:'entry'}});};
    const correction=await saveCorrection('entry',['Ninguna aplica'],'nota',{id:'agent'},'hash');
    assert.equal(correction.success,true);assert.deepEqual(captured,{categories:[],note:'nota',contentHash:'hash'});
  });
});

test('API real: seguimiento normaliza nota, fecha, acción y autor para ambas vistas',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    apiClient.defaults.adapter=async config=>reply(config,{success:true,data:[{id:'int-fixture',title:'Fixture',assigned_to:'otro-responsable',campana_nombre:'Campaña técnica',
      seguimientos:[{fecha:'2026-10-05',nota_avance:'Nota persistida',progreso_reportado:35,tipo_accion:'Pausa',autor_id:'fixture-supervisor'}]}]});
    const {fetchSupervisorActions}=await load('/src/features/supervisor/services/supervisorQueries.jsx');
    const {fetchSstInterventions}=await load('/src/features/sst/services/sstQueries.jsx');
    for (const query of [fetchSupervisorActions,fetchSstInterventions]) {
      const [item]=await query();assert.equal(item.campaign,'Campaña técnica');
      assert.equal(item.lastFollowup.note,'Nota persistida');assert.equal(item.lastFollowup.date,'2026-10-05');
      assert.equal(item.lastFollowup.actionType,'Pausa');assert.equal(item.lastFollowup.authorId,'fixture-supervisor');
      assert.equal(item.assignedTo,'otro-responsable');
    }
  });
});

test('API real: avisos esperan sobre del servidor y restablecer demo no accede al mock',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    const {markAllRead,markNotificationRead}=await load('/src/features/notifications/services/notificationsService.jsx');
    apiClient.defaults.adapter=async config=>reply(config,{success:true,data:{updated:1}});
    assert.equal((await markAllRead({id:'fixture'})).success,true);
    assert.equal((await markNotificationRead({id:'notice'})).data.updated,1);
    apiClient.defaults.adapter=async config=>reply(config,{success:false,error:{message:'No actualizado',code:'FIXTURE'}});
    await assert.rejects(markAllRead({id:'fixture'}),/No actualizado/);
    const {resetDemo}=await load('/src/features/admin/services/organizationService.jsx');
    assert.equal(resetDemo('fixture').success,false);
  });
});

test('API real: Habeas Data propio conserva timestamp de radicación y respuesta',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    apiClient.defaults.adapter=async config=>reply(config,{success:true,data:config.url==='/agent/habeas-data' ?
      [{id:'hd-fixture',usuario_id:'fixture',created_at:'2026-10-06T00:02:00Z',deadline:'2026-10-20',status:'Respondida',note:'Respuesta técnica'}] : []});
    const {fetchAgentRecords}=await load('/src/features/agent/services/agentQueries.jsx');
    const [item]=(await fetchAgentRecords('fixture')).habeasRequests;
    assert.equal(item.createdAt,'2026-10-06T00:02:00Z');assert.equal(item.deadline,'2026-10-20');
    assert.equal(item.status,'Respondida');assert.equal(item.note,'Respuesta técnica');
  });
});
test('API real: consulta fallida no cae a mock y sobre success:false no se anuncia como éxito',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    const {fetchAuditPage}=await load('/src/features/auditor/services/auditorQueries.jsx');
    const {saveRule}=await load('/src/features/sst/services/alertRulesService.jsx');
    for(const status of [400,401,403,409,500]){
      apiClient.defaults.adapter=async config=>{const error=new Error('Fixture HTTP '+status);error.response={status,data:{success:false,error:{message:'Fixture '+status}}};error.config=config;throw error;};
      await assert.rejects(fetchAuditPage(),/Fixture HTTP/);
      assert.equal((await saveRule({metric:'Fixture'})).success,false);
    }
    apiClient.defaults.adapter=async()=>{const error=new Error('Fixture timeout');error.code='ECONNABORTED';throw error;};
    await assert.rejects(fetchAuditPage(),/timeout/);
    apiClient.defaults.adapter=async config=>reply(config,{success:false,error:{message:'No guardado',code:'FIXTURE_REJECTED'}});
    const result=await saveRule({metric:'Fixture'});assert.equal(result.success,false);assert.equal(result.error,'No guardado');
  });
});
test('API real: parámetros anidados, política publicada, reglas y catálogo de léxico se normalizan',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    apiClient.defaults.adapter=async config=>reply(config,{success:true,data:config.url==='/admin/nlp/versions' ?
      [{id:'registered',version:'lexico-v1.2',estado:'ACTIVA',has_content:true}] :
      {params:[{clave:'gobernanza_checkin',valor:{horas_edicion_permitidas:99,retencion_auditoria_anios:7}},{clave:'slas_atencion',valor:{alta_horas:30}}],
        policies:[{version:'draft',estado:'BORRADOR',vigente_desde:'2020-01-01'},{version:'current',estado:'PUBLICADA',vigente_desde:'2021-01-01'}],
        rules:[{id:'rule',metrica:'Recuperación agregada',valor_umbral:'15',pending_approval:true,activa:false}]}});
    const {fetchAdminParams}=await load('/src/features/admin/services/adminQueries.jsx');
    const result=await fetchAdminParams();
    assert.equal(result.checkinEditHours,2);assert.equal(result.umbralMinimo,5);assert.equal(result.auditRetentionYears,7);
    assert.equal(result.slaAltaHoras,30);assert.equal(result.policyVersion,'current');assert.equal(result.nlpVersion,'lexico-v1.2');
    assert.equal(result.rules[0].pendingApproval,true);
  });
});
test('API real: NLP carga el diccionario activo y falla sin autorización sin cambiar algoritmo',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    const {nlpEngine}=await load('/src/core/nlp/nlpEngine.jsx');
    assert.throws(()=>nlpEngine.analyze('sobrecarga'),/Carga el léxico/);
    apiClient.defaults.adapter=async config=>reply(config,{success:true,data:{version:'registered',dictionary:{categories:{'Sobrecarga percibida':['sobrecarga']},crisisPhrases:[],negators:['no'],intensifiers:['muy']}}});
    await nlpEngine.loadActiveLexicon();
    const analysis=nlpEngine.analyze('muy sobrecarga');assert.equal(analysis.version,'registered');assert.equal(analysis.categories[0].confidence,.63);
    assert.equal(nlpEngine.analyze('no sobrecarga').categories.length,0);
    apiClient.defaults.adapter=async()=>{throw new Error('Revocado');};
    await assert.rejects(nlpEngine.loadActiveLexicon(),/Revocado/);
    assert.throws(()=>nlpEngine.analyze('sobrecarga'),/Carga el léxico/);
  });
});
test('API real: exportación e integridad provienen del servidor, paginación mantiene sobre',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    apiClient.defaults.adapter=async config=>reply(config,config.url==='/auditor/logs' ? {success:true,data:[{id:123,action:'Fixture'}],pagination:{total:70,hasMore:true}} :
      {success:true,data:config.url==='/auditor/export' ? {logs:Array(70).fill({id:'fixture'}),metadata:{limit:10000}} : {verifiedRecords:70}});
    const {fetchAuditPage,exportAudit,verifyAudit}=await load('/src/features/auditor/services/auditorQueries.jsx');
    const page=await fetchAuditPage();assert.equal(page.logs[0].id,'123');assert.equal(page.pagination.total,70);
    assert.equal((await exportAudit({limit:10000})).logs.length,70);assert.equal((await verifyAudit()).verifiedRecords,70);
  });
});

test('API real: apoyo confidencial usa modalidad identificada y conserva preferencia/franja',async()=>{
  await withApi(async({load,apiClient,reply})=>{
    let captured;
    apiClient.defaults.adapter=async config=>{captured=JSON.parse(config.data);return reply(config,{success:true,data:{id:'request',code:'FIXTURE'}});};
    const {createSupportRequest}=await load('/src/features/agent/services/supportChannelService.jsx');
    const result=await createSupportRequest(false,'media','confidencial',{id:'fixture'},'Motivo técnico','', 'correo','Tarde');
    assert.equal(result.success,true);assert.equal(captured.mode,'identificado');assert.equal(captured.description,'');
    assert.equal(captured.contact_preference,'correo');assert.equal(captured.time_window,'Tarde');
    const {createPriorityRequest}=await load('/src/features/agent/services/journalService.jsx');
    assert.equal((await createPriorityRequest({id:'fixture'},'confidencial')).success,true);
    assert.equal(captured.mode,'identificado');
  });
});
