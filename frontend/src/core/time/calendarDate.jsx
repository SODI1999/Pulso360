// Fechas de calendario de la operación. No dependen del día UTC ni del huso del navegador.
export function bogotaCalendarDate(now = new Date(), offsetDays = 0) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(now);
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}
