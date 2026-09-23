import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");
const PEDIDOS_FILE = path.join(DATA_DIR, "source", "detalle_pedidos_2026.xlsx");
const CONTROL_FILE = path.join(DATA_DIR, "source", "control_ventas_2026.xlsx");

if (!fs.existsSync(PEDIDOS_FILE) || !fs.existsSync(CONTROL_FILE)) {
  console.error(
    "No se encontraron los archivos fuente. Deben estar en data/source/:\n" +
      "  - detalle_pedidos_2026.xlsx\n" +
      "  - control_ventas_2026.xlsx"
  );
  process.exit(1);
}

// empezar de cero en cada corrida del seed
if (fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH);
if (fs.existsSync(DB_PATH + "-wal")) fs.rmSync(DB_PATH + "-wal");
if (fs.existsSync(DB_PATH + "-shm")) fs.rmSync(DB_PATH + "-shm");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE pedidos (
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
  CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
  CREATE INDEX idx_pedidos_vendedor ON pedidos(vendedor);
  CREATE INDEX idx_pedidos_estado ON pedidos(estado);
  CREATE INDEX idx_pedidos_sku ON pedidos(sku);

  CREATE TABLE control_ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mes TEXT NOT NULL,
    vendedor TEXT NOT NULL,
    fecha TEXT,
    dni TEXT,
    monto REAL,
    codigo_pedido TEXT,
    observacion TEXT
  );

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'lectura' CHECK (role IN ('admin', 'lectura')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );
`);

function excelDateToISO(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${mm}-${dd}`;
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// ---------- detalle_pedidos_2026.xlsx (fuente principal) ----------

const pedidosWb = XLSX.readFile(PEDIDOS_FILE, { cellDates: true });
const detalleSheet = pedidosWb.Sheets["Detalle"];
if (!detalleSheet) {
  console.error('No se encontró la hoja "Detalle" en detalle_pedidos_2026.xlsx');
  process.exit(1);
}

type DetalleRow = {
  vendedor: string | null;
  codigo: string | null;
  pedido: string | null;
  fecha: unknown;
  cliente: string | null;
  canal: string | null;
  estado: string | null;
  sku: string | null;
  producto: string | null;
  marca: string | null;
  categoria: string | null;
  cantidad: number | null;
  precio_unit: number | null;
  total_pen: number | null;
  medio_pago: string | null;
  distrito: string | null;
};

const detalleRows = XLSX.utils.sheet_to_json<DetalleRow>(detalleSheet, {
  defval: null,
});

const insertPedido = db.prepare(`
  INSERT INTO pedidos
    (vendedor, codigo_vendedor, pedido, fecha, cliente, canal, estado, sku, producto, marca, categoria, cantidad, precio_unit, total_pen, medio_pago, distrito)
  VALUES
    (@vendedor, @codigo_vendedor, @pedido, @fecha, @cliente, @canal, @estado, @sku, @producto, @marca, @categoria, @cantidad, @precio_unit, @total_pen, @medio_pago, @distrito)
`);

let pedidosCount = 0;
const insertAllPedidos = db.transaction((rows: DetalleRow[]) => {
  for (const row of rows) {
    if (!row.pedido) continue;
    const fecha = excelDateToISO(row.fecha);
    if (!fecha) continue;
    insertPedido.run({
      vendedor: row.vendedor?.toString().trim() || null,
      codigo_vendedor: row.codigo?.toString().trim() || null,
      pedido: row.pedido.toString().trim(),
      fecha,
      cliente: row.cliente?.toString().trim() || null,
      canal: row.canal?.toString().trim() || null,
      estado: row.estado?.toString().trim() || null,
      sku: row.sku?.toString().trim() || null,
      producto: row.producto?.toString().trim() || null,
      marca: row.marca?.toString().trim() || null,
      categoria: row.categoria?.toString().trim() || null,
      cantidad: toNumber(row.cantidad),
      precio_unit: toNumber(row.precio_unit),
      total_pen: toNumber(row.total_pen),
      medio_pago: row.medio_pago?.toString().trim() || null,
      distrito: row.distrito?.toString().trim() || null,
    });
    pedidosCount++;
  }
});
insertAllPedidos(detalleRows);
console.log(`pedidos: ${pedidosCount} filas cargadas`);

// ---------- control_ventas_2026.xlsx (registro manual, referencia secundaria) ----------
//
// Cada hoja de mes tiene bloques repetidos de 5 columnas por vendedor:
// [fecha, DNI, monto, codigo de pedido, observacion]. La fecha solo se
// escribe en la primera fila de cada día (las siguientes filas del mismo
// día la dejan en blanco), así que se hace forward-fill por bloque.

const controlWb = XLSX.readFile(CONTROL_FILE, { cellDates: true });
const monthSheets = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO"];

const insertControl = db.prepare(`
  INSERT INTO control_ventas (mes, vendedor, fecha, dni, monto, codigo_pedido, observacion)
  VALUES (@mes, @vendedor, @fecha, @dni, @monto, @codigo_pedido, @observacion)
`);

let controlCount = 0;
const insertAllControl = db.transaction(() => {
  for (const sheetName of monthSheets) {
    const sheet = controlWb.Sheets[sheetName];
    if (!sheet) continue;

    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    // fila con los encabezados "DNI | S/ | UP" de cada bloque de vendedor
    const headerRowIndex = rows.findIndex((r) =>
      r.some((cell) => typeof cell === "string" && cell.trim() === "DNI")
    );
    if (headerRowIndex < 1) continue;
    const headerRow = rows[headerRowIndex];

    // el nombre del vendedor está unas filas arriba, en la misma columna que "DNI"
    // (puede haber filas en blanco de por medio, así que se busca hacia arriba)
    function findVendorName(col: number): string | null {
      for (let r = headerRowIndex - 1; r >= 0; r--) {
        const v = rows[r]?.[col];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      return null;
    }

    // ubicar el inicio de cada bloque de vendedor por la posición de "DNI"
    const blockStarts: { col: number; vendedor: string }[] = [];
    headerRow.forEach((cell, col) => {
      if (typeof cell === "string" && cell.trim() === "DNI") {
        const vendedor = findVendorName(col);
        if (vendedor) {
          blockStarts.push({ col: col - 1, vendedor });
        }
      }
    });

    const lastDate: Record<number, string | null> = {};

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;

      for (const { col, vendedor } of blockStarts) {
        const fechaRaw = row[col];
        const dni = row[col + 1];
        const monto = row[col + 2];
        const codigo = row[col + 3];
        const obs = row[col + 4];

        const fechaISO = excelDateToISO(fechaRaw);
        if (fechaISO) lastDate[col] = fechaISO;

        const montoNum = toNumber(monto);
        const hasData =
          (dni !== null && dni !== undefined && dni !== "") ||
          (codigo !== null && codigo !== undefined && codigo !== "") ||
          (montoNum !== null && montoNum !== 0);

        if (!hasData) continue;

        insertControl.run({
          mes: sheetName,
          vendedor,
          fecha: lastDate[col] ?? null,
          dni: dni !== null && dni !== undefined ? String(dni).trim() : null,
          monto: montoNum,
          codigo_pedido:
            codigo !== null && codigo !== undefined ? String(codigo).trim() : null,
          observacion:
            obs !== null && obs !== undefined ? String(obs).trim() : null,
        });
        controlCount++;
      }
    }
  }
});
insertAllControl();
console.log(`control_ventas: ${controlCount} filas cargadas`);

db.close();
console.log("Seed completado:", DB_PATH);
