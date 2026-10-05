import { useSupportInbox } from '../hooks/useSupportInbox';

// src/features/sst/pages/SupportInboxPage.jsx
// Buzón confidencial de atención y acompañamiento para SST (RF-10)

import { Icon } from '../../../core/components/Icon';

import '../../../styles/sst.css';

export function SupportInboxPage() {
  const { feedback, storeData, requests, handleAdvanceStatus } = useSupportInbox();

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Buzón de acompañamiento y orientación</h1>
          <p className="page-subtitle">
            Canal reservado para SST en la gestión de solicitudes individuales voluntarias (RF-10).
          </p>
        </div>
      </div>

      {/* Banner de Confidencialidad */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <Icon name="shield" size={20} />
        <div>
          <strong>Privacidad y reserva:</strong> En la modalidad anónima, el flujo no solicita datos de
          contacto y muestra un código de seguimiento. En la modalidad identificada, el detalle de contacto se
          presenta al profesional SST asignado según los controles activos del despliegue.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabla de Casos */}
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
                      <td>{item.requestDate || item.request_date || item.date || (item.createdAt || item.created_at)?.substring(0, 10) || 'Sin fecha'}</td>
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
                              {identityUser || item.userName || 'Agente Registrado'}
                            </strong>
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
    </div>
  );
}
