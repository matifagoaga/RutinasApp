"use client";

import { useTransition } from "react";

export function TeamAssignSelect({
  teams,
  currentTeamId,
  onChange,
}: {
  teams: { id: string; name: string }[];
  currentTeamId: string | null;
  onChange: (teamId: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentTeamId ?? ""}
      disabled={isPending}
      onChange={(e) => startTransition(() => onChange(e.target.value))}
      className="no-print rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
    >
      <option value="">Sin equipo</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
}
