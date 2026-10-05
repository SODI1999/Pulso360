import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 3 Â· Transversal Contract Tests", () => {
  let agentToken = "";
  let supervisorToken = "";

  before(async () => {
    // 1. Autenticacion
    const agentRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "agente@pulso360.co", contrasena: "Pulso360#2026" });
    agentToken = agentRes.body.data.token;
    const supRes = await request(app).post('/api/v1/auth/login').send({ correo: 'supervisor@pulso360.co', contrasena: 'Pulso360#2026' });
    supervisorToken = supRes.body.data.token;
  });

  describe("GET /api/v1/reports", () => {
    it("debe retornar 200 OK con reportes del usuario", async () => {
      const res = await request(app)
        .get("/api/v1/reports")
        .set("Authorization", `Bearer ${supervisorToken}`)
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
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de notificaciones");
    });
  });

  describe("PATCH /api/v1/notifications/read-all", () => {
    it("debe retornar 200 OK marcando leÃ­das", async () => {
      const res = await request(app)
        .patch("/api/v1/notifications/read-all")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      // Puede que devuelva data: {} o algÃºn mensaje.
    });
  });
  describe("Ciclo de vida de reportes e Integridad (Canonical JSON)", () => {
    let reportId = `rep-test-${Date.now()}`;
    it("debe retornar 200 OK en la descarga de un reporte intacto (Canonical JSON)", async () => {
      // Find supervisor user ID
      const userRes = await pool.query("SELECT id FROM usuarios WHERE correo_institucional = 'supervisor@pulso360.co' LIMIT 1");
      const supervisorId = userRes.rows[0].id;

      // Create fake report directly to avoid k-anon restrictions
      const crypto = await import('node:crypto');
      const contentObj = { tipoReporte: "Test", autorId: supervisorId, fechaCorte: "2026-10-01", parametrosFiltro: { snapshot_metrics: {} }, metrics: {} };
      
      function canonicalStringify(obj) {
        if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
        if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']';
        const keys = Object.keys(obj).sort();
        return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}';
      }
      const hashReal = crypto.createHash('sha256').update(canonicalStringify(contentObj)).digest('hex');

      await pool.query(
        "INSERT INTO reportes_generados (id, tipo_reporte, autor_id, fecha_corte, hash_integridad, parametros_filtro, ruta_archivo) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [reportId, "Test", supervisorId, "2026-10-01", hashReal, JSON.stringify({ snapshot_metrics: {} }), "ruta.json"]
      );

      // Download Report (200 OK)
      const downloadRes = await request(app)
        .get(`/api/v1/reports/${reportId}/download`)
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect("Content-Type", /json/)
        .expect(200);
        
      assert.ok(downloadRes.body, "Debe retornar el contenido del reporte");
    });

    it("debe rechazar con 409 Conflict y REPORT_INTEGRITY_MISMATCH si el reporte fue alterado", async () => {
      // Alterar temporalmente el hash_integridad en DB
      await pool.query("UPDATE reportes_generados SET hash_integridad = 'hash-manipulado' WHERE id = $1", [reportId]);
      
      // Intentar descargar
      const dlRes = await request(app)
        .get(`/api/v1/reports/${reportId}/download`)
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect("Content-Type", /json/)
        .expect(409);
        
      assert.equal(dlRes.body.error.code, "REPORT_INTEGRITY_MISMATCH");
    });
  });
});

