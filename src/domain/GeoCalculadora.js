/**
 * ENTIDAD / SERVICIO DE DOMINIO: GeoCalculadora
 * Implementación matemática de la fórmula de Haversine para cálculo de distancia en metros.
 * No depende de ningún framework ni base de datos (Dominio puro).
 */
export class GeoCalculadora {
  /**
   * Calcula la distancia en metros entre dos puntos geográficos (latitud y longitud).
   */
  static calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
    const RADIO_TIERRA_METROS = 6371000;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const radLat1 = lat1 * (Math.PI / 180);
    const radLat2 = lat2 * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(RADIO_TIERRA_METROS * c);
  }

  /**
   * Determina si una distancia calculada está dentro del radio permitido.
   */
  static esUbicacionValida(distanciaMetros, radioPermitidoMetros = 100) {
    return distanciaMetros <= radioPermitidoMetros;
  }
}
