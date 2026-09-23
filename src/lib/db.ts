import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function createConnection() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendedor TEXT,
      codigo_vendedor TEXT,
      pedido TEXT,
      fecha TEXT NOT NULL,
      cliente TEXT,
      canal TEXT,
      estado TEXT,
      sku TEXT,
      producto TEXT,
      marca TEXT,
      categoria TEXT,
      cantidad REAL,
      precio_unit REAL,
      total_pen REAL,
      medio_pago TEXT,
      distrito TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha);
    CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor ON pedidos(vendedor);
    CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
    CREATE INDEX IF NOT EXISTS idx_pedidos_sku ON pedidos(sku);

    CREATE TABLE IF NOT EXISTS control_ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes TEXT NOT NULL,
      vendedor TEXT NOT NULL,
      fecha TEXT,
      dni TEXT,
      monto REAL,
      codigo_pedido TEXT,
      observacion TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'lectura' CHECK (role IN ('admin', 'lectura')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!global.__db) {
    global.__db = createConnection();
  }
  return global.__db;
}
