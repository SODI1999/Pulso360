import express from "express";
import cors from "cors";
import authRoutes from './interfaces/routes/authRoutes.js';

const app = express();

// Middlewares globales de transporte
app.use(cors());
app.use(express.json());

// Endpoint base de estado
app.get("/api/v1", (req, res) => {
  res.json({ status: "connected", service: "pulso360-backend", version: "1.0.0" });
});

// Endpoint canónico de Healthcheck (RNF-03)
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

// Montar rutas de autenticación
app.use('/api/v1/auth', authRoutes);

// Manejador para rutas no implementadas (Formato de error SDD unificado)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `La ruta '${req.method} ${req.originalUrl}' no existe en esta versión de la API.`,
      code: "RESOURCE_NOT_FOUND"
    }
  });
});

// Middleware centralizado de excepciones no controladas
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error("[ServerError]:", err);
  }
  res.status(status).json({
    success: false,
    error: {
      message: err.message || "Error interno del servidor",
      code: err.code || "INTERNAL_SERVER_ERROR"
    }
  });
});

export default app;
