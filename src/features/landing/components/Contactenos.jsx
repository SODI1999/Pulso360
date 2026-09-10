// src/features/landing/components/Contactenos.jsx
// Formulario funcional de Contáctenos con campos controlados (useState), validaciones en tiempo real y confirmación interactiva

import { useState } from 'react';
import { Icon } from '../../../core/components/Icon';
import '../../../styles/contactenos.css';

const CONTACT_SUBJECTS = [
  { value: '', label: 'Selecciona el motivo de tu consulta...' },
  { value: 'implementacion', label: 'Implementación en Operación de Contact Center' },
  { value: 'demostracion', label: 'Solicitud de Demostración Institucional' },
  { value: 'privacidad', label: 'Consultoría en Privacidad y k-Anonimato (N ≥ 5)' },
  { value: 'sst', label: 'Vigilancia Epidemiológica y Prevención de Burnout' },
  { value: 'otro', label: 'Otra consulta o requerimiento' }
];

export function Contactenos() {
  // 1. Estados controlados del formulario (useState)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Manejo de cambios en los inputs controlados
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // 2. Validación básica obligatoria
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre completo es obligatorio.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Escribe al menos 3 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    return errors;
  };

  // 3. Evento onSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmittedOnce(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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
      message: ''
    });
    setFormErrors({});
    setHasSubmittedOnce(false);
    setSubmittedData(null);
  };

  return (
    <div className="form-panel" style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div className="form-panel-header" style={{ borderBottom: '1px solid var(--c-borde-suave)', padding: 'var(--space-4) var(--space-6)' }}>
        <span>Atención Institucional · Pulso360</span>
        <strong>Contáctenos</strong>
      </div>

      {!submittedData ? (
        <form id="contactForm" className="landing-form" onSubmit={handleSubmit} noValidate>
          {/* Banner de Alerta cuando se intenta enviar con campos incompletos */}
          {hasSubmittedOnce && Object.keys(formErrors).length > 0 && (
            <div className="contact-alert-banner" role="alert">
              <Icon name="alertTriangle" size={18} />
              <div>
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
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && (
                <span className="field-error visible" role="alert">
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
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <span className="field-error visible" role="alert">
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
                aria-invalid={!!formErrors.company}
              />
              {formErrors.company && (
                <span className="field-error visible" role="alert">
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
              aria-invalid={!!formErrors.subject}
            >
              {CONTACT_SUBJECTS.map(subj => (
                <option key={subj.value} value={subj.value}>{subj.label}</option>
              ))}
            </select>
            {formErrors.subject && (
              <span className="field-error visible" role="alert">
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
              aria-invalid={!!formErrors.message}
            />
            {formErrors.message && (
              <span className="field-error visible" role="alert">
                <Icon name="alertTriangle" size={13} />
                <span>{formErrors.message}</span>
              </span>
            )}
          </div>

          <button
            className="form-submit"
            type="submit"
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
          >
            <Icon name="check" size={18} />
            <span>{isSubmitting ? 'Enviando solicitud...' : 'Enviar mensaje'}</span>
          </button>
        </form>
      ) : (
        /* 4. Tarjeta interactiva con datos ingresados */
        <div style={{ padding: 'var(--space-6)' }}>
          <div style={{
            background: 'var(--c-superficie)',
            border: '1px solid var(--c-exito)',
            borderLeft: '5px solid var(--c-exito)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <span style={{
                background: 'rgba(29, 155, 87, 0.12)',
                color: 'var(--c-exito)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon name="check" size={20} />
              </span>
              <div>
                <strong style={{ fontSize: '17px', color: 'var(--c-texto)', display: 'block' }}>
                  ¡Mensaje de contacto enviado con éxito!
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--c-texto-suave)' }}>
                  Radicado recibido el {submittedData.date}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--c-texto)', margin: '0 0 var(--space-4)', lineHeight: '1.5' }}>
              Estimado(a) <strong>{submittedData.name}</strong>, hemos registrado tu solicitud para la empresa <strong>{submittedData.company}</strong>. Un especialista de Pulso360 se pondrá en contacto contigo en el correo <strong>{submittedData.email}</strong>.
            </p>

            <div style={{
              background: '#ffffff',
              border: '1px solid var(--c-borde-suave)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-4)',
              display: 'grid',
              gap: 'var(--space-2)',
              fontSize: '13.5px'
            }}>
              <div>
                <span style={{ color: 'var(--c-texto-suave)', fontWeight: '600' }}>Asunto: </span>
                <span style={{ color: 'var(--c-texto)' }}>{submittedData.subject}</span>
              </div>
              <div>
                <span style={{ color: 'var(--c-texto-suave)', fontWeight: '600' }}>Teléfono: </span>
                <span style={{ color: 'var(--c-texto)' }}>{submittedData.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--c-texto-suave)', fontWeight: '600' }}>Detalle del mensaje: </span>
                <p style={{ color: 'var(--c-texto)', fontStyle: 'italic', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                  &ldquo;{submittedData.message}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Icon name="edit" size={15} />
            <span>Enviar otro mensaje</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Alias de exportación retrocompatible
export { Contactenos as Formulario };
