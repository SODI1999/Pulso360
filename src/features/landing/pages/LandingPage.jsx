// src/features/landing/pages/LandingPage.jsx
// Página de Bienvenida y Presentación Institucional con Demostración Interactiva (Hito 7)

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, roleHomePaths } from '../../../core/auth/authService';
import { Icon } from '../../../core/components/Icon';

const ROLE_DETAILS = {
  agente: {
    label: 'Agente de Contact Center',
    demoEmail: 'agente@demo',
    desc: 'Espacio privado para expresar tu percepción diaria de jornada y llevar una bitácora protegida.',
    badge: 'role-agente'
  },
  supervisor: {
    label: 'Supervisor de Operaciones',
    demoEmail: 'supervisor@demo',
    desc: 'Monitoreo colectivo de tendencias y planes de acción con k-anonimato estricto (N ≥ 5).',
    badge: 'role-supervisor'
  },
  sst: {
    label: 'Profesional SST',
    demoEmail: 'sst@demo',
    desc: 'Vigilancia epidemiológica, alertas tempranas, mapa de calor y formulación de intervenciones preventivas.',
    badge: 'role-sst'
  },
  auditor: {
    label: 'Auditor Interno',
    demoEmail: 'auditor@demo',
    desc: 'Supervisión de cadena inmutable de auditoría, trazabilidad criptográfica y verificación de integridad.',
    badge: 'role-auditor'
  },
  admin: {
    label: 'Administrador del Sistema',
    demoEmail: 'admin@demo',
    desc: 'Gobernanza institucional, gestión de campañas/equipos, roles RBAC y tramitación de Habeas Data.',
    badge: 'role-admin'
  }
};

export function LandingPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Estados del encabezado y menú móvil
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados de la encuesta demo en el Hero
  const [surveySelected, setSurveySelected] = useState(null);
  const [surveyFeedback, setSurveyFeedback] = useState('Selecciona una opción para probar la encuesta.');
  const [surveyAnswered, setSurveyAnswered] = useState(false);

  // Estados del formulario interactivo de bienvenida
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [welcomeCard, setWelcomeCard] = useState(null);

  // Efecto de scroll para el header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejo de la encuesta interactiva demo
  const handleSurveyOption = (val, label) => {
    setSurveySelected(val);
    setSurveyAnswered(true);
    setSurveyFeedback(
      `Seleccionaste ${val} de 5: energía ${label.toLowerCase()}. En la encuesta completa continuarías con carga, recuperación, apoyo, distanciamiento e ineficacia.`
    );
  };

  const handleSurveySkip = () => {
    setSurveySelected('skip');
    setSurveyAnswered(true);
    setSurveyFeedback(
      'Elegiste no responder en esta ocasión. Pulso360 respeta tu decisión y no penaliza la omisión de preguntas.'
    );
  };

  // Manejo del formulario de bienvenida interactiva
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Por favor escribe tu nombre.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Escribe un correo electrónico válido.';
    }

    if (!formData.role) {
      errors.role = 'Selecciona un rol de interés.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setWelcomeCard(null);
      return;
    }

    setFormErrors({});
    const roleInfo = ROLE_DETAILS[formData.role];

    setWelcomeCard({
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      roleInfo,
      message: formData.message.trim()
    });
  };

  // Acceso directo con cuenta demo desde la tarjeta generada
  const handleQuickLogin = async (demoEmail) => {
    try {
      await authService.login(demoEmail, '123456');
      const user = authService.getCurrentUser();
      if (user) {
        navigate(roleHomePaths[user.role] || '/login');
      }
    } catch {
      navigate('/login');
    }
  };

  return (
    <div>
      <a className="skip-link" href="#contenido">Saltar al contenido principal</a>

      {/* Header Institucional */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`} id="header">
        <div className="landing-container header-inner">
          <a className="brand" href="#inicio" aria-label="Pulso360, volver al inicio">
            <img className="brand-logo" src="/assets/imágenes/logo.png" alt="" />
            <span className="brand-name">Pulso360</span>
            <span className="brand-context">Bienestar laboral</span>
          </a>

          <nav className="primary-nav" aria-label="Navegación principal">
            <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="navMenu">
              <li><a className="nav-link" href="#inicio" onClick={() => setIsMenuOpen(false)}>Inicio</a></li>
              <li><a className="nav-link" href="#problema" onClick={() => setIsMenuOpen(false)}>El problema</a></li>
              <li><a className="nav-link" href="#como-funciona" onClick={() => setIsMenuOpen(false)}>Cómo funciona</a></li>
              <li><a className="nav-link" href="#funcionalidades" onClick={() => setIsMenuOpen(false)}>Funcionalidades</a></li>
              <li><a className="nav-link" href="#interaccion" onClick={() => setIsMenuOpen(false)}>Prueba interactiva</a></li>
              <li>
                <Link className="nav-link nav-link-mobile-cta" to={currentUser ? roleHomePaths[currentUser.role] : '/login'} onClick={() => setIsMenuOpen(false)}>
                  {currentUser ? 'Ir a mi Panel' : 'Ver plataforma'}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <Link className="header-login" to={currentUser ? roleHomePaths[currentUser.role] : '/login'}>
              {currentUser ? 'Ir a mi Panel' : 'Ver plataforma'}
            </Link>
            <button
              className="mobile-toggle"
              id="mobileToggleBtn"
              type="button"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="contenido">
        {/* Hero Section */}
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero-pattern" aria-hidden="true"></div>
          <div className="landing-container hero-layout">
            <div className="hero-copy">
              <h1 id="hero-title">
                <strong>Pulso360</strong> ayuda a detectar señales de desgaste laboral antes de que se conviertan en una crisis.
              </h1>
              <p className="hero-lead">
                Los agentes responden seis preguntas breves sobre su jornada. Pulso360 mantiene cada respuesta en privado y muestra a Seguridad y Salud en el Trabajo únicamente tendencias colectivas para orientar acciones de prevención.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#encuesta-demo">
                  Probar encuesta
                </a>
                <Link className="button button-secondary" to="/login">
                  Abrir plataforma
                </Link>
              </div>

              <dl className="hero-facts" aria-label="Resumen de Pulso360">
                <div>
                  <dt>6</dt>
                  <dd>preguntas por jornada</dd>
                </div>
                <div>
                  <dt>1 min</dt>
                  <dd>para responder</dd>
                </div>
                <div>
                  <dt>Privado</dt>
                  <dd>para cada agente</dd>
                </div>
              </dl>
            </div>

            {/* Simulador Interactivo de Encuesta */}
            <div className="survey-showcase" id="encuesta-demo">
              <div className="survey-window">
                <header className="survey-header">
                  <div>
                    <span className="survey-app-label">Así lo usa un agente</span>
                    <strong>Encuesta diaria de bienestar</strong>
                  </div>
                  <span className="survey-duration">1 minuto</span>
                </header>

                <div className="survey-progress" aria-label="Pregunta 1 de 6">
                  <div className="survey-progress-copy">
                    <strong>Pregunta 1 de 6</strong>
                    <span>Energía</span>
                  </div>
                  <div className="survey-progress-track">
                    <span style={{ width: '16.6%' }}></span>
                  </div>
                </div>

                <div className="survey-question">
                  <p>¿Cómo sientes tu energía al terminar la jornada?</p>
                  <div className="survey-scale" role="group" aria-label="Selecciona un nivel de energía">
                    {[
                      { val: 1, label: 'Muy baja' },
                      { val: 2, label: 'Baja' },
                      { val: 3, label: 'Media' },
                      { val: 4, label: 'Alta' },
                      { val: 5, label: 'Muy alta' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`survey-option ${surveySelected === opt.val ? 'selected' : ''}`}
                        aria-pressed={surveySelected === opt.val}
                        onClick={() => handleSurveyOption(opt.val, opt.label)}
                      >
                        <strong>{opt.val}</strong>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className={`survey-skip ${surveySelected === 'skip' ? 'selected' : ''}`}
                    type="button"
                    onClick={handleSurveySkip}
                  >
                    Prefiero no responder
                  </button>
                </div>

                <div className={`survey-feedback ${surveyAnswered ? 'answered' : ''}`} aria-live="polite">
                  {surveyFeedback}
                </div>

                <footer className="survey-footer">
                  <span className="privacy-icon" aria-hidden="true"><Icon name="check" size={14} /></span>
                  <p><strong>Tu respuesta individual es privada.</strong> Ningún supervisor puede verla.</p>
                  <Link to="/login">Ver encuesta completa</Link>
                </footer>
              </div>

              <div className="survey-caption">
                <span>Lo que responde el agente</span>
                <strong>se transforma en una tendencia colectiva, nunca en una evaluación personal.</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Resumen del Funcionamiento */}
        <section className="journey-summary" aria-label="Resumen del funcionamiento de Pulso360">
          <div className="landing-container journey-summary-grid">
            <article>
              <span>1</span>
              <div>
                <strong>El agente responde</strong>
                <p>Registra cómo vivió su jornada.</p>
              </div>
            </article>
            <article>
              <span>2</span>
              <div>
                <strong>Pulso360 protege</strong>
                <p>Agrupa respuestas sin mostrar personas.</p>
              </div>
            </article>
            <article>
              <span>3</span>
              <div>
                <strong>SST actúa</strong>
                <p>Recibe tendencias y hace seguimiento.</p>
              </div>
            </article>
          </div>
        </section>

        {/* El Problema */}
        <section className="landing-section problem-section" id="problema" aria-labelledby="problem-title">
          <div className="landing-container">
            <div className="section-heading section-heading-split">
              <div>
                <p className="eyebrow eyebrow-dark">El problema</p>
                <h2 id="problem-title">
                  Muchas empresas descubren el desgaste cuando ya se refleja en ausentismo, rotación o crisis.
                </h2>
              </div>
              <p>
                En los Contact Centers la presión puede cambiar de una semana a otra. Las mediciones ocasionales no siempre muestran lo que está viviendo el equipo hoy, y los agentes pueden evitar hablar si sienten que serán identificados.
              </p>
            </div>

            <div className="problem-grid">
              <article className="problem-card">
                <span className="problem-number">01</span>
                <h3>No existe una lectura continua</h3>
                <p>Una encuesta anual no permite observar cambios rápidos en energía, carga, recuperación o apoyo.</p>
              </article>
              <article className="problem-card problem-card-accent">
                <span className="problem-number">02</span>
                <h3>Expresarse puede generar temor</h3>
                <p>Si una respuesta puede llegar al jefe directo, la persona puede ocultar lo que realmente siente.</p>
              </article>
              <article className="problem-card">
                <span className="problem-number">03</span>
                <h3>Actuar sin datos dificulta prevenir</h3>
                <p>SST necesita tendencias oportunas para priorizar acciones y comprobar si el equipo mejora.</p>
              </article>
            </div>

            <aside className="audience-panel">
              <div>
                <span>¿Para quién es Pulso360?</span>
                <h3>Para agentes de Contact Center y los equipos responsables de cuidar su bienestar laboral.</h3>
              </div>
              <p><strong>El agente</strong> obtiene un espacio privado para expresar cómo se siente.</p>
              <p><strong>Supervisores y SST</strong> reciben información colectiva para prevenir, nunca respuestas individuales.</p>
            </aside>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section className="landing-section how-section" id="como-funciona" aria-labelledby="how-title">
          <div className="landing-container">
            <div className="section-heading centered">
              <p className="eyebrow eyebrow-dark">Cómo funciona</p>
              <h2 id="how-title">Así se usa Pulso360 durante una jornada real.</h2>
              <p>El recorrido es sencillo para quien responde y útil para quien debe tomar acciones de prevención.</p>
            </div>

            <ol className="how-grid">
              <li className="how-card">
                <div className="how-card-top"><span>1</span><small>Durante la jornada</small></div>
                <h3>El agente responde seis preguntas</h3>
                <p>Califica energía, carga, recuperación, apoyo, distanciamiento e ineficacia. También puede elegir no responder.</p>
                <div className="mini-survey" aria-hidden="true">
                  <span>1</span><span>2</span><span className="active">3</span><span>4</span><span>5</span>
                </div>
              </li>
              <li className="how-card">
                <div className="how-card-top"><span>2</span><small>De forma automática</small></div>
                <h3>El sistema reúne y protege las respuestas</h3>
                <p>Los resultados se agrupan. Si hay muy pocas personas, Pulso360 oculta la información para evitar identificaciones.</p>
                <div className="mini-protection" aria-hidden="true">
                  <div><i></i><i></i><i></i><i></i><i></i></div>
                  <strong>Grupo protegido</strong>
                </div>
              </li>
              <li className="how-card">
                <div className="how-card-top"><span>3</span><small>Para prevenir</small></div>
                <h3>SST observa una tendencia y registra una acción</h3>
                <p>El equipo de bienestar puede detectar un cambio colectivo, intervenir y hacer seguimiento sin señalar a ningún agente.</p>
                <div className="mini-alert" aria-hidden="true">
                  <span>!</span>
                  <div><strong>Carga en aumento</strong><small>Revisar condiciones del equipo</small></div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="landing-section features-section" id="funcionalidades" aria-labelledby="features-title">
          <div className="landing-container">
            <div className="section-heading centered">
              <p className="eyebrow eyebrow-dark">Las tres funcionalidades principales</p>
              <h2 id="features-title">¿Qué puede hacer una persona dentro de Pulso360?</h2>
              <p>Estas son las tres funciones que definen el proyecto y que pueden comprobarse dentro de la plataforma.</p>
            </div>

            <div className="features-grid">
              <article className="feature-card">
                <div className="feature-visual feature-visual-survey" aria-hidden="true">
                  <div className="visual-question"><span></span><span></span></div>
                  <div className="visual-options"><i></i><i></i><i className="selected"></i><i></i><i></i></div>
                </div>
                <div className="feature-number">Funcionalidad 1</div>
                <h3>Encuesta diaria de bienestar</h3>
                <p>El agente registra en menos de un minuto cómo vivió seis aspectos de su jornada laboral.</p>
                <ul>
                  <li>Seis preguntas fáciles de responder</li>
                  <li>Opción consciente de no responder</li>
                  <li>Historial personal de bienestar</li>
                </ul>
                <Link to="/login">Probar esta funcionalidad</Link>
              </article>

              <article className="feature-card feature-card-highlight">
                <div className="feature-visual feature-visual-journal" aria-hidden="true">
                  <div><span></span><span></span><span></span><span></span></div>
                  <i><Icon name="check" size={14} /></i>
                </div>
                <div className="feature-number">Funcionalidad 2</div>
                <h3>Bitácora personal y privada</h3>
                <p>El agente puede escribir lo que ocurrió en su jornada y recibir un análisis orientativo sobre el texto.</p>
                <ul>
                  <li>Notas visibles solo para su titular</li>
                  <li>Análisis NLP explicable, no clínico</li>
                  <li>Control para corregir la clasificación</li>
                </ul>
                <Link to="/login">Probar esta funcionalidad</Link>
              </article>

              <article className="feature-card">
                <div className="feature-visual feature-visual-dashboard" aria-hidden="true">
                  <div className="visual-bars"><i></i><i></i><i></i><i></i><i></i></div>
                  <span>Tendencia del equipo</span>
                </div>
                <div className="feature-number">Funcionalidad 3</div>
                <h3>Panel colectivo para SST</h3>
                <p>SST consulta tendencias protegidas del equipo, recibe alertas y registra acciones preventivas.</p>
                <ul>
                  <li>Resultados agrupados y redondeados</li>
                  <li>Alertas automáticas tempranas</li>
                  <li>Seguimiento de intervenciones</li>
                </ul>
                <Link to="/login">Probar esta funcionalidad</Link>
              </article>
            </div>
          </div>
        </section>

        {/* Privacidad por Rol */}
        <section className="landing-section visibility-section" id="privacidad" aria-labelledby="visibility-title">
          <div className="landing-container visibility-layout">
            <div className="visibility-copy">
              <p className="eyebrow">Privacidad explicada sin tecnicismos</p>
              <h2 id="visibility-title">Cada rol ve únicamente lo necesario para cumplir su función.</h2>
              <p>
                La confianza es esencial: Pulso360 separa el espacio personal del agente y la información colectiva usada para prevenir.
              </p>
              <Link className="button button-light" to="/login">
                Conocer los cinco roles
              </Link>
            </div>

            <div className="visibility-cards">
              <article>
                <span className="role-avatar">A</span>
                <div>
                  <h3>El agente puede ver</h3>
                  <p>Sus respuestas, su bitácora y su evolución personal.</p>
                </div>
              </article>
              <article>
                <span className="role-avatar role-avatar-supervisor">S</span>
                <div>
                  <h3>El supervisor puede ver</h3>
                  <p>Tendencias generales del equipo, nunca respuestas individuales.</p>
                </div>
              </article>
              <article>
                <span className="role-avatar role-avatar-sst">SST</span>
                <div>
                  <h3>Seguridad y Salud puede ver</h3>
                  <p>Alertas colectivas y acciones preventivas, nunca la bitácora privada.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Prueba Interactiva JavaScript */}
        <section className="landing-section interaction-section" id="interaccion" aria-labelledby="interaction-title">
          <div className="landing-container interaction-layout">
            <div className="interaction-copy">
              <p className="eyebrow eyebrow-dark">Interacción JavaScript de inicio</p>
              <h2 id="interaction-title">Genera una bienvenida personalizada para explorar la plataforma.</h2>
              <p>
                El formulario valida los datos y crea una tarjeta de bienvenida interactiva con acceso directo a la cuenta de prueba de ese rol.
              </p>

              <div className="javascript-proof">
                <span>Validación de formulario</span>
                <span>Eventos reactivos</span>
                <span>Manipulación del DOM</span>
                <span>Acceso directo por rol</span>
              </div>
            </div>

            <div className="form-panel">
              <div className="form-panel-header">
                <span>Prueba interactiva</span>
                <strong>¿Desde qué rol quieres conocer Pulso360?</strong>
              </div>

              <form id="contactForm" className="landing-form" onSubmit={handleFormSubmit} noValidate>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label htmlFor="contactName">
                      Nombre completo <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contactName"
                      name="name"
                      type="text"
                      placeholder="Ej. Laura Gómez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && (
                      <span className="field-error" role="alert">{formErrors.name}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="contactEmail">
                      Correo electrónico <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contactEmail"
                      name="email"
                      type="email"
                      placeholder="nombre@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && (
                      <span className="field-error" role="alert">{formErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="contactRole">
                    Rol de interés <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="contactRole"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="">Selecciona un rol institucional...</option>
                    <option value="agente">Agente de Contact Center</option>
                    <option value="supervisor">Supervisor de Operaciones</option>
                    <option value="sst">Profesional SST</option>
                    <option value="auditor">Auditor Interno</option>
                    <option value="admin">Administrador del Sistema</option>
                  </select>
                  {formErrors.role && (
                    <span className="field-error" role="alert">{formErrors.role}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="contactMessage">
                    ¿Qué aspecto deseas explorar? <span className="optional">(Opcional)</span>
                  </label>
                  <textarea
                    id="contactMessage"
                    name="message"
                    rows={2}
                    maxLength={300}
                    placeholder="Ej. Quiero ver cómo funciona el k-anonimato o las alertas tempranas..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button className="form-submit" type="submit">
                  Generar bienvenida personalizada
                </button>
              </form>

              {/* Tarjeta de Bienvenida Dinámica Generada */}
              {welcomeCard && (
                <div className="dynamic-feedback" style={{ display: 'block', marginTop: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-4)', background: 'var(--c-superficie)', border: '1px solid var(--c-borde-suave)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ fontSize: '16px', color: 'var(--c-texto)' }}>
                        ¡Bienvenido(a), {welcomeCard.name}!
                      </strong>
                      <span className={`user-role-badge ${welcomeCard.roleInfo.badge}`}>
                        {welcomeCard.roleInfo.label}
                      </span>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--c-texto-suave)', margin: '0 0 var(--space-3)' }}>
                      {welcomeCard.roleInfo.desc}
                    </p>

                    {welcomeCard.message && (
                      <p style={{ fontSize: '12.5px', fontStyle: 'italic', color: 'var(--c-texto-suave)', margin: '0 0 var(--space-3)' }}>
                        &ldquo;{welcomeCard.message}&rdquo;
                      </p>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleQuickLogin(welcomeCard.roleInfo.demoEmail)}
                    >
                      <Icon name="play" size={14} />
                      <span>Ingresar directamente como {welcomeCard.roleInfo.label}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Institucional */}
      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand">
            <a className="brand brand-footer" href="#inicio" aria-label="Pulso360, volver al inicio">
              <img className="brand-logo" src="/assets/imágenes/logo.png" alt="" />
              <span className="brand-name">Pulso360</span>
            </a>
            <p>Encuestas breves, privacidad individual y tendencias colectivas para prevenir el desgaste laboral.</p>
          </div>

          <div className="footer-column">
            <h2>Explorar</h2>
            <a href="#problema">El problema</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#interaccion">Prueba interactiva</a>
          </div>

          <div className="footer-column">
            <h2>Equipo</h2>
            <span>Brahian Andrés Ospina Ríos</span>
            <span>Leonardo Otálvaro</span>
            <span>Andrés Felipe Trujillo</span>
          </div>
        </div>

        <div className="landing-container footer-bottom">
          <p>© 2026 Pulso360 · Tecnológico de Antioquia (TdeA)</p>
          <p>Prototipo académico de Ingeniería de Software · No realiza diagnósticos clínicos.</p>
        </div>
      </footer>
    </div>
  );
}
