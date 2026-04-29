const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();

/* CORS libre para desarrollo local */
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🚀 HiveTrack API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
});