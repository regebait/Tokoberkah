const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Import middleware
const { requireAuth } = require('./middleware/auth');

// 1. Route tes biasa (Bisa diakses di browser tanpa token)
app.get('/', (req, res) => {
  res.send('API Toko Berkah Aktif!');
});

// 2. Route yang butuh login (Pasang requireAuth khusus di sini)
app.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Jalankan server di PORT dynamic dari Railway
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
