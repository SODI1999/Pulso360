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
    submittedData,
    handleChange,
    handleSubmit,
    handleReset
  } = useContactForm();

  return (
    <div className="form-panel">
      <div className="form-panel-header">
        <span className="panel-kicker">Solicitud Institucional</span>
        <h2 className="panel-title">Prepara tu solicitud</h2>
        <p className="panel-sub">
          Completa los datos para revisar una solicitud de muestra. Esta demo no envía mensajes.
        </p>
      </div>

      {!submittedData ? (
        <form id="contactForm" className="landing-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          {/* Banner de Alerta moderno y sutil en caso de campos incompletos */}
          {hasSubmittedOnce && Object.keys(formErrors).length > 0 && (
            <div className="contact-alert-banner" role="alert">
              <span className="contact-alert-icon" aria-hidden="true">
                <Icon name="alertTriangle" size={14} />
              </span>
              <div className="contact-alert-text">
                <strong>Por favor revisa el formulario:</strong> Hay campos obligatorios pendientes o con
                información incompleta.
              </div>
            </div>
          )}

          <div className="form-grid-two">
            <div className="form-field">
              <label htmlFor="contactName">
                Nombre y Apellidos <span aria-hidden="true">*</span>
              </label>
              <input
                id="contactName"
                name="name"
                type="text"
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
                Correo Electrónico <span aria-hidden="true">*</span>
              </label>
              <input
                id="contactEmail"
                name="email"
                type="email"
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
                Empresa u Operación BPO <span aria-hidden="true">*</span>
              </label>
              <input
                id="contactCompany"
                name="company"
                type="text"
                className={formErrors.company ? 'has-error' : ''}
                placeholder="Ej. BPO Solutions Medellín"
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
                placeholder="Ej. +57 300 123 4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="contactSubject">
              Motivo de la Consulta <span aria-hidden="true">*</span>
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
              Mensaje o Requerimiento <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="contactMessage"
              name="message"
              className={formErrors.message ? 'has-error' : ''}
              rows={4}
              maxLength={600}
              placeholder="Describe detalladamente tu inquietud, tamaño de la operación o aspectos específicos que deseas coordinar con nuestro equipo..."
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
                Acepto el tratamiento de mis datos personales de contacto conforme a la Ley 1581 de 2012 y la{' '}
                <Link
                  to="/fundamentacion#marco-legal"
                  className="checkbox-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Tratamiento de Datos
                </Link>{' '}
                para atender esta solicitud institucional.{' '}
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
              <strong>Reserva médica y datos sensibles:</strong> Por favor abstente de incluir datos de salud,
              diagnósticos o información clínica en este formulario.
            </span>
          </div>

          <button className="form-submit" type="submit">
            <Icon name="check" size={18} />
            <span>Ver resumen</span>
          </button>
        </form>
      ) : (
        /* 4. Tarjeta interactiva con confirmación limpia y sin estilos inline */
        <div className="contact-success-wrap">
          <div className="contact-success-card">
            <div className="contact-success-header">
              <span className="contact-success-badge">
                <Icon name="check" size={20} />
              </span>
              <div>
                <strong className="contact-success-title">Resumen de solicitud (demo)</strong>
                <span className="contact-success-date">Preparado el {submittedData.date}</span>
              </div>
            </div>

            <p className="contact-success-message">
              Este es el resumen de <strong>{submittedData.name}</strong> para{' '}
              <strong>{submittedData.company}</strong>. Los datos se muestran solo en esta pestaña; no se
              enviaron ni se guardaron en un servidor.
            </p>

            <div className="contact-success-details">
              <div>
                <span className="detail-label">Asunto: </span>
                <span className="detail-value">{submittedData.subject}</span>
              </div>
              <div>
                <span className="detail-label">Teléfono: </span>
                <span className="detail-value">{submittedData.phone}</span>
              </div>
              <div>
                <span className="detail-label">Detalle del mensaje: </span>
                <p className="detail-message-body">&ldquo;{submittedData.message}&rdquo;</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm contact-success-reset-btn"
            onClick={handleReset}
          >
            <Icon name="edit" size={15} />
            <span>Completar otro formulario</span>
          </button>
        </div>
      )}
    </div>
  );
}
