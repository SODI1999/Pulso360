/**
 * Presenta la urgencia registrada sin convertir su ausencia en urgencia media.
 * @param {string|null|undefined} value Valor de urgencia recibido del servicio SST.
 * @returns {{label: string, tone: string}} Etiqueta original o normalizada y tono conocido.
 */
export function getSupportUrgency(value) {
  const labels = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  const registeredValue = (value || '').trim();
  const key = registeredValue.toLocaleLowerCase('es-CO');
  return { label: labels[key] || registeredValue || 'No registrada', tone: labels[key] ? key : 'sin-dato' };
}
