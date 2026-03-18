// server/db.js
import Database from "better-sqlite3";

// Crea o abre el archivo de base de datos
const db = new Database("database.sqlite");

// Tabla de usuarios administradores
db.prepare(`
  CREATE TABLE IF NOT EXISTS AdminUser (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

// Tabla de trips
db.prepare(`
  CREATE TABLE IF NOT EXISTS Trip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    destination TEXT,
    status TEXT,
    price REAL,
    duration_days INTEGER,
    rating REAL,
    image_url TEXT,
    is_featured INTEGER DEFAULT 0
  )
`).run();

// Insertar un admin por defecto si no existe
const exists = db.prepare("SELECT * FROM AdminUser WHERE username = ?").get("admin");
if (!exists) {
  db.prepare("INSERT INTO AdminUser (username, password) VALUES (?, ?)").run("admin", "1234");
}

export default db;