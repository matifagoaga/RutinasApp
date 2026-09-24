import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { requireTrainerSession } from "@/lib/auth";
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
  const { trainerId } = await requireTrainerSession();
  const team = await getTeamById(teamId, trainerId);
  if (!team) notFound();

  const players = await getTeamPlayers(teamId, trainerId);
  const boundCreatePlayer = createPlayerAction.bind(null, teamId);
  const boundDeleteTeam = deleteTeamAction.bind(null, teamId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <Link
            href="/admin/teams"
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Equipos
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-ink">{team.name}</h1>
        </div>
        <DeleteTeamButton teamName={team.name} onDelete={boundDeleteTeam} />
      </div>

      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Jugadores</h2>
        {players.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Todavía no cargaste jugadores en este equipo.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {players.map((player) => (
              <li key={player.id}>
                <Link
                  href={`/admin/students/${player.id}`}
                  className="flex items-center gap-3 rounded-card border border-line px-4 py-3 text-sm hover:border-accent/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-xs font-semibold text-ink">
                    {getInitials(player.name)}
                  </span>
                  <span className="flex-1 font-medium text-ink">
                    {player.name}
                  </span>
                  {(player.email || player.phone) && (
                    <span className="text-ink-muted">{player.email || player.phone}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-lg rounded-card-lg border border-line p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
          <Plus className="h-5 w-5 text-ink-muted" strokeWidth={1.75} /> Agregar jugador a {team.name}
        </h2>
        <form action={boundCreatePlayer} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre y apellido"
            className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              name="email"
              placeholder="Email (opcional)"
              className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
            />
          </div>
          <input
            type="text"
            name="notes"
            placeholder="Notas (posición, número de camiseta, etc. — opcional)"
            className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          <button
            type="submit"
            className="self-start rounded-button bg-accent px-4 py-2 text-sm font-medium text-ivory hover:bg-accent-hover"
          >
            Agregar jugador
          </button>
        </form>
      </section>
    </div>
  );
}
