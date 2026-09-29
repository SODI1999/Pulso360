// src/core/nlp/nlpEngine.jsx
// Motor léxico determinista de Procesamiento de Lenguaje Natural (NLP) para detección de riesgos psicosociales

import { pulsoStore } from '../storage/pulsoStore';

// Categorías clínicas/operativas y sus respectivos términos asociados
export const NLP_CATEGORIES = {
  'Sobrecarga percibida': [
    'sobrecarga',
    'saturado',
    'saturada',
    'demasiadas llamadas',
    'mucho volumen',
    'sin parar',
    'cola',
    'presión',
    'presion'
  ],
  'Recuperación insuficiente': [
    'agotado',
    'agotada',
    'sin descansar',
    'no descansé',
    'no descanse',
    'cansancio',
    'fatiga',
    'sin recuperar',
    'dormí mal',
    'dormi mal'
  ],
  'Exigencia emocional': [
    'insultos',
    'gritos',
    'cliente agresivo',
    'cliente molesto',
    'angustia',
    'llorar',
    'emocionalmente difícil',
    'emocionalmente dificil'
  ],
  'Conflicto de rol': [
    'instrucciones contradictorias',
    'no sé qué hacer',
    'no se que hacer',
    'dos instrucciones',
    'conflicto de rol',
    'cambio de guion'
  ],
  'Bajo apoyo organizacional': [
    'sin apoyo',
    'no me apoyan',
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
    'meta imposible'
  ],
  'Percepción de ineficacia': [
    'no sirvo',
    'no logro nada',
    'ineficaz',
    'mi trabajo no sirve',
    'no fui capaz',
    'no puedo hacerlo bien'
  ]
};

// Frases centinela para el protocolo de apoyo inmediato en crisis
export const CRISIS_PHRASES = [
  'no puedo más',
  'no puedo mas',
  'quiero morir',
  'hacerme daño',
  'hacerme dano',
  'acabar con todo',
  'no quiero seguir',
  'lastimarme'
];

// Palabras para detectar negaciones e intensificadores gramaticales
const NEGATORS = ['no', 'nunca', 'jamás', 'jamas', 'sin'];
const INTENSIFIERS = ['muy', 'demasiado', 'demasiada', 'totalmente', 'siempre'];

// Normalización de texto (minúsculas, colapso de espacios múltiples)
const normalize = (text = '') => text.toLowerCase().replace(/\s+/g, ' ').trim();

// Comprobar si existe una negación en una ventana de 3 palabras previas al término
const hasNegationNear = (text, phrase) => {
  const phraseIndex = text.indexOf(phrase);
  if (phraseIndex < 0) return false;

  const wordsBefore = text
    .slice(Math.max(0, phraseIndex - 35), phraseIndex)
    .split(/\s+/)
    .slice(-3);
  return wordsBefore.some((word) => NEGATORS.includes(word));
};

export const nlpEngine = {
  // Versión activa del clasificador léxico configurada en el sistema
  getVersion: () => pulsoStore?.get?.().settings?.nlpVersion || 'lexico-v1.2',

  // Lista de nombres de categorías soportadas
  getCategoryNames: () => Object.keys(NLP_CATEGORIES),

  // Análisis de texto determinista
  analyze: (rawText = '') => {
    const text = normalize(rawText);

    // 1. Detección preventiva de alerta de crisis
    const isCrisisAlert = CRISIS_PHRASES.some((phrase) => text.includes(phrase));

    // 2. Evaluación de cada categoría contra el léxico
    const results = [];
    Object.entries(NLP_CATEGORIES).forEach(([name, lexicon]) => {
      let score = 0;
      const evidence = [];

      lexicon.forEach((term) => {
        if (!text.includes(term)) return;
        if (hasNegationNear(text, term)) return;

        // Detectar si tiene un intensificador previo
        const termIndex = text.indexOf(term);
        const previousWord = text
          .slice(Math.max(0, termIndex - 20), termIndex)
          .split(/\s+/)
          .slice(-1)[0];

        if (INTENSIFIERS.includes(previousWord)) {
          score += 1.5;
        } else {
          score += 1;
        }

        evidence.push(term);
      });

      if (score > 0) {
        // Cálculo de confianza normalizado entre 0.48 y 0.95
        const confidence = Math.min(0.95, Number((0.48 + score * 0.13).toFixed(2)));
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
