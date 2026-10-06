import crypto from 'node:crypto';
import { canonicalJson } from './canonicalJson.js';

export const GENESIS_HASH = crypto.createHash('sha256').update('Pulso360:audit:genesis:v2').digest('hex');
export function auditHash(row) {
  const payload = {
    id: String(row.id), actor: row.actor_reference || null, role: row.rol || null,
    action: row.action, resource: row.resource, resourceId: row.resource_id || null,
    details: row.details || {}, ip: row.ip_address || null,
    createdAt: new Date(row.created_at).toISOString(), previous: row.prev_hash, version: 2
  };
  return crypto.createHash('sha256').update(canonicalJson(payload)).digest('hex');
}
