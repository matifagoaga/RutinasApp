import Link from "next/link";
import { AtlasLogo } from "@/components/AtlasLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-card-lg border border-line bg-ivory p-8">
        <AtlasLogo className="h-8 w-8 text-ink" />
        <h1 className="mt-4 font-heading text-xl font-bold text-ink">No encontrado</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Esta página no existe o el alumno/equipo ya no está disponible.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block w-full rounded-button bg-accent px-3 py-2.5 text-center text-sm font-medium text-ivory hover:bg-accent-hover"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
