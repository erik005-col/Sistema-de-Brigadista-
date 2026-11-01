/**
 * CASO DE USO: ValidarCodigoQR
 * Regla de aplicación: Comprueba que el código escaneado sea reconocido y esté vigente.
 */
import { QrRepository } from '../infrastructure/repositories/QrRepository.js';

export class ValidarCodigoQR {
  static async ejecutar(codigo) {
    if (!codigo) {
      return { valido: false, mensaje: 'El código QR está vacío.' };
    }

    const qrEncontrado = await QrRepository.buscarPorCodigo(codigo.trim());

    if (!qrEncontrado) {
      return { 
        valido: false, 
        mensaje: 'Código QR no reconocido o ya no está vigente. Contacte a la asesora.' 
      };
    }

    return { 
      valido: true, 
      datos: qrEncontrado 
    };
  }
}
