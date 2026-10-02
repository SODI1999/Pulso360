/**
 * Pulso360 — Test Harness: Validador de Contratos y Esquemas SDD
 * Utilidad del arnés de pruebas para verificar que las respuestas HTTP
 * y los objetos de dominio cumplan con los estándares de la especificación.
 */

import assert from "node:assert/strict";

/**
 * Valida que una respuesta de error cumpla con el estándar SDD de Pulso360:
 * { success: false, error: { message: string, code: string } }
 * @param {object} body - Cuerpo JSON de la respuesta
 * @param {string} expectedCode - Código de error semántico esperado
 */
export function assertErrorContract(body, expectedCode = null) {
  assert.equal(body.success, false, "El campo 'success' debe ser false en respuestas de error");
  assert.ok(body.error, "La respuesta debe contener la propiedad 'error'");
  assert.equal(typeof body.error.message, "string", "'error.message' debe ser una cadena legible");
  assert.ok(body.error.message.length > 0, "'error.message' no puede estar vacío");
  assert.equal(typeof body.error.code, "string", "'error.code' debe ser una cadena");
  
  if (expectedCode) {
    assert.equal(body.error.code, expectedCode, `Se esperaba el código de error '${expectedCode}', se obtuvo '${body.error.code}'`);
  }
}

/**
 * Valida que una respuesta exitosa cumpla con el estándar SDD:
 * { success: true, data: { ... } }
 * @param {object} body - Cuerpo JSON de la respuesta
 */
export function assertSuccessContract(body) {
  assert.equal(body.success, true, "El campo 'success' debe ser true en respuestas exitosas");
  assert.ok("data" in body, "La respuesta exitosa debe contener la propiedad 'data'");
}
