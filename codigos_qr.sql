-- Actividad 3.1: Configurar el código QR de asistencia
CREATE DATABASE IF NOT EXISTS sigeb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigeb_db;

CREATE TABLE IF NOT EXISTS codigos_qr (
    id_qr INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    vigente BOOLEAN NOT NULL DEFAULT 1
);

INSERT INTO codigos_qr (codigo, descripcion, vigente)
VALUES ('SIGEB-RFM-2026-A1B2C3D4', 'Punto de Asistencia Principal - Ejido Ricardo Flores Magón', 1)
ON DUPLICATE KEY UPDATE vigente = 1;
