const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    multipleStatements: true
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await connection.query(schema);
    await connection.query(`USE ${process.env.DB_NAME || 'hivetrack'}`);

    const hash = await bcrypt.hash('admin123', 10);
    await connection.query(
      `INSERT IGNORE INTO usuarios (nombre, apellido, email, password_hash, rut, telefono, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Admin', 'HiveTrack', 'admin@hivetrack.cl', hash, '12345678-9', '+56900000000', 'admin_b33']
    );

    await connection.query(
      `INSERT IGNORE INTO agricultores (id, nombre, razon_social, rut, email, telefono, direccion)
       VALUES (1, 'Agrícola Valle Sur', 'Agrícola Valle Sur SpA', '76543210-1', 'contacto@vallesur.cl', '+56911112222', 'Región Metropolitana')`
    );

    await connection.query(
      `INSERT IGNORE INTO apiarios (id, rua_code, nombre, propietario_rut, lat, lng, region, comuna, n_colmenas_max, fecha_registro)
       VALUES (1, 'RM01-000001', 'Apiario Central b33', '12345678-9', -33.44890000, -70.66930000, 'Metropolitana', 'Santiago', 500, CURDATE())`
    );

    console.log('✅ Base de datos creada correctamente.');
    console.log('✅ Login inicial: admin@hivetrack.cl / admin123');
  } catch (error) {
    console.error('❌ Error init-db');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('❌ No se pudo conectar a MySQL.');
  console.error('Mensaje:', error.message);
  console.error('Código:', error.code);
  console.error('Revisa que MySQL esté en localhost:3306 y contraseña admin.');
  process.exit(1);
});
