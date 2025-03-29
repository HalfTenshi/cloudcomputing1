const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'secret123';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT || 3306,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke MySQL!');
    connection.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke MySQL:', err.message);
  }
})();

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Akses ditolak, token tidak ditemukan' });
  }
  
  const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer "
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    req.user = decoded;
    next();
  });
};

// Endpoint Registrasi
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.json({ success: true, message: 'Registrasi berhasil' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Endpoint Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ success: true, message: 'Login berhasil', token });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Endpoint Submit
app.post('/submit', verifyToken, async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Nama dan pesan harus diisi' });
  }
  try {
    await pool.query('INSERT INTO form (name, message) VALUES (?, ?)', [name, message]);
    res.json({ success: true, message: 'Data berhasil disimpan' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});