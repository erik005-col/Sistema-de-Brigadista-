/**
 * REPOSITORIO DE INFRAESTRUCTURA: QrRepository
 * Acceso directo a la tabla `codigos_qr` en MySQL.
 */
import { db } from '../database/conexion.js';

export class QrRepository {
  /**
   * Busca un código QR en la base de datos y verifica si está vigente.
   */
  static async buscarPorCodigo(codigo) {
    const sql = 'SELECT id_qr, codigo, descripcion, vigente FROM codigos_qr WHERE codigo = ? AND vigente = 1';
    const resultados = await db.query(sql, [codigo]);
    return resultados && resultados.length > 0 ? resultados[0] : null;
  }
}
