import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertErrorContract, assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 3 · SST, Supervision & k-Anonymity Analytics Contract Tests", () => {
  let sstToken = "";
  let supervisorToken = "";
  let agentToken = "";

  before(async () => {
    // 1. Limpieza preventiva de datos previos de pruebas
    await pool.query("DELETE FROM daily_checkins WHERE id LIKE 'test-chk-%'");
    await pool.query("DELETE FROM asignaciones_usuario_equipo WHERE id LIKE 'test-asig-%'");
    await pool.query("DELETE FROM usuarios WHERE id LIKE 'test-usr-%'");
    await pool.query("DELETE FROM sst_intervenciones WHERE id LIKE 'int-%' AND id NOT IN ('int-1', 'int-2')");
    await pool.query("DELETE FROM solicitudes_apoyo WHERE id LIKE 'sup-%' AND id NOT IN ('req-1')");
    await pool.query("UPDATE consentimientos SET c1_checkin = TRUE, c2_bitacora = TRUE, c3_apoyo = TRUE, c4_analitica = TRUE, c5_contacto = TRUE WHERE id = 'con-1'");

    // 2. Insertar 4 usuarios agentes adicionales para conformar cohorte de k >= 5 en team-alpha-1 (junto con usr-1)
    for (let i = 1; i <= 4; i++) {
      await pool.query(
        "INSERT INTO usuarios (id, rol_codigo, correo_institucional, contrasena_hash, nombres, apellidos) VALUES ($1, 'AGENTE', $2, '$2b$10$fBVGE8qy91Fp4rxpI4/dgO.gIXwMoT2JPskCXG/flua3SL2G/tGc6', 'Test', $3) ON CONFLICT (id) DO NOTHING",
        [`test-usr-${i}`, `testagent${i}@pulso360.co`, `Agente ${i}`]
      );

      await pool.query(
        "INSERT INTO asignaciones_usuario_equipo (id, usuario_id, equipo_id, tipo_asignacion, fecha_inicio, activa) VALUES ($1, $2, 'team-alpha-1', 'AGENTE', '2026-01-01', TRUE) ON CONFLICT (id) DO NOTHING",
        [`test-asig-${i}`, `test-usr-${i}`]
      );

      await pool.query(
        "INSERT INTO daily_checkins (id, usuario_id, asignacion_id, journey_key, checkin_date, energia, carga_emocional, recuperacion, apoyo, distanciamiento, ineficacia) VALUES ($1, $2, $3, 'TEST', '2026-08-20', 4, 3, 3, 4, 2, 2) ON CONFLICT (id) DO NOTHING",
        [`test-chk-${i}`, `test-usr-${i}`, `test-asig-${i}`]
      );
    }

    // 3. Autenticación de SST, SUPERVISOR y AGENTE
    const sstRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "sst@pulso360.co", contrasena: "Pulso360#2026" });
    sstToken = sstRes.body.data.token;

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
      await pool.query("DELETE FROM daily_checkins WHERE id LIKE 'test-chk-%'");
      await pool.query("DELETE FROM asignaciones_usuario_equipo WHERE id LIKE 'test-asig-%'");
      await pool.query("DELETE FROM usuarios WHERE id LIKE 'test-usr-%'");
      await pool.query("DELETE FROM sst_intervenciones WHERE id LIKE 'int-%' AND id NOT IN ('int-1', 'int-2')");
      await pool.query("DELETE FROM solicitudes_apoyo WHERE id LIKE 'sup-%' AND id NOT IN ('req-1')");
      await pool.end();
    } catch {
      // Ignorar errores si pool ya fue cerrado
    }
  });

  describe("Autenticación y tokens de roles", () => {
    it("debe contar con tokens JWT válidos para SST, SUPERVISOR y AGENTE", () => {
      assert.ok(sstToken, "Debe existir token para SST");
      assert.ok(supervisorToken, "Debe existir token para SUPERVISOR");
      assert.ok(agentToken, "Debe existir token para AGENTE");
    });
  });

  describe("GET /api/v1/sst/metrics — k-Anonimato en Analítica Agregada", () => {
    it("con k >= 5: debe retornar 200 OK con { protected: false, cohort_count >= 5, k_threshold: 5, metrics: { ... } }", async () => {
      const res = await request(app)
        .get("/api/v1/sst/metrics?equipo_id=team-alpha-1")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const data = res.body.data;

      assert.equal(data.protected, false, "No debe estar protegido porque k >= 5");
      assert.ok(data.cohort_count >= 5, `cohort_count debe ser >= 5 (recibido: ${data.cohort_count})`);
      assert.equal(data.k_threshold, 5, "k_threshold debe ser 5");
      assert.ok(data.metrics, "metrics debe ser un objeto con promedios");
      assert.equal(typeof data.metrics, "object");
      assert.ok("energia_avg" in data.metrics || "energia" in data.metrics, "Debe incluir promedios de dimensiones");

      const supRes = await request(app)
        .get("/api/v1/sst/metrics?equipo_id=team-alpha-1")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect(200);

      assertSuccessContract(supRes.body);
      assert.equal(supRes.body.data.protected, false);
    });

    it("con k >= 5 en consulta general sin filtros: debe retornar 200 OK con protected: false y metrics calculadas", async () => {
      const res = await request(app)
        .get("/api/v1/sst/metrics")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const data = res.body.data;
      assert.equal(data.protected, false);
      assert.ok(data.cohort_count >= 5);
      assert.ok(data.metrics !== null);
    });

    it("con k < 5: debe retornar 200 OK con { protected: true, reason, cohort_count < 5, k_threshold: 5, metrics: null }", async () => {
      const res = await request(app)
        .get("/api/v1/sst/metrics?equipo_id=team-alpha-2")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const data = res.body.data;

      assert.equal(data.protected, true, "Debe estar protegido porque k < 5");
      assert.ok(data.cohort_count < 5, `cohort_count debe ser menor a 5 (recibido: ${data.cohort_count})`);
      assert.equal(data.k_threshold, 5);
      assert.equal(data.metrics, null, "metrics debe ser estrictamente null cuando está protegido");
      assert.ok(data.reason, "Debe incluir la razón de protección");
      assert.equal(typeof data.reason, "string");
    });

    it("con k < 5 por rango de fechas sin agentes suficientes: debe retornar 200 OK con protected: true y metrics: null", async () => {
      const res = await request(app)
        .get("/api/v1/sst/metrics?desde=2020-01-01&hasta=2020-01-02")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect(200);

      assertSuccessContract(res.body);
      const data = res.body.data;
      assert.equal(data.protected, true);
      assert.equal(data.cohort_count, 0);
      assert.equal(data.metrics, null);
    });
  });

  describe("GET /api/v1/sst/alerts — Catálogo de Alertas Tempranas", () => {
    it("debe retornar 200 OK con arreglo de alertas tempranas preventivas para rol SST", async () => {
      const res = await request(app)
        .get("/api/v1/sst/alerts")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo de alertas");
      assert.ok(res.body.data.length > 0, "Debe contener alertas preventivas de la semilla");

      const alert = res.body.data[0];
      assert.ok(alert.id, "Debe contener id");
      assert.ok(alert.regla_nombre, "Debe contener regla_nombre");
      assert.ok(alert.campana_nombre, "Debe contener campana_nombre");
      assert.ok(alert.equipo_nombre, "Debe contener equipo_nombre");
      assert.ok(alert.alert_date, "Debe contener alert_date");
      assert.ok(alert.severity, "Debe contener severity");
      assert.ok(alert.status, "Debe contener status");
      assert.ok(typeof alert.respondents === "number", "Debe contener respondents como número");
      assert.ok(alert.description, "Debe contener description");
    });
  });

  describe("Intervenciones Preventivas (GET y POST /api/v1/sst/interventions)", () => {
    it("debe retornar 200 OK con arreglo de intervenciones psicosociales para rol SST", async () => {
      const res = await request(app)
        .get("/api/v1/sst/interventions")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo");
      assert.ok(res.body.data.length > 0, "Debe contener intervenciones existentes");

      const item = res.body.data[0];
      assert.ok(item.id);
      assert.ok(item.title);
      assert.ok(item.type);
      assert.ok(item.status);
      assert.ok(item.start_date);
      assert.ok(item.end_date);
      assert.ok(item.indicator);
    });

    it("debe retornar 201 Created con { id, status: 'Activa', created_at } al crear intervención con datos válidos", async () => {
      const newIntervention = {
        title: "Pausas cognitivas de recuperación activa",
        type: "Pausas activas coordinadas",
        campana_id: "camp-1",
        equipo_id: "team-alpha-1",
        start_date: "2026-10-05",
        end_date: "2026-10-25",
        indicator: "Recuperacion agregada",
        target_desc: "Mejorar percepción de recuperación en un 15%"
      };

      const res = await request(app)
        .post("/api/v1/sst/interventions")
        .set("Authorization", `Bearer ${sstToken}`)
        .send(newIntervention)
        .expect("Content-Type", /json/)
        .expect(201);

      assertSuccessContract(res.body);
      const data = res.body.data;
      assert.ok(data.id, "Debe incluir el id generado");
      assert.equal(data.status, "Activa", "El estado inicial debe ser 'Activa'");
      assert.ok(data.created_at, "Debe contener timestamp created_at");
    });

    it("debe retornar 400 Bad Request con código 'INTERVENTION_MISSING_REQUIRED_FIELDS' cuando faltan campos obligatorios", async () => {
      const invalidPayload = {
        title: "Solo titulo incompleto"
      };

      const res = await request(app)
        .post("/api/v1/sst/interventions")
        .set("Authorization", `Bearer ${sstToken}`)
        .send(invalidPayload)
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(res.body, "INTERVENTION_MISSING_REQUIRED_FIELDS");
    });
  });

  describe("Solicitudes de Apoyo Psicosocial (/api/v1/sst/support-requests)", () => {
    it("debe retornar 200 OK en GET con rol SST comprobando estrictamente que mode = 'anonimo' tenga solicitante === null", async () => {
      const res = await request(app)
        .get("/api/v1/sst/support-requests")
        .set("Authorization", `Bearer ${sstToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      assert.ok(Array.isArray(res.body.data), "data debe ser un arreglo");
      assert.ok(res.body.data.length > 0, "Debe contener al menos la solicitud sembrada req-1");

      for (const reqItem of res.body.data) {
        assert.ok(reqItem.id);
        assert.ok(reqItem.code);
        assert.ok(reqItem.mode);
        if (reqItem.mode === "anonimo") {
          assert.equal(
            reqItem.solicitante,
            null,
            `Para la solicitud anónima ${reqItem.code}, el campo solicitante debe ser estrictamente null`
          );
        }
      }
    });

    it("debe retornar 201 Created con { id, code, status: 'Recibida', sla: '24 h habiles' } al radicar solicitud con rol AGENTE", async () => {
      const supportPayload = {
        mode: "anonimo",
        reason: "Sobrecarga de llamadas y fatiga emocional",
        description: "Requiero orientacion profesional para gestionar la sobrecarga durante el turno de la tarde.",
        urgency: "media",
        contact_preference: "app"
      };

      const res = await request(app)
        .post("/api/v1/sst/support-requests")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(supportPayload)
        .expect("Content-Type", /json/)
        .expect(201);

      assertSuccessContract(res.body);
      const data = res.body.data;
      assert.ok(data.id, "Debe retornar id de la solicitud");
      assert.ok(data.code, "Debe retornar código de radicado");
      assert.ok(data.code.startsWith("ANON-"), "Código anónimo debe iniciar con prefijo ANON-");
      assert.equal(data.status, "Recibida", "El estado inicial debe ser 'Recibida'");
      assert.equal(data.sla, "24 h habiles", "El SLA estándar debe ser '24 h habiles'");
    });
  });

  describe("Control RBAC: Restricción de Roles No Autorizados (403 Forbidden)", () => {
    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cuando un AGENTE intenta acceder a GET /api/v1/sst/metrics", async () => {
      const res = await request(app)
        .get("/api/v1/sst/metrics")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });

    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cuando un AGENTE intenta acceder a GET /api/v1/sst/alerts", async () => {
      const res = await request(app)
        .get("/api/v1/sst/alerts")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });

    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cuando un AGENTE intenta acceder a GET /api/v1/sst/interventions", async () => {
      const res = await request(app)
        .get("/api/v1/sst/interventions")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });

    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cuando un AGENTE intenta acceder a GET /api/v1/sst/support-requests", async () => {
      const res = await request(app)
        .get("/api/v1/sst/support-requests")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });

    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cuando un SUPERVISOR intenta acceder a GET /api/v1/sst/alerts", async () => {
      const res = await request(app)
        .get("/api/v1/sst/alerts")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });

    it("debe rechazar con 403 Forbidden y AUTH_FORBIDDEN_ROLE cuando un SUPERVISOR intenta crear una intervención", async () => {
      const res = await request(app)
        .post("/api/v1/sst/interventions")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ title: "Intento supervisor", type: "Pausas", campana_id: "camp-1", equipo_id: "team-alpha-1", start_date: "2026-10-01" })
        .expect("Content-Type", /json/)
        .expect(403);

      assertErrorContract(res.body, "AUTH_FORBIDDEN_ROLE");
    });
  });
});
