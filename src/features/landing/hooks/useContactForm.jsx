import { useState } from 'react';
import { CONTACT_SUBJECTS } from '../data/landingData';
import { validateContactForm } from '../services/contactValidation';

export function useContactForm() {
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
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // 2. Validación básica obligatoria y Habeas Data

  // 3. Evento onSubmit con foco accesible en el primer campo inválido (WCAG AA)
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmittedOnce(true);

    const errors = validateContactForm(formData);
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
      const subjectLabel =
        CONTACT_SUBJECTS.find((s) => s.value === formData.subject)?.label || formData.subject;
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

  return {
    formData,
    formErrors,
    hasSubmittedOnce,
    isSubmitting,
    submittedData,
    handleChange,
    handleSubmit,
    handleReset
  };
}
