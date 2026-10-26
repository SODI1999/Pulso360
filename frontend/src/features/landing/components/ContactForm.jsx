// src/features/landing/components/ContactForm.jsx
// Formulario funcional e institucional de Contáctenos con campos controlados (useState),
// validaciones en tiempo real, foco accesible WCAG AA y autorización expresa de Habeas Data (Ley 1581)

import { useContactForm } from '../hooks/useContactForm';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';
import { CONTACT_SUBJECTS } from '../data/landingData';
import '../../../styles/contactenos.css';

export function ContactForm() {
  const {
    formData,
    formRef,
    formErrors,
    hasSubmittedOnce,
    isSubmitting,
    submittedData,
    handleChange,
    handleSubmit,
    handleReset
  } = useContactForm();

  return (
    <div className="form-panel">
      {!submittedData ? (
        <>
          <div className="form-panel-header">
            <span className="panel-kicker">Radicación Institucional & SST</span>
            <h2 className="panel-title">Ficha de Solicitud de Coordinación</h2>
            <p className="panel-sub">
              Diligencia los parámetros de tu operación para generar una ficha formal de enlace técnico en
              entorno controlado (Sandbox institucional).
            </p>
          </div>

          <form id="contactForm" className="landing-form" ref={formRef} onSubmit={handleSubmit} noValidate>
            {/* Banner de Validación Guiada Sutil (no punitivo) */}
            {hasSubmittedOnce && Object.keys(formErrors).length > 0 && (
              <div className="contact-alert-banner" role="status" aria-live="polite">
                <span className="contact-alert-icon" aria-hidden="true">
                  <Icon name="alertTriangle" size={14} />
                </span>
                <div className="contact-alert-text">
                  <strong>Revisa los campos requeridos:</strong> Hay información pendiente o incompleta en el
                  formulario para poder emitir el radicado.
                </div>
              </div>
            )}

            <div className="form-grid-two">
              <div className="form-field">
                <label htmlFor="contactName">
                  Nombre y Apellidos <span aria-hidden="true" className="required-star">*</span>
                </label>
                <input
                  id="contactName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={formErrors.name ? 'has-error' : ''}
                  placeholder="Ej. Laura Marcela Gómez"
                  value={formData.name}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                />
                {formErrors.name && (
                  <span id="name-error" className="field-error visible" role="alert">
                    <Icon name="alertTriangle" size={13} />
                    <span>{formErrors.name}</span>
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="contactEmail">
                  Correo Electrónico Corporativo <span aria-hidden="true" className="required-star">*</span>
                </label>
                <input
                  id="contactEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={formErrors.email ? 'has-error' : ''}
                  placeholder="laura.gomez@contactcenter.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? 'email-error' : undefined}
                />
                {formErrors.email && (
                  <span id="email-error" className="field-error visible" role="alert">
                    <Icon name="alertTriangle" size={13} />
                    <span>{formErrors.email}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-field">
                <label htmlFor="contactCompany">
                  Empresa u Operación BPO <span aria-hidden="true" className="required-star">*</span>
                </label>
                <input
                  id="contactCompany"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  className={formErrors.company ? 'has-error' : ''}
                  placeholder="Ej. BPO Contact Center Medellín"
                  value={formData.company}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.company}
                  aria-describedby={formErrors.company ? 'company-error' : undefined}
                />
                {formErrors.company && (
                  <span id="company-error" className="field-error visible" role="alert">
                    <Icon name="alertTriangle" size={13} />
                    <span>{formErrors.company}</span>
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="contactPhone">
                  Teléfono de Contacto <span className="optional">(Opcional)</span>
                </label>
                <input
                  id="contactPhone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Ej. +57 300 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="contactSubject">
                Motivo de la Coordinación <span aria-hidden="true" className="required-star">*</span>
              </label>
              <select
                id="contactSubject"
                name="subject"
                className={formErrors.subject ? 'has-error' : ''}
                value={formData.subject}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!formErrors.subject}
                aria-describedby={formErrors.subject ? 'subject-error' : undefined}
              >
                {CONTACT_SUBJECTS.map((subj) => (
                  <option key={subj.value} value={subj.value}>
                    {subj.label}
                  </option>
                ))}
              </select>
              {formErrors.subject && (
                <span id="subject-error" className="field-error visible" role="alert">
                  <Icon name="alertTriangle" size={13} />
                  <span>{formErrors.subject}</span>
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="contactMessage">
                Mensaje o Requerimiento Técnico <span aria-hidden="true" className="required-star">*</span>
              </label>
              <textarea
                id="contactMessage"
                name="message"
                className={formErrors.message ? 'has-error' : ''}
                rows={4}
                maxLength={600}
                placeholder="Describe la operación: número de operadores, turnos rotativos, tipología de colas o aspectos específicos que deseas coordinar con nuestro equipo técnico..."
                value={formData.message}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!formErrors.message}
                aria-describedby={formErrors.message ? 'message-error' : undefined}
              />
              {formErrors.message && (
                <span id="message-error" className="field-error visible" role="alert">
                  <Icon name="alertTriangle" size={13} />
                  <span>{formErrors.message}</span>
                </span>
              )}
            </div>

            {/* Checkbox Obligatorio de Habeas Data (Ley 1581) */}
            <div className="form-field form-field-checkbox">
              <label className="checkbox-label" htmlFor="contactHabeasData">
                <input
                  id="contactHabeasData"
                  name="habeasData"
                  type="checkbox"
                  checked={formData.habeasData}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.habeasData}
                  aria-describedby={formErrors.habeasData ? 'habeasData-error' : undefined}
                />
                <span className="checkbox-text">
                  Autorizo el tratamiento de mis datos de contacto conforme a la Ley 1581 de 2012 y la{' '}
                  <Link
                    to="/fundamentacion#marco-legal"
                    className="checkbox-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Tratamiento de Datos Institucional
                  </Link>{' '}
                  para coordinar esta solicitud técnica.{' '}
                  <span className="required-star" aria-hidden="true">
                    *
                  </span>
                </span>
              </label>
              {formErrors.habeasData && (
                <span id="habeasData-error" className="field-error visible" role="alert">
                  <Icon name="alertTriangle" size={13} />
                  <span>{formErrors.habeasData}</span>
                </span>
              )}
            </div>

            {/* Advertencia preventiva: no incluir datos de salud sensible */}
            <div className="contact-health-disclaimer">
              <Icon name="shieldCheck" size={15} className="disclaimer-icon" />
              <span>
                <strong>Reserva médica y datos sensibles:</strong> Abstente de incluir diagnósticos, historias
                clínicas o datos de salud individual en este canal institucional.
              </span>
            </div>

            <button
              className="form-submit"
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="refresh" size={16} className="spin-animation" />
                  <span>Generando radicado institucional...</span>
                </>
              ) : (
                <>
                  <Icon name="fileText" size={16} />
                  <span>Radicar Solicitud Institucional</span>
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* Estado Ficha Técnica Oficial de Radicación (Éxito sin Card-itis) */
        <div className="radication-dossier-panel" role="region" aria-label="Constancia oficial de radicación">
          <div className="radication-header">
            <div className="radication-meta-top">
              <div className="radication-brand-mark">
                <Icon name="shieldCheck" size={22} className="radication-shield-icon" />
                <div>
                  <span className="radication-inst-tag">Tecnológico de Antioquia · Institución Universitaria</span>
                  <h2 className="radication-title">Constancia Oficial de Radicación (Sandbox)</h2>
                </div>
              </div>
              <div className="radication-code-pill">
                <span className="code-label">Radicado Oficial</span>
                <strong className="code-value">{submittedData.radCode}</strong>
              </div>
            </div>
            <p className="radication-stamp-date">
              Sello de Recepción: <time>{submittedData.date}</time>
            </p>
          </div>

          <div className="radication-body">
            <p className="radication-intro-note">
              Se ha emitido la presente ficha técnica de enlace para la operación{' '}
              <strong>{submittedData.company}</strong>, coordinada por <strong>{submittedData.name}</strong>.
            </p>

            <dl className="radication-parameters-grid">
              <div className="param-item">
                <dt className="param-label">Empresa u Operación BPO:</dt>
                <dd className="param-val">{submittedData.company}</dd>
              </div>
              <div className="param-item">
                <dt className="param-label">Responsable / Enlace:</dt>
                <dd className="param-val">{submittedData.name}</dd>
              </div>
              <div className="param-item">
                <dt className="param-label">Correo Electrónico:</dt>
                <dd className="param-val">{submittedData.email}</dd>
              </div>
              <div className="param-item">
                <dt className="param-label">Teléfono de Contacto:</dt>
                <dd className="param-val">{submittedData.phone}</dd>
              </div>
              <div className="param-item param-item-full">
                <dt className="param-label">Motivo de Coordinación:</dt>
                <dd className="param-val">{submittedData.subject}</dd>
              </div>
              <div className="param-item param-item-full">
                <dt className="param-label">Detalle y Alcance del Requerimiento:</dt>
                <dd className="param-val param-message-box">&ldquo;{submittedData.message}&rdquo;</dd>
              </div>
            </dl>

            <div className="radication-custody-clause">
              <Icon name="Scale" size={15} className="custody-icon" />
              <span>
                <strong>Garantía de Custodia & Ley 1581:</strong> Ficha generada en memoria de sesión local.
                Para preservar la reserva del SG-SST, los datos no son transferidos a servidores externos ni
                cruzados con bitácoras de operadores.
              </span>
            </div>
          </div>

          <div className="radication-actions-bar no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-print-radication"
              aria-label="Imprimir Ficha Oficial de Radicación en PDF"
            >
              <Icon name="Printer" size={15} />
              <span>Imprimir Ficha en PDF</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn-reset-radication"
              aria-label="Iniciar una nueva solicitud de radicación"
            >
              <Icon name="edit" size={15} />
              <span>Radicar Nueva Solicitud</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
