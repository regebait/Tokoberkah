const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/init");
const { signToken, requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
// Kalau ADMIN_PASSWORD_HASH belum di-set di .env, pakai password default "admin123" (HANYA untuk pengembangan lokal)
const DEFAULT_ADMIN_HASH = bcrypt.hashSync("admin123", 10);

router.post("/buyer/register", (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ error: "Nama, username, dan kata sandi wajib diisi." });
  }
  const exists = db
    .prepare("SELECT id FROM buyers WHERE username = ?")
    .get(username);
  if (exists) return res.status(409).json({ error: "Username sudah dipakai." });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO buyers (name, username, password) VALUES (?, ?, ?)")
    .run(name, username, hash);

  const token = signToken({
    id: info.lastInsertRowid,
    username,
    name,
    role: "buyer",
  });
  res.json({ token, user: { name, username, role: "buyer" } });
});

router.post("/buyer/login", (req, res) => {
  const { username, password } = req.body;
  const buyer = db
    .prepare("SELECT * FROM buyers WHERE username = ?")
    .get(username);
  if (!buyer || !bcrypt.compareSync(password, buyer.password)) {
    return res.status(401).json({ error: "Username atau kata sandi salah." });
  }
  const token = signToken({
    id: buyer.id,
    username: buyer.username,
    name: buyer.name,
    role: "buyer",
  });
  res.json({
    token,
    user: { name: buyer.name, username: buyer.username, role: "buyer" },
  });
});

router.post("/seller/verify", (req, res) => {
  const { name, businessName, idNumber, phone, username, password } = req.body;
  if (!name || !businessName || !idNumber || !phone || !username || !password) {
    return res
      .status(400)
      .json({ error: "Semua kolom verifikasi wajib diisi." });
  }
  const takenSeller = db
    .prepare("SELECT id FROM sellers WHERE username = ?")
    .get(username);
  const takenApp = db
    .prepare(
      "SELECT id FROM seller_applications WHERE username = ? AND status != 'rejected'"
    )
    .get(username);
  if (takenSeller || takenApp) {
    return res
      .status(409)
      .json({ error: "Username ini sudah dipakai atau sedang diajukan." });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      `INSERT INTO seller_applications (name, business_name, id_number, phone, username, password)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(name, businessName, idNumber, phone, username, hash);

  res.json({
    application: {
      id: info.lastInsertRowid,
      name,
      businessName,
      username,
      status: "pending",
    },
  });
});

router.post("/seller/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME) {
    const hashToCheck = ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;
    if (bcrypt.compareSync(password, hashToCheck)) {
      const token = signToken({ username, name: "Admin", role: "admin" });
      return res.json({
        token,
        user: { name: "Admin", username, role: "admin" },
      });
    }
    return res.status(401).json({ error: "Username atau kata sandi salah." });
  }

  const seller = db
    .prepare("SELECT * FROM sellers WHERE username = ?")
    .get(username);
  if (!seller || !bcrypt.compareSync(password, seller.password)) {
    const pending = db
      .prepare(
        "SELECT id FROM seller_applications WHERE username = ? AND status = 'pending'"
      )
      .get(username);
    if (pending) {
      return res
        .status(403)
        .json({ error: "Akun masih menunggu verifikasi admin." });
    }
    return res.status(401).json({ error: "Username atau kata sandi salah." });
  }
  const token = signToken({
    id: seller.id,
    username: seller.username,
    name: seller.name,
    businessName: seller.business_name,
    role: "seller",
  });
  res.json({
    token,
    user: {
      name: seller.name,
      businessName: seller.business_name,
      username: seller.username,
      role: "seller",
    },
  });
});

router.get(
  "/admin/applications",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const rows = db
      .prepare(
        "SELECT id, name, business_name, id_number, phone, username, status, submitted_at FROM seller_applications ORDER BY submitted_at DESC"
      )
      .all();
    res.json({ applications: rows });
  }
);

router.post(
  "/admin/applications/:id/approve",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const app = db
      .prepare("SELECT * FROM seller_applications WHERE id = ?")
      .get(req.params.id);
    if (!app)
      return res.status(404).json({ error: "Permohonan tidak ditemukan." });
    if (app.status !== "pending")
      return res.status(409).json({ error: "Permohonan sudah diproses." });

    db.prepare(
      `INSERT INTO sellers (name, business_name, id_number, phone, username, password)
     VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      app.name,
      app.business_name,
      app.id_number,
      app.phone,
      app.username,
      app.password
    );

    db.prepare(
      "UPDATE seller_applications SET status = 'approved' WHERE id = ?"
    ).run(app.id);
    res.json({ ok: true });
  }
);

router.post(
  "/admin/applications/:id/reject",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const app = db
      .prepare("SELECT * FROM seller_applications WHERE id = ?")
      .get(req.params.id);
    if (!app)
      return res.status(404).json({ error: "Permohonan tidak ditemukan." });
    if (app.status !== "pending")
      return res.status(409).json({ error: "Permohonan sudah diproses." });

    db.prepare(
      "UPDATE seller_applications SET status = 'rejected' WHERE id = ?"
    ).run(app.id);
    res.json({ ok: true });
  }
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
