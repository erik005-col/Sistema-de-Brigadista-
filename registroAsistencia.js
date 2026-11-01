import express from 'express';
const router = express.Router();

// Parámetros de validación geográfica (Ejido Ricardo Flores Magón, Sinaloa)
const CENTRO_LAT = 25.7952;
const CENTRO_LON = -108.9955;
const RADIO_PERMITIDO_METROS = 100; 

// Fórmula matemática de Haversine para calcular distancia esférica en metros
function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); 
}

// Ruta POST principal para el registro de asistencia mediante código QR y GPS
router.post('/api/asistencia/registrar', async (req, res) => {
  try {
    const { codigo_qr, latitud, longitud } = req.body;

    // 1. Obtener id del brigadista autenticado (con soporte para pruebas)
    const id_brigadista = req.session?.id_brigadista || req.body.id_brigadista || 1;

    if (!codigo_qr || latitud === undefined || longitud === undefined) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'Datos incompletos. Se requiere código QR y coordenadas GPS.' 
      });
    }

    // 2. Validar que el código QR exista y esté vigente en la base de datos
    const qrValido = await db.query(
      'SELECT id_qr, codigo, descripcion FROM codigos_qr WHERE codigo = ? AND vigente = 1', 
      [codigo_qr]
    );

    if (!qrValido || qrValido.length === 0) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'Código QR no reconocido o ya no está vigente. Contacte a la asesora.' 
      });
    }

    // 3. Validar ubicación GPS respecto al centro del Ejido
    const distancia = calcularDistanciaMetros(latitud, longitud, CENTRO_LAT, CENTRO_LON);
    const esUbicacionValida = distancia <= RADIO_PERMITIDO_METROS;

    // Si está fuera del área permitida (RF05: Registrar discrepancia)
    if (!esUbicacionValida) {
      await db.query(
        'INSERT INTO discrepancias (id_brigadista, descripcion, tipo) VALUES (?, ?, ?)',
        [id_brigadista, `Intento fuera del área permitida a ${distancia}m del centro`, 'Ubicación']
      );

      return res.status(400).json({ 
        exito: false, 
        tipo: 'DISCREPANCIA',
        distancia: distancia,
        mensaje: `Ubicación fuera del área permitida (${distancia} metros de la sede, máximo permitido: ${RADIO_PERMITIDO_METROS}m). El intento quedó registrado para revisión de la asesora.` 
      });
    }

    // 4. Determinar si corresponde a ENTRADA o SALIDA en la fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    const jornadaAbierta = await db.query(
      'SELECT * FROM asistencias WHERE id_brigadista = ? AND fecha = ? AND hora_salida IS NULL',
      [id_brigadista, hoy]
    );

    // Caso A: No hay jornada abierta hoy -> Se registra la ENTRADA
    if (jornadaAbierta.length === 0) {
      await db.query(
        `INSERT INTO asistencias 
         (id_brigadista, id_qr, fecha, hora_entrada, lat_entrada, lon_entrada, ubicacion_valida) 
         VALUES (?, ?, ?, NOW(), ?, ?, 1)`,
        [id_brigadista, qrValido[0].id_qr, hoy, latitud, longitud]
      );

      return res.json({ 
        exito: true, 
        tipo: 'ENTRADA',
        distancia: distancia,
        mensaje: `¡Entrada registrada con éxito! Ubicación válida (${distancia} m del punto oficial).` 
      });
    } 
    
    // Caso B: Ya existe una entrada registrada hoy sin salida -> Se registra la SALIDA y se calculan las horas
    else {
      const registro = jornadaAbierta[0];
      const entrada = new Date(registro.hora_entrada);
      const salida = new Date();
      
      // Cálculo de horas trabajadas (diferencia en milisegundos convertida a horas con 2 decimales)
      const horasCalculadas = Math.max(0, ((salida - entrada) / (1000 * 60 * 60))).toFixed(2);

      await db.query(
        `UPDATE asistencias 
         SET hora_salida = NOW(), lat_salida = ?, lon_salida = ?, horas_jornada = ? 
         WHERE id_asistencia = ?`,
        [latitud, longitud, horasCalculadas, registro.id_asistencia]
      );

      return res.json({ 
        exito: true, 
        tipo: 'SALIDA',
        horas: horasCalculadas,
        distancia: distancia,
        mensaje: `¡Salida registrada con éxito! Jornada completada: ${horasCalculadas} horas de servicio sumadas.` 
      });
    }

  } catch (error) {
    console.error('Error al procesar la asistencia:', error);
    return res.status(500).json({ 
      exito: false, 
      mensaje: 'Error interno en el servidor al registrar la asistencia.' 
    });
  }
});

export default router;
