const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://zntmnrm0-5173.brs.devtunnels.ms'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🚀 HiveTrack API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend corriendo en puerto ${port}`);
});