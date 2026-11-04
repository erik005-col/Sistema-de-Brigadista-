// server.js — Servidor principal SIGEB
// Actividad Complementaria C-3.3: Configuración del entorno de desarrollo
// Sirve la pantalla de la Asesora (configurar_qr.html) como página principal

const express = require('express');
const path = require('path');

const app = express();

// Puerto: usa la variable de entorno de Render, o 3000 en local
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta raíz
app.use(express.static(path.join(__dirname)));

// Ruta principal → pantalla de la Asesora (Actividad 3.1)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'configurar_qr.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor SIGEB corriendo en http://localhost:${PORT}`);
});
