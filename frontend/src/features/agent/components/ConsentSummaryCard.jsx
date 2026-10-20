import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Inspector Estructurado de Consentimientos y Finalidades Legales (C1–C5).
 * Organizado como un registro formal de gobernanza y control de finalidades bajo Habeas Data
 * (Ley 1581 de 2012 y Decreto 1377 de 2013 de Colombia).
 * Cumple con accesibilidad WAI-ARIA (acordeón semántico sin controles anidados) y
 * garantiza alineación vertical estricta a la derecha para estados y controles.
 */
export function ConsentSummaryCard({ consent, formatDate }) {
  const [expandedPurpose, setExpandedPurpose] = useState(null);

  const isPolicyAccepted = Boolean(consent?.policyAccepted);
  const updatedAtFormatted = consent?.updatedAt ? formatDate(consent.updatedAt) : 'Sin fecha registrada';

  const purposes = [
    {
      code: 'C1',
      title: 'Check-in diario de turno',
      icon: 'HeartPulse',
      iconColor: 'var(--c-primario)',
      scopeLabel: 'Registro Somático',
      desc: 'Monitoreo preventivo de energía y fatiga al cierre de tu jornada operativa.',
      impactText: 'Si se revoca, no se solicitará tu autoevaluación al salir del turno, pero no registrarás tu histórico de vitalidad.',
      active: Boolean(consent?.c1_checkin ?? true)
    },
    {
      code: 'C2',
      title: 'Bitácora personal y reflexiones',
      icon: 'BookOpen',
      iconColor: '#0d9488',
      scopeLabel: 'Local en Estación',
      desc: 'Espacio de desahogo privado con análisis léxico ejecutado 100% en tu navegador.',
      impactText: 'Tus notas no se guardan en el servidor y ningún líder ni supervisor tiene acceso a los textos escritos.',
      active: Boolean(consent?.c2_bitacora ?? true)
    },
    {
      code: 'C3',
      title: 'Acompañamiento psicosocial',
      icon: 'HeartHandshake',
      iconTone: '#8b5cf6',
      scopeLabel: 'Canal Reservado',
      desc: 'Canal directo para solicitar pausas asistidas o contacto con profesionales de SST.',
      impactText: 'Permite que el equipo de bienestar te contacte de forma confidencial si solicitas orientación.',
      active: Boolean(consent?.c3_apoyo ?? true)
    },
    {
      code: 'C4',
      title: 'Analítica colectiva (k ≥ 5)',
      icon: 'BarChart3',
      iconColor: 'var(--c-info)',
      scopeLabel: 'Anonimato Grupal',
      desc: 'Aportar a las tendencias de ergonomía del equipo sin vincular tu nombre ni tu ID.',
      impactText: 'Tus datos solo se promedian si hay 5 o más agentes en el turno. Nunca se asocian a tu desempeño o AHT.',
      active: Boolean(consent?.c4_analitica ?? true)
    },
    {
      code: 'C5',
      title: 'Notificaciones en estación',
      icon: 'Bell',
      iconColor: '#f59e0b',
      scopeLabel: 'Avisos en Pantalla',
      desc: 'Recordatorios amables para pausas activas, estiramientos y ergonomía visual.',
      impactText: 'Si se revoca, tu estación no mostrará avisos sonoros o emergentes de pausas preventivas.',
      active: Boolean(consent?.c5_contacto ?? true)
    }
  ];

  const activeCount = purposes.filter((p) => p.active).length;

  const toggleExpand = (code) => {
    setExpandedPurpose((prev) => (prev === code ? null : code));
  };

  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            Consentimientos y Finalidades Autorizadas
          </h2>
          <p className="card-subtitle">
            Marco de consentimiento informado bajo la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
          </p>
        </div>
      </div>

      <div className="consent-inspector-layout">
        {/* Columna Izquierda: Panel de Control y Resumen de Garantías */}
        <div className="consent-inspector-summary">
          <div className="consent-coverage-box">
            <span className="consent-coverage-label">Finalidades autorizadas</span>
            <div className="consent-coverage-value">
              <span className="consent-coverage-number">{activeCount}</span>
              <span className="consent-coverage-total">/ 5 activas</span>
            </div>
            <div className="consent-coverage-bar" role="progressbar" aria-valuenow={activeCount} aria-valuemin={0} aria-valuemax={5}>
              <div
                className="consent-coverage-bar-fill"
                style={{ width: `${(activeCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="consent-status-meta">
            <div className="consent-meta-row">
              <span className="consent-meta-label">Estado de la política:</span>
              <span className={`badge ${isPolicyAccepted ? 'badge-ok' : 'badge-warn'}`}>
                {isPolicyAccepted ? 'Vigente y Aceptada' : 'Aceptación Pendiente'}
              </span>
            </div>
            <div className="consent-meta-row">
              <span className="consent-meta-label">Última actualización:</span>
              <span className="consent-meta-val">{updatedAtFormatted}</span>
            </div>
          </div>

          <div className="consent-guarantee-note">
            <Icon name="ShieldCheck" size={15} style={{ color: 'var(--c-primario)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--c-texto-suave)', lineHeight: 1.45 }}>
              En Colombia, puedes revocar cualquiera de estas finalidades en cualquier momento. <strong>La revocación no genera consecuencias laborales ni disciplinarias.</strong>
            </p>
          </div>

          <Link
            to="/consentimiento"
            className="btn btn-secondary btn-sm consent-action-btn"
            aria-label="Ir a la página de modificación de consentimientos"
          >
            <Icon name="Pencil" size={14} />
            <span>Modificar mis preferencias</span>
          </Link>
        </div>

        {/* Columna Derecha: Registro Unificado de Finalidades C1 a C5 */}
        <div className="consent-inspector-table">
          <div className="consent-table-header">
            <span className="consent-table-col-purpose">Finalidad y Alcance Técnico</span>
            <span className="consent-table-col-status">Estado y Opciones</span>
          </div>

          <div className="consent-table-body">
            {purposes.map((p) => {
              const isExpanded = expandedPurpose === p.code;

              return (
                <div
                  key={p.code}
                  className={`consent-purpose-row ${p.active ? 'is-active' : 'is-revoked'} ${isExpanded ? 'is-expanded' : ''}`}
                >
                  <button
                    type="button"
                    className="consent-row-main-btn"
                    onClick={() => toggleExpand(p.code)}
                    aria-expanded={isExpanded}
                    aria-controls={`consent-impact-${p.code}`}
                  >
                    <div className="consent-row-left">
                      <span className="consent-code-badge">{p.code}</span>
                      <div className="consent-row-info">
                        <div className="consent-row-title-line">
                          <strong className="consent-row-title">{p.title}</strong>
                          <span className="consent-scope-tag">{p.scopeLabel}</span>
                        </div>
                        <p className="consent-row-desc">{p.desc}</p>
                      </div>
                    </div>

                    <div className="consent-row-right">
                      <span className={`badge ${p.active ? 'badge-ok' : 'badge-neutral'} consent-status-badge`}>
                        <Icon name={p.active ? 'Check' : 'Info'} size={12} />
                        <span>{p.active ? 'Autorizada' : 'Revocada'}</span>
                      </span>

                      <span className="consent-expand-indicator" aria-hidden="true">
                        <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div id={`consent-impact-${p.code}`} className="consent-row-impact-box">
                      <div className="consent-impact-content">
                        <Icon name="Info" size={13} style={{ color: 'var(--c-primario)', flexShrink: 0, marginTop: '2px' }} />
                        <span className="consent-impact-text">{p.impactText}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
