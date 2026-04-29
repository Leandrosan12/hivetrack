const db = require('../config/db');

exports.summary = async (req, res) => {
  try {
    const [[apiarios]] = await db.query('SELECT COUNT(*) AS total FROM apiarios');
    const [[agricultores]] = await db.query('SELECT COUNT(*) AS total FROM agricultores');
    const [[colmenas]] = await db.query('SELECT COUNT(*) AS total FROM colmenas');
    const [[contratos]] = await db.query('SELECT COUNT(*) AS total FROM contratos_polinizacion');
    const [[movimientos]] = await db.query('SELECT COUNT(*) AS total FROM movimientos');

    res.json({
      apiarios: apiarios.total,
      agricultores: agricultores.total,
      colmenas: colmenas.total,
      contratos: contratos.total,
      movimientos: movimientos.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar resumen', error: error.message });
  }
};

exports.listApiarios = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM apiarios ORDER BY id DESC');
  res.json(rows);
};

exports.createApiario = async (req, res) => {
  const { rua_code, nombre, propietario_rut, lat, lng, region, comuna, n_colmenas_max } = req.body;

  await db.query(
    `INSERT INTO apiarios 
    (id, rua_code, nombre, propietario_rut, lat, lng, region, comuna, n_colmenas_max, fecha_registro, created_by)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
    [rua_code, nombre, propietario_rut, lat, lng, region, comuna, n_colmenas_max || 0, req.user.id]
  );

  res.json({ message: 'Apiario creado' });
};

exports.listAgricultores = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM agricultores ORDER BY id DESC');
  res.json(rows);
};

exports.createAgricultor = async (req, res) => {
  const { nombre, razon_social, rut, email, telefono, direccion } = req.body;

  await db.query(
    `INSERT INTO agricultores 
    (id, nombre, razon_social, rut, email, telefono, direccion)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [nombre, razon_social, rut, email, telefono, direccion]
  );

  res.json({ message: 'Agricultor creado' });
};

exports.listColmenas = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM colmenas ORDER BY id DESC');
  res.json(rows);
};

exports.createColmena = async (req, res) => {
  const { apiario_id, codigo_lote, estado_salud, reina_id, nro_marcos, nro_alzas, peso_kg, observaciones } = req.body;

  await db.query(
    `INSERT INTO colmenas 
    (id, apiario_id, codigo_lote, estado_salud, reina_id, nro_marcos, nro_alzas, peso_kg, observaciones)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
    [apiario_id, codigo_lote, estado_salud, reina_id, nro_marcos || 0, nro_alzas || 0, peso_kg || null, observaciones]
  );

  res.json({ message: 'Colmena creada' });
};

exports.listContratos = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM contratos_polinizacion ORDER BY id DESC');
  res.json(rows);
};

exports.createContrato = async (req, res) => {
  const { apiario_id, agricultor_id, cultivo, variedad, superficie_ha, densidad_acordada, fecha_inicio, fecha_fin, precio_colmena_dia } = req.body;

  const codigo = `POL-${Date.now()}`;
  const ipe = Math.min(100, Number(densidad_acordada || 0) * 20);

  await db.query(
    `INSERT INTO contratos_polinizacion
    (id, codigo_contrato, apiario_id, agricultor_id, cultivo, variedad, superficie_ha, densidad_acordada, fecha_inicio, fecha_fin, precio_colmena_dia, ipe_final)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [codigo, apiario_id, agricultor_id, cultivo, variedad, superficie_ha, densidad_acordada, fecha_inicio, fecha_fin, precio_colmena_dia || null, ipe]
  );

  res.json({ message: 'Contrato creado' });
};

exports.listMovimientos = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM movimientos ORDER BY id DESC');
  res.json(rows);
};

exports.createMovimiento = async (req, res) => {
  const { origen_id, destino_id, fecha_movimiento, n_colmenas, motivo, vehiculo_patente, conductor_rut } = req.body;

  await db.query(
    `INSERT INTO movimientos
    (id, origen_id, destino_id, fecha_movimiento, n_colmenas, motivo, vehiculo_patente, conductor_rut, responsable_id)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
    [origen_id, destino_id, fecha_movimiento, n_colmenas, motivo, vehiculo_patente, conductor_rut, req.user.id]
  );

  res.json({ message: 'Movimiento creado' });
};

exports.deleteApiario = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM movimientos WHERE origen_id = ? OR destino_id = ?', [id, id]);
    await db.query('DELETE FROM contratos_polinizacion WHERE apiario_id = ?', [id]);
    await db.query('DELETE FROM colmenas WHERE apiario_id = ?', [id]);
    await db.query('DELETE FROM apiarios WHERE id = ?', [id]);

    res.json({ message: 'Apiario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar apiario', error: error.message });
  }
};

exports.deleteAgricultor = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM contratos_polinizacion WHERE agricultor_id = ?', [id]);
    await db.query('DELETE FROM agricultores WHERE id = ?', [id]);

    res.json({ message: 'Agricultor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar agricultor', error: error.message });
  }
};

exports.deleteColmena = async (req, res) => {
  await db.query('DELETE FROM colmenas WHERE id = ?', [req.params.id]);
  res.json({ message: 'Colmena eliminada correctamente' });
};

exports.deleteContrato = async (req, res) => {
  await db.query('DELETE FROM contratos_polinizacion WHERE id = ?', [req.params.id]);
  res.json({ message: 'Contrato eliminado correctamente' });
};

exports.deleteMovimiento = async (req, res) => {
  await db.query('DELETE FROM movimientos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Movimiento eliminado correctamente' });
};