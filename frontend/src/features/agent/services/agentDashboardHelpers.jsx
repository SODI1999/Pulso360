export const QUICK_ENERGY_SCALE = [
  { value: 1, label: 'Sin batería' },
  { value: 2, label: 'Baja energía' },
  { value: 3, label: 'Justa para el turno' },
  { value: 4, label: 'Buena energía' },
  { value: 5, label: 'Plena y enfocado' }
];

export const formatHour = (hourNumber) => {
  const h = ((hourNumber % 24) + 24) % 24;
  return `${String(h).padStart(2, '0')}:00`;
};
