import { REQUIRED_COLUMNS } from '../data/csvImportData';

const allowedColumns = [...REQUIRED_COLUMNS, 'volumen_llamadas', 'tasa_ausentismo_pct', 'aht_segundos'];

// CSV delimitado por comas: admite campos citados, comillas escapadas y saltos dentro de un campo.
export function parseCsv(content) {
  const records = [];
  let row = [], field = '', quoted = false, closedQuote = false;
  const text = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index++; }
      else if (char === '"') { quoted = false; closedQuote = true; }
      else field += char;
    } else if (char === '"') {
      if (field || closedQuote) throw new Error('Comillas mal ubicadas en el CSV.');
      quoted = true;
    } else if (char === ',' || char === '\n') {
      row.push(field.trim()); field = ''; closedQuote = false;
      if (char === '\n') { if (row.some(value => value !== '')) records.push(row); row = []; }
    } else {
      if (closedQuote && char.trim()) throw new Error('Contenido inesperado después de un campo citado.');
      field += char;
    }
  }
  if (quoted) throw new Error('Hay un campo citado sin cerrar.');
  if (field || row.length || closedQuote) { row.push(field.trim()); if (row.some(value => value !== '')) records.push(row); }
  return records;
}

export function validateCsvContent(content) {
  try {
    const records = parseCsv(content);
    if (records.length < 2) throw new Error('Incluye cabecera y al menos una fila de datos.');
    const headers = records[0].map(value => value.toLowerCase());
    if (new Set(headers).size !== headers.length) throw new Error('La cabecera contiene columnas duplicadas.');
    const unknown = headers.filter(value => !allowedColumns.includes(value));
    if (unknown.length) throw new Error('Hay columnas fuera de la plantilla permitida. No incluyas identificadores ni datos de personas.');
    if (REQUIRED_COLUMNS.some(value => !headers.includes(value))) throw new Error('Faltan las columnas campana_id o semana.');
    const rows = records.slice(1).map((values,index) => {
      if (values.length !== headers.length) throw new Error(`Fila ${index + 2}: cantidad de columnas incorrecta.`);
      const row = Object.fromEntries(headers.map((header,position) => [header,values[position]]));
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(row.campana_id)) throw new Error(`Fila ${index + 2}: identificador de campaña inválido.`);
      if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(row.semana)) throw new Error(`Fila ${index + 2}: usa una semana en formato AAAA-W01.`);
      for (const column of headers.filter(value => !REQUIRED_COLUMNS.includes(value))) {
        const value = row[column];
        if (!/^\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) ||
            (column === 'volumen_llamadas' && !Number.isInteger(Number(value))) ||
            (column === 'tasa_ausentismo_pct' && Number(value) > 100)) {
          throw new Error(`Fila ${index + 2}: valor inválido en ${column}.`);
        }
      }
      return row;
    });
    return { valid:true, type:'ok', rows, message:`Estructura comprobada: ${rows.length} filas compatibles con la plantilla. Revisa que los valores sean totales por campaña y semana.` };
  } catch (error) { return { valid:false, type:'schema', rows:[], message:error.message }; }
}
