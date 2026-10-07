import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from './interfaces/routes/authRoutes.js';
import agentRoutes from './interfaces/routes/agentRoutes.js';
import sstRoutes from './interfaces/routes/sstRoutes.js';
import adminRoutes from './interfaces/routes/adminRoutes.js';
import auditorRoutes from './interfaces/routes/auditorRoutes.js';
import supervisorRoutes from './interfaces/routes/supervisorRoutes.js';
import reportsRoutes from './interfaces/routes/reportsRoutes.js';
import notificationsRoutes from './interfaces/routes/notificationsRoutes.js';
import nlpRoutes from './interfaces/routes/nlpRoutes.js';
import chatRoutes from './interfaces/routes/chatRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

import pool from './infrastructure/db.js';

const app = express();

// Middlewares globales de seguridad y transporte
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Limitador de tasa contra ataques de fuerza bruta en inicio de sesión (exento en test)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de acceso desde esta dirección IP. Por favor intente en 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  skip: () => process.env.NODE_ENV === 'test'
});
app.use('/api/v1/auth/login', loginLimiter);

// Endpoint base de estado
app.get("/api/v1", (req, res) => {
  res.json({ status: "connected", service: "pulso360-backend", version: "1.0.0" });
});

// Endpoint canónico de Healthcheck (RNF-03)
app.get("/api/v1/health", async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'disconnected', error: 'Base de datos no disponible.', code: 'DATABASE_UNAVAILABLE' });
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
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/support/chat', chatRoutes);


// Manejador para rutas no implementadas (Formato de error SDD unificado)
app.use(notFoundHandler);

// Middleware centralizado de excepciones no controladas
app.use(errorHandler);

export default app;

