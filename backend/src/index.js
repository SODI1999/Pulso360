import http from "node:http";
import app from "./app.js";
import dotenv from "dotenv";
import { testConnection } from "./infrastructure/db.js";
import { startAlertScheduler } from "./jobs/alertScheduler.js";
import { getJwtSecret } from './infrastructure/jwtConfig.js';
import { initSocketServer } from './infrastructure/socket.js';

dotenv.config();
getJwtSecret();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocketServer(server);

// Inicialización del servidor HTTP + WebSockets y verificación de conectividad con PostgreSQL
server.listen(PORT, async () => {
  console.log(`[Express + Socket.io]: Servidor Pulso360 corriendo en http://localhost:${PORT}`);
  try {
    if (await testConnection()) {
      const scheduler = startAlertScheduler();
      process.once('SIGTERM', () => { void scheduler.stop(); });
      process.once('SIGINT', () => { void scheduler.stop(); });
    }
  } catch (error) {
    console.error("[PostgreSQL]: Fallo en la verificación inicial:", error.message);
  }
});
