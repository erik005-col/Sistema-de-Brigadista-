# Sistema Integral de Brigadistas (SIGEB)

Proyecto de servicio social para el control de asistencia y seguimiento de brigadistas en el Ejido Ricardo Flores Magón, Sinaloa.

* **Universidad:** Universidad Autónoma de Sinaloa (Facultad de Ingeniería Mochis)
* **Carrera:** Licenciatura en Ingeniería de Software
* **Brigadista:** Erik Ortiz Leal
* **Asesora:** Dra. Ana Karina Ordoñez Melendrez
* **Ciclo:** 2026 - 2027-I

---

### ¿De qué trata el proyecto?
Actualmente el seguimiento de los brigadistas se hace mediante fotos de entrada y salida por WhatsApp, ubicación en tiempo real compartida en el chat y las horas se registran a mano en Excel. 

El objetivo de este proyecto es cambiar ese proceso por un sistema web donde el brigadista registre su asistencia escaneando un código QR desde su celular, validando al mismo tiempo su ubicación GPS para comprobar que se encuentra en el Ejido dentro del área permitida (100 metros).

---

### Arquitectura del Proyecto (Clean Architecture)
El sistema está organizado bajo los principios de **Arquitectura Limpia**, separando las responsabilidades en capas independientes:

```
D:\Sistema de brigadistas\
│
├── public/                               # Capa de Presentación (Frontend)
│   ├── configurar_qr.html                # Pantalla para la Asesora (Generar e imprimir QR)
│   └── escaner_qr.html                   # Pantalla para el Brigadista (Cámara y GPS)
│
├── src/                                  # Capa de Negocio y Datos (Backend)
│   ├── domain/                           # 1. Reglas puras del negocio
│   │   ├── constants.js                  # Coordenadas oficiales y radio de 100 m
│   │   └── GeoCalculadora.js             # Fórmula matemática de Haversine
│   │
│   ├── usecases/                         # 2. Casos de uso de la aplicación
│   │   ├── ValidarCodigoQR.js            # Verifica que el QR exista y esté vigente
│   │   └── RegistrarAsistencia.js        # Lógica de Entrada / Salida y horas
│   │
│   ├── infrastructure/                   # 3. Base de datos y repositorios
│   │   ├── database/
│   │   │   ├── conexion.js               # Conexión con MySQL
│   │   │   └── schema.sql                # Script de creación de tablas
│   │   └── repositories/
│   │       ├── AsistenciaRepository.js   # Consultas de asistencia y discrepancias
│   │       └── QrRepository.js           # Consultas de códigos QR
│   │
│   └── controllers/                      # 4. Controladores y Rutas HTTP
│       ├── AsistenciaController.js       # Recibe peticiones y responde JSON
│       └── AsistenciaRoutes.js           # Ruta POST /api/asistencia/registrar
│
├── server.js                             # Servidor principal con Express
├── package.json                          # Dependencias del proyecto
└── README.md                             # Documentación del proyecto
```

---

### Cómo usarlo y probarlo

#### Opción 1: Directo en el navegador (Sin encender servidor)
Puedes abrir directamente con doble clic:
1. `configurar_qr.html` para ver y descargar el código QR del Ejido.
2. `escaner_qr.html` para activar la cámara, pedir GPS y probar el registro de asistencia.

#### Opción 2: Con servidor Node.js
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor:
   ```bash
   npm start
   ```
3. Abrir en el navegador:
   * **Brigadista:** `http://localhost:3000/escaner_qr.html`
   * **Asesora:** `http://localhost:3000/configurar_qr.html`
