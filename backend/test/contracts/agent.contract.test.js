import { currentJourney } from '../../src/domain/journey.js';
﻿import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertErrorContract, assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 2 Â· Agent Module & Privacy Contract Tests", () => {
  let agentToken = "";
  let supervisorToken = "";
  const today = currentJourney(8);

  before(async () => {
    await pool.query("DELETE FROM usuarios WHERE id='test-agent-contract'");
    await pool.query(`INSERT INTO usuarios(id,rol_codigo,correo_institucional,contrasena_hash,nombres,apellidos,estado,shift_start_hour)
      SELECT 'test-agent-contract','AGENTE','test-agent-contract@example.test',contrasena_hash,'Fixture','Agente','Activo',8 FROM usuarios WHERE id='usr-1'`);
    await pool.query(`INSERT INTO consentimientos(id,usuario_id,politica_id,tipo_evento,acepta_politica,acepta_aviso_privacidad,c1_checkin,c2_bitacora,c3_apoyo,c4_analitica,c5_contacto)
      SELECT 'test-agent-consent','test-agent-contract',id,'INICIAL',TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE FROM politicas_privacidad
      WHERE estado='PUBLICADA' AND vigente_desde<=NOW() ORDER BY vigente_desde DESC,created_at DESC,id DESC LIMIT 1`);

    // Autenticar agente
    const agentRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "test-agent-contract@example.test", contrasena: "Pulso360#2026" });
    agentToken = agentRes.body.data.token;

    // Autenticar supervisor
    const supervisorRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "supervisor@pulso360.co", contrasena: "Pulso360#2026" });
    supervisorToken = supervisorRes.body.data.token;
  });

  after(async () => {
    try {
      await pool.query("DELETE FROM daily_checkins WHERE usuario_id = 'test-agent-contract' AND checkin_date = $1", [today]);
      await pool.query("DELETE FROM bitacoras WHERE usuario_id = 'test-agent-contract' AND id LIKE 'jou-%' AND entry_date = $1", [today]);
      await pool.query("DELETE FROM consentimientos WHERE usuario_id = 'test-agent-contract' AND id != 'test-agent-consent'");
      await pool.query("UPDATE consentimientos SET c1_checkin = TRUE, c2_bitacora = TRUE, c3_apoyo = TRUE, c4_analitica = TRUE, c5_contacto = TRUE WHERE id = 'test-agent-consent'");
      await pool.query("DELETE FROM consentimientos WHERE usuario_id='test-agent-contract'");
      await pool.query("DELETE FROM usuarios WHERE id='test-agent-contract'");
      await pool.end();
    } catch {
      // Ignorar errores si pool ya fue cerrado
    }
  });

  describe("GET /api/v1/agent/consent", () => {
    it("debe retornar 200 OK con la estructura de consentimiento C1..C5 del agente", async () => {
      const res = await request(app)
        .get("/api/v1/agent/consent")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const consent = res.body.data;

      assert.equal(typeof consent.acepta_politica, "boolean");
      assert.equal(consent.acepta_politica, true);
      assert.equal(typeof consent.c1_checkin, "boolean");
      assert.equal(typeof consent.c2_bitacora, "boolean");
      assert.equal(typeof consent.c3_apoyo, "boolean");
      assert.equal(typeof consent.c4_analitica, "boolean");
      assert.equal(typeof consent.c5_contacto, "boolean");
      assert.ok(consent.politica_version, "Debe incluir la version de la politica");
    });
  });

  describe("PUT /api/v1/agent/consent", () => {
    it("debe retornar 200 OK y actualizar los consentimientos granulares", async () => {
      const updatePayload = {
        c1_checkin: true,
        c2_bitacora: true,
        c3_apoyo: false,
        c4_analitica: true,
        c5_contacto: false
      };

      const res = await request(app)
        .put("/api/v1/agent/consent")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(updatePayload)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const updated = res.body.data;

      assert.equal(updated.c1_checkin, true);
      assert.equal(updated.c2_bitacora, true);
      assert.equal(updated.c3_apoyo, false);
      assert.equal(updated.c4_analitica, true);
      assert.equal(updated.c5_contacto, false);
    });
  });

  describe("GET /api/v1/agent/checkin/today", () => {
    it("debe retornar 200 OK con { completed: false, checkin: null } cuando aÃºn no se ha registrado hoy", async () => {
      const res = await request(app)
        .get("/api/v1/agent/checkin/today")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.equal(res.body.data.completed, false);
      assert.equal(res.body.data.checkin, null);
    });
  });

  describe("POST /api/v1/agent/checkin", () => {
    it("debe rechazar con 400 Bad Request y CHECKIN_INVALID_DIMENSIONS si alguna dimensiÃ³n es invÃ¡lida (6 o decimal)", async () => {
      const payloadFueraDeRango = {
        journey_key: "START_SHIFT",
        energia: 6,
        carga_emocional: 3,
        recuperacion: 4,
        apoyo: 5,
        distanciamiento: 1,
        ineficacia: 2
      };

      const resRango = await request(app)
        .post("/api/v1/agent/checkin")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(payloadFueraDeRango)
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resRango.body, "CHECKIN_INVALID_DIMENSIONS");

      const payloadDecimal = {
        journey_key: "START_SHIFT",
        energia: 3.5,
        carga_emocional: 3,
        recuperacion: 4,
        apoyo: 5,
        distanciamiento: 1,
        ineficacia: 2
      };

      const resDecimal = await request(app)
        .post("/api/v1/agent/checkin")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(payloadDecimal)
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resDecimal.body, "CHECKIN_INVALID_DIMENSIONS");
    });

    it("debe registrar exitosamente con 201 Created y retornar { id, checkin_date, submitted_at } con dimensiones vÃ¡lidas", async () => {
      const payloadValido = {
        journey_key: "START_SHIFT",
        energia: 4,
        carga_emocional: 3,
        recuperacion: 4,
        apoyo: 5,
        distanciamiento: 1,
        ineficacia: 2
      };

      const res = await request(app)
        .post("/api/v1/agent/checkin")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(payloadValido)
        .expect("Content-Type", /json/)
        .expect(201);

      assertSuccessContract(res.body);
      const data = res.body.data;
      assert.ok(data.id, "Debe generar un id para el checkin");
      assert.equal(data.checkin_date, today);
      assert.ok(data.submitted_at, "Debe contener submitted_at");
    });

    it("debe retornar 201 Created actualizando el check-in cuando se edita en la ventana de tiempo", async () => {
      const payloadDuplicado = {
        journey_key: "START_SHIFT",
        energia: 3,
        carga_emocional: 2,
        recuperacion: 3,
        apoyo: 4,
        distanciamiento: 2,
        ineficacia: 1
      };

      const res = await request(app)
        .post("/api/v1/agent/checkin")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(payloadDuplicado)
        .expect("Content-Type", /json/)
        .expect(201);

      assertSuccessContract(res.body);
    });

    it("debe retornar completed: true y el objeto checkin en GET /api/v1/agent/checkin/today despuÃ©s de registrar", async () => {
      const res = await request(app)
        .get("/api/v1/agent/checkin/today")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.equal(res.body.data.completed, true);
      assert.ok(res.body.data.checkin);
      assert.equal(res.body.data.checkin.checkin_date, today);
    });
  });

  describe("GET /api/v1/agent/checkin/history", () => {
    it("debe retornar 200 OK con arreglo de check-ins del propio agente", async () => {
      const res = await request(app)
        .get("/api/v1/agent/checkin/history")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo");
      assert.ok(res.body.data.length > 0, "Debe contener al menos el check-in registrado hoy");

      const primerCheckin = res.body.data[0];
      assert.ok(primerCheckin.id);
      assert.ok(primerCheckin.checkin_date);
      assert.ok(primerCheckin.energia);
    });
  });

  describe("BitÃ¡coras Privadas (GET y POST /api/v1/agent/journal)", () => {
    it("debe rechazar con 400 Bad Request y JOURNAL_CONTENT_EMPTY cuando el contenido tiene menos de 5 caracteres", async () => {
      const resVacio = await request(app)
        .post("/api/v1/agent/journal")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ context: "Turno maÃ±ana", content: "   " })
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resVacio.body, "JOURNAL_CONTENT_EMPTY");

      const resCorto = await request(app)
        .post("/api/v1/agent/journal")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ context: "Turno maÃ±ana", content: "hola" })
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resCorto.body, "JOURNAL_CONTENT_EMPTY");
    });

    it("debe registrar con 201 Created una entrada de bitÃ¡cora privada vÃ¡lida", async () => {
      const entryPayload = {
        context: "Cierre de turno",
        content: "Jornada completada con alto volumen pero buen soporte del equipo."
      };

      const res = await request(app)
        .post("/api/v1/agent/journal")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(entryPayload)
        .expect("Content-Type", /json/)
        .expect(201);

      assertSuccessContract(res.body);
      const entry = res.body.data;
      assert.ok(entry.id);
      assert.equal(entry.entry_date, today);
      assert.equal(entry.context, "Cierre de turno");
      assert.equal(entry.content, entryPayload.content);
      assert.ok(entry.created_at);
    });

    it("debe retornar 200 OK con arreglo de bitÃ¡coras del propio usuario autenticado", async () => {
      const res = await request(app)
        .get("/api/v1/agent/journal")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo");
      assert.ok(res.body.data.length > 0, "Debe contener entradas en bitÃ¡cora");

      for (const item of res.body.data) {
        assert.ok(item.id);
        assert.ok(item.entry_date);
        assert.ok(item.content);
      }
    });
  });

  describe("Control RBAC: RestricciÃ³n de Acceso para SUPERVISOR (403 Forbidden)", () => {
    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cualquier intento de acceso a /api/v1/agent por SUPERVISOR", async () => {
      const endpoints = [
        { method: "get", path: "/api/v1/agent/consent" },
        { method: "put", path: "/api/v1/agent/consent", body: { c1_checkin: true, c2_bitacora: true } },
        { method: "get", path: "/api/v1/agent/checkin/today" },
        {
          method: "post",
          path: "/api/v1/agent/checkin",
          body: {
            energia: 4,
            carga_emocional: 3,
            recuperacion: 4,
            apoyo: 5,
            distanciamiento: 1,
            ineficacia: 2
          }
        },
        { method: "get", path: "/api/v1/agent/checkin/history" },
        { method: "get", path: "/api/v1/agent/journal" },
        { method: "post", path: "/api/v1/agent/journal", body: { content: "Intento no autorizado" } }
      ];

      for (const ep of endpoints) {
        let reqBuilder = request(app)[ep.method](ep.path)
          .set("Authorization", `Bearer ${supervisorToken}`);

        if (ep.body) {
          reqBuilder = reqBuilder.send(ep.body);
        }

        const res = await reqBuilder
          .expect("Content-Type", /json/)
          .expect(403);

        assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
      }
    });
  });
});

