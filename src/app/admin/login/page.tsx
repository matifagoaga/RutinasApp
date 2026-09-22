import { AtlasLogo } from "@/components/AtlasLogo";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-card-lg border border-line bg-ivory p-8">
        <AtlasLogo className="h-8 w-8 text-ink" />
        <h1 className="mt-4 font-heading text-xl font-bold text-ink">Atlas</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ingresá tu contraseña de entrenador para continuar.
        </p>

        <form action={login} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            name="passcode"
            autoFocus
            required
            placeholder="Contraseña"
            aria-label="Contraseña"
            className="w-full rounded-button border border-line bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              Contraseña incorrecta. Probá de nuevo.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-button bg-accent px-3 py-2.5 text-sm font-medium text-ivory hover:bg-accent-hover"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
