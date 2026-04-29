CREATE DATABASE IF NOT EXISTS hivetrack
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE hivetrack;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS contratos_polinizacion;
DROP TABLE IF EXISTS cuarentenas;
DROP TABLE IF EXISTS movimientos;
DROP TABLE IF EXISTS agricultores;
DROP TABLE IF EXISTS tratamientos;
DROP TABLE IF EXISTS colmenas;
DROP TABLE IF EXISTS apiarios;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rut VARCHAR(15),
  telefono VARCHAR(30),
  rol ENUM(
    'apicultor_campo',
    'tecnico_apicola',
    'admin_b33',
    'agricultor_cliente',
    'inspector_sanitario'
  ) DEFAULT 'admin_b33',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE apiarios (
  id CHAR(36) PRIMARY KEY,
  rua_code VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  propietario_rut VARCHAR(15),
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  region VARCHAR(120),
  comuna VARCHAR(120),
  n_colmenas_max INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  fecha_registro DATE,
  created_by CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE agricultores (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  razon_social VARCHAR(255),
  rut VARCHAR(15) UNIQUE,
  email VARCHAR(255),
  telefono VARCHAR(30),
  direccion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE colmenas (
  id CHAR(36) PRIMARY KEY,
  apiario_id CHAR(36) NOT NULL,
  codigo_lote VARCHAR(100) NOT NULL,
  estado_salud ENUM('verde','amarillo','naranjo','rojo') DEFAULT 'verde',
  reina_id VARCHAR(100),
  nro_marcos INT DEFAULT 0,
  nro_alzas INT DEFAULT 0,
  peso_kg DECIMAL(6,2),
  observaciones TEXT,
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apiario_id) REFERENCES apiarios(id) ON DELETE CASCADE
);

CREATE TABLE tratamientos (
  id CHAR(36) PRIMARY KEY,
  colmena_id CHAR(36) NOT NULL,
  farmaco VARCHAR(255) NOT NULL,
  principio_activo VARCHAR(255),
  dosis VARCHAR(100),
  receta_nro VARCHAR(100),
  vet_rut VARCHAR(15),
  vet_nombre VARCHAR(150),
  fecha_inicio DATE,
  dias_carencia INT DEFAULT 0,
  motivo TEXT,
  resultado TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (colmena_id) REFERENCES colmenas(id) ON DELETE CASCADE
);

CREATE TABLE movimientos (
  id CHAR(36) PRIMARY KEY,
  origen_id CHAR(36) NOT NULL,
  destino_id CHAR(36) NOT NULL,
  fecha_movimiento DATETIME NOT NULL,
  n_colmenas INT NOT NULL,
  motivo TEXT NOT NULL,
  vehiculo_patente VARCHAR(20),
  conductor_rut VARCHAR(15),
  notif_estado ENUM(
    'pendiente',
    'generada',
    'enviada',
    'confirmada',
    'rechazada'
  ) DEFAULT 'pendiente',
  responsable_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (origen_id) REFERENCES apiarios(id),
  FOREIGN KEY (destino_id) REFERENCES apiarios(id),
  FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE cuarentenas (
  id CHAR(36) PRIMARY KEY,
  apiario_id CHAR(36) NOT NULL,
  motivo TEXT NOT NULL,
  enfermedad VARCHAR(255),
  inspector_id CHAR(36),
  fecha_inicio DATE,
  fecha_levant DATE,
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apiario_id) REFERENCES apiarios(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE contratos_polinizacion (
  id CHAR(36) PRIMARY KEY,
  codigo_contrato VARCHAR(50) UNIQUE,
  apiario_id CHAR(36) NOT NULL,
  agricultor_id CHAR(36) NOT NULL,
  cultivo VARCHAR(120) NOT NULL,
  variedad VARCHAR(120),
  superficie_ha DECIMAL(10,2) NOT NULL,
  densidad_acordada DECIMAL(6,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  precio_colmena_dia DECIMAL(10,2),
  ipe_final DECIMAL(5,2),
  estado ENUM('activo','finalizado','cancelado') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apiario_id) REFERENCES apiarios(id),
  FOREIGN KEY (agricultor_id) REFERENCES agricultores(id)
);

CREATE TABLE audit_log (
  id CHAR(36) PRIMARY KEY,
  tabla VARCHAR(80) NOT NULL,
  registro_id CHAR(36) NOT NULL,
  operacion ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  datos_json JSON,
  usuario_id CHAR(36),
  ip_address VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);