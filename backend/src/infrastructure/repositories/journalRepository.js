import { auditedMutation } from './auditedMutation.js';
import { createLog } from './auditorRepository.js';
import pool from '../db.js';
import crypto from 'node:crypto';
import { AppError } from '../../application/errors/AppError.js';

function formatJournal(row) {
  if (!row) return null;
  return {
    ...row,
    content_hash: crypto.createHash('sha256').update(row.content).digest('hex'),
    analysis_json: Array.isArray(row.analysis_json?.categories) ? row.analysis_json : null,
    corrected_categories_json: row.analysis_json?.correctedCategories ?? null,
    correction_note: row.analysis_json?.correctionNote ?? null,
    correction_history: row.analysis_json?.correctionHistory || [],
    analysis_history: row.analysis_json?.archivedAnalyses || [],
    entry_date: row.entry_date instanceof Date
      ? row.entry_date.toISOString().split('T')[0]
      : String(row.entry_date).slice(0, 10),
    created_at: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at
  };
}

export const journalRepository = {
  async create({ id, userId, asignacionId, entryDate, context, content }) {
    const query = `
      INSERT INTO bitacoras (
        id, usuario_id, asignacion_id, entry_date, context, content
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) RETURNING id, entry_date, context, content, created_at
    `;
    const values = [id, userId, asignacionId, entryDate, context, content];
    return auditedMutation(async client => formatJournal((await client.query(query,values)).rows[0]),
      { usuarioId:userId,rol:'AGENTE',action:'CREACION_BITACORA',resource:'bitacoras',resourceId:id });
  },

  async findByUserId(userId) {
    const query = `
      SELECT id, entry_date, context, content, analysis_json, created_at
      FROM bitacoras
      WHERE usuario_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows.map(formatJournal);
  },

  async delete(id, userId) {
    const query = `
      DELETE FROM bitacoras
      WHERE id = $1 AND usuario_id = $2
      RETURNING id
    `;
    return auditedMutation(async client => (await client.query(query,[id,userId])).rows[0] || null,
      { usuarioId:userId,rol:'AGENTE',action:'ELIMINACION_BITACORA',resource:'bitacoras',resourceId:id });
  },

  async update(id, userId, changes) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query('SELECT * FROM bitacoras WHERE id=$1 AND usuario_id=$2 FOR UPDATE', [id, userId]);
      const row = found.rows[0];
      if (!row) { await client.query('ROLLBACK'); return null; }
      const hash = crypto.createHash('sha256').update(row.content).digest('hex');
      let snapshot = row.analysis_json || {};
      const content = changes.content ?? row.content;
      const archives = [...(snapshot.archivedAnalyses || [])];
      if (content !== row.content || changes.analysis === null) {
        if (Array.isArray(snapshot.categories)) {
          const { archivedAnalyses, ...previous } = snapshot;
          archives.unshift({ ...previous, content:row.content,contentHash: hash, archivedAt: new Date().toISOString() });
        }
        snapshot = { archivedAnalyses: archives };
      }
      if (changes.analysis !== undefined && changes.analysis !== null) {
        if (changes.contentHash !== hash || content !== row.content) {
          throw new AppError('El texto cambió. Vuelve a analizar la entrada.', 'JOURNAL_ANALYSIS_STALE', 409);
        }
        if (Array.isArray(snapshot.categories)) {
          const { archivedAnalyses, ...previous } = snapshot;
          archives.unshift({ ...previous, content:row.content,contentHash: hash, archivedAt: new Date().toISOString() });
        }
        snapshot = { ...changes.analysis, contentHash: hash, archivedAnalyses: archives };
      }
      if (changes.correction) {
        if (changes.contentHash !== hash || !Array.isArray(snapshot.categories)) {
          throw new AppError('El análisis cambió. Actualiza la entrada.', 'JOURNAL_ANALYSIS_STALE', 409);
        }
        const dictionary = (await client.query('SELECT contenido FROM versiones_lexico WHERE codigo_version=$1',[snapshot.version])).rows[0]?.contenido;
        if (!dictionary || changes.correction.categories.some(name => !Object.hasOwn(dictionary.categories,name))) {
          throw new AppError('Categoría no registrada para el análisis de esta entrada.', 'JOURNAL_CORRECTION_INVALID',400);
        }
        const previous = snapshot.correctedCategories || snapshot.categories.map(c => c.name);
        const record = { id: `corr-${crypto.randomUUID()}`, timestamp: new Date().toISOString(),
          modelVersion: snapshot.version, categories: changes.correction.categories,
          previousCategories: previous, note: changes.correction.note, contentHash: hash };
        snapshot = { ...snapshot, correctedCategories: record.categories, correctionNote: record.note,
          correctionHistory: [record, ...(snapshot.correctionHistory || [])] };
      }
      const { rows } = await client.query(`UPDATE bitacoras SET content=$3, analysis_json=$4,context=COALESCE($5,context)
        WHERE id=$1 AND usuario_id=$2 RETURNING *`, [id, userId, content, JSON.stringify(snapshot),changes.context ?? null]);
      await createLog({ usuarioId:userId,rol:'AGENTE',action:changes.correction ? 'CORRECCION_NLP' : changes.analysis !== undefined ? 'ACTUALIZACION_ANALISIS_NLP' : 'EDICION_BITACORA',resource:'bitacoras',resourceId:id,
        details:changes.analysis?.version ? {lexiconVersion:changes.analysis.version} : {} },client);
      await client.query('COMMIT');
      return formatJournal(rows[0]);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
};
