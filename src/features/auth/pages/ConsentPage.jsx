// src/features/auth/pages/ConsentPage.jsx
// Gestión del consentimiento informado del agente y preferencias C1 a C5
// Blueprint 0: Documento Editorial Plano y Continuo (Anti-Slop Craft)

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

// Estilos editoriales continuos
import '../../../styles/consentimiento.css';

// Finalidades de tratamiento C1 a C5 con terminología de Contact Center y salud ocupacional
const CONSENT_PURPOSES = [
  {
    key: 'c1',
    code: 'C1',
    title: 'Check-in diario de bienestar',
    desc: 'Permite registrar las seis dimensiones operativas del turno (energía, carga, recuperación, apoyo, distanciamiento e ineficacia) para tu autogestión.',
    consequence: 'No podrás registrar tu pulso diario ni seguir tu evolución en el panel.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c2',
    code: 'C2',
    title: 'Bitácora privada del operador',
    desc: 'Habilita tu libreta personal para consignar notas de desahogo y reflexión en el almacenamiento seguro de tu estación.',
    consequence: 'El módulo de bitácora se oculta de tu navegación y no se admiten nuevas notas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c3',
    code: 'C3',
    title: 'Procesamiento léxico orientativo (NLP)',
    desc: 'Permite que el motor determinista local analice tus notas para orientarte sobre estresores recurrentes, sin envío a servicios externos.',
    consequence: 'La bitácora funcionará como editor básico sin detección de señales.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c4',
    code: 'C4',
    title: 'Métricas agregadas y k-anonimato',
    desc: 'Permite incorporar tus respuestas a las tendencias colectivas, únicamente bajo estricto cumplimiento del umbral de k-anonimato (RF-07).',
    consequence: 'Tus respuestas no computarán en promedios colectivos ni en el cálculo de N.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  },
  {
    key: 'c5',
    code: 'C5',
    title: 'Acompañamiento voluntario y canal SST',
    desc: 'Habilita el buzón confidencial para solicitar orientación preventiva directa al equipo de Seguridad y Salud en el Trabajo.',
    consequence: 'El acceso directo se desactiva en tu menú; las rutas públicas continúan habilitadas.',
    activeLabel: 'Autorizado',
    inactiveLabel: 'Pausado'
  }
];

export function ConsentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const comesFromLogin = searchParams.get('origin') === 'login';

  const currentUser = useMemo(() => authService.getCurrentUser(), []);
  const currentUserId = currentUser?.id;

  // Estados de los consentimientos C1 - C5 y de la política general
  const [consents, setConsents] = useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false
  });
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [history, setHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    policyVersion: 'v2.4',
    policyEffectiveDate: '15/08/2026'
  });

  // Gestión de foco para el modal accesible (R-26 / R-32)
  const lastFocusedElementRef = useRef(null);
  const modalCloseBtnRef = useRef(null);
  const backdropRef = useRef(null);

  // Cargar historial inmutable de consentimientos
  const loadConsentHistory = useCallback(() => {
    if (!currentUserId) return;
    const data = pulsoStore.get();
    const rows = (data.consentHistory || []).filter(item => item.userId === currentUserId);
    setHistory(rows);
  }, [currentUserId]);

  // Verificar sesión y rol de agente
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agente') {
      navigate('/login');
      return;
    }

    const data = pulsoStore.get();
    if (data.settings) {
      setSettings(data.settings);
    }

    const userConsent = data.consents?.[currentUserId] || {};
    setConsents({
      c1: Boolean(userConsent.c1),
      c2: Boolean(userConsent.c2),
      c3: Boolean(userConsent.c3),
      c4: Boolean(userConsent.c4),
      c5: Boolean(userConsent.c5)
    });

    const activePolicyVersion = data.settings?.policyVersion || 'v2.4';
    setPolicyAccepted(Boolean(userConsent.policyAccepted && userConsent.policyVersion === activePolicyVersion));
    loadConsentHistory();
  }, [currentUserId, currentUser, navigate, loadConsentHistory]);

  // Control accesible de tecla Escape en modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        modalCloseBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen]);

  const openModal = () => {
    lastFocusedElementRef.current = document.activeElement;
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      lastFocusedElementRef.current?.focus();
    }, 50);
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      closeModal();
    }
  };

  const handleCheckboxChange = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Guardar consentimiento y registrar evento inmutable
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!policyAccepted || !currentUser) return;

    setIsSaving(true);
    setStatusMessage('');

    const data = pulsoStore.get();
    const activeVersion = data.settings?.policyVersion || settings.policyVersion;

    const updatedRecord = {
      userId: currentUser.id,
      policyAccepted: true,
      policyVersion: activeVersion,
      updatedAt: new Date().toISOString(),
      ...consents
    };

    data.consents = data.consents || {};
    data.consents[currentUser.id] = { ...updatedRecord };
    delete data.consents[currentUser.id].userId;

    data.consentHistory = data.consentHistory || [];
    data.consentHistory.unshift(updatedRecord);

    pulsoStore.save(data);
    pulsoStore.audit({
      actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
      action: 'ACTUALIZACION_CONSENTIMIENTO',
      target: `Política ${activeVersion} · C1-C5`
    });

    loadConsentHistory();

    setTimeout(() => {
      setIsSaving(false);
      setStatusMessage('Preferencias actualizadas en tu estación de trabajo.');

      if (comesFromLogin) {
        setTimeout(() => {
          navigate('/agente/panel');
        }, 500);
      }
    }, 300);
  };

  const activeCount = useMemo(() => {
    return Object.values(consents).filter(Boolean).length;
  }, [consents]);

  const activeCodes = useMemo(() => {
    return CONSENT_PURPOSES.filter((p) => consents[p.key]).map((p) => p.code);
  }, [consents]);

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <main className="page-container consent-editorial-page">
      {/* Retorno sobrio */}
      {!comesFromLogin && (
        <div className="consent-top-nav">
          <button
            type="button"
            className="consent-back-link"
            onClick={() => navigate('/agente/panel')}
          >
            <Icon name="arrowLeft" size={16} />
            <span>Volver al panel</span>
          </button>
        </div>
      )}

      {/* Cabecera editorial plana: sin tarjetas ni cajas */}
      <header className="consent-page-header">
        <h1 className="consent-page-title">Consentimiento informado y preferencias</h1>
        <p className="consent-page-subtitle">
          Decide con plena autonomía qué herramientas de bienestar deseas habilitar en tu estación. Política versión {settings.policyVersion}, vigente desde el {settings.policyEffectiveDate}.
        </p>
      </header>

      {/* Principio de voluntariedad: texto institucional continuo sin franja lateral ni card-itis */}
      <section className="consent-preamble-section" aria-label="Principio de voluntariedad y dignidad laboral">
        <h2 className="consent-preamble-title">Principio de voluntariedad y dignidad laboral</h2>
        <p className="consent-preamble-text">
          La participación en Pulso360 es confidencial y enteramente voluntaria. Los datos recopilados son de carácter sensible y tienen como único propósito la prevención del desgaste laboral en el Contact Center. Ninguna de las finalidades C1 a C5 es obligatoria; activar, pausar o revocar cualquiera de ellas no afecta tu evaluación de desempeño, bonos de campaña, adherencia operativa ni estabilidad contractual.
        </p>
        <button
          type="button"
          className="consent-modal-trigger-link"
          onClick={openModal}
        >
          <span>Consultar garantías normativas completas (Ley 1581)</span>
        </button>
      </section>

      {/* Sección de finalidades C1 a C5: lista continua con divisores hairline */}
      <section className="consent-settings-section" aria-labelledby="purposes-heading">
        <div className="consent-section-intro">
          <h2 id="purposes-heading" className="consent-section-heading">Finalidades de tratamiento</h2>
          <p className="consent-section-caption">
            Activa o desactiva cada funcionalidad de manera independiente según tu criterio personal.
          </p>
        </div>

        <form id="consentForm" onSubmit={handleSubmit}>
          <div className="consent-purposes-flow" role="group" aria-label="Finalidades del consentimiento">
            {CONSENT_PURPOSES.map((item) => {
              const isChecked = consents[item.key];
              return (
                <div key={item.key} className="consent-purpose-row">
                  <div className="consent-purpose-info">
                    <div className="consent-purpose-header-line">
                      <span className="consent-code-tag">{item.code}</span>
                      <h3 id={`title-${item.key}`} className="consent-purpose-heading">{item.title}</h3>
                    </div>
                    <p id={`desc-${item.key}`} className="consent-purpose-description">{item.desc}</p>
                    <p id={`cons-${item.key}`} className="consent-purpose-consequence">
                      <strong className="consent-consequence-prefix">Al pausar:</strong> {item.consequence}
                    </p>
                  </div>

                  <div className="consent-purpose-action">
                    <button
                      type="button"
                      role="switch"
                      id={`switch-${item.key}`}
                      aria-checked={isChecked}
                      aria-labelledby={`title-${item.key}`}
                      aria-describedby={`desc-${item.key} cons-${item.key}`}
                      className={`editorial-switch ${isChecked ? 'is-active' : ''}`}
                      onClick={() => handleCheckboxChange(item.key)}
                    >
                      <span className="editorial-switch-track">
                        <span className="editorial-switch-thumb" />
                      </span>
                      <span className="editorial-switch-text">
                        {isChecked ? item.activeLabel : item.inactiveLabel}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bloque de confirmación y balance sereno */}
          <div className="consent-footer-flow">
            <div className="consent-terms-block">
              <label className="consent-terms-label" htmlFor="policyAccepted">
                <input
                  type="checkbox"
                  id="policyAccepted"
                  className="consent-terms-input"
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                />
                <span className="consent-terms-caption">
                  He leído y comprendo las{' '}
                  <button
                    type="button"
                    className="consent-terms-inline-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openModal();
                    }}
                  >
                    condiciones de la política de tratamiento y garantías de privacidad
                  </button>{' '}
                  de Pulso360.
                </span>
              </label>
            </div>

            {/* Balance textual sereno sin cajas flotantes */}
            <div className="consent-balance-text" role="status" aria-live="polite">
              <p className="consent-balance-stat">
                <strong>Balance:</strong> {activeCount} de 5 finalidades autorizadas.
              </p>
              <p className="consent-balance-sub">
                {activeCount === 0
                  ? 'No has autorizado finalidades opcionales. El sistema operará bajo mínima recolección de datos.'
                  : `Permisos activos: ${activeCodes.join(', ')}. Puedes modificar o revocar estas autorizaciones en cualquier momento.`}
              </p>
            </div>

            {/* Botón de guardado proporcional */}
            <div className="consent-submit-bar">
              <button
                type="submit"
                className="btn btn-primary consent-save-button"
                disabled={!policyAccepted || isSaving}
              >
                {isSaving ? (
                  <>
                    <Icon name="sync" size={16} className="consent-saving-icon" />
                    <span>Guardando preferencias...</span>
                  </>
                ) : (
                  <span>Confirmar y guardar preferencias</span>
                )}
              </button>
            </div>

            {/* Notificación de guardado */}
            {statusMessage && (
              <div role="status" aria-live="polite" className="consent-feedback-toast">
                <Icon name="checkCircle" size={16} />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Historial inmutable: tabla editorial limpia sin caja gigante */}
      <section className="consent-audit-section" aria-labelledby="history-heading">
        <div className="consent-audit-header">
          <div>
            <h2 id="history-heading" className="consent-section-heading">Historial de cambios</h2>
            <p className="consent-section-caption">
              Registro temporal inmutable de cada actualización efectuada por el titular en su estación.
            </p>
          </div>
          <span className="consent-audit-counter">
            {history.length} {history.length === 1 ? 'evento registrado' : 'eventos registrados'}
          </span>
        </div>

        <div
          className="consent-table-container"
          tabIndex={0}
          role="region"
          aria-label="Historial de consentimientos registrados"
        >
          <table className="consent-audit-table">
            <thead>
              <tr>
                <th scope="col">Versión</th>
                <th scope="col">Fecha y hora</th>
                <th scope="col">C1 Check-in</th>
                <th scope="col">C2 Bitácora</th>
                <th scope="col">C3 NLP</th>
                <th scope="col">C4 Agregados</th>
                <th scope="col">C5 Acompañamiento</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="consent-table-empty-cell">
                    Aún no hay registros de consentimiento guardados. Al confirmar tus preferencias, se creará el primer registro fechado aquí.
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={item.updatedAt || idx}>
                    <td className="consent-col-version">{item.policyVersion}</td>
                    <td className="consent-col-date">
                      <time dateTime={item.updatedAt}>{formatDateTime(item.updatedAt)}</time>
                    </td>
                    <td>
                      <span className={`consent-state-tag ${item.c1 ? 'is-active' : 'is-paused'}`}>
                        {item.c1 ? 'Autorizado' : 'Pausado'}
                      </span>
                    </td>
                    <td>
                      <span className={`consent-state-tag ${item.c2 ? 'is-active' : 'is-paused'}`}>
                        {item.c2 ? 'Autorizado' : 'Pausado'}
                      </span>
                    </td>
                    <td>
                      <span className={`consent-state-tag ${item.c3 ? 'is-active' : 'is-paused'}`}>
                        {item.c3 ? 'Autorizado' : 'Pausado'}
                      </span>
                    </td>
                    <td>
                      <span className={`consent-state-tag ${item.c4 ? 'is-active' : 'is-paused'}`}>
                        {item.c4 ? 'Autorizado' : 'Pausado'}
                      </span>
                    </td>
                    <td>
                      <span className={`consent-state-tag ${item.c5 ? 'is-active' : 'is-paused'}`}>
                        {item.c5 ? 'Autorizado' : 'Pausado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal accesible de detalle normativo (Blueprint 3 / C) */}
      {isModalOpen && (
        <div
          className="consent-modal-scrim"
          ref={backdropRef}
          onClick={handleBackdropClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-policy-title"
            aria-describedby="modal-policy-subtitle"
            className="consent-modal-frame"
          >
            <header className="consent-modal-header-strip">
              <div>
                <h2 id="modal-policy-title" className="consent-modal-main-title">
                  Política de tratamiento de datos y garantías normativas
                </h2>
                <p id="modal-policy-subtitle" className="consent-modal-sub-title">
                  Versión {settings.policyVersion} · En vigor desde el {settings.policyEffectiveDate}
                </p>
              </div>
              <button
                type="button"
                className="consent-modal-dismiss-btn"
                onClick={closeModal}
                ref={modalCloseBtnRef}
                aria-label="Cerrar modal de política"
              >
                <Icon name="close" size={18} />
              </button>
            </header>

            <div className="consent-modal-scrollable-body">
              <div className="consent-modal-text-flow">
                <section className="consent-modal-clause">
                  <h3 className="consent-modal-clause-heading">
                    1. Aislamiento de la supervisión y k-anonimato (RF-07)
                  </h3>
                  <p className="consent-modal-clause-text">
                    Tus respuestas individuales, notas de bitácora y estados de fatiga nunca están disponibles para supervisores, monitores de calidad ni coordinadores de cuenta. Las vistas de supervisión únicamente presentan tendencias numéricas colectivas cuando el grupo operativo supera el umbral estricto de k-anonimato (RF-07). Si una campaña o turno cuenta con menos agentes de los requeridos por el umbral, los datos quedan bloqueados automáticamente para impedir deducciones individuales.
                  </p>
                </section>

                <section className="consent-modal-clause">
                  <h3 className="consent-modal-clause-heading">
                    2. Naturaleza preventiva no clínica y riesgo psicosocial
                  </h3>
                  <p className="consent-modal-clause-text">
                    Esta plataforma es un instrumento de autogestión y acompañamiento en el turno de atención. No emite diagnósticos médicos ni psiquiátricos, no evalúa aptitud laboral y no sustituye la aplicación periódica de la Batería oficial de Riesgo Psicosocial exigida por el Ministerio del Trabajo (Resoluciones 2646 de 2008 y 2764 de 2022). Ningún dato individual se utiliza con fines disciplinarios ni de despido.
                  </p>
                </section>

                <section className="consent-modal-clause">
                  <h3 className="consent-modal-clause-heading">
                    3. Procesamiento léxico local, determinista y explicable
                  </h3>
                  <p className="consent-modal-clause-text">
                    Si decides autorizar el análisis en tu bitácora (finalidad C3), el procesamiento se ejecuta mediante un diccionario léxico transparente y local en tu navegador. El texto de tus notas no se transmite a modelos generativos de lenguaje externos ni se entrena con tus reflexiones privadas.
                  </p>
                </section>

                <section className="consent-modal-clause">
                  <h3 className="consent-modal-clause-heading">
                    4. Control permanente, revocatoria inmediata y derechos ARCO
                  </h3>
                  <p className="consent-modal-clause-text">
                    De conformidad con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 de Protección de Datos Personales (Habeas Data), conservas el derecho a conocer, actualizar, rectificar y suprimir tus datos en cualquier momento. La revocatoria de autorizaciones no requiere preaviso ni trámite burocrático; entra en vigencia de inmediato al guardar tus preferencias.
                  </p>
                </section>
              </div>

              <div className="consent-modal-contact-note">
                <Icon name="info" size={16} />
                <span>
                  Para consultas sobre el tratamiento de datos o ejercicio de derechos ARCO, puedes acudir al área de Seguridad y Salud en el Trabajo o utilizar el canal institucional habilitado en la organización.
                </span>
              </div>
            </div>

            <footer className="consent-modal-footer-strip">
              <button
                type="button"
                className="btn btn-primary consent-modal-return-button"
                onClick={closeModal}
              >
                Entendido y volver al formulario
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
