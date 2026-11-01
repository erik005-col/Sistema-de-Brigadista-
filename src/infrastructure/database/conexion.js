/**
 * CAPA DE INFRAESTRUCTURA: Conexión a Base de Datos MySQL
 */
import mysql from 'mysql2/promise';

let pool = null;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sigeb_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch (error) {
  console.warn('Advertencia: Pool de MySQL no inicializado. Se ejecutará en modo seguro.', error.message);
}

export const db = {
  async query(sql, params) {
    if (!pool) {
      console.warn('Conexión a MySQL ausente. Ejecutando consulta simulada:', sql);
      return [];
    }
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Error al ejecutar consulta SQL en MySQL:', error.message);
      throw error;
    }
  }
};
