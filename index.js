const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path'); // Tambahkan path untuk file statis
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Middleware JSON harus sebelum endpoint

// Koneksi ke Database
// const database = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost', // Gunakan variabel lingkungan
//   user: process.env.DB_USER || 'root',      // Sesuaikan dengan username MySQL Anda
//   password: process.env.DB_PASS || '',      // Sesuaikan dengan password MySQL Anda
//   database: process.env.DB_NAME || 'web1',  // Sesuaikan dengan nama database Anda
//   port: process.env.DB_PORT || 4000         // Gunakan variabel lingkungan untuk port jika berbeda
// });


// database.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL database:', err);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

// Endpoint Login
app.post('/login', (req, res) => {
  console.log('Data Login Diterima:', req.body);
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  database.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    } else if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Username atau password salah' });
    }
  });
});

// Endpoint untuk mengirim data form
app.post('/submit', (req, res) => {
  console.log('Data Form Diterima:', req.body);
  const { name, message } = req.body;

  const query = 'INSERT INTO form (name, message) VALUES (?, ?)';
  database.query(query, [name, message], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ success: true, message: 'Data berhasil disimpan' });
    }
  });
});

// Sajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Tangani semua rute lainnya dengan file 'index.html'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
