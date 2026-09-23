import { getDb } from "@/lib/db";

const ESTADO_VALIDO = "Completada";

export function getTotalVentas() {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(total_pen), 0) as total, COUNT(*) as pedidos
       FROM pedidos WHERE estado = ?`
    )
    .get(ESTADO_VALIDO) as { total: number; pedidos: number };
  return row;
}

export function getEvolucionMensual() {
  const db = getDb();
  return db
    .prepare(
      `SELECT substr(fecha, 1, 7) as mes, COALESCE(SUM(total_pen), 0) as total
       FROM pedidos
       WHERE estado = ?
       GROUP BY mes
       ORDER BY mes ASC`
    )
    .all(ESTADO_VALIDO) as { mes: string; total: number }[];
}

export function getTopProductos(limit = 10) {
  const db = getDb();
  return db
    .prepare(
      `SELECT sku, producto, SUM(cantidad) as unidades, SUM(total_pen) as total
       FROM pedidos
       WHERE estado = ? AND sku IS NOT NULL
       GROUP BY sku, producto
       ORDER BY total DESC
       LIMIT ?`
    )
    .all(ESTADO_VALIDO, limit) as {
    sku: string;
    producto: string;
    unidades: number;
    total: number;
  }[];
}

export function getVentasPorVendedor() {
  const db = getDb();
  return db
    .prepare(
      `SELECT COALESCE(vendedor, 'Sin vendedor (canal automático)') as vendedor,
              SUM(total_pen) as total,
              COUNT(*) as pedidos
       FROM pedidos
       WHERE estado = ?
       GROUP BY vendedor
       ORDER BY total DESC`
    )
    .all(ESTADO_VALIDO) as { vendedor: string; total: number; pedidos: number }[];
}

export type PedidoFiltros = {
  vendedor?: string;
  estado?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export function buscarPedidos(filtros: PedidoFiltros) {
  const db = getDb();
  const page = filtros.page ?? 1;
  const pageSize = filtros.pageSize ?? 25;
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filtros.vendedor) {
    where.push("vendedor = ?");
    params.push(filtros.vendedor);
  }
  if (filtros.estado) {
    where.push("estado = ?");
    params.push(filtros.estado);
  }
  if (filtros.q) {
    where.push(
      "(pedido LIKE ? OR cliente LIKE ? OR producto LIKE ? OR sku LIKE ?)"
    );
    const like = `%${filtros.q}%`;
    params.push(like, like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(*) as c FROM pedidos ${whereSql}`)
    .get(...params) as { c: number };

  const rows = db
    .prepare(
      `SELECT pedido, fecha, vendedor, cliente, canal, estado, sku, producto, cantidad, precio_unit, total_pen
       FROM pedidos
       ${whereSql}
       ORDER BY fecha DESC, id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, pageSize, offset);

  return { rows, total: total.c, page, pageSize };
}

export function getVendedoresDisponibles() {
  const db = getDb();
  return db
    .prepare(
      `SELECT DISTINCT vendedor FROM pedidos WHERE vendedor IS NOT NULL ORDER BY vendedor`
    )
    .all() as { vendedor: string }[];
}
