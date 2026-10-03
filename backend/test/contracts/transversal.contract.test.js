import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 3 · Transversal Contract Tests", () => {
  let agentToken = "";

  before(async () => {
    // 1. Autenticación
    const agentRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "agente@pulso360.co", contrasena: "Pulso360#2026" });
    agentToken = agentRes.body.data.token;
  });

  describe("GET /api/v1/reports", () => {
    it("debe retornar 200 OK con reportes del usuario", async () => {
      const res = await request(app)
        .get("/api/v1/reports")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de reportes");
    });
  });

  describe("GET /api/v1/notifications", () => {
    it("debe retornar 200 OK con notificaciones", async () => {
      const res = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de notificaciones");
    });
  });

  describe("PATCH /api/v1/notifications/read-all", () => {
    it("debe retornar 200 OK marcando leídas", async () => {
      const res = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      // Puede que devuelva data: {} o algún mensaje.
    });
  });
});
