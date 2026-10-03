import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertErrorContract, assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 3 · Supervisor Contract Tests", () => {
  let supervisorToken = "";
  let agentToken = "";

  before(async () => {
    // 1. Limpieza preventiva
    await pool.query("DELETE FROM seguimientos_intervencion WHERE id LIKE 'test-seg-%'");
    await pool.query("DELETE FROM sst_intervenciones WHERE id LIKE 'test-int-%'");
    
    // 2. Insertar datos de prueba
    await pool.query(`
      INSERT INTO sst_intervenciones 
      (id, alerta_id, title, type, campana_id, equipo_id, creator_id, assigned_to, status, start_date, end_date, indicator, target_desc, external_action)
      VALUES 
      ('test-int-sup-1', NULL, 'Test Intervention Supervisor', 'Pausas activas coordinadas', 'camp-1', 'team-alpha-1', 'usr-3', 'usr-2', 'Activa', '2026-10-01', '2026-10-31', 'Recuperacion agregada', 'Target test', NULL)
      ON CONFLICT (id) DO NOTHING
    `);

    // 3. Autenticación
    const supRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "supervisor@pulso360.co", contrasena: "Pulso360#2026" });
    supervisorToken = supRes.body.data.token;

    const agentRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "agente@pulso360.co", contrasena: "Pulso360#2026" });
    agentToken = agentRes.body.data.token;
  });

  after(async () => {
    try {
      await pool.query("DELETE FROM seguimientos_intervencion WHERE id LIKE 'test-seg-%'");
      await pool.query("DELETE FROM sst_intervenciones WHERE id LIKE 'test-int-%'");
    } catch {
      // Ignorar
    }
  });

  describe("GET /api/v1/supervisor/actions", () => {
    it("debe retornar 200 OK con arreglo de intervenciones y seguimientos con token de supervisor", async () => {
      const res = await request(app)
        .get("/api/v1/supervisor/actions")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de acciones");
      
      const testInt = res.body.data.find(i => i.id === 'test-int-sup-1' || i.id === 'int-1' || i.id === 'int-2');
      assert.ok(testInt, "Debe contener al menos una intervención");
      assert.ok(Array.isArray(testInt.seguimientos), "Debe contener seguimientos");
    });

    it("debe retornar 403 Forbidden si un agente intenta acceder", async () => {
      const res = await request(app)
        .get("/api/v1/supervisor/actions")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });
  });

  describe("POST /api/v1/supervisor/actions/:id/followup", () => {
    it("debe retornar 200 OK actualizando avance y agregando seguimiento", async () => {
      const res = await request(app)
        .post("/api/v1/supervisor/actions/test-int-sup-1/followup")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({
          progress: 50,
          note: "Avance de prueba"
        })
        .expect("Content-Type", /json/)
        .expect("Content-Type", /json/)
        .expect(201);

      assertSuccessContract(res.body);
      assert.equal(res.body.data.progreso_reportado, 50, "El progreso debe actualizarse");
      assert.equal(res.body.data.nota_avance, "Avance de prueba", "La nota debe coincidir");
    });
  });
});
