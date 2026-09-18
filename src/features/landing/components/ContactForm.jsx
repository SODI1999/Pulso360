// src/features/landing/components/ContactForm.jsx
// Formulario funcional e institucional de Contáctenos con campos controlados (useState),
// validaciones en tiempo real, foco accesible WCAG AA y autorización expresa de Habeas Data (Ley 1581)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';
import { CONTACT_SUBJECTS } from '../data/landingData';
import '../../../styles/contactenos.css';

export function ContactForm() {
  // 1. Estados controlados del formulario (useState)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    habeasData: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Manejo de cambios en los inputs controlados
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // 2. Validación básica obligatoria y Habeas Data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre completo es obligatorio.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Escribe al menos 3 caracteres.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Ingresa un correo corporativo válido (ej. usuario@empresa.com).';
    }

    if (!formData.company.trim()) {
      errors.company = 'La empresa u operación BPO es obligatoria.';
    }

    if (!formData.subject) {
      errors.subject = 'Por favor selecciona el motivo de contacto.';
    }

    if (!formData.message.trim()) {
      errors.message = 'El mensaje o consulta es obligatorio.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Por favor ingresa al menos 10 caracteres detallando tu solicitud.';
    }

    if (!formData.habeasData) {
      errors.habeasData = 'Debes aceptar la autorización de tratamiento de datos personales para continuar.';
    }

    return errors;
  };

  // 3. Evento onSubmit con foco accesible en el primer campo inválido (WCAG AA)
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmittedOnce(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const fieldMap = {
        name: 'contactName',
        email: 'contactEmail',
        company: 'contactCompany',
        subject: 'contactSubject',
        message: 'contactMessage',
        habeasData: 'contactHabeasData'
      };
      const targetElement = document.getElementById(fieldMap[firstErrorKey]);
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    // Simular procesamiento y almacenamiento en estado (SPA)
    setTimeout(() => {
      const subjectLabel = CONTACT_SUBJECTS.find(s => s.value === formData.subject)?.label || formData.subject;
      setSubmittedData({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        phone: formData.phone.trim() || 'No especificado',
        subject: subjectLabel,
        message: formData.message.trim(),
        date: new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      setIsSubmitting(false);
    }, 400);
  };

  // Reiniciar formulario para enviar otro mensaje
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
      habeasData: false
    });
    setFormErrors({});
    setHasSubmittedOnce(false);
    setSubmittedData(null);
  };

  return (
    <div className="form-panel">
      <div className="form-panel-header">
        <span className="panel-kicker">Solicitud Institucional</span>
        <h2 className="panel-title">Envíanos tu requerimiento</h2>
        <p className="panel-sub">Coordinamos sesiones técnicas y demostraciones para líderes de operaciones y SST.</p>
      </div>

      {!submittedData ? (
        <form id="contactForm" className="landing-form" onSubmit={handleSubmit} noValidate>
          {/* Banner de Alerta moderno y sutil en caso de campos incompletos */}
          {hasSubmittedOnce && Object.keys(formErrors).length > 0 && (
            <div className="contact-alert-banner" role="alert">
              <span className="contact-alert-icon" aria-hidden="true">
                <Icon name="alertTriangle" size={14} />
              </span>
              <div className="contact-alert-text">
                <strong>Por favor revisa el formulario:</strong> Hay campos obligatorios pendientes o con información incompleta.
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!formErrors.subject}
              aria-describedby={formErrors.subject ? 'subject-error' : undefined}
            >
              {CONTACT_SUBJECTS.map(subj => (
                <option key={subj.value} value={subj.value}>{subj.label}</option>
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!formErrors.habeasData}
                aria-describedby={formErrors.habeasData ? 'habeasData-error' : undefined}
              />
              <span className="checkbox-text">
                Acepto el tratamiento de mis datos personales de contacto conforme a la Ley 1581 de 2012 y la{' '}
                <Link to="/fundamentacion#marco-legal" className="checkbox-link" target="_blank" rel="noopener noreferrer">
                  Política de Tratamiento de Datos
                </Link>{' '}
                para atender esta solicitud institucional. <span className="required-star" aria-hidden="true">*</span>
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
              <strong>Reserva médica y datos sensibles:</strong> Por favor abstente de incluir datos de salud, diagnósticos o información clínica en este formulario.
            </span>
          </div>

          <button
            className="form-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="refresh" size={18} className="spin-animation" />
                <span>Enviando solicitud...</span>
              </>
            ) : (
              <>
                <Icon name="send" size={18} />
                <span>Enviar mensaje</span>
              </>
            )}
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
                <strong className="contact-success-title">
                  ¡Mensaje de contacto enviado con éxito!
                </strong>
                <span className="contact-success-date">
                  Radicado recibido el {submittedData.date}
                </span>
              </div>
            </div>

            <p className="contact-success-message">
              Estimado(a) <strong>{submittedData.name}</strong>, hemos registrado tu solicitud para la empresa <strong>{submittedData.company}</strong>. Un especialista de Pulso360 se pondrá en contacto contigo en el correo <strong>{submittedData.email}</strong>.
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
                <p className="detail-message-body">
                  &ldquo;{submittedData.message}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm contact-success-reset-btn"
            onClick={handleReset}
          >
            <Icon name="edit" size={15} />
            <span>Enviar otro mensaje</span>
          </button>
        </div>
      )}
    </div>
  );
}
