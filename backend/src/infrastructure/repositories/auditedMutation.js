/**
 * @fileoverview Helper transaccional de orden superior para mutaciones atómicas con registro de auditoría encadenado.
 * Capa: P10 · infrastructure/repositories
 * @module infrastructure/repositories/auditedMutation
 */
import { transaction } from '../db.js';
import { createLog } from './auditorRepository.js';

/**
 * Ejecuta una operación de persistencia y registra su log de auditoría en la misma transacción atómica.
 * El evento se confirma única y exclusivamente si la mutación se confirma con éxito.
 *
 * @template T
 * @param {function(import('pg').PoolClient): Promise<T>} operation - Función asíncrona de mutación sobre el cliente de transacción.
 * @param {Object|function(T): Object} event - Objeto de evento de auditoría o función que lo construye a partir del resultado de la mutación.
 * @returns {Promise<T>} Resultado devuelto por la operación de mutación.
 */
export function auditedMutation(operation, event) {
  return transaction(async client => {
    const result = await operation(client);
    if (result) await createLog(typeof event === 'function' ? event(result) : event,client);
    return result;
  });
}
