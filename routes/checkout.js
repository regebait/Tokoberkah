const express = require("express");
const db = require("../db/init");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, requireRole("buyer"), (req, res) => {
  const { items, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0 || !paymentMethod) {
    return res
      .status(400)
      .json({
        error: "Keranjang kosong atau metode pembayaran belum dipilih.",
      });
  }

  const invoiceItems = [];
  let total = 0;

  const tx = db.transaction(() => {
    for (const item of items) {
      const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(item.productId);
      if (!product)
        throw new Error(`Produk ${item.productId} tidak ditemukan.`);
      if (product.stok < item.qty)
        throw new Error(`Stok ${product.name} tidak cukup.`);

      db.prepare("UPDATE products SET stok = stok - ? WHERE id = ?").run(
        item.qty,
        product.id
      );
      const subtotal = product.harga * item.qty;
      total += subtotal;
      invoiceItems.push({ name: product.name, qty: item.qty, subtotal });
    }
  });

  try {
    tx();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const invoiceNumber = "INV-" + Date.now();
  db.prepare(
    "INSERT INTO invoices (invoice_number, buyer_username, items_json, total, payment_method) VALUES (?, ?, ?, ?, ?)"
  ).run(
    invoiceNumber,
    req.user.username,
    JSON.stringify(invoiceItems),
    total,
    paymentMethod
  );

  res.json({
    invoice: {
      number: invoiceNumber,
      date: new Date().toISOString(),
      items: invoiceItems,
      total,
      method: paymentMethod,
    },
  });
});

module.exports = router;
