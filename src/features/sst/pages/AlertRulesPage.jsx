// src/features/sst/pages/AlertRulesPage.jsx
// Configuración, simulación y propuesta de reglas de alertas tempranas (RF-08)

import { useState, useMemo } from 'react';
import { authService } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { RuleFormCard } from '../components/RuleFormCard';

import '../../../styles/sst.css';

export function AlertRulesPage() {
  const user = authService.getCurrentUser();
  const [version, setVersion] = useState(0);
  const [feedback, setFeedback] = useState('');

  const rules = useMemo(() => {
    return pulsoStore.get().rules || [];
  }, [version]);

  const handleSaveRule = (newRule) => {
    const storeData = pulsoStore.get();
    storeData.rules = storeData.rules || [];
    storeData.rules.unshift(newRule);
    pulsoStore.save(storeData);

    // Registro inmutable de auditoría (RF-08)
    pulsoStore.audit({
      actor: `${user?.name || 'Profesional SST'} (${user?.role || 'sst'})`,
      action: 'PROPUESTA_REGLA_ALERTA',
      target: newRule.sentence || `${newRule.metric} ${newRule.operator} ${newRule.value}%`
    });

    setFeedback(`Regla propuesta con éxito. Quedó registrada con estado "Pendiente de aprobación" para autorización administrativa.`);
    setVersion(v => v + 1);
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración de reglas preventivas</h1>
          <p className="page-subtitle">
            SST propone umbrales y condiciones estadísticas; la activación oficial requiere autorización administrativa (RF-08).
          </p>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="alert-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <Icon name="info" size={20} />
        <div>
          <strong>Gobernanza de Reglas:</strong> La separación de funciones asegura que ninguna regla se active unilateralmente. SST simula y propone; el Administrador autoriza tras verificar la pertinencia institucional.
        </div>
      </div>

      {/* Mensaje de feedback */}
      {feedback && (
        <div className="alert-banner ok" role="status" style={{ marginBottom: 'var(--space-5)' }}>
          <Icon name="checkCircle" size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Layout en dos columnas: Formulario y Catálogo */}
      <div className="rule-grid-layout">
        <RuleFormCard onSaveRule={handleSaveRule} />

        {/* Catálogo de reglas vigentes y propuestas */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Catálogo de reglas vigentes y propuestas</h2>
              <p className="card-subtitle">Reglas configuradas para el monitoreo preventivo de la organización.</p>
            </div>
            <span className="badge badge-info">{rules.length} reglas</span>
          </div>

          <div style={{ marginTop: 'var(--space-2)' }}>
            {rules.length === 0 ? (
              <p style={{ color: 'var(--c-texto-suave)', fontSize: '13.5px' }}>No hay reglas registradas.</p>
            ) : (
              rules.map(rule => (
                <div key={rule.id} className="rule-list-item">
                  <div className="rule-list-info">
                    <div className="rule-list-title">
                      <strong>{rule.metric}</strong> {rule.operator} {rule.value}%
                    </div>
                    <div className="rule-list-meta">
                      Persistencia: {rule.persistence} {rule.unit || 'semanas'} · Ámbito: {rule.scope} · Severidad: {rule.severity}
                    </div>
                  </div>
                  <span className={`badge ${rule.active ? 'badge-ok' : 'badge-warn'}`}>
                    {rule.active ? 'Activa' : 'Pendiente de aprobación'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
