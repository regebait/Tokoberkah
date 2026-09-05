const express = require('express');
const app = express();

// Middleware parsing body
app.use(express.json());

// Import fungsi requireAuth pakai kurung kurawal { }
const { requireAuth } = require('./auth');

// Pasang middleware-nya
app.use(requireAuth);

// ... sisa kode server.js kamu ke bawah tetep samarequire("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const checkoutRoutes = require("./routes/checkout");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Toko Berkah API jalan di port ${PORT}`);
});
