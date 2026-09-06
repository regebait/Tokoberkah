const express = require('express');
const app = express();

app.use(express.json());

// Import fungsi requireAuth langsung dari folder middleware/
const { requireAuth } = require('./middleware/auth');

// Pasang middleware-nya
app.use(requireAuth);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
