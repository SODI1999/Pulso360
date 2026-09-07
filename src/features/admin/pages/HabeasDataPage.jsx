// src/features/admin/pages/HabeasDataPage.jsx
// Módulo de Gestión Administrativa de Solicitudes Habeas Data (RF-14 / Ley 1581)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { HabeasAdvanceModal } from '../components/HabeasAdvanceModal';

import '../../../styles/admin.css';

const STATUS_WORKFLOW = ['Recibida', 'En trámite', 'Respondida', 'Cerrada'];

export function HabeasDataPage() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [advanceModalState, setAdvanceModalState] = useState({
    isOpen: false,
    request: null,
    nextStatus: ''
  });

  const storeData = useMemo(() => pulsoStore.get(), [version]);
  const requests = storeData.habeasRequests || [];
  const users = storeData.users || [];

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Formatear fechas
  const formatDate = (value) => {
    if (!value) return '—';
    const dateStr = value.includes('T') ? value : `${value}T12:00:00`;
    try {
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(dateStr));
    } catch {
      return value;
    }
  };

  // Abrir modal para avanzar
  const handleOpenAdvance = (request) => {
    const currentIndex = STATUS_WORKFLOW.indexOf(request.status);
    if (currentIndex >= 0 && currentIndex < STATUS_WORKFLOW.length - 1) {
      const nextStatus = STATUS_WORKFLOW[currentIndex + 1];
      setAdvanceModalState({
        isOpen: true,
        request,
        nextStatus
      });
    }
  };

  // Confirmar avance
  const handleConfirmAdvance = ({ requestId, nextStatus, note }) => {
    const data = pulsoStore.get();
    const req = (data.habeasRequests || []).find((item) => item.id === requestId);
    if (!req) return;

    req.status = nextStatus;
    if (note) req.note = note;

    pulsoStore.save(data);

    pulsoStore.audit({
      actor: actorLabel,
      action: 'GESTION_HABEAS_DATA',
      target: `${req.id} (${req.type}) -> Estado: ${nextStatus} · Constancia: ${note || 'Sin nota'}`
    });

    setFeedback(`Radicado ${req.id} actualizado exitosamente al estado "${nextStatus}".`);
    setAdvanceModalState({ isOpen: false, request: null, nextStatus: '' });
    setVersion((v) => v + 1);
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandeja de solicitudes de titulares</h1>
          <p className="page-subtitle">
            Atención de derechos de consulta, rectificación, portabilidad y supresión con trazabilidad administrativa (RF-14 / Ley 1581).
          </p>
        </div>
      </div>

      {/* Banner de Plazos Normativos */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-5)' }}>
        <Icon name="info" size={18} />
        <div>
          <strong>Cálculo de Plazos Legales:</strong> La fecha objetivo se calcula en días hábiles institucionales. La gestión de solicitudes de portabilidad y rectificación no altera bitácoras históricas selladas, preservando la inmutabilidad de la cadena de auditoría.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-4)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tarjeta con Tabla de Solicitudes */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Solicitudes radicadas</h2>
            <div className="card-subtitle">Control de términos, estados de atención y constancias administrativas.</div>
          </div>
          <span className="badge badge-info">Toda transición queda auditada</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Radicado</th>
                <th>Titular</th>
                <th>Tipo de Solicitud</th>
                <th>Fecha Radicación</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
                <th>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
                    No hay solicitudes de Habeas Data radicadas en el sistema.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const targetUser = users.find((u) => u.id === r.userId);
                  const currentIndex = STATUS_WORKFLOW.indexOf(r.status);
                  const canAdvance = currentIndex >= 0 && currentIndex < STATUS_WORKFLOW.length - 1;

                  // Verificación de vencimiento
                  const dueDate = r.deadline ? new Date(`${r.deadline}T23:59:59`) : null;
                  const isOverdue = dueDate && dueDate.getTime() < Date.now() && !['Respondida', 'Cerrada'].includes(r.status);

                  let statusBadgeClass = 'badge-info';
                  if (r.status === 'Cerrada') statusBadgeClass = 'badge-ok';
                  else if (r.status === 'Recibida') statusBadgeClass = 'badge-warn';
                  else if (r.status === 'Respondida') statusBadgeClass = 'badge-ok';

                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="audit-code-cell">{r.id}</span>
                        {r.note && (
                          <div className="habeas-note-box">
                            <strong>Nota:</strong> {r.note}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{targetUser?.name || r.userId}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--c-texto-suave)' }}>{r.userId}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{r.type}</span>
                      </td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td>
                        {formatDate(r.deadline)}{' '}
                        {isOverdue && <span className="badge badge-danger">Vencida</span>}
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass}`}>{r.status}</span>
                      </td>
                      <td>
                        {canAdvance ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenAdvance(r)}
                          >
                            <Icon name="arrowRight" size={14} />
                            <span>Avanzar</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)' }}>
                            Trámite finalizado
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

      {/* Modal de Avance */}
      <HabeasAdvanceModal
        isOpen={advanceModalState.isOpen}
        request={advanceModalState.request}
        nextStatus={advanceModalState.nextStatus}
        onClose={() => setAdvanceModalState({ isOpen: false, request: null, nextStatus: '' })}
        onConfirm={handleConfirmAdvance}
      />
    </div>
  );
}
