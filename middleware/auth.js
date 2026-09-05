const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'ganti_secret_ini_di_env';

// Middleware 1: Cek Token Auth
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Belum login.' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesi tidak valid, silakan login lagi.' });
  }
}

// Middleware 2: Cek Role User
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Tidak punya akses untuk aksi ini.' });
    }
    next();
  };
}

// Helper Function: Bikin Token JWT
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Contoh Endpoint Login (opsional)
router.post('/login', (req, res) => {
  // Logic login kamu di sini...
  const token = signToken({ id: 1, role: 'admin' });
  res.json({ message: 'Login berhasil', token });
});

// Export router utama DAN fungsi middleware-nya
module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;
module.exports.signToken = signToken;
module.exports.SECRET = SECRET;
