import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 3 · Auditor Contract Tests", () => {
  let adminToken = "";

  before(async () => {
    // 1. Autenticación (Auditoría está restringida a ADMIN según specs/middlewares, vamos a usar admin@pulso360.co)
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "admin@pulso360.co", contrasena: "Pulso360#2026" });
    adminToken = adminRes.body.data.token;
  });

  describe("GET /api/v1/auditor/logs", () => {
    it("debe retornar 200 OK con lista de logs inmutables", async () => {
      const res = await request(app)
        .get("/api/v1/auditor/logs")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de logs");
      if (res.body.data.length > 0) {
        const log = res.body.data[0];
        assert.ok(log.id);
        assert.ok(log.entidad_afectada);
        assert.ok(log.accion);
      }
    });
  });

  describe("POST /api/v1/auditor/export", () => {
    it("debe retornar 200 OK con metadatos de exportación", async () => {
      const payload = {
        entidadAfectada: "consentimientos"
      };

      const res = await request(app)
        .post("/api/v1/auditor/export")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload)
        .expect("Content-Type", /json/)
        .expect(200); // Controller podría retornar 200 o 201

      assertSuccessContract(res.body);
      assert.ok(res.body.data.exportId);
      assert.ok(res.body.data.timestamp);
      assert.ok(res.body.data.entidadAfectada);
    });
  });
});
