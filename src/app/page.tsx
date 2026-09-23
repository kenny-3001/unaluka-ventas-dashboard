import {
  getTotalVentas,
  getEvolucionMensual,
  getTopProductos,
  getVentasPorVendedor,
} from "@/lib/queries";
import MonthlyChart from "@/components/MonthlyChart";
import VendorChart from "@/components/VendorChart";

function formatSoles(value: number) {
  return `S/ ${value.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}

export default function DashboardPage() {
  const totales = getTotalVentas();
  const evolucion = getEvolucionMensual();
  const topProductos = getTopProductos();
  const porVendedor = getVentasPorVendedor();

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-6 py-8">
      <div className="border-l-4 border-blue-600 pl-3">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard de ventas</h1>
        <p className="text-sm text-gray-500">
          Datos de pedidos completados, enero - mayo 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ventas totales</p>
          <p className="mt-1 text-3xl font-semibold text-blue-700">
            {formatSoles(totales.total)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 border-l-4 border-l-emerald-600 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos completados</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-700">
            {totales.pedidos.toLocaleString("es-PE")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          Evolución de ventas mes a mes
        </h2>
        <MonthlyChart data={evolucion} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-blue-700 uppercase">
            Ventas por vendedor
          </h2>
          <VendorChart data={porVendedor} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-blue-700 uppercase">
            Productos / SKU más vendidos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50 text-blue-900">
                  <th className="rounded-l-md px-2 py-2 font-semibold">SKU</th>
                  <th className="px-2 py-2 font-semibold">Producto</th>
                  <th className="px-2 py-2 text-right font-semibold">Unid.</th>
                  <th className="rounded-r-md px-2 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {topProductos.map((p, i) => (
                  <tr key={`${p.sku}-${i}`} className="border-b border-gray-50 last:border-0">
                    <td className="px-2 py-2 font-mono text-xs text-gray-600">
                      {p.sku}
                    </td>
                    <td className="max-w-[360px] truncate px-2 py-2 text-gray-800">
                      {p.producto}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-600">
                      {p.unidades}
                    </td>
                    <td className="px-2 py-2 text-right font-medium text-gray-900">
                      {formatSoles(p.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
