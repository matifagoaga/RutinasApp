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
      className="no-print rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint disabled:opacity-60"
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
