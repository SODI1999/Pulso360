import { Icon } from '../../../core/components/Icon';

export function PendingAlertRules({ rules, handleApproveRule }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Aprobación Institucional de Reglas de Alerta</h2>
          <div className="card-subtitle">
            Reglas automáticas propuestas por el equipo de SST pendientes de activación (RF-15).
          </div>
        </div>
      </div>

      {rules.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
          No hay reglas de alertas configuradas en la plataforma.
        </p>
      ) : (
        rules.map((r) => {
          const isPending = r.pendingApproval || !r.active;

          return (
            <div key={r.id} className="rule-approval-card">
              <div>
                <strong>{r.metric}</strong> {r.operator} <strong>{r.value}%</strong> durante {r.persistence}{' '}
                {r.unit} · Ámbito: <em>{r.scope}</em> ({r.severity})
              </div>

              <div>
                {isPending ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleApproveRule(r.id)}
                  >
                    <Icon name="check" size={14} />
                    <span>Aprobar y activar</span>
                  </button>
                ) : (
                  <span className="badge badge-ok">Activa en producción</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
