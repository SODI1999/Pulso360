import crypto from 'node:crypto';
import { transaction } from '../../infrastructure/db.js';
import { lexiconRepository } from '../../infrastructure/repositories/lexiconRepository.js';
import { canonicalJson } from '../../domain/canonicalJson.js';
import { AppError } from '../errors/AppError.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import { consentRepository } from '../../infrastructure/repositories/consentRepository.js';
import { tieneConsentimientoActivo } from '../../domain/privacyRules.js';

function validateDictionary(row) {
  const content = row?.contenido;
  const terms = value => Array.isArray(value) && value.every(term => typeof term === 'string' && term.trim());
  if (!content?.categories || !Object.keys(content.categories).length ||
      !Object.values(content.categories).every(terms) ||
      !['crisisPhrases', 'negators', 'intensifiers'].every(key => terms(content[key])) ||
      crypto.createHash('sha256').update(canonicalJson(content)).digest('hex') !== row.hash_contenido) {
    throw new AppError('La versión no tiene un diccionario íntegro registrado.', 'LEXICON_INVALID_CONTENT', 409);
  }
  return row;
}

export async function getActiveLexicon(userId) {
  const consent = await consentRepository.findActiveByUserId(userId);
  if (!tieneConsentimientoActivo(consent, 'c2_bitacora') || !tieneConsentimientoActivo(consent, 'c3_apoyo')) {
    throw new AppError('Requiere C2 y C3 vigentes para analizar la bitácora.', 'CONSENT_C3_REQUIRED', 403);
  }
  const row = validateDictionary(await lexiconRepository.findActive());
  return { id: row.id, version: row.codigo_version, hash: row.hash_contenido, dictionary: row.contenido };
}

export async function listLexicons() {
  return lexiconRepository.list();
}

export async function validateAnalysis(analysis,userId) {
  const active = await getActiveLexicon(userId);
  if (analysis.version !== active.version) throw new AppError('Cambió el léxico activo. Vuelve a analizar.', 'LEXICON_VERSION_CHANGED',409);
  if (!Array.isArray(analysis.categories) || analysis.categories.length > 3 || analysis.categories.some(category =>
    !Object.hasOwn(active.dictionary.categories,category.name) || !Number.isFinite(category.confidence) ||
    category.confidence < 0 || category.confidence > 1 || !Array.isArray(category.evidence) ||
    category.evidence.some(term => !active.dictionary.categories[category.name].includes(term)))) {
    throw new AppError('Categorías o evidencias ajenas al diccionario registrado.', 'JOURNAL_ANALYSIS_INVALID',400);
  }
  return { version:active.version,categories:analysis.categories.map(({name,confidence,evidence}) => ({name,confidence,evidence})),
    requiresReview:Boolean(analysis.requiresReview),isCrisisAlert:Boolean(analysis.isCrisisAlert) };
}

export async function activateLexicon(id, actor, revert = false) {
  return transaction(async client => {
    await lexiconRepository.lockActivation(client);
    const active = await lexiconRepository.findActive(client, true);
    if (revert) {
      const previousId = await lexiconRepository.findPreviousId(client);
      if (!previousId) throw new AppError('No hay una activación previa a la cual regresar.', 'LEXICON_NO_PREVIOUS_VERSION', 409);
      id = previousId;
    }
    const row = await lexiconRepository.findForUpdate(id, client);
    if (!row) throw new AppError('Versión no registrada.', 'LEXICON_NOT_FOUND', 404);
    validateDictionary(row);
    if (active?.id === id) return { id, version: row.codigo_version, changed: false };
    await lexiconRepository.activate(id, active?.id || null, actor.id, client);
    await createLog({ usuarioId: actor.id, rol: actor.rol_codigo, action: revert ? 'REVERSION_LEXICO_NLP' : 'ACTIVACION_LEXICO_NLP', resource: 'versiones_lexico', resourceId: id, details: { previousVersionId: active?.id || null } }, client);
    return { id, version: row.codigo_version, prevVersion: active?.codigo_version || null, changed: true };
  });
}
