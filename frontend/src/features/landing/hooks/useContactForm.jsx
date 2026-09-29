import { useRef, useState } from 'react';
import { CONTACT_SUBJECTS } from '../data/landingData';
import { validateContactForm } from '../services/contactValidation';

export function useContactForm() {
  // Los campos se mantienen en React para validar y mostrar un resumen local.
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
  const [submittedData, setSubmittedData] = useState(null);
  const formRef = useRef(null);

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

  // Enfocar el primer campo inválido facilita corregir el formulario con teclado.
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmittedOnce(true);

    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      formRef.current?.elements.namedItem(firstErrorKey)?.focus();
      return;
    }

    setFormErrors({});
    const subjectLabel =
      CONTACT_SUBJECTS.find((subject) => subject.value === formData.subject)?.label || formData.subject;
    setSubmittedData({
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company.trim(),
      phone: formData.phone.trim() || 'No especificado',
      subject: subjectLabel,
      message: formData.message.trim(),
      date: new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  };

  // Limpiar el formulario para preparar otro resumen
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
    formRef,
    formErrors,
    hasSubmittedOnce,
    submittedData,
    handleChange,
    handleSubmit,
    handleReset
  };
}
