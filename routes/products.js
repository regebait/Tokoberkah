const express = require("express");
const db = require("../db/init");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const { search, jenis } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];
  if (search) {
    sql += " AND name LIKE ?";
    params.push(`%${search}%`);
  }
  if (jenis && jenis !== "Semua") {
    sql += " AND jenis = ?";
    params.push(jenis);
  }
  sql += " ORDER BY created_at DESC";
  const rows = db.prepare(sql).all(...params);
  res.json({ products: rows });
});

router.post("/", requireAuth, requireRole("seller"), (req, res) => {
  const { name, jenis, harga, stok, icon } = req.body;
  if (
    !name ||
    !jenis ||
    harga == null ||
    stok == null ||
    harga < 0 ||
    stok < 0
  ) {
    return res
      .status(400)
      .json({ error: "Lengkapi nama, jenis, harga, dan stok dengan benar." });
  }
  const info = db
    .prepare(
      "INSERT INTO products (name, jenis, harga, stok, icon, seller_id) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(name, jenis, harga, stok, icon || "ðŸ“¦", req.user.id);
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(info.lastInsertRowid);
  res.json({ product });
});

router.put("/:id", requireAuth, requireRole("seller"), (req, res) => {
  const { name, jenis, harga, stok, icon } = req.body;
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id);
  if (!product)
    return res.status(404).json({ error: "Produk tidak ditemukan." });
  if (
    !name ||
    !jenis ||
    harga == null ||
    stok == null ||
    harga < 0 ||
    stok < 0
  ) {
    return res
      .status(400)
      .json({ error: "Lengkapi nama, jenis, harga, dan stok dengan benar." });
  }
  db.prepare(
    "UPDATE products SET name = ?, jenis = ?, harga = ?, stok = ?, icon = ? WHERE id = ?"
  ).run(name, jenis, harga, stok, icon || product.icon, req.params.id);
  const updated = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id);
  res.json({ product: updated });
});

router.delete("/:id", requireAuth, requireRole("seller"), (req, res) => {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id);
  if (!product)
    return res.status(404).json({ error: "Produk tidak ditemukan." });
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
