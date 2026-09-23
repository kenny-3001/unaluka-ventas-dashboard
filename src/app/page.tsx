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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard de ventas</h1>
        <p className="text-sm text-gray-500">
          Datos de pedidos completados, enero - mayo 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ventas totales</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {formatSoles(totales.total)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos completados</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {totales.pedidos.toLocaleString("es-PE")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">
          Evolución de ventas mes a mes
        </h2>
        <MonthlyChart data={evolucion} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-gray-700">
            Ventas por vendedor
          </h2>
          <VendorChart data={porVendedor} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-gray-700">
            Productos / SKU más vendidos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-2 pr-2 font-medium">SKU</th>
                  <th className="pb-2 pr-2 font-medium">Producto</th>
                  <th className="pb-2 pr-2 text-right font-medium">Unid.</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {topProductos.map((p, i) => (
                  <tr key={`${p.sku}-${i}`} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-2 font-mono text-xs text-gray-600">
                      {p.sku}
                    </td>
                    <td className="max-w-[360px] truncate py-2 pr-2 text-gray-800">
                      {p.producto}
                    </td>
                    <td className="py-2 pr-2 text-right text-gray-600">
                      {p.unidades}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
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
