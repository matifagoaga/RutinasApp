import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamById, getTeamPlayers } from "@/lib/data";
import { DeleteTeamButton } from "@/components/DeleteTeamButton";
import { createPlayerAction, deleteTeamAction } from "../actions";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);
  if (!team) notFound();

  const players = await getTeamPlayers(teamId);
  const boundCreatePlayer = createPlayerAction.bind(null, teamId);
  const boundDeleteTeam = deleteTeamAction.bind(null, teamId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-100 pb-5 dark:border-emerald-950">
        <div>
          <Link
            href="/admin/teams"
            className="text-sm text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
          >
            ← Equipos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{team.name}</h1>
        </div>
        <DeleteTeamButton teamName={team.name} onDelete={boundDeleteTeam} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Jugadores</h2>
        {players.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no cargaste jugadores en este equipo.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {players.map((player) => (
              <li key={player.id}>
                <Link
                  href={`/admin/students/${player.id}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {getInitials(player.name)}
                  </span>
                  <span className="flex-1 font-medium text-zinc-900 dark:text-zinc-50">
                    {player.name}
                  </span>
                  {(player.email || player.phone) && (
                    <span className="text-zinc-500">{player.email || player.phone}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>➕</span> Agregar jugador a {team.name}
        </h2>
        <form action={boundCreatePlayer} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              name="email"
              placeholder="Email (opcional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            />
          </div>
          <input
            type="text"
            name="notes"
            placeholder="Notas (posición, número de camiseta, etc. — opcional)"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Agregar jugador
          </button>
        </form>
      </section>
    </div>
  );
}
