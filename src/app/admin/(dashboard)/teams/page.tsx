import Link from "next/link";
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">🏟️ Equipos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Cada equipo agrupa a sus jugadores. Un jugador tiene ficha propia igual que un alumno
          (rutina, progreso, link), pero con testeos físicos en vez de pagos.
        </p>
      </div>

      <section>
        {teams.length === 0 ? (
          <p className="text-sm text-zinc-500">Todavía no cargaste ningún equipo.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {teams.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/admin/teams/${team.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{team.name}</span>
                  <span className="text-zinc-500">
                    {team._count.players} {team._count.players === 1 ? "jugador" : "jugadores"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>➕</span> Agregar equipo
        </h2>
        <form action={createTeamAction} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre del equipo"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Agregar equipo
          </button>
        </form>
      </section>
    </div>
  );
}
