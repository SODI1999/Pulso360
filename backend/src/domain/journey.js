// La jornada comienza a la hora de turno registrada, en America/Bogota.
export function currentJourney(shiftStartHour = 8, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(now).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const date = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
  if (Number(parts.hour) < Number(shiftStartHour)) date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
