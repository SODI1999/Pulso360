import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection, query } from "./infrastructure/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de comprobación de salud (Healthcheck de Servidor y BD)
app.get('/api/v1/health', async (req, res) => {
    try {
        const dbRes = await query('SELECT current_database() as db, NOW() as time;');
        res.json({
            status: 'healthy',
            service: 'Pulso360 Backend REST API',
            version: '1.0.0',
            database: {
                status: 'connected',
                name: dbRes.rows[0].db,
                serverTime: dbRes.rows[0].time
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'Pulso360 Backend REST API',
            database: {
                status: 'disconnected',
                error: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Inicialización del servidor y verificación de BD
app.listen(PORT, async () => {
    console.log(`[Express]: Servidor Pulso360 corriendo en http://localhost:${PORT}`);
    await testConnection();
});