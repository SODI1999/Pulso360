import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { assertErrorContract } from "../harness/contractValidator.js";

describe("P05 · HTTP API Contract Tests (Test Harness)", () => {
  describe("GET /api/v1/health (RNF-03)", () => {
    it("debe responder con HTTP 200 y el esquema canónico de salud", async () => {
      const res = await request(app)
        .get("/api/v1/health")
        .expect("Content-Type", /json/)
        .expect(200);

      assert.equal(res.body.status, "ok");
      assert.equal(res.body.database, "connected");
      assert.ok(res.body.timestamp, "Debe contener marca de tiempo");
    });
  });

  describe("Manejo Unificado de Rutas Inexistentes (404 Not Found)", () => {
    it("debe retornar HTTP 404 con el estándar de error SDD ante rutas no implementadas", async () => {
      const res = await request(app)
        .get("/api/v1/ruta-inexistente-demo")
        .expect("Content-Type", /json/)
        .expect(404);

      assertErrorContract(res.body, "RESOURCE_NOT_FOUND");
    });
  });
});
