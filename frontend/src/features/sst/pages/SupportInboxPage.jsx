// frontend/src/features/sst/pages/SupportInboxPage.jsx
// Buzón institucional unificado de Casos Radicados de Acompañamiento SG-SST (RF-10)
// Integra gestión formal de tickets y canales interactivos en tiempo real con Socket.io + PostgreSQL

import { useState } from 'react';
import { useSupportInbox } from '../hooks/useSupportInbox';
import { SstRequestChatDrawer } from '../components/SstRequestChatDrawer';
import { Icon } from '../../../core/components/Icon';
import { getSupportUrgency } from '../utils/supportCasePresentation';
import '../../../styles/sst.css';

export function SupportInboxPage() {
  const {
    loading,
    loadError,
    feedback,
    storeData,
    requests,
    handleAdvanceStatus,
    reload
  } = useSupportInbox();

  const [selectedTicketForChat, setSelectedTicketForChat] = useState(null);
  const [chatDrafts, setChatDrafts] = useState({});
  const selectedTicket = requests.find(request => request.id === selectedTicketForChat?.id) || selectedTicketForChat;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Buzón de Radicados de Acompañamiento SG-SST</h1>
            <p className="page-subtitle">
              Revisa solicitudes, responde por radicado y consulta el seguimiento de cada caso.
            </p>
          </div>
        </div>
        <div
          className="supervisor-loading"
          style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--c-texto-suave)' }}
          role="status"
          aria-live="polite"
        >
          <Icon name="refresh" size={24} className="icon-spin" />
          <p style={{ marginTop: 'var(--space-2)' }}>Cargando casos radicados del servidor…</p>
        </div>
      </div>
    );
  }

  if (loadError && requests.length === 0) {
    return (
      <div role="alert">
        <div className="page-header">
          <div>
            <h1 className="page-title">Buzón de Radicados de Acompañamiento SG-SST</h1>
            <p className="page-subtitle">
              Revisa solicitudes, responde por radicado y consulta el seguimiento de cada caso.
            </p>
          </div>
        </div>
        <div
          className="alert-banner danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
        >
          <span>No se pudieron cargar los datos: {loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera Editorial */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Buzón de Radicados de Acompañamiento SG-SST</h1>
          <p className="page-subtitle">
            Revisa solicitudes, responde por radicado y consulta el seguimiento de cada caso.
          </p>
        </div>
      </div>

      {/* Mensaje de feedback */}
      {loadError && (
        <div className="alert-banner danger sst-inbox-refresh-error" role="alert">
          <span>No se pudo actualizar el buzón: {loadError}. Los casos cargados siguen disponibles.</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>Reintentar actualización</button>
        </div>
      )}
      {feedback && (
        <div
          className={`alert-banner ${feedback.startsWith('Error') ? 'danger' : 'ok'}`}
          role={feedback.startsWith('Error') ? 'alert' : 'status'}
          style={{ marginBottom: 'var(--space-5)' }}
        >
          <Icon name={feedback.startsWith('Error') ? 'alertTriangle' : 'checkCircle'} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabla Canónica de Casos Radicados */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Casos radicados en la organización</h2>
            <p className="card-subtitle">
              Consulta el estado y el canal de conversación de cada solicitud.
            </p>
          </div>
          <span className="badge badge-info">{requests.length} radicados</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código / Radicado</th>
                <th>Modalidad</th>
                <th>Fecha de Registro</th>
                <th>Motivo</th>
                <th>Titular / Contacto</th>
                <th>Urgencia</th>
                <th>SLA / Plazo</th>
                <th>Estado</th>
                <th>Acciones / Chat</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--c-texto-suave)' }}
                  >
                    No hay solicitudes de acompañamiento registradas en este momento.
                  </td>
                </tr>
              ) : (
                requests.map((item) => {
                  const isAnon = item.mode === 'anonimo';
                  const identityUser =
                    !isAnon && item.identityUserId
                      ? storeData?.users?.find((u) => u.id === item.identityUserId)?.name
                      : null;

                  const isEnGestion = item.status === 'En gestion';
                  const isRecibida = item.status === 'Recibida';
                  const isClosed = item.status === 'Cerrada';
                  const urgency = getSupportUrgency(item.urgency || item.severity);

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.code || item.id}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--c-texto-suave)', fontSize: '12.5px', fontWeight: '500' }}>
                          {isAnon ? 'Anónimo' : 'Identificado'}
                        </span>
                      </td>
                      <td>
                        {item.date ||
                          (item.requestDate || item.request_date || item.createdAt || item.created_at)?.substring(0, 10) ||
                          'Sin fecha'}
                      </td>
                      <td>
                        <strong>{item.reason}</strong>
                      </td>
                      <td>
                        {isAnon ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--c-texto-suave)', fontSize: '12px' }}>
                            <Icon name="lock" size={13} />
                            <span>Identidad protegida</span>
                          </span>
                        ) : (
                          <div>
                            <strong style={{ color: 'var(--c-texto)' }}>
                              {identityUser || item.userName || 'Identidad no disponible'}
                            </strong>
                            <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>
                              {item.contactPreference || 'Sin preferencia'} · {item.timeWindow || 'Sin ventana indicada'}
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`sst-context-badge urgency-${urgency.tone}`}>
                          {urgency.label}
                        </span>
                      </td>
                      <td>{item.sla || 'Sin plazo registrado'}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            item.status === 'Cerrada'
                              ? 'muted'
                              : item.status === 'Atendida'
                              ? 'ok'
                              : item.status === 'En gestion'
                              ? 'warn'
                              : 'info'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Botón de Chat Vinculado al Radicado */}
                          {isEnGestion && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedTicketForChat(item)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                              <Icon name="MessagesSquare" size={14} />
                              <span>{item.chatStatus === 'activa' ? 'Abrir conversación' : 'Revisar canal de apoyo'}</span>
                            </button>
                          )}

                          {isRecibida && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedTicketForChat(item)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                              <Icon name="MessagesSquare" size={14} />
                              <span>Revisar canal de apoyo</span>
                            </button>
                          )}

                          {(isClosed || item.status === 'Atendida') && (
                            item.chatStatus ? (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedTicketForChat(item)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                              >
                                <Icon name="MessagesSquare" size={14} />
                                <span>Ver historial de chat</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '11.5px', color: 'var(--c-texto-mutado)' }}>
                                Sin chat previo
                              </span>
                            )
                          )}

                          {/* Avance de Estado de Flujo */}
                          {!isClosed && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAdvanceStatus(item.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                              <Icon name="arrowRight" size={14} />
                              <span>Avanzar estado</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Lateral de Chat Preventivo para el Radicado Seleccionado */}
      {selectedTicket && (
        <SstRequestChatDrawer
          key={selectedTicket.id}
          ticket={selectedTicket}
          inputText={chatDrafts[selectedTicket.id] || ''}
          setInputText={update => setChatDrafts(previous => ({
            ...previous,
            [selectedTicket.id]: typeof update === 'function'
              ? update(previous[selectedTicket.id] || '') : update
          }))}
          onClose={() => setSelectedTicketForChat(null)}
          onSessionChanged={() => {
            reload();
          }}
        />
      )}
    </div>
  );
}
