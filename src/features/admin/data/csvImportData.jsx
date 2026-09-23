export const PERSONAL_IDENTIFIERS = [
  'nombre',
  'cedula',
  'cédula',
  'documento',
  'correo',
  'email',
  'usuario',
  'user_id',
  'employee_id',
  'agente'
];

export const REQUIRED_COLUMNS = ['campana_id', 'semana'];

export const CSV_TEMPLATE = [
  'campana_id,semana,volumen_llamadas,tasa_ausentismo_pct,aht_segundos',
  'camp-1,2026-W34,1420,4.5,285',
  'camp-1,2026-W35,1510,5.1,290',
  'camp-2,2026-W34,890,3.2,310'
].join('\n');
