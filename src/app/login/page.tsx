import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 border-t-4 border-t-blue-600 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-blue-700">
          Ventas Unaluka
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Ingresa con tu cuenta de Google para consultar el panel de ventas.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
            Ingresar con Google
          </button>
        </form>
      </div>
    </main>
  );
}
