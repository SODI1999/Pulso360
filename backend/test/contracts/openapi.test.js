import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiPath = path.resolve(__dirname, "../../src/interfaces/contracts/openapi.json");

describe("P05 · OpenAPI 3.1 Specification Contract Integrity", () => {
  it('documenta todas las operaciones montadas y no anuncia rutas inexistentes', () => {
    const doc=JSON.parse(fs.readFileSync(openapiPath,'utf8'));
    const routesDir=path.resolve(__dirname,'../../src/interfaces/routes');
    const actual=new Set();
    for(const filename of fs.readdirSync(routesDir).filter(name=>name.endsWith('Routes.js'))){
      const prefix=filename.replace('Routes.js','');
      const source=fs.readFileSync(path.join(routesDir,filename),'utf8');
      for(const match of source.matchAll(/router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g)){
        if(match[2]==='/password-reset/')continue;
        const endpoint=('/'+prefix+(match[2]==='/'?'':match[2])).replace(/:(\w+)/g,'{$1}');
        actual.add(match[1].toUpperCase()+' '+endpoint);
      }
    }
    for(const action of ['request','validate','confirm'])actual.add('POST /auth/password-reset/'+action);
    const documented=new Set(Object.entries(doc.paths).flatMap(([endpoint,operations])=>
      Object.keys(operations).filter(method=>['get','post','put','patch','delete'].includes(method)&&endpoint!='/health').map(method=>method.toUpperCase()+' '+endpoint)));
    assert.deepEqual([...documented].sort(),[...actual].sort());
    assert.equal(doc.paths['/agent/journal/{id}'].put.requestBody.content['application/json'].schema.$ref,'#/components/schemas/JournalUpdateRequest');
    assert.ok(doc.components.schemas.ReportCreateRequest.properties.desde);
    assert.ok(doc.components.schemas.ReportCreateRequest.properties.dimensions);
    assert.ok(doc.components.schemas.AuditIntegrity.properties.legacyUnverifiable);
  });
  it("el archivo openapi.json debe existir y ser un JSON sintácticamente válido", () => {
    assert.ok(fs.existsSync(openapiPath), "El archivo openapi.json debe existir en contracts/");
    const content = fs.readFileSync(openapiPath, "utf-8");
    const doc = JSON.parse(content);
    assert.equal(doc.openapi, "3.1.0", "La versión de OpenAPI debe ser 3.1.0");
    assert.ok(doc.info.title.includes("Pulso360"), "El título debe mencionar Pulso360");
  });

  it("debe contener la definición de los 13 endpoints canónicos principales", () => {
    const doc = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
    const requiredPaths = [
      "/health",
      "/auth/login",
      "/auth/me",
            "/agent/consent",
      "/agent/checkin/today",
      "/agent/checkin",
      "/agent/checkin/history",
      "/agent/journal",
      "/sst/metrics",
      "/sst/alerts",
      "/sst/interventions",
      "/sst/support-requests"
    ];

    for (const p of requiredPaths) {
      assert.ok(p in doc.paths, `La ruta '${p}' debe estar especificada en openapi.json`);
    }
  });

  it("debe definir el esquema estandarizado de error con 'success' y 'error'", () => {
    const doc = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
    const errorSchema = doc.components.schemas.ErrorResponse;
    assert.ok(errorSchema, "Debe existir el componente 'ErrorResponse'");
    assert.ok(errorSchema.properties.success, "Debe contener propiedad 'success'");
    assert.ok(errorSchema.properties.error, "Debe contener propiedad 'error'");
    assert.ok(errorSchema.properties.error.properties.code, "El error debe contener propiedad 'code'");
    assert.ok(errorSchema.properties.error.properties.message, "El error debe contener propiedad 'message'");
  });

  it("debe definir el esquema de entrada de Checkin con las 6 dimensiones requeridas (1 a 5)", () => {
    const doc = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
    const checkinSchema = doc.components.schemas.CheckinCreateRequest;
    assert.ok(checkinSchema, "Debe existir 'CheckinCreateRequest'");
    
    const requiredDims = [
      "energia",
      "carga_emocional",
      "recuperacion",
      "apoyo",
      "distanciamiento",
      "ineficacia"
    ];

    for (const dim of requiredDims) {
      assert.ok(dim in checkinSchema.properties, `La propiedad '${dim}' debe existir en el esquema`);
      assert.equal(checkinSchema.properties[dim].minimum, 1);
      assert.equal(checkinSchema.properties[dim].maximum, 5);
      assert.deepEqual(checkinSchema.properties[dim].type, ["integer", "null"]);
    }
  });

  it("debe requerir autenticación Bearer JWT en los esquemas de seguridad", () => {
    const doc = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
    assert.ok(doc.components.securitySchemes.bearerAuth, "Debe existir 'bearerAuth' en securitySchemes");
    assert.equal(doc.components.securitySchemes.bearerAuth.type, "http");
    assert.equal(doc.components.securitySchemes.bearerAuth.scheme, "bearer");
  });
});
