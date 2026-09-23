import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Nav() {
  const session = await auth();
  if (!session) return null;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Ventas Unaluka
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 transition hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/pedidos"
            className="text-sm text-gray-600 transition hover:text-gray-900"
          >
            Pedidos
          </Link>
          {session.user.role === "admin" && (
            <Link
              href="/admin/usuarios"
              className="text-sm text-gray-600 transition hover:text-gray-900"
            >
              Usuarios
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {session.user.name}{" "}
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                session.user.role === "admin"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {session.user.role === "admin" ? "Administrador" : "Solo lectura"}
            </span>
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50">
              Salir
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
