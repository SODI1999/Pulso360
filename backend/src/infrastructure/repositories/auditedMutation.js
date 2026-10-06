import { transaction } from '../db.js';
import { createLog } from './auditorRepository.js';

// El evento se confirma únicamente si la mutación se confirma en la misma transacción.
export function auditedMutation(operation, event) {
  return transaction(async client => {
    const result = await operation(client);
    if (result) await createLog(typeof event === 'function' ? event(result) : event,client);
    return result;
  });
}
