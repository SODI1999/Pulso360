// src/features/auth/pages/ConsentPage.jsx
// Gestión del consentimiento informado del agente y preferencias C1 a C5

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

// Estilos de la vista de consentimiento
import '../../../styles/consentimiento.css';

export function ConsentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const comesFromLogin = searchParams.get('origin') === 'login';

  const currentUser = authService.getCurrentUser();

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
  const [settings, setSettings] = useState({ policyVersion: 'v2.4', policyEffectiveDate: '15/08/2026' });

  // 1. Verificar sesión y rol de agente
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agente') {
      navigate('/login');
      return;
    }

    const data = pulsoStore.get();
    setSettings(data.settings);

    const userConsent = data.consents?.[currentUser.id] || {};
    setConsents({
      c1: Boolean(userConsent.c1),
      c2: Boolean(userConsent.c2),
      c3: Boolean(userConsent.c3),
      c4: Boolean(userConsent.c4),
      c5: Boolean(userConsent.c5)
    });

    setPolicyAccepted(Boolean(userConsent.policyAccepted && userConsent.policyVersion === data.settings.policyVersion));
    loadConsentHistory();
  }, []);

  // 2. Cargar historial inmutable de consentimientos
  const loadConsentHistory = () => {
    if (!currentUser) return;
    const data = pulsoStore.get();
    const rows = (data.consentHistory || []).filter(item => item.userId === currentUser.id);
    setHistory(rows);
  };

  const handleCheckboxChange = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Guardar consentimiento
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!policyAccepted || !currentUser) return;

    const data = pulsoStore.get();

    const updatedRecord = {
      userId: currentUser.id,
      policyAccepted: true,
      policyVersion: data.settings.policyVersion,
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
      target: `Política ${data.settings.policyVersion} · C1-C5`
    });

    loadConsentHistory();
    setStatusMessage('Preferencias actualizadas.');

    setTimeout(() => {
      if (comesFromLogin) {
        navigate('/agente/panel');
      } else {
        setStatusMessage('');
      }
    }, 450);
  };

  const formatBoolean = (val) => (val ? 'Sí' : 'No');

  return (
    <main className="page-container consent-container">
      {!comesFromLogin && (
        <div id="backNav" className="consent-back-nav">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/agente/panel')}>
            <Icon name="arrowLeft" />
            <span>Volver a mi panel</span>
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Política de tratamiento y preferencias (RF-02)</h1>
            <p className="card-subtitle">Política vigente desde {settings.policyEffectiveDate}</p>
          </div>
          <span className="badge badge-ok">{settings.policyVersion}</span>
        </div>

        <div className="alert-banner info">
          <Icon name="info" size={18} />
          <div>
            <strong>Participación voluntaria y libre.</strong> Estos datos son de carácter sensible. No estás obligado a
            autorizar las finalidades C1–C5 y rechazarlas no afecta tu evaluación de desempeño, estabilidad ni condiciones
            laborales.
          </div>
        </div>

        <div className="consent-split-grid">
          {/* Resumen de la Política */}
          <section className="consent-policy-box">
            <h2 className="consent-policy-title">Aviso de privacidad · Resumen normativo</h2>
            <p className="consent-policy-text">Pulso360 recopila únicamente la información asociada con las finalidades que decidas activar voluntariamente. La información individual sensible jamás se comparte con supervisores ni líderes operativos.</p>

            <h3 className="consent-policy-subtitle">Control total del titular</h3>
            <p className="consent-policy-text">Puedes modificar tus preferencias en cualquier momento y ejercer tus derechos de consulta, rectificación, portabilidad y supresión desde el módulo “Mis datos”.</p>

            <h3 className="consent-policy-subtitle">Enfoque estrictamente preventivo</h3>
            <p className="consent-policy-text">Pulso360 no realiza diagnósticos clínicos, no sustituye la Batería oficial de Riesgo Psicosocial y no utiliza información individual para decisiones disciplinarias ni de productividad.</p>
          </section>

          {/* Matriz C1 a C5 */}
          <form id="consentForm" onSubmit={handleSubmit}>
            <div className="consent-item">
              <div className="consent-info">
                <div className="consent-title">C1 · Check-in diario</div>
                <div className="consent-desc">Permite registrar seis ítems de bienestar (energía, carga, recuperación, apoyo, distanciamiento e ineficacia).</div>
                <div className="consent-consequence">Si lo desactivas: no podrás registrar tu check-in diario.</div>
              </div>
              <input
                type="checkbox"
                id="c1"
                className="consent-switch"
                checked={consents.c1}
                onChange={() => handleCheckboxChange('c1')}
                aria-label="Autorizar C1 Check-in diario"
              />
            </div>

            <div className="consent-item">
              <div className="consent-info">
                <div className="consent-title">C2 · Bitácora privada</div>
                <div className="consent-desc">Permite guardar notas de texto libre en tu espacio personal cifrado.</div>
                <div className="consent-consequence">Si lo desactivas: la bitácora se oculta de tu menú.</div>
              </div>
              <input
                type="checkbox"
                id="c2"
                className="consent-switch"
                checked={consents.c2}
                onChange={() => handleCheckboxChange('c2')}
                aria-label="Autorizar C2 Bitácora privada"
              />
            </div>

            <div className="consent-item">
              <div className="consent-info">
                <div className="consent-title">C3 · Procesamiento NLP</div>
                <div className="consent-desc">Permite analizar tus notas de bitácora mediante léxico y reglas explicables.</div>
                <div className="consent-consequence">Si lo desactivas: la bitácora funciona sin análisis orientativo.</div>
              </div>
              <input
                type="checkbox"
                id="c3"
                className="consent-switch"
                checked={consents.c3}
                onChange={() => handleCheckboxChange('c3')}
                aria-label="Autorizar C3 Procesamiento NLP"
              />
            </div>

            <div className="consent-item">
              <div className="consent-info">
                <div className="consent-title">C4 · Métricas agregadas</div>
                <div className="consent-desc">Permite que tus respuestas contribuyan a indicadores colectivos protegidos por el umbral RF-07.</div>
                <div className="consent-consequence">Si lo desactivas: tus respuestas no entran en agregados ni cuentan para N.</div>
              </div>
              <input
                type="checkbox"
                id="c4"
                className="consent-switch"
                checked={consents.c4}
                onChange={() => handleCheckboxChange('c4')}
                aria-label="Autorizar C4 Métricas agregadas"
              />
            </div>

            <div className="consent-item">
              <div className="consent-info">
                <div className="consent-title">C5 · Acompañamiento</div>
                <div className="consent-desc">Habilita el canal voluntario de solicitudes de orientación a SST.</div>
                <div className="consent-consequence">Si lo desactivas: el buzón se deshabilita; la ruta pública sigue disponible.</div>
              </div>
              <input
                type="checkbox"
                id="c5"
                className="consent-switch"
                checked={consents.c5}
                onChange={() => handleCheckboxChange('c5')}
                aria-label="Autorizar C5 Acompañamiento"
              />
            </div>

            <label className="consent-terms-label">
              <input
                type="checkbox"
                id="policyAccepted"
                className="consent-terms-checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
              />
              <span>He leído y acepto la política de tratamiento de datos y el aviso de privacidad de Pulso360.</span>
            </label>

            <button type="submit" className="btn btn-primary consent-submit-btn" disabled={!policyAccepted}>
              <span>Guardar mis preferencias</span>
            </button>

            {statusMessage && (
              <div role="status" className="consent-feedback-msg">
                {statusMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Historial de Consentimientos */}
      <div className="card consent-history-card">
        <div className="card-header">
          <div>
            <div className="card-title">Historial de consentimientos registrados</div>
            <div className="card-subtitle">Trazabilidad inmutable de versiones y finalidades aceptadas/rechazadas por el titular.</div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Versión</th>
                <th>Fecha y Hora</th>
                <th>C1 Check-in</th>
                <th>C2 Bitácora</th>
                <th>C3 NLP</th>
                <th>C4 Agregados</th>
                <th>C5 Acompañamiento</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7">Aún no hay eventos de consentimiento guardados.</td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={item.updatedAt || idx}>
                    <td>{item.policyVersion}</td>
                    <td>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.updatedAt))}</td>
                    <td>{formatBoolean(item.c1)}</td>
                    <td>{formatBoolean(item.c2)}</td>
                    <td>{formatBoolean(item.c3)}</td>
                    <td>{formatBoolean(item.c4)}</td>
                    <td>{formatBoolean(item.c5)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
