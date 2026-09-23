export function validateContactForm(formData) {
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
}
