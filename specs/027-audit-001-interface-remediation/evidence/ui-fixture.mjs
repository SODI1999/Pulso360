/** Datos técnicos exclusivos del navegador aislado; no modifican la base de Pulso360. */
export async function installFixture(client) {
  const fixture = {
    mode: 'active', closeBehavior: 'error', held: [], errors: [], closed: false,
    cases: [
      { id: 'ui-case-active', code: 'MUESTRA-UI-001', mode: 'anonimo', status: 'En gestion', urgency: 'media', reason: 'Muestra técnica: sobrecarga de llamadas. Datos simulados para comprobar el canal.', chat_status: 'activa' },
      { id: 'ui-case-closed', code: 'MUESTRA-UI-002', mode: 'anonimo', status: 'Cerrada', urgency: 'baja', reason: 'Muestra técnica: consulta concluida. Datos simulados.', chat_status: 'cerrada' },
      { id: 'ui-case-waiting', code: 'MUESTRA-UI-003', mode: 'anonimo', status: 'Recibida', reason: 'Muestra técnica: consulta sin urgencia ni plazo registrados. Datos simulados.' }
    ].map(item => ({ ...item, request_date: '2026-11-02T10:00:00Z' })),
    messages: Array.from({ length: 65 }, (_, index) => ({ id: `ui-message-${index}`, sessionId: 'ui-session', senderRole: index % 2 ? 'SST' : 'AGENTE', senderName: 'Participante de muestra', text: `Mensaje de muestra ${index + 1}. Contenido técnico simulado para revisar lectura, desplazamiento y respuesta sobre la sobrecarga de llamadas.`, timestamp: `2026-11-02T10:${String(index % 60).padStart(2, '0')}:00Z` }))
  };
  fixture.handle = async ({ requestId, request }) => {
    const path = new URL(request.url).pathname.replace('/api/v1', '');
    const ok = data => client.fulfill(requestId, 200, { success: true, data });
    if (request.method === 'OPTIONS') return client.fulfill(requestId, 204, {});
    if (path === '/sst/support-requests' || path === '/agent/support-requests') return ok(fixture.cases);
    if (path === '/chat/agent-active-map') return ok(fixture.cases.filter(item => item.chat_status).map(item => ({ requestId: item.id, sessionId: 'ui-session', status: item.chat_status })));
    if (/\/chat\/sessions\/.+\/close$/.test(path)) {
      const payload = JSON.parse(request.postData);
      fixture.lastClose = { status: payload.targetRequestStatus, notesLength: payload.notes.length };
      if (fixture.closeBehavior === 'pending') { fixture.held.push(requestId); return; }
      if (fixture.closeBehavior === 'error') return client.fulfill(requestId, 503, { success: false, error: { message: 'Muestra técnica: cierre no confirmado. Reintenta.' } });
      fixture.closed = true;
      return ok({ status: 'cerrada' });
    }
    if (/\/chat\/requests\/.+\/activate$/.test(path)) {
      const item = fixture.cases.find(row => row.id === path.split('/')[3]);
      item.chat_status = 'activa'; item.status = 'En gestion';
      return ok({ session: { id: 'ui-session', requestId: item.id, status: 'activa' }, messages: [] });
    }
    if (path.startsWith('/chat/requests/')) {
      if (fixture.mode === 'loading') { fixture.held.push(requestId); return; }
      if (fixture.mode === 'error') return client.fulfill(requestId, 503, { success: false, error: { message: 'Muestra técnica: historial no disponible. Reintenta.' } });
      const item = fixture.cases.find(row => row.id === path.split('/')[3]);
      return ok({ session: !item?.chat_status ? null : { id: 'ui-session', requestId: item.id, status: fixture.closed || item.chat_status === 'cerrada' ? 'cerrada' : 'activa' }, messages: fixture.mode === 'empty' ? [] : fixture.messages });
    }
    return client.call('Fetch.continueRequest', { requestId });
  };
  client.fixture = fixture;
  await client.call('Fetch.enable', { patterns: [{ urlPattern: '*localhost:3000/api/v1/chat/*' }, { urlPattern: '*localhost:3000/api/v1/sst/support-requests*' }, { urlPattern: '*localhost:3000/api/v1/agent/support-requests*' }] });
  return fixture;
}
