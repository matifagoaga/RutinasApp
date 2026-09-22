"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, Plus, Search, Users, X } from "lucide-react";

type Person = { id: string; name: string };
type Team = { id: string; name: string; players: Person[] };

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function PersonRow({ person, pathname }: { person: Person; pathname: string | null }) {
  const isActive = pathname?.includes(`/admin/students/${person.id}`) ?? false;
  return (
    <li>
      <Link
        href={`/admin/students/${person.id}`}
        className={`flex items-center gap-3 rounded-button px-2.5 py-2 text-sm transition ${
          isActive ? "bg-ink text-ivory" : "text-ink hover:bg-ink/[0.04]"
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
            isActive ? "bg-ivory/15 text-ivory" : "bg-ink/[0.06] text-ink"
          }`}
        >
          {getInitials(person.name)}
        </span>
        <span className="truncate">{person.name}</span>
      </Link>
    </li>
  );
}

export function StudentSidebar({ students, teams }: { students: Person[]; teams: Team[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const activeTeamId = teams.find((team) =>
    team.players.some((player) => pathname?.includes(`/admin/students/${player.id}`))
  )?.id;

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeTeamId ? [activeTeamId] : [])
  );

  function toggleTeam(teamId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const filteredStudents = useMemo(() => {
    if (!isSearching) return students;
    return students.filter((student) => student.name.toLowerCase().includes(normalizedQuery));
  }, [students, isSearching, normalizedQuery]);

  const filteredTeams = useMemo(() => {
    if (!isSearching) return teams;
    return teams
      .map((team) => {
        const teamMatches = team.name.toLowerCase().includes(normalizedQuery);
        const players = teamMatches
          ? team.players
          : team.players.filter((player) => player.name.toLowerCase().includes(normalizedQuery));
        return { ...team, players, matches: teamMatches || players.length > 0 };
      })
      .filter((team) => team.matches);
  }, [teams, isSearching, normalizedQuery]);

  return (
    <nav className="flex w-full flex-col gap-6 md:w-64 md:shrink-0">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alumno o equipo..."
          className="w-full rounded-button border border-line py-2 pl-9 pr-8 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Alumnos
          </span>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Nuevo
          </Link>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="px-1 text-sm text-ink-muted">
            {isSearching ? "Sin resultados." : "Todavía no cargaste alumnos."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {filteredStudents.map((student) => (
              <PersonRow key={student.id} person={student} pathname={pathname} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Equipos
          </span>
          <Link
            href="/admin/teams"
            className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Nuevo
          </Link>
        </div>

        {filteredTeams.length === 0 ? (
          <p className="px-1 text-sm text-ink-muted">
            {isSearching ? "Sin resultados." : "Todavía no cargaste equipos."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {filteredTeams.map((team) => {
              const isOpen = isSearching || expanded.has(team.id);
              return (
                <li key={team.id}>
                  <button
                    type="button"
                    onClick={() => toggleTeam(team.id)}
                    className="flex w-full items-center gap-2 rounded-button px-2.5 py-2 text-left text-sm text-ink hover:bg-ink/[0.04]"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                      strokeWidth={2}
                    />
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink">
                      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 truncate">{team.name}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{team.players.length}</span>
                  </button>

                  {isOpen && (
                    <ul className="ml-4 mt-1 flex flex-col gap-1 border-l border-line pl-3">
                      {team.players.length === 0 ? (
                        <li className="px-1 py-1.5 text-xs text-ink-muted">Sin jugadores</li>
                      ) : (
                        team.players.map((player) => (
                          <PersonRow key={player.id} person={player} pathname={pathname} />
                        ))
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
