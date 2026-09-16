import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          RutinasApp
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ingresá tu contraseña de entrenador para continuar.
        </p>

        <form action={login} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            name="passcode"
            autoFocus
            required
            placeholder="Contraseña"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {error && (
            <p className="text-sm text-red-600">
              Contraseña incorrecta. Probá de nuevo.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
