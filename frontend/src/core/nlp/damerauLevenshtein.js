// src/core/nlp/damerauLevenshtein.js
// Cálculo determinista de distancia Damerau-Levenshtein con soporte para transposiciones adyacentes

/**
 * Calcula la distancia de Damerau-Levenshtein entre dos cadenas.
 * Soporta inserciones, eliminaciones, sustituciones y transposiciones de caracteres adyacentes.
 * Complejidad temporal O(N*M), espacio O(N*M).
 * @param {string} source - Cadena de origen
 * @param {string} target - Cadena de destino
 * @returns {number} Distancia mínima de edición
 */
export function damerauLevenshtein(source = '', target = '') {
  const s = source || '';
  const t = target || '';
  const sLen = s.length;
  const tLen = t.length;

  if (s === t) return 0;
  if (sLen === 0) return tLen;
  if (tLen === 0) return sLen;

  const maxDist = sLen + tLen;
  const h = Array.from({ length: sLen + 2 }, () => new Array(tLen + 2).fill(0));

  h[0][0] = maxDist;
  for (let i = 0; i <= sLen; i++) {
    h[i + 1][0] = maxDist;
    h[i + 1][1] = i;
  }
  for (let j = 0; j <= tLen; j++) {
    h[0][j + 1] = maxDist;
    h[1][j + 1] = j;
  }

  const da = {};

  for (let i = 1; i <= sLen; i++) {
    let db = 0;
    for (let j = 1; j <= tLen; j++) {
      const k = da[t[j - 1]] || 0;
      const l = db;
      let cost = 0;
      if (s[i - 1] === t[j - 1]) {
        db = j;
      } else {
        cost = 1;
      }

      h[i + 1][j + 1] = Math.min(
        h[i][j + 1] + 1,
        h[i + 1][j] + 1,
        h[i][j] + cost,
        k > 0 && l > 0 ? h[k][l] + (i - k - 1) + 1 + (j - l - 1) : maxDist
      );
    }
    da[s[i - 1]] = i;
  }

  return h[sLen + 1][tLen + 1];
}

/**
 * Evalúa si un token coincide con algún término o lema objetivo permitiendo una tolerancia de edición.
 * @param {string} token - Palabra a comparar
 * @param {string[]} targets - Lista de términos válidos
 * @param {number} maxDistance - Distancia máxima tolerada (default 1)
 * @returns {string|null} Término coincidente o null si supera la tolerancia
 */
export function matchWithTolerance(token = '', targets = [], maxDistance = 1) {
  if (!token || !Array.isArray(targets) || targets.length === 0) return null;

  // Si la palabra es muy corta (< 4 letras), solo permitimos coincidencia exacta para evitar falsos positivos
  if (token.length < 4) {
    return targets.includes(token) ? token : null;
  }

  for (const target of targets) {
    if (Math.abs(token.length - target.length) > maxDistance) continue;
    if (token === target) return target;
    if (damerauLevenshtein(token, target) <= maxDistance) {
      return target;
    }
  }

  return null;
}
