import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

type Usuario = {
  id: number;
  email: string;
  name: string | null;
  role: "admin" | "lectura";
  created_at: string;
  last_login_at: string | null;
};

async function cambiarRol(formData: FormData) {
  "use server";

  const session = await auth();
  if (session?.user.role !== "admin") return;

  const userId = Number(formData.get("userId"));
  const nuevoRol = formData.get("role");
  if (!userId || (nuevoRol !== "admin" && nuevoRol !== "lectura")) return;

  const db = getDb();
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(nuevoRol, userId);
  revalidatePath("/admin/usuarios");
}

export default function UsuariosPage() {
  const db = getDb();
  const usuarios = db
    .prepare(
      "SELECT id, email, name, role, created_at, last_login_at FROM users ORDER BY created_at ASC"
    )
    .all() as Usuario[];

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-6 py-8">
      <div className="border-l-4 border-blue-600 pl-3">
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-500">
          Gestiona quién puede administrar el sistema y quién solo consulta.
        </p>
      </div>

      <div className="max-w-3xl overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-blue-100 bg-blue-50 text-blue-900">
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Último ingreso</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2 text-gray-800">{u.name ?? "—"}</td>
                <td className="px-4 py-2 text-gray-600">{u.email}</td>
                <td className="px-4 py-2 text-gray-500">
                  {u.last_login_at ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <form action={cambiarRol} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
                    >
                      <option value="lectura">Solo lectura</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Todavía no ha iniciado sesión ningún usuario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
