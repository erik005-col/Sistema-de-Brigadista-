/**
 * REPOSITORIO DE INFRAESTRUCTURA: AsistenciaRepository
 * Acceso directo a las tablas `asistencias` y `discrepancias` en MySQL.
 */
import { db } from '../database/conexion.js';

export class AsistenciaRepository {
  /**
   * Busca si el brigadista tiene una jornada abierta hoy (entrada registrada sin salida).
   */
  static async obtenerJornadaAbiertaHoy(idBrigadista, fechaHoy) {
    const sql = `
      SELECT id_asistencia, id_brigadista, fecha, hora_entrada, hora_salida 
      FROM asistencias 
      WHERE id_brigadista = ? AND fecha = ? AND hora_salida IS NULL 
      LIMIT 1
    `;
    const resultados = await db.query(sql, [idBrigadista, fechaHoy]);
    return resultados && resultados.length > 0 ? resultados[0] : null;
  }

  /**
   * Inserta un nuevo registro de ENTRADA.
   */
  static async registrarEntrada(idBrigadista, idQr, fecha, lat, lon) {
    const sql = `
      INSERT INTO asistencias 
      (id_brigadista, id_qr, fecha, hora_entrada, lat_entrada, lon_entrada, ubicacion_valida) 
      VALUES (?, ?, ?, NOW(), ?, ?, 1)
    `;
    return await db.query(sql, [idBrigadista, idQr, fecha, lat, lon]);
  }

  /**
   * Actualiza el registro existente marcando la SALIDA y sumando las horas de jornada.
   */
  static async registrarSalida(idAsistencia, lat, lon, horasJornada) {
    const sql = `
      UPDATE asistencias 
      SET hora_salida = NOW(), lat_salida = ?, lon_salida = ?, horas_jornada = ? 
      WHERE id_asistencia = ?
    `;
    return await db.query(sql, [lat, lon, horasJornada, idAsistencia]);
  }

  /**
   * Registra una discrepancia geográfica o de permisos para auditoría de la asesora.
   */
  static async registrarDiscrepancia(idBrigadista, descripcion, tipo = 'Ubicación') {
    const sql = `
      INSERT INTO discrepancias (id_brigadista, descripcion, tipo) 
      VALUES (?, ?, ?)
    `;
    return await db.query(sql, [idBrigadista, descripcion, tipo]);
  }
}
