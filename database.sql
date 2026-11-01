-- ============================================================================
-- PROYECTO: SIGEB (Sistema Integral de Brigadistas)
-- Sede: Ejido Ricardo Flores Magón, Sinaloa
-- Módulo: Registro de Asistencia por Código QR y Geolocalización (Meta 3)
-- Archivo: database.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sigeb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigeb_db;

-- 1. Tabla de Configuración general del sistema (RF16)
CREATE TABLE IF NOT EXISTS configuracion (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    lat_centro DECIMAL(10, 7) NOT NULL DEFAULT 25.7952000,
    lon_centro DECIMAL(10, 7) NOT NULL DEFAULT -108.9955000,
    radio_metros INT NOT NULL DEFAULT 100,
    hora_inicio TIME NOT NULL DEFAULT '08:00:00',
    hora_fin TIME NOT NULL DEFAULT '14:00:00'
);

-- Valores oficiales para el Ejido Ricardo Flores Magón
INSERT INTO configuracion (lat_centro, lon_centro, radio_metros, hora_inicio, hora_fin)
VALUES (25.7952000, -108.9955000, 100, '08:00:00', '14:00:00')
ON DUPLICATE KEY UPDATE id_config = id_config;

-- 2. Tabla de Usuarios y Roles (RF01, RNF03)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('brigadista', 'asesor') NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Brigadistas (RF02, RF07)
CREATE TABLE IF NOT EXISTS brigadistas (
    id_brigadista INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    estatus ENUM('activo', 'inactivo', 'concluido') NOT NULL DEFAULT 'activo',
    horas_requeridas INT NOT NULL DEFAULT 480,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 4. Tabla de Códigos QR de Asistencia (Actividad 3.1)
CREATE TABLE IF NOT EXISTS codigos_qr (
    id_qr INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    vigente BOOLEAN NOT NULL DEFAULT 1
);

-- Código QR oficial vigente del punto de servicio
INSERT INTO codigos_qr (codigo, descripcion, vigente)
VALUES ('SIGEB-RFM-2026-A1B2C3D4', 'Punto de Asistencia Principal - Ejido Ricardo Flores Magón', 1)
ON DUPLICATE KEY UPDATE vigente = 1;

-- 5. Tabla de Asistencias (RF03, RF04, RF06)
CREATE TABLE IF NOT EXISTS asistencias (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_brigadista INT NOT NULL,
    id_qr INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME NULL,
    lat_entrada DECIMAL(10, 7) NOT NULL,
    lon_entrada DECIMAL(10, 7) NOT NULL,
    lat_salida DECIMAL(10, 7) NULL,
    lon_salida DECIMAL(10, 7) NULL,
    ubicacion_valida BOOLEAN NOT NULL DEFAULT 1,
    horas_jornada DECIMAL(5, 2) NULL DEFAULT 0.00,
    FOREIGN KEY (id_brigadista) REFERENCES brigadistas(id_brigadista) ON DELETE CASCADE,
    FOREIGN KEY (id_qr) REFERENCES codigos_qr(id_qr)
);

-- 6. Tabla de Discrepancias (RF05)
-- Incluye id_brigadista para auditoría cuando el registro ocurre fuera del área permitida
CREATE TABLE IF NOT EXISTS discrepancias (
    id_discrepancia INT AUTO_INCREMENT PRIMARY KEY,
    id_brigadista INT NOT NULL,
    id_asistencia INT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'Ubicación', 'Sin permiso GPS', 'QR Inválido'
    descripcion VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revisada BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (id_brigadista) REFERENCES brigadistas(id_brigadista) ON DELETE CASCADE,
    FOREIGN KEY (id_asistencia) REFERENCES asistencias(id_asistencia) ON DELETE SET NULL
);
