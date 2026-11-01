/**
 * CASO DE USO: RegistrarAsistencia
 * Orquesta la validación de presencia, cálculo de distancia y persistencia de Entrada / Salida.
 */
import { DOMINIO_CONFIG } from '../domain/constants.js';
import { GeoCalculadora } from '../domain/GeoCalculadora.js';
import { ValidarCodigoQR } from './ValidarCodigoQR.js';
import { AsistenciaRepository } from '../infrastructure/repositories/AsistenciaRepository.js';

export class RegistrarAsistencia {
  static async ejecutar({ idBrigadista, codigoQr, latitud, longitud }) {
    // 1. Validar parámetros de entrada
    if (!codigoQr || latitud === undefined || longitud === undefined) {
      return {
        exito: false,
        codigoEstado: 400,
        mensaje: 'Datos incompletos. Se requiere código QR y coordenadas GPS.'
      };
    }

    // 2. Ejecutar caso de uso de validación de código QR
    const resultadoQR = await ValidarCodigoQR.ejecutar(codigoQr);
    if (!resultadoQR.valido) {
      return {
        exito: false,
        codigoEstado: 400,
        mensaje: resultadoQR.mensaje
      };
    }

    // 3. Medir distancia al punto oficial con la entidad de dominio GeoCalculadora
    const distancia = GeoCalculadora.calcularDistanciaMetros(
      latitud,
      longitud,
      DOMINIO_CONFIG.CENTRO_EJIDO.latitud,
      DOMINIO_CONFIG.CENTRO_EJIDO.longitud
    );

    const esValida = GeoCalculadora.esUbicacionValida(distancia, DOMINIO_CONFIG.RADIO_MAXIMO_METROS);

    // Si está fuera del área permitida -> Registrar discrepancia
    if (!esValida) {
      await AsistenciaRepository.registrarDiscrepancia(
        idBrigadista,
        `Intento fuera del área a ${distancia} m del centro`,
        'Ubicación'
      );

      return {
        exito: false,
        codigoEstado: 400,
        tipo: 'DISCREPANCIA',
        distancia: distancia,
        mensaje: `Ubicación fuera del área permitida (${distancia} m de la sede, máximo permitido: ${DOMINIO_CONFIG.RADIO_MAXIMO_METROS} m). Intento registrado como discrepancia.`
      };
    }

    // 4. Determinar si corresponde a Entrada o Salida según jornada abierta
    const fechaHoy = new Date().toISOString().split('T')[0];
    const jornadaAbierta = await AsistenciaRepository.obtenerJornadaAbiertaHoy(idBrigadista, fechaHoy);

    // Caso A: No hay jornada abierta -> REGISTRAR ENTRADA
    if (!jornadaAbierta) {
      await AsistenciaRepository.registrarEntrada(
        idBrigadista,
        resultadoQR.datos.id_qr,
        fechaHoy,
        latitud,
        longitud
      );

      return {
        exito: true,
        codigoEstado: 200,
        tipo: 'ENTRADA',
        distancia: distancia,
        mensaje: `¡Entrada registrada con éxito! Ubicación válida a ${distancia} m del centro del Ejido.`
      };
    }

    // Caso B: Ya hay entrada hoy -> REGISTRAR SALIDA Y CALCULAR HORAS
    const entradaFecha = new Date(jornadaAbierta.hora_entrada);
    const salidaFecha = new Date();
    const horasCalculadas = Math.max(0, ((salidaFecha - entradaFecha) / (1000 * 60 * 60))).toFixed(2);

    await AsistenciaRepository.registrarSalida(
      jornadaAbierta.id_asistencia,
      latitud,
      longitud,
      horasCalculadas
    );

    return {
      exito: true,
      codigoEstado: 200,
      tipo: 'SALIDA',
      horas: horasCalculadas,
      distancia: distancia,
      mensaje: `¡Salida registrada con éxito! Jornada completada: ${horasCalculadas} horas sumadas al servicio social.`
    };
  }
}
