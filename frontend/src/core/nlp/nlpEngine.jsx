// src/core/nlp/nlpEngine.jsx
// Motor léxico determinista de Procesamiento de Lenguaje Natural (NLP) para detección de riesgos psicosociales

import { pulsoStore } from '../storage/pulsoStore';
import { env } from '../config/env';
import { apiClient } from '../api/apiClient';
import { sanitizeInputText, stripDiacritics } from './nlpSanitizer';
import { stemSpanish } from './spanishStemmer';
import { damerauLevenshtein } from './damerauLevenshtein';

// Categorías clínicas/operativas y sus respectivos términos asociados (Léxico BPO)
export const NLP_CATEGORIES = {
  'Sobrecarga percibida': [
    'sobrecarga',
    'saturado',
    'saturada',
    'saturacion',
    'saturación',
    'sobrecargado',
    'sobrecargada',
    'demasiadas llamadas',
    'mucho volumen',
    'llamada tras llamada',
    'back to back',
    'cola interminable',
    'sin parar',
    'sin pausa',
    'sin respiro',
    'cola',
    'presión',
    'presion'
  ],
  'Recuperación insuficiente': [
    'agotado',
    'agotada',
    'agotamiento',
    'cansado',
    'cansada',
    'cansancio',
    'fatiga',
    'pereza',
    'desgano',
    'desganado',
    'desganada',
    'agobio',
    'agobiado',
    'agobiada',
    'desesperacion',
    'desesperación',
    'sin descansar',
    'no descansé',
    'no descanse',
    'sin recuperar',
    'sin fuerzas',
    'dormí mal',
    'dormi mal'
  ],
  'Exigencia emocional': [
    'insultos',
    'insulto',
    'insultar',
    'gritos',
    'grito',
    'gritar',
    'gritando',
    'grosero',
    'grosera',
    'groserias',
    'groserías',
    'maltrato',
    'falta de respeto',
    'déspota',
    'despota',
    'altanero',
    'altanera',
    'cliente agresivo',
    'cliente molesto',
    'angustia',
    'llorar',
    'rabia',
    'ira',
    'enojo',
    'enojado',
    'enojada',
    'furia',
    'furioso',
    'furiosa',
    'frustracion',
    'frustración',
    'frustrado',
    'frustrada',
    'impotencia',
    'desespero',
    'emocionalmente difícil',
    'emocionalmente dificil'
  ],
  'Conflicto de rol': [
    'instrucciones contradictorias',
    'orden contradictoria',
    'procedimiento confuso',
    'no sé qué hacer',
    'no se que hacer',
    'dos instrucciones',
    'conflicto de rol',
    'cambio de guion'
  ],
  'Bajo apoyo organizacional': [
    'sin apoyo',
    'no me apoyan',
    'sin ayuda',
    'supervisor ausente',
    'nadie responde',
    'aislado',
    'aislada',
    'solo con esto',
    'sola con esto',
    'mi líder no ayuda',
    'mi lider no ayuda'
  ],
  'Distanciamiento laboral': [
    'me da igual',
    'desconectado del trabajo',
    'desconectada del trabajo',
    'desmotivado',
    'desmotivada',
    'aburrido',
    'aburrida',
    'sin ganas',
    'no me importa',
    'distante',
    'evito involucrarme'
  ],
  'Frustración por métricas operativas': [
    'aht',
    'fcr',
    'csat',
    'métrica',
    'metrica',
    'bono por meta',
    'presión por tiempo',
    'presion por tiempo',
    'presion de metricas',
    'presion de métricas',
    'tiempo en llamada',
    'meta imposible'
  ],
  'Percepción de ineficacia': [
    'no sirvo',
    'no logro nada',
    'ineficaz',
    'mi trabajo no sirve',
    'no fui capaz',
    'no puedo hacerlo bien',
    'me bloquee',
    'me bloqueé',
    'no supe responder',
    'no resolvi',
    'no resolví'
  ]
};

// Frases centinela para el protocolo de apoyo inmediato en crisis
export const CRISIS_PHRASES = [
  'no puedo más',
  'no puedo mas',
  'no doy más',
  'no doy mas',
  'no aguanto más',
  'no aguanto mas',
  'quiero morir',
  'morir',
  'morirme',
  'me quiero morir',
  'me voy a morir',
  'hacerme daño',
  'hacerme dano',
  'acabar con todo',
  'acabar con mi vida',
  'no quiero seguir',
  'lastimarme',
  'quitarme la vida',
  'suicidarme',
  'suicidar',
  'suicidare',
  'suicidaré',
  'suicidio',
  'suicidarse',
  'suicida',
  'autolesion',
  'autolesionarme',
  'desvivirme',
  'matarme',
  'matar',
  'me quiero matar',
  'me voy a matar',
  'quiero matar',
  'me mato',
  'ahorcarme',
  'cortarme'
];

// Disparadores de negación (patrón NegEx en español) e intensificadores gramaticales
const NEGATORS = [
  'no',
  'nunca',
  'jamás',
  'jamas',
  'sin',
  'ningun',
  'ningún',
  'ninguna',
  'tampoco',
  'cero',
  'para nada'
];

const INTENSIFIERS = [
  'muy',
  'demasiado',
  'demasiada',
  'totalmente',
  'siempre',
  'super',
  'súper',
  'bastante'
];

let activeLexicon = null;

function dictionary() {
  if (env.useMockStorage) {
    return {
      categories: NLP_CATEGORIES,
      crisis: CRISIS_PHRASES,
      negators: NEGATORS,
      intensifiers: INTENSIFIERS
    };
  }
  if (!activeLexicon) throw new Error('Carga el léxico autorizado antes de analizar.');
  return { ...activeLexicon.dictionary, crisis: activeLexicon.dictionary.crisisPhrases };
}

export const nlpEngine = {
  loadActiveLexicon: async () => {
    if (env.useMockStorage) return;
    activeLexicon = null;
    const response = await apiClient.get('/nlp/lexicon/active');
    activeLexicon = response.data;
  },

  // Versión activa del clasificador léxico configurada en el sistema
  getVersion: () =>
    env.useMockStorage
      ? pulsoStore.get().settings?.nlpVersion || 'lexico-v1.2'
      : activeLexicon?.version,

  // Lista de nombres de categorías soportadas
  getCategoryNames: () =>
    Object.keys(env.useMockStorage ? NLP_CATEGORIES : activeLexicon?.dictionary?.categories || {}),

  // Análisis de texto determinista y explicable de 4 capas
  analyze: (rawText = '') => {
    // Capa 1: Sanitización ortopédica, elongaciones y desacentuación simétrica
    const cleanText = sanitizeInputText(rawText);
    const unaccentedText = stripDiacritics(cleanText);

    // Tokenización y lematización morfológica (Capa 2: Stemming Snowball)
    const tokens = cleanText.split(/\s+/).filter(Boolean);
    const unaccentedTokens = tokens.map(stripDiacritics);
    const stemmedTokens = unaccentedTokens.map(stemSpanish);

    const activeDict = dictionary();
    const crisisList = activeDict.crisis || CRISIS_PHRASES;

    // 1. Detección preventiva de alerta de crisis:
    // A) Frases compuestas multipalabra (subcadenas literales desacentuadas)
    const directPhraseMatch = crisisList.some((phrase) => {
      const cleanPhrase = phrase.toLowerCase().trim();
      const unaccentedPhrase = stripDiacritics(cleanPhrase);
      return cleanText.includes(cleanPhrase) || unaccentedText.includes(unaccentedPhrase);
    });

    // B) Coincidencia de tokens individuales con Stemming y Damerau-Levenshtein <= 1
    const singleCrisisTerms = crisisList
      .filter((phrase) => !phrase.includes(' '))
      .map((p) => stripDiacritics(p.toLowerCase().trim()));
    const singleCrisisStems = singleCrisisTerms.map(stemSpanish);

    const tokenCrisisMatch = unaccentedTokens.some((tok, idx) => {
      const tokStem = stemmedTokens[idx];
      return singleCrisisTerms.some((term, tIdx) => {
        const termStem = singleCrisisStems[tIdx];
        if (tok === term) return true;
        if (termStem.length >= 3 && tokStem === termStem) return true;
        // Tolerancia a erratas de digitación en teclado (Damerau-Levenshtein):
        // Para términos largos (>= 7 caracteres como 'suicidare'/'suicidarme'), tolera distancia <= 2 (ej. 'suciadare')
        // Para términos medianos (>= 5 caracteres como 'suicidar'/'matarme'), tolera distancia <= 1 (ej. 'csuicidar')
        const maxDist = term.length >= 7 ? 2 : (term.length >= 5 ? 1 : 0);
        if (maxDist > 0 && tok.length >= 4 && damerauLevenshtein(tok, term) <= maxDist) return true;
        if (termStem.length >= 4 && tokStem.length >= 4 && damerauLevenshtein(tokStem, termStem) <= 1) return true;
        return false;
      });
    });

    const isCrisisAlert = directPhraseMatch || tokenCrisisMatch;
    const negatorList = (activeDict.negators || NEGATORS).map((n) => stripDiacritics(n.toLowerCase()));
    const intensifierList = (activeDict.intensifiers || INTENSIFIERS).map((i) =>
      stripDiacritics(i.toLowerCase())
    );

    // 2. Evaluación de cada categoría contra el léxico
    const results = [];

    Object.entries(activeDict.categories).forEach(([name, lexicon]) => {
      let score = 0;
      const evidence = [];
      const matchedTokenIndices = new Set();

      // Fase A: Términos compuestos / frases de múltiples palabras primero (ej: 'cliente agresivo', 'back to back')
      const multiWordTerms = lexicon.filter((term) => term.includes(' '));
      multiWordTerms.forEach((term) => {
        const termClean = term.toLowerCase().trim();
        const termUnaccented = stripDiacritics(termClean);

        if (cleanText.includes(termClean) || unaccentedText.includes(termUnaccented)) {
          // Localizar la posición de la frase para la ventana de negación (NegEx)
          const firstWord = termUnaccented.split(/\s+/)[0];
          const firstIdx = unaccentedTokens.indexOf(firstWord);
          const windowTokens = unaccentedTokens.slice(Math.max(0, firstIdx - 3), firstIdx);
          const windowStr = windowTokens.join(' ');

          const isNegated =
            windowTokens.some((w) => negatorList.includes(w)) ||
            negatorList.some((neg) => neg.includes(' ') && windowStr.includes(neg));

          if (!isNegated) {
            score += 1;
            evidence.push(term);
          }
        }
      });

      // Fase B: Términos de una sola palabra con lematización y tolerancia Damerau-Levenshtein
      const singleWordTerms = lexicon.filter((term) => !term.includes(' '));
      singleWordTerms.forEach((term) => {
        const termClean = term.toLowerCase().trim();
        const termUnaccented = stripDiacritics(termClean);
        const termStem = stemSpanish(termUnaccented);

        for (let i = 0; i < unaccentedTokens.length; i++) {
          if (matchedTokenIndices.has(i)) continue; // Un token solo puntúa una vez por categoría

          const tok = unaccentedTokens[i];
          const tokStem = stemmedTokens[i];

          let isMatch = false;

          // 1. Coincidencia exacta desacentuada
          if (tok === termUnaccented) {
            isMatch = true;
          }
          // 2. Coincidencia morfológica por raíz Snowball
          else if (tokStem === termStem) {
            isMatch = true;
          }
          // 3. Coincidencia por tolerancia tipográfica Damerau-Levenshtein (distancia <= 1 para palabras de 4+ letras)
          else if (tok.length >= 4 && damerauLevenshtein(tok, termUnaccented) <= 1) {
            isMatch = true;
          }

          if (isMatch) {
            matchedTokenIndices.add(i);

            // Ventana de negación NegEx (3 palabras previas)
            const windowTokens = unaccentedTokens.slice(Math.max(0, i - 3), i);
            const windowStr = windowTokens.join(' ');

            const isNegated =
              windowTokens.some((w) => negatorList.includes(w)) ||
              negatorList.some((neg) => neg.includes(' ') && windowStr.includes(neg));

            if (!isNegated) {
              const prevToken = unaccentedTokens[i - 1] || '';
              if (intensifierList.includes(prevToken)) {
                score += 1.5;
              } else {
                score += 1;
              }
              // Siempre emitir el término canónico exacto registrado en el diccionario para el backend
              evidence.push(term);
            }
            break;
          }
        }
      });

      if (score > 0) {
        // Cálculo de confianza normalizado
        let confidence;
        if (score === 1) {
          confidence = 0.55;
        } else {
          confidence = Math.min(0.95, Number((0.55 + (score - 1) * 0.15).toFixed(2)));
        }
        results.push({ name, confidence, evidence: [...new Set(evidence)] });
      }
    });

    // 3. Ordenar por mayor confianza y seleccionar el top 3
    results.sort((a, b) => b.confidence - a.confidence);
    const topCategories = results.slice(0, 3);

    return {
      version: nlpEngine.getVersion(),
      categories: topCategories,
      requiresReview: topCategories.some((item) => item.confidence < 0.6),
      isCrisisAlert
    };
  }
};
