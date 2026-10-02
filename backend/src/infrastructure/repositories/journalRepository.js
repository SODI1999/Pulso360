import pool from '../db.js';

function formatJournal(row) {
  if (!row) return null;
  return {
    ...row,
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
    const { rows } = await pool.query(query, values);
    return formatJournal(rows[0]);
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
  }
};

