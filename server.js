/**
 * SERVIDOR PRINCIPAL - SIGEB
 * Sistema Integral de Brigadistas (Ejido Ricardo Flores Magón, Sinaloa)
 * Módulo: Registro de Asistencia por Código QR y Geolocalización (Meta 3)
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import asistenciaRoutes from './src/controllers/AsistenciaRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (carpeta public y raíz)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Registrar rutas de la API bajo /api
app.use('/api', asistenciaRoutes);

// Ruta raíz por defecto -> Redirige a la Actividad 3.1 (Configuración del QR)
app.get('/', (req, res) => {
  res.redirect('/configurar_qr.html');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  SIGEB - Sistema Integral de Brigadistas (UAS)`);
  console.log(`  Meta 3: Módulo de Asistencia por QR y Ubicación`);
  console.log(`  Servidor iniciado en: http://localhost:${PORT}`);
  console.log(`  - Actividad 3.1 (Configuración QR): http://localhost:${PORT}/configurar_qr.html`);
  console.log(`  - Escáner de Asistencia:             http://localhost:${PORT}/escaner_qr.html`);
  console.log('====================================================');
});
