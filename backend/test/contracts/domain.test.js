import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluarKAnonimato,
  validarDimensionesCheckin,
  tieneConsentimientoActivo,
  K_ANONYMITY_THRESHOLD
} from "../../src/domain/privacyRules.js";

describe("P08 · Domain Contracts & Invariants (Test Harness)", () => {
  describe("Regla 1: Invariante de k-Anonimato (k >= 5)", () => {
    it("debe suprimir métricas y retornar estado protegido cuando la cohorte es menor al umbral (k < 5)", () => {
      const cohortePequena = [0, 1, 2, 3, 4];
      for (const n of cohortePequena) {
        const resultado = evaluarKAnonimato(n);
        assert.equal(resultado.protected, true, `Para n=${n} debe ser protegido`);
        assert.ok(resultado.reason.includes("k < 5"), "Debe indicar la razón de protección k < 5");
        assert.equal(resultado.cohort_count, n);
        assert.equal(resultado.k_threshold, K_ANONYMITY_THRESHOLD);
      }
    });

    it("debe permitir la emisión de métricas cuando la cohorte alcanza o supera el umbral (k >= 5)", () => {
      const cohortesValidas = [5, 6, 14, 100];
      for (const n of cohortesValidas) {
        const resultado = evaluarKAnonimato(n);
        assert.equal(resultado.protected, false, `Para n=${n} no debe estar protegido`);
        assert.equal(resultado.reason, null);
        assert.equal(resultado.cohort_count, n);
      }
    });
  });

  describe("Regla 3: Validación de las 6 Dimensiones del Check-in", () => {
    it("debe aceptar un registro completo con enteros entre 1 y 5", () => {
      const payloadValido = {
        energia: 4,
        carga_emocional: 3,
        recuperacion: 4,
        apoyo: 5,
        distanciamiento: 1,
        ineficacia: 2
      };
      const res = validarDimensionesCheckin(payloadValido);
      assert.equal(res.valid, true);
      assert.equal(res.errors.length, 0);
    });

    it("debe rechazar dimensiones fuera del rango 1 a 5 (valores 0 o 6)", () => {
      const payloadInvalido = {
        energia: 6, // Fuera de rango
        carga_emocional: 0, // Fuera de rango
        recuperacion: 4,
        apoyo: 5,
        distanciamiento: 1,
        ineficacia: 2
      };
      const res = validarDimensionesCheckin(payloadInvalido);
      assert.equal(res.valid, false);
      assert.ok(res.errors.length >= 2);
    });

    it("debe rechazar dimensiones fraccionarias (ej. 3.5)", () => {
      const payloadDecimal = {
        energia: 3.5,
        carga_emocional: 4,
        recuperacion: 3,
        apoyo: 4,
        distanciamiento: 2,
        ineficacia: 1
      };
      const res = validarDimensionesCheckin(payloadDecimal);
      assert.equal(res.valid, false);
      assert.ok(res.errors.some(e => e.includes("entero")));
    });

    it("debe rechazar cuando falte alguna de las 6 dimensiones obligatorias", () => {
      const payloadIncompleto = {
        energia: 4,
        carga_emocional: 3
        // faltan 4 dimensiones
      };
      const res = validarDimensionesCheckin(payloadIncompleto);
      assert.equal(res.valid, false);
      assert.equal(res.errors.length, 4);
    });
  });

  describe("Regla 4: Verificación de Consentimiento Informado (C1..C5)", () => {
    it("debe retornar true solo si la política general fue aceptada y el flag específico está activo", () => {
      const consentimientoActivo = {
        acepta_politica: true,
        c1_checkin: true,
        c2_bitacora: false
      };

      assert.equal(tieneConsentimientoActivo(consentimientoActivo, "c1_checkin"), true);
      assert.equal(tieneConsentimientoActivo(consentimientoActivo, "c2_bitacora"), false);
      assert.equal(tieneConsentimientoActivo(consentimientoActivo, "c3_apoyo"), false);
    });

    it("debe retornar false si la política general no fue aceptada aunque el flag esté en true", () => {
      const consentimientoSinPolitica = {
        acepta_politica: false,
        c1_checkin: true
      };

      assert.equal(tieneConsentimientoActivo(consentimientoSinPolitica, "c1_checkin"), false);
    });

    it("debe retornar false para valores nulos o indefinidos", () => {
      assert.equal(tieneConsentimientoActivo(null, "c1_checkin"), false);
      assert.equal(tieneConsentimientoActivo(undefined, "c1_checkin"), false);
    });
  });
});
