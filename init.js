const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "toko.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS buyers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sellers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  jenis TEXT NOT NULL,
  harga INTEGER NOT NULL,
  stok INTEGER NOT NULL,
  icon TEXT DEFAULT '📦',
  seller_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL,
  buyer_username TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const seedCount = db.prepare("SELECT COUNT(*) AS c FROM products").get().c;
if (seedCount === 0) {
  const insert = db.prepare(
    "INSERT INTO products (name, jenis, harga, stok, icon) VALUES (?, ?, ?, ?, ?)"
  );
  const seed = [
    ["Beras Premium 5kg", "Sembako", 68000, 24, "🌾"],
    ["Minyak Goreng 2L", "Sembako", 34000, 18, "🛢️"],
    ["Gula Pasir 1kg", "Sembako", 15500, 40, "🍚"],
    ["Kopi Robusta 250g", "Minuman", 32000, 15, "☕"],
    ["Teh Celup Box", "Minuman", 12000, 30, "🍵"],
    ["Sabun Mandi Batang", "Kebutuhan Rumah", 6000, 3, "🧼"],
    ["Keripik Singkong", "Camilan", 10000, 25, "🥔"],
  ];
  seed.forEach((row) => insert.run(...row));
}

module.exports = db;
