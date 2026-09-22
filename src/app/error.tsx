"use client";

import { AtlasLogo } from "@/components/AtlasLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-card-lg border border-line bg-ivory p-8">
        <AtlasLogo className="h-8 w-8 text-ink" />
        <h1 className="mt-4 font-heading text-xl font-bold text-ink">Algo salió mal</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {error.message || "Ocurrió un error inesperado. Podés intentar de nuevo."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 w-full rounded-button bg-accent px-3 py-2.5 text-sm font-medium text-ivory hover:bg-accent-hover"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
