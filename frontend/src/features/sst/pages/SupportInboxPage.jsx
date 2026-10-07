import { useState } from 'react';
import { useSupportInbox } from '../hooks/useSupportInbox';
import { SstLiveChatConsole } from '../components/SstLiveChatConsole';
import { Icon } from '../../../core/components/Icon';

import '../../../styles/sst.css';

export function SupportInboxPage() {
  const {
    loading, loadError, feedback, storeData, requests, handleAdvanceStatus } = useSupportInbox();
  const [activeTab, setActiveTab] = useState('live-chat');

  if (loading) return <p role="status">Cargando datos del servidor…</p>;
  if (loadError) return <p className="alert-banner danger" role="alert">No se pudieron cargar los datos: {loadError}</p>;

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Buzón y Orientación de Acompañamiento</h1>
          <p className="page-subtitle">
            Canal confidencial para SST: orientación inmediata en vivo (WebSockets) y gestión de casos formalmente radicados (RF-10).
          </p>
        </div>
      </div>

      {/* Banner de Confidencialidad */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="shield" size={20} />
        <div>
          <strong>Privacidad y secreto profesional (Ley 1581 / Res. 2646):</strong> Los supervisores de operaciones NO tienen acceso a este buzón ni a las conversaciones de chat. En la modalidad anónima se reserva la identidad y en la modalidad identificada se atienden solicitudes con consentimiento expreso.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className={`alert-banner ${feedback.startsWith("Error") ? "danger" : "ok"}`} role={feedback.startsWith("Error") ? "alert" : "status"} style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name={feedback.startsWith("Error") ? "alertTriangle" : "checkCircle"} size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Selector de Pestañas */}
      <div
        role="tablist"
        aria-label="Vistas del canal de acompañamiento"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-5)',
          borderBottom: '1px solid var(--c-borde-suave)',
          paddingBottom: 'var(--space-2)'
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'live-chat'}
          onClick={() => setActiveTab('live-chat')}
          className={`btn ${activeTab === 'live-chat' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Icon name="Headphones" size={16} />
          <span>Atención en Vivo (Chat en Tiempo Real)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tickets'}
          onClick={() => setActiveTab('tickets')}
          className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Icon name="FileText" size={16} />
          <span>Casos Radicados Formales ({requests.length})</span>
        </button>
      </div>

      {/* Vista 1: Consola de Chat en Vivo */}
      {activeTab === 'live-chat' && <SstLiveChatConsole />}

      {/* Vista 2: Tabla de Casos Radicados */}
      {activeTab === 'tickets' && (
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Casos radicados en la organización</h2>
            <p className="card-subtitle">Seguimiento oportuno según acuerdos de nivel de servicio (SLA).</p>
          </div>
          <span className="badge badge-info">{requests.length} casos</span>
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
                <th>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--c-texto-suave)' }}
                  >
                    No hay solicitudes de acompañamiento pendientes.
                  </td>
                </tr>
              ) : (
                requests.map((item) => {
                  const isAnon = item.mode === 'anonimo';
                  const identityUser =
                    !isAnon && item.identityUserId
                      ? storeData.users.find((u) => u.id === item.identityUserId)?.name
                      : null;

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
                      <td>{item.date || (item.requestDate || item.request_date || item.createdAt || item.created_at)?.substring(0, 10) || 'Sin fecha'}</td>
                      <td>{item.reason}</td>
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
                            <div>{item.contactPreference || 'Sin preferencia'} · {item.timeWindow || 'Sin ventana indicada'}</div>
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
                          className={`badge badge-${item.status === 'Cerrada' ? 'muted' : item.status === 'Atendida' ? 'ok' : 'info'}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status !== 'Cerrada' ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAdvanceStatus(item.id)}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            <Icon name="arrowRight" size={14} />
                            <span>Avanzar estado</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--c-texto-mutado)' }}>
                            Caso cerrado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
