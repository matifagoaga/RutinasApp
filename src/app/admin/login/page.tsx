import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl dark:border-emerald-950 dark:bg-zinc-950">
        <div className="bg-emerald-900 px-8 py-6">
          <p className="text-2xl">🏋️</p>
          <h1 className="mt-1 text-xl font-semibold text-white">RutinasApp</h1>
          <p className="mt-1 text-sm text-emerald-100">
            Ingresá tu contraseña de entrenador para continuar.
          </p>
        </div>

        <form action={login} className="flex flex-col gap-4 px-8 py-6">
          <input
            type="password"
            name="passcode"
            autoFocus
            required
            placeholder="Contraseña"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
          />
          {error && (
            <p className="text-sm text-red-600">
              Contraseña incorrecta. Probá de nuevo.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-800 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
