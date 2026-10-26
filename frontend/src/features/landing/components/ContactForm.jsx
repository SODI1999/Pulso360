// src/features/landing/components/ContactForm.jsx
// Formulario de contacto directo con validación accesible WCAG AA y confirmación de recepción

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
            <h2 className="panel-title">Envíanos un mensaje</h2>
            <p className="panel-sub">
              Completa el formulario y nos comunicaremos con tu equipo para coordinar una reunión o demostración.
            </p>
          </div>

          <form id="contactForm" className="landing-form" ref={formRef} onSubmit={handleSubmit} noValidate>
            {/* Aviso accesible en caso de campos incompletos */}
            {hasSubmittedOnce && Object.keys(formErrors).length > 0 && (
              <div className="contact-alert-banner" role="status" aria-live="polite">
                <span className="contact-alert-icon" aria-hidden="true">
                  <Icon name="alertTriangle" size={14} />
                </span>
                <div className="contact-alert-text">
                  <strong>Por favor revisa los campos requeridos:</strong> Completa los datos marcados para enviar tu mensaje.
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
                  placeholder="Ej. Laura Gómez"
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
                  placeholder="laura.gomez@empresa.com"
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
                  placeholder="Ej. Operación Medellín"
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
                Motivo de Consulta <span aria-hidden="true" className="required-star">*</span>
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
                Mensaje <span aria-hidden="true" className="required-star">*</span>
              </label>
              <textarea
                id="contactMessage"
                name="message"
                className={formErrors.message ? 'has-error' : ''}
                rows={4}
                maxLength={600}
                placeholder="Cuéntanos sobre tu operación: número de operadores, turnos o dudas específicas..."
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
                  </Link>
                  .{' '}
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

            <button className="form-submit" type="submit">
              <Icon name="send" size={16} />
              <span>Enviar mensaje</span>
            </button>
          </form>
        </>
      ) : (
        /* Estado de Éxito / Confirmación de Recepción */
        <div className="contact-success-state" role="status" aria-live="polite">
          <div className="success-icon-wrap" aria-hidden="true">
            <Icon name="CheckCircle2" size={32} />
          </div>
          <h2 className="success-title">Mensaje enviado</h2>
          <p className="success-intro">
            Gracias por comunicarte, <strong>{submittedData.name}</strong>. Hemos recibido tu consulta para{' '}
            <strong>{submittedData.company}</strong> y nos pondremos en contacto a través de{' '}
            <strong>{submittedData.email}</strong>.
          </p>

          <div className="success-summary-box">
            <div className="summary-row">
              <span className="summary-label">Motivo:</span>
              <span className="summary-val">{submittedData.subject}</span>
            </div>
            {submittedData.phone && submittedData.phone !== 'No especificado' && (
              <div className="summary-row">
                <span className="summary-label">Teléfono:</span>
                <span className="summary-val">{submittedData.phone}</span>
              </div>
            )}
            <div className="summary-row summary-message">
              <span className="summary-label">Mensaje:</span>
              <p className="summary-text">&ldquo;{submittedData.message}&rdquo;</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="btn-reset-form"
          >
            <Icon name="edit" size={15} />
            <span>Enviar otro mensaje</span>
          </button>
        </div>
      )}
    </div>
  );
}
