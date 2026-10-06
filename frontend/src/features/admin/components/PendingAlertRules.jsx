import { ruleScopeLabel } from '../../../core/api/ruleContract';
import { authService } from '../../../core/auth/authService';
import { Icon } from '../../../core/components/Icon';

export function PendingAlertRules({ rules, handleApproveRule }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Aprobación Institucional de Reglas de Alerta</h2>
          <div className="card-subtitle">
            La aprobación permite evaluar la regla en el siguiente cierre, si la evaluación semanal está habilitada y hay datos suficientes.
          </div>
        </div>
      </div>

      {rules.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--c-texto-suave)' }}>
          No hay reglas de alertas configuradas en la plataforma.
        </p>
      ) : (
        rules.map((r) => {
          const isPending = r.pendingApproval;

          return (
            <div key={r.id} className="rule-approval-card">
              <div>
                <strong>{r.metric}</strong> {r.operator} <strong>{r.value}{r.operator?.startsWith('baje') ? '%' : ' / 100'}</strong> durante {r.persistence}{' '}
                {r.unit} · Ámbito: <em>{ruleScopeLabel(r.scope, authService.getCurrentUser()?.scopes)}</em> ({r.severity})
                {r.evaluation_supported === false && <p>Sin evaluación automática: falta una fuente o condición compatible.</p>}
              </div>

              <div>
                {isPending ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleApproveRule(r.id)}
                  >
                    <Icon name="check" size={14} />
                    <span>Aprobar propuesta</span>
                  </button>
                ) : (
                  <span className="badge badge-ok">Aprobada</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
