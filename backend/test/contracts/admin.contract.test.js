import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertErrorContract, assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 3 · Admin Contract Tests", () => {
  let adminToken = "";

  before(async () => {
    // 1. Limpieza
    await pool.query("DELETE FROM politicas_privacidad WHERE version = 'vTest'");

    // 2. Autenticación
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "admin@pulso360.co", contrasena: "Pulso360#2026" });
    adminToken = adminRes.body.data.token;
  });

  after(async () => {
    try {
      await pool.query("DELETE FROM politicas_privacidad WHERE version = 'vTest'");
    } catch {
      // Ignorar
    }
  });

  describe("GET /api/v1/admin/users", () => {
    it("debe retornar 200 OK con usuarios normalizados", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de usuarios");
      if (res.body.data.length > 0) {
        const user = res.body.data[0];
        assert.ok(user.id);
        assert.ok(user.correo);
        assert.ok(user.rol_codigo);
      }
    });
  });

  describe("GET /api/v1/admin/organization", () => {
    it("debe retornar 200 OK con campañas y equipos", async () => {
      const res = await request(app)
        .get("/api/v1/admin/organization")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de campañas");
      if (res.body.data.length > 0) {
        const campana = res.body.data[0];
        assert.ok(campana.id);
        assert.ok(Array.isArray(campana.equipos));
      }
    });
  });

  describe("GET /api/v1/admin/params", () => {
    it("debe retornar 200 OK con configuración y políticas", async () => {
      const res = await request(app)
        .get("/api/v1/admin/params")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(res.body.data.params, "Debe contener params");
      assert.ok(res.body.data.policies, "Debe contener policies");
      assert.ok(Array.isArray(res.body.data.policies));
    });
  });

  describe("POST /api/v1/admin/policies", () => {
    it("debe retornar 201 o 200 creando política válida con hash", async () => {
      const payload = {
        version: "vTest-" + Date.now(),
        titulo: "Política Test",
        textoPolitica: "Texto de prueba",
        textoAviso: "Aviso de prueba"
      };

      const res = await request(app)
        .post("/api/v1/admin/policies")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload)
        .expect("Content-Type", /json/)
        .expect(201); // Ojo si en el controller usa 200 o 201

      assertSuccessContract(res.body);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.version, payload.version);
    });
  });

  describe("GET /api/v1/admin/habeas-data", () => {
    it("debe retornar 200 OK con solicitudes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/habeas-data")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo");
    });
  });
});
