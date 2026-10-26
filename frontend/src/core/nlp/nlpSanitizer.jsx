// src/core/nlp/nlpSanitizer.js
// Saneamiento ortopédico, desacentuación simétrica y normalización de elongaciones para lenguaje BPO

/**
 * Normaliza y elimina acentos y tildes diacríticas preservando la letra 'ñ'.
 * @param {string} str - Texto de entrada
 * @returns {string} Texto desacentuado en minúsculas
 */
export function stripDiacritics(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[áàäâã]/gi, 'a')
    .replace(/[éèëê]/gi, 'e')
    .replace(/[íìïî]/gi, 'i')
    .replace(/[óòöôõ]/gi, 'o')
    .replace(/[úùüû]/gi, 'u');
}

/**
 * Colapsa repeticiones intencionales o elongaciones enfáticas de 3 o más letras.
 * Mantiene 'rr' y 'll' cuando la letra repetida es 'r' o 'l'.
 * Ej: 'demasiaaaado' -> 'demasiado', 'noooo' -> 'no', 'horriiiible' -> 'horrible'
 * @param {string} str - Texto con elongaciones
 * @returns {string} Texto con elongaciones normalizadas
 */
export function collapseElongations(str = '') {
  if (typeof str !== 'string') return '';
  return str.replace(/([a-záéíóúñ])\1{2,}/gi, (match, char) => {
    const lower = char.toLowerCase();
    if (lower === 'r' || lower === 'l') return lower + lower;
    return lower;
  });
}

/**
 * Sanitiza texto eliminando ruido de teclado (fat-finger typos), separando
 * signos de puntuación pegados y normalizando espacios y minúsculas.
 * Ej: 'm,e' -> 'm e', 'pere<za' -> 'pereza', 'UQE' -> 'uqe'
 * @param {string} rawText - Texto original del usuario
 * @returns {string} Texto sanitizado
 */
export function sanitizeInputText(rawText = '') {
  if (typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Colapsar repeticiones exageradas de caracteres
  text = collapseElongations(text);

  // 2. Separar puntuación pegada a palabras (ej: 'm,e' -> 'm e', 'hola.como' -> 'hola como')
  text = text.replace(/([a-zA-ZáéíóúñÁÉÍÓÚÑ])[,;:!?]([a-zA-ZáéíóúñÁÉÍÓÚÑ])/g, '$1 $2');

  // 3. Remover caracteres parásitos de teclado incrustados dentro de palabras (ej: 'pere<za' -> 'pereza')
  text = text.replace(/([a-zA-ZáéíóúñÁÉÍÓÚÑ])[<>/\\|_^~*+=#@$]+([a-zA-ZáéíóúñÁÉÍÓÚÑ])/g, '$1$2');

  // 4. Reemplazar cualquier símbolo de ruido restante por espacios
  text = text.replace(/[<>/\\|_^~*+=#@$]/g, ' ');

  // 5. Normalizar espacios en blanco y pasar a minúsculas
  text = text.replace(/\s+/g, ' ').trim().toLowerCase();

  return text;
}
