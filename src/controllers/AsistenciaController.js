/**
 * CONTROLADOR: AsistenciaController
 * Recibe peticiones HTTP desde el frontend móvil y delega la ejecución al Caso de Uso.
 */
import { RegistrarAsistencia } from '../usecases/RegistrarAsistencia.js';

export class AsistenciaController {
  static async registrar(req, res) {
    try {
      const { codigo_qr, latitud, longitud } = req.body;
      const idBrigadista = req.session?.id_brigadista || req.body?.id_brigadista || 1;

      const resultado = await RegistrarAsistencia.ejecutar({
        idBrigadista,
        codigoQr: codigo_qr,
        latitud,
        longitud
      });

      return res.status(resultado.codigoEstado).json(resultado);
    } catch (error) {
      console.error('Error no controlado en AsistenciaController:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error interno en el servidor al procesar la asistencia.'
      });
    }
  }
}
