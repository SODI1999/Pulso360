import express from "express";
import cors from "cors";
import authRoutes from './interfaces/routes/authRoutes.js';
import agentRoutes from './interfaces/routes/agentRoutes.js';
import sstRoutes from './interfaces/routes/sstRoutes.js';
import adminRoutes from './interfaces/routes/adminRoutes.js';
import auditorRoutes from './interfaces/routes/auditorRoutes.js';
import supervisorRoutes from './interfaces/routes/supervisorRoutes.js';
import reportsRoutes from './interfaces/routes/reportsRoutes.js';
import notificationsRoutes from './interfaces/routes/notificationsRoutes.js';
import nlpRoutes from './interfaces/routes/nlpRoutes.js';


import pool from './infrastructure/db.js';

const app = express();

// Middlewares globales de transporte
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));
app.use(express.json());

// Endpoint base de estado
app.get("/api/v1", (req, res) => {
  res.json({ status: "connected", service: "pulso360-backend", version: "1.0.0" });
});

// Endpoint canónico de Healthcheck (RNF-03)
app.get("/api/v1/health", async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'disconnected', error: err.message });
  }
});

// Montar rutas de autenticación
app.use('/api/v1/auth', authRoutes);

// Montar rutas de agente
app.use('/api/v1/agent', agentRoutes);

// Montar rutas de SST
app.use('/api/v1/sst', sstRoutes);

// Montar rutas de administración
app.use('/api/v1/admin', adminRoutes);

// Montar rutas de auditoría
app.use('/api/v1/auditor', auditorRoutes);

// Montar rutas de supervisor
app.use('/api/v1/supervisor', supervisorRoutes);

// Montar rutas transversales
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/nlp', nlpRoutes);


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
    console.error('[ServerError]', { code:err.code || 'INTERNAL_SERVER_ERROR', method:req.method,path:req.path });
  }
  res.status(status).json({
    success: false,
    error: {
      message: err.code === 'PASSWORD_RESET_UNAVAILABLE' ? 'La recuperación por correo no está disponible.' : status >= 500 ? 'No se pudo completar la operación del servidor.' : err.message || 'Error interno del servidor',
      code: err.code || "INTERNAL_SERVER_ERROR"
    }
  });
});

export default app;
