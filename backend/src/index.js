import app from "./app.js";
import dotenv from "dotenv";
import { testConnection } from "./infrastructure/db.js";
import { startAlertScheduler } from "./jobs/alertScheduler.js";
import { getJwtSecret } from './infrastructure/jwtConfig.js';

dotenv.config();
getJwtSecret();

const PORT = process.env.PORT || 3000;

// Inicialización del servidor y verificación de conectividad con PostgreSQL
app.listen(PORT, async () => {
  console.log(`[Express]: Servidor Pulso360 corriendo en http://localhost:${PORT}`);
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
