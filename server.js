/**
 * SERVIDOR PRINCIPAL - SIGEB
 * Sistema Integral de Brigadistas (Ejido Ricardo Flores Magón, Sinaloa)
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

// Ruta raíz por defecto -> redirige al escáner móvil
app.get('/', (req, res) => {
  res.redirect('/escaner_qr.html');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  SIGEB - Sistema Integral de Brigadistas (UAS)`);
  console.log(`  Servidor iniciado en: http://localhost:${PORT}`);
  console.log(`  - Escáner Móvil (Brigadista): http://localhost:${PORT}/escaner_qr.html`);
  console.log(`  - Configuración QR (Asesora):  http://localhost:${PORT}/configurar_qr.html`);
  console.log('====================================================');
});
