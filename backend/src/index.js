import app from "./app.js";
import dotenv from "dotenv";
import { testConnection } from "./infrastructure/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Inicialización del servidor y verificación de conectividad con PostgreSQL
app.listen(PORT, async () => {
  console.log(`[Express]: Servidor Pulso360 corriendo en http://localhost:${PORT}`);
  try {
    await testConnection();
  } catch (error) {
    console.error("[PostgreSQL]: Fallo en la verificación inicial:", error.message);
  }
});