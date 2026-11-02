import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Muestra las finalidades C1–C5 y el estado normalizado del consentimiento.
 * La ausencia de un permiso no se interpreta como una autorización.
 * @param {object} props Datos del consentimiento y formato de fecha de la página.
 * @param {object|null} props.consent Consentimiento normalizado por consentContract.
 * @param {(date: string) => string} props.formatDate Formato legible de la fecha guardada.
 * @returns {JSX.Element} Resumen de finalidades con consecuencias funcionales desplegables.
 */
export function ConsentSummaryCard({ consent, formatDate }) {
  const [expandedPurpose, setExpandedPurpose] = useState(null);

  const isPolicyCurrent = Boolean(consent?.active);
  const updatedAtFormatted = consent?.updatedAt ? formatDate(consent.updatedAt) : 'Sin fecha registrada';

  const purposes = [
    {
      code: 'C1',
      title: 'Check-in diario de turno',
      icon: 'HeartPulse',
      iconColor: 'var(--c-primario)',
      scopeLabel: 'Registro personal',
      desc: 'Registro voluntario de seis dimensiones sobre cómo vives el turno.',
      impactText: 'Al pausarla, no podrás guardar nuevos check-ins mientras permanezca desactivada.',
      active: isPolicyCurrent && Boolean(consent?.c1_checkin ?? consent?.c1)
    },
    {
      code: 'C2',
      title: 'Bitácora personal y reflexiones',
      icon: 'BookOpen',
      iconColor: 'var(--c-primario)',
      scopeLabel: 'Bitácora de tu cuenta',
      desc: 'Permite guardar reflexiones personales en el servidor, asociadas a tu cuenta.',
      impactText: 'Al pausarla, no podrás crear nuevas notas. Las vistas de supervisión no muestran el texto de la bitácora; el análisis léxico se ejecuta localmente y requiere C3.',
      active: isPolicyCurrent && Boolean(consent?.c2_bitacora ?? consent?.c2)
    },
    {
      code: 'C3',
      title: 'Acompañamiento psicosocial',
      icon: 'HeartHandshake',
      iconColor: 'var(--c-rol-sst)',
      scopeLabel: 'Orientación preventiva',
      desc: 'Autoriza el análisis léxico de la bitácora y las solicitudes de apoyo a SST.',
      impactText: 'Al pausarla, la bitácora queda sin análisis léxico y el canal de apoyo permanece deshabilitado hasta volver a autorizarla.',
      active: isPolicyCurrent && Boolean(consent?.c3_apoyo ?? consent?.c3)
    },
    {
      code: 'C4',
      title: 'Analítica colectiva',
      icon: 'BarChart3',
      iconColor: 'var(--c-info)',
      scopeLabel: 'Agregados protegidos',
      desc: 'Permite incluir tus respuestas autorizadas en tendencias colectivas.',
      impactText: 'El servidor aplica los mínimos de participación vigentes al grupo y período consultados. Al pausarla, tus respuestas no se incluyen en los promedios ni en el recuento de participantes.',
      active: isPolicyCurrent && Boolean(consent?.c4_analitica ?? consent?.c4)
    },
    {
      code: 'C5',
      title: 'Contacto preventivo proactivo',
      icon: 'Bell',
      iconColor: 'var(--c-rol-sst)',
      scopeLabel: 'Contacto SST',
      desc: 'Preferencia de autorización para contactos preventivos de SST.',
      impactText: 'La aplicación guarda esta preferencia; no activa un servicio de contacto automático. Al pausarla, la preferencia queda desactivada. Las solicitudes voluntarias de apoyo dependen de C3.',
      active: isPolicyCurrent && Boolean(consent?.c5_contacto ?? consent?.c5)
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
              <span className={`badge ${isPolicyCurrent ? 'badge-ok' : 'badge-warn'}`}>
                {isPolicyCurrent ? 'Vigente y aceptada' : 'Requiere revisión'}
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
              Puedes revisar, pausar o revocar estas finalidades. Antes de guardar, consulta cómo cambia la disponibilidad de cada herramienta.
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
