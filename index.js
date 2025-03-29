const express = require('express');
const mysql = require('mysql2/promise'); // Gunakan mysql2 dengan Promise
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); // Untuk hash password

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Konfigurasi Koneksi Database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'bakniahhyhgtejshkimi-mysql.services.clever-cloud.com',
  user: process.env.DB_USERNAME || 'u3rce4uszo3pnhor',
  password: process.env.DB_PASSWORD || 'JxYXB8gIdDRBkxjT1L',
  database: process.env.DB_NAME || 'bakniahhyhgtejshkimi',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false } // Clever Cloud pakai SSL
});

// Cek koneksi ke database
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke MySQL di Clever Cloud!');
    connection.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke MySQL:', err.message);
  }
})();

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

    res.json({ success: true, message: 'Login berhasil' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Endpoint untuk menyimpan data form
app.post('/submit', async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Nama dan pesan harus diisi' });
  }

  try {
    const [result] = await pool.query('INSERT INTO form (name, message) VALUES (?, ?)', [name, message]);
    res.json({ success: true, message: 'Data berhasil disimpan' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Sajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Tangani semua rute lainnya dengan file 'index.html'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
