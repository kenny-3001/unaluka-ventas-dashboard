import { buscarPedidos, getVendedoresDisponibles } from "@/lib/queries";
import Link from "next/link";

type Pedido = {
  pedido: string;
  fecha: string;
  vendedor: string | null;
  cliente: string | null;
  canal: string | null;
  estado: string | null;
  sku: string | null;
  producto: string | null;
  cantidad: number | null;
  precio_unit: number | null;
  total_pen: number | null;
};

function formatSoles(value: number | null) {
  return `S/ ${(value ?? 0).toLocaleString("es-PE", { maximumFractionDigits: 2 })}`;
}

const ESTADOS = ["Completada", "Activa", "Cancelada", "Borrador"];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const vendedor = typeof sp.vendedor === "string" ? sp.vendedor : undefined;
  const estado = typeof sp.estado === "string" ? sp.estado : undefined;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const pageSize = 25;

  const { rows, total } = buscarPedidos({ q, vendedor, estado, page, pageSize });
  const vendedores = getVendedoresDisponibles();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildQuery(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (vendedor) params.set("vendedor", vendedor);
    if (estado) params.set("estado", estado);
    params.set("page", String(page));
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    return `?${params.toString()}`;
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500">
          {total.toLocaleString("es-PE")} pedidos encontrados
        </p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Buscar</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Pedido, cliente, producto o SKU"
            className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Vendedor</label>
          <select
            name="vendedor"
            defaultValue={vendedor ?? ""}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {vendedores.map((v) => (
              <option key={v.vendedor} value={v.vendedor}>
                {v.vendedor}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Estado</label>
          <select
            name="estado"
            defaultValue={estado ?? ""}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filtrar
        </button>
        {(q || vendedor || estado) && (
          <Link
            href="/pedidos"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Canal</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {(rows as Pedido[]).map((p, i) => (
              <tr key={`${p.pedido}-${i}`} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{p.pedido}</td>
                <td className="px-4 py-2 text-gray-600">{p.fecha}</td>
                <td className="px-4 py-2 text-gray-800">
                  {p.vendedor ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 text-gray-800">
                  {p.cliente ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="max-w-[160px] truncate px-4 py-2 text-gray-600">
                  {p.canal ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      p.estado === "Completada"
                        ? "bg-green-100 text-green-700"
                        : p.estado === "Cancelada"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="max-w-[240px] truncate px-4 py-2 text-gray-800">
                  {p.producto ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2 text-right font-medium text-gray-900">
                  {formatSoles(p.total_pen)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron pedidos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            href={buildQuery({ page: Math.max(1, page - 1) })}
            className={`rounded-md border border-gray-300 px-3 py-1.5 ${
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
            }`}
          >
            Anterior
          </Link>
          <Link
            href={buildQuery({ page: Math.min(totalPages, page + 1) })}
            className={`rounded-md border border-gray-300 px-3 py-1.5 ${
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </main>
  );
}
