const express = require("express");
const app = express();

// Parsing JSON
app.use(express.json());

// Import middleware auth
const { requireAuth } = require("./auth");

// Pasang middleware (jika ingin dipasang secara global)
app.use(requireAuth);

// --- MASUKKAN ROUTE-ROUTE KAMU DI SINI ---
// contoh: app.get('/...', ...);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
