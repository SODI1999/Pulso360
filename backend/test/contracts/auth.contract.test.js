import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/infrastructure/db.js";
import { assertErrorContract, assertSuccessContract } from "../harness/contractValidator.js";

describe("Sprint 1 · Authentication and Profile Contract Tests", () => {
  let validToken = "";

  after(async () => {
    try {
      await pool.query("UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = 'usr-1'");
      await pool.end();
    } catch {
      // Ignorar errores si pool ya fue cerrado
    }
  });

  describe("POST /api/v1/auth/login", () => {
    it("debe autenticar exitosamente con credenciales validas (200 OK), retornar usuario y token, y omitir contrasena_hash", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          correo: "agente@pulso360.co",
          contrasena: "Pulso360#2026"
        })
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const { usuario, token } = res.body.data;

      assert.ok(usuario, "La respuesta debe incluir el objeto usuario");
      assert.ok(token, "La respuesta debe incluir el token JWT");
      assert.equal(typeof token, "string", "El token debe ser un string");

      assert.equal(usuario.id, "usr-1");
      assert.equal(usuario.correo, "agente@pulso360.co");
      assert.equal(usuario.nombres, "Laura");
      assert.equal(usuario.apellidos, "Gomez");
      assert.equal(usuario.rol, "AGENTE");

      assert.equal(usuario.contrasena_hash, undefined, "El hash de la contrasena jamas debe exponerse en la respuesta");

      validToken = token;
    });

    it("debe rechazar con 401 y AUTH_INVALID_CREDENTIALS ante una contrasena incorrecta", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          correo: "agente@pulso360.co",
          contrasena: "ContrasenaErronea#999"
        })
        .expect("Content-Type", /json/)
        .expect(401);

      assertErrorContract(res.body, "AUTH_INVALID_CREDENTIALS");
    });

    it("debe rechazar con 401 y AUTH_INVALID_CREDENTIALS ante un usuario inexistente", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          correo: "noexiste@pulso360.co",
          contrasena: "Pulso360#2026"
        })
        .expect("Content-Type", /json/)
        .expect(401);

      assertErrorContract(res.body, "AUTH_INVALID_CREDENTIALS");
    });

    it("debe rechazar con 400 y AUTH_MISSING_FIELDS ante un body vacio o campos incompletos", async () => {
      const resVacio = await request(app)
        .post("/api/v1/auth/login")
        .send({})
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resVacio.body, "AUTH_MISSING_FIELDS");

      const resSinPass = await request(app)
        .post("/api/v1/auth/login")
        .send({ correo: "agente@pulso360.co" })
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resSinPass.body, "AUTH_MISSING_FIELDS");

      const resSinEmail = await request(app)
        .post("/api/v1/auth/login")
        .send({ contrasena: "Pulso360#2026" })
        .expect("Content-Type", /json/)
        .expect(400);

      assertErrorContract(resSinEmail.body, "AUTH_MISSING_FIELDS");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("debe responder con 200 OK y el perfil completo del usuario (usr-1, AGENTE, equipo) con Bearer token valido", async () => {
      if (!validToken) {
        const loginRes = await request(app)
          .post("/api/v1/auth/login")
          .send({ correo: "agente@pulso360.co", contrasena: "Pulso360#2026" });
        validToken = loginRes.body.data.token;
      }

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer " + validToken)
        .expect("Content-Type", /json/)
        .expect(200);

      assertSuccessContract(res.body);
      const perfil = res.body.data;

      assert.equal(perfil.id, "usr-1");
      assert.equal(perfil.correo, "agente@pulso360.co");
      assert.equal(perfil.nombres, "Laura");
      assert.equal(perfil.apellidos, "Gomez");
      assert.equal(perfil.rol, "AGENTE");
      assert.ok(perfil.equipo, "Debe contener la asignacion al equipo de trabajo");
      assert.equal(perfil.equipo.id, "team-alpha-1");
      assert.equal(perfil.equipo.nombre, "Equipo Alpha 1");
      assert.equal(perfil.equipo.campana, "Campaña Soporte Alpha");
    });

    it("debe rechazar con 401 y AUTH_TOKEN_MISSING sin cabecera Authorization", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .expect("Content-Type", /json/)
        .expect(401);

      assertErrorContract(res.body, "AUTH_TOKEN_MISSING");
    });

    it("debe rechazar con 401 y AUTH_TOKEN_INVALID con token malformado o invalido", async () => {
      const resFalso = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer token_falso_invalido.12345")
        .expect("Content-Type", /json/)
        .expect(401);

      assertErrorContract(resFalso.body, "AUTH_TOKEN_INVALID");

      const resMalformado = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "TokenMalformadoSinBearer")
        .expect("Content-Type", /json/)
        .expect(401);

      assertErrorContract(resMalformado.body, "AUTH_TOKEN_INVALID");
    });
  });
});
