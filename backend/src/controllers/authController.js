const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rut, telefono, rol } = req.body;

    if (!nombre || nombre.trim().length < 2) return res.status(400).json({ message: 'Nombre inválido' });
    if (!apellido || apellido.trim().length < 2) return res.status(400).json({ message: 'Apellido inválido' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Correo inválido' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });

    const [exists] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Este correo ya tiene cuenta. Inicia sesión.' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rut, telefono, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), apellido.trim(), email.trim().toLowerCase(), hash, rut || null, telefono || null, rol || 'admin_b33']
    );

    res.status(201).json({ message: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validEmail(email)) return res.status(400).json({ message: 'Correo inválido' });
    if (!password) return res.status(400).json({ message: 'Contraseña requerida' });

    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email.trim().toLowerCase()]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no existe. Debes registrarte.' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

exports.me = async (req, res) => {
  const [rows] = await db.query('SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?', [req.user.id]);
  res.json(rows[0]);
};
