import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { getTeams } from "@/lib/data";
import { createTeamAction } from "./actions";

// La lista cambia cuando se crea/borra un equipo; sin esto Next.js la
// generaría estática en el build y quedaría congelada.
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-ink">
          <Users className="h-6 w-6 text-ink-muted" strokeWidth={1.75} /> Equipos
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cada equipo agrupa a sus jugadores. Un jugador tiene ficha propia igual que un alumno
          (rutina, progreso, link), pero con testeos físicos en vez de pagos.
        </p>
      </div>

      <section>
        {teams.length === 0 ? (
          <p className="text-sm text-ink-muted">Todavía no cargaste ningún equipo.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {teams.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/admin/teams/${team.id}`}
                  className="flex items-center justify-between rounded-card border border-line px-4 py-3 text-sm hover:border-accent/40"
                >
                  <span className="font-medium text-ink">{team.name}</span>
                  <span className="text-ink-muted">
                    {team._count.players} {team._count.players === 1 ? "jugador" : "jugadores"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-lg rounded-card-lg border border-line p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
          <Plus className="h-5 w-5 text-ink-muted" strokeWidth={1.75} /> Agregar equipo
        </h2>
        <form action={createTeamAction} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre del equipo"
            className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          <button
            type="submit"
            className="self-start rounded-button bg-accent px-4 py-2 text-sm font-medium text-ivory hover:bg-accent-hover"
          >
            Agregar equipo
          </button>
        </form>
      </section>
    </div>
  );
}
