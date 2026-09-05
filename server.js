const express = require('express');
const app = express();

// Parsing JSON body
app.use(express.json());

// Import router & middleware dari folder routes/auth.js
const authRouter = require('./routes/auth');
const { requireAuth } = require('./routes/auth');

// Pasang auth router (misal endpoint login /routes/auth/login)
app.use('/auth', authRouter);

// Contoh pasang middleware untuk memproteksi route tertentu
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ message: 'Akses diterima', user: req.user });
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
