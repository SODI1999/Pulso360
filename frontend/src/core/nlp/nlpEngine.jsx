// src/core/nlp/nlpEngine.jsx
// Motor léxico determinista de Procesamiento de Lenguaje Natural (NLP) para detección de riesgos psicosociales

import { pulsoStore } from '../storage/pulsoStore';
import { env } from '../config/env';
import { apiClient } from '../api/apiClient';

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
let activeLexicon = null;
function dictionary() {
  if (env.useMockStorage) return { categories:NLP_CATEGORIES,crisis:CRISIS_PHRASES,negators:NEGATORS,intensifiers:INTENSIFIERS };
  if (!activeLexicon) throw new Error('Carga el léxico autorizado antes de analizar.');
  return { ...activeLexicon.dictionary,crisis:activeLexicon.dictionary.crisisPhrases };
}

// Normalización de texto (minúsculas, colapso de espacios múltiples)
const normalize = (text = '') => text.toLowerCase().replace(/\s+/g, ' ').trim();

// Comprobar si existe una negación en una ventana de 3 palabras previas al término
const hasNegationNear = (text, phrase) => {
  const phraseIndex = text.indexOf(phrase);
  if (phraseIndex < 0) return false;

  const wordsBefore = text
    .slice(Math.max(0, phraseIndex - 35), phraseIndex)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-3);
  return wordsBefore.some((word) => dictionary().negators.includes(word));
};

export const nlpEngine = {
  loadActiveLexicon: async () => {
    if (env.useMockStorage) return;
    // Se vuelve a consultar: una activación o revocación no puede usar una caché indefinida.
    activeLexicon = null;
    const response = await apiClient.get('/nlp/lexicon/active');
    activeLexicon = response.data;
  },
  // Versión activa del clasificador léxico configurada en el sistema
  getVersion: () => env.useMockStorage ? pulsoStore.get().settings?.nlpVersion || 'lexico-v1.2' : activeLexicon?.version,

  // Lista de nombres de categorías soportadas
  getCategoryNames: () => Object.keys(env.useMockStorage ? NLP_CATEGORIES : activeLexicon?.dictionary?.categories || {}),

  // Análisis de texto determinista
  analyze: (rawText = '') => {
    const text = normalize(rawText);

    // 1. Detección preventiva de alerta de crisis
    const isCrisisAlert = dictionary().crisis.some((phrase) => text.includes(phrase));

    // 2. Evaluación de cada categoría contra el léxico
    const results = [];
    Object.entries(dictionary().categories).forEach(([name, lexicon]) => {
      let score = 0;
      const evidence = [];

      lexicon.forEach((term) => {
        if (!text.includes(term)) return;
        if (hasNegationNear(text, term)) return;

        // Detectar si tiene un intensificador previo
        const termIndex = text.indexOf(term);
        const precedingWords = text
          .slice(Math.max(0, termIndex - 25), termIndex)
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        const previousWord = precedingWords.slice(-1)[0] || '';

        if (dictionary().intensifiers.includes(previousWord)) {
          score += 1.5;
        } else {
          score += 1;
        }

        evidence.push(term);
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
