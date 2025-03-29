const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Konfigurasi Koneksi Database
const database = mysql.createPool({
  connectionLimit: 10, // Maksimal koneksi bersamaan
  host: process.env.DB_HOST || 'bakniahhyhgtejshkimi-mysql.services.clever-cloud.com',
  user: process.env.DB_USERNAME || 'u3rce4uszo3pnhor',
  password: process.env.DB_PASSWORD || 'JxYXB8gIdDRBkxjT1L',
  database: process.env.DB_NAME || 'bakniahhyhgtejshkimi',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true // Dukung multiple query jika diperlukan
});

// Cek koneksi database
database.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal terhubung ke MySQL:', err.message);
  } else {
    console.log('✅ Berhasil terhubung ke MySQL di Clever Cloud!');
    connection.release(); // Bebaskan koneksi setelah dicek
  }
});

// Endpoint Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  database.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.json({ success: true, message: 'Login berhasil' });
    } else {
      res.status(401).json({ error: 'Username atau password salah' });
    }
  });
});

// Endpoint untuk menyimpan data form
app.post('/submit', (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Nama dan pesan harus diisi' });
  }

  const query = 'INSERT INTO form (name, message) VALUES (?, ?)';
  database.query(query, [name, message], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: 'Data berhasil disimpan' });
  });
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
