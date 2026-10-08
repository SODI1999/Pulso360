// frontend/src/features/sst/pages/SupportInboxPage.jsx
// Buzón institucional unificado de Casos Radicados de Acompañamiento SG-SST (RF-10)
// Integra gestión formal de tickets y canales interactivos en tiempo real con Socket.io + PostgreSQL

import { useState } from 'react';
import { useSupportInbox } from '../hooks/useSupportInbox';
import { SstRequestChatDrawer } from '../components/SstRequestChatDrawer';
import { Icon } from '../../../core/components/Icon';
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

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div>
      {/* Cabecera Editorial */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Buzón de Radicados de Acompañamiento SG-SST</h1>
          <p className="page-subtitle">
            Gestión institucional de solicitudes formales de apoyo preventivo y canales interactivos de orientación en vivo (RF-10).
          </p>
        </div>
      </div>

      {/* Banner de Confidencialidad y Cumplimiento Normativo */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="shield" size={20} />
        <div>
          <strong>Privacidad y secreto profesional (Ley 1581 de 2012 / Res. 2646 de 2008):</strong> Los supervisores de operaciones
          NO tienen acceso a este buzón ni a los chats preventivos. En solicitudes anónimas se disocia rigurosamente la identidad,
          y en modalidades identificadas se preserva el consentimiento expreso de acompañamiento ocupacional.
        </div>
      </div>

      {/* Mensaje de feedback */}
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
              Atención preventiva, seguimiento a acuerdos de nivel de servicio (SLA) y chat en vivo por caso.
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

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.code || item.id}</strong>
                      </td>
                      <td>
                        <span className={`badge ${isAnon ? 'badge-neutral' : 'badge-info'}`}>
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
                          <span
                            className="badge badge-neutral"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Icon name="lock" size={12} />
                            <span>Solicitante anónimo (Identidad protegida)</span>
                          </span>
                        ) : (
                          <div>
                            <strong style={{ color: 'var(--c-texto)' }}>
                              {identityUser || item.userName || 'Identidad no disponible'}
                            </strong>
                            <div>
                              {item.contactPreference || 'Sin preferencia'} · {item.timeWindow || 'Sin ventana indicada'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--c-primario)', marginTop: '2px' }}>
                              Uso reservado SST
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${item.urgency === 'alta' ? 'danger' : 'warn'}`}>
                          {item.urgency?.toUpperCase() || 'MEDIA'}
                        </span>
                      </td>
                      <td>{item.sla || '24 h hábiles'}</td>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {/* Botón de Chat Vinculado al Radicado */}
                          {isEnGestion && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedTicketForChat(item)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                              <Icon name="MessagesSquare" size={14} />
                              <span>{item.chatStatus === 'activa' ? 'Atender chat en vivo' : 'Iniciar chat preventivo'}</span>
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
                              <span>Iniciar chat preventivo</span>
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
      {selectedTicketForChat && (
        <SstRequestChatDrawer
          ticket={selectedTicketForChat}
          onClose={() => setSelectedTicketForChat(null)}
          onSessionChanged={() => {
            reload();
          }}
        />
      )}
    </div>
  );
}
