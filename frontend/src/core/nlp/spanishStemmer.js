// src/core/nlp/spanishStemmer.js
// Lematizador determinista de raíces para español basado en las reglas del algoritmo Snowball (Martin Porter)

/**
 * Reduce una palabra en español a su raíz morfológica canónica (stem).
 * Remueve sufijos flexivos verbales (conjugaciones en pasado, presente, gerundio, copretérito),
 * sufijos derivativos y marcas de género y número.
 *
 * @param {string} word - Palabra individual a procesar
 * @returns {string} Raíz canónica
 */
export function stemSpanish(word = '') {
  if (typeof word !== 'string' || word.length < 3) return word;

  // 1. Normalización inicial: minúsculas y desacentuación
  let w = word
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u');

  // 2. Paso Plural: Quitar terminación plural '-ces' -> 'z', '-es', '-s'
  if (w.endsWith('ces') && w.length >= 5) {
    w = w.slice(0, -3) + 'z';
  } else if (w.endsWith('es') && w.length >= 5) {
    w = w.slice(0, -2);
  } else if (w.endsWith('s') && w.length >= 4) {
    w = w.slice(0, -1);
  }

  // 3. Paso Sufijos Nominales y Derivativos
  let strippedNoun = false;
  const nounSuffixes = [
    'amientos', 'imientos', 'amiento', 'imiento', 'aciones', 'acion',
    'idades', 'idad', 'anzas', 'anza', 'ismos', 'ismo', 'istas', 'ista',
    'ables', 'ibles', 'able', 'ible', 'osos', 'osas', 'oso', 'osa',
    'eria', 'erias', 'mente'
  ];
  for (const suf of nounSuffixes) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      w = w.slice(0, -suf.length);
      strippedNoun = true;
      break;
    }
  }

  // 4. Paso Sufijos Verbales (solo si no se despojó un sufijo nominal)
  if (!strippedNoun) {
    const verbSuffixes = [
      'iamos', 'ieron', 'ieran', 'ieras', 'iesen', 'ieses', 'iendo',
      'arian', 'arias', 'abais', 'abamos', 'aremos', 'eremos', 'iremos',
      'aron', 'aban', 'abas', 'aste', 'ando', 'ador', 'aria',
      'aron', 'emos', 'ados', 'adas', 'idos', 'idas',
      'aba', 'ada', 'ida', 'ido', 'ado', 'ian', 'ias', 'io', 'ar', 'er', 'ir',
      'an', 'en', 'is'
    ];
    for (const suf of verbSuffixes) {
      if (w.endsWith(suf) && w.length - suf.length >= 3) {
        w = w.slice(0, -suf.length);
        break;
      }
    }
  }

  // 5. Paso Residual: Marcas de género/vocal temática ('o', 'a', 'e')
  if ((w.endsWith('o') || w.endsWith('a') || w.endsWith('e')) && w.length >= 4) {
    w = w.slice(0, -1);
  }

  return w;
}
