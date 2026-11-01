/**
 * RUTAS DE API: AsistenciaRoutes
 */
import express from 'express';
import { AsistenciaController } from './AsistenciaController.js';

const router = express.Router();

// Ruta oficial de registro (coincide con el fetch en el frontend)
router.post('/asistencia/registrar', AsistenciaController.registrar);

export default router;
