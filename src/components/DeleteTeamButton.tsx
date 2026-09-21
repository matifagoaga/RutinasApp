"use client";

import { useTransition } from "react";

export function DeleteTeamButton({
  teamName,
  onDelete,
}: {
  teamName: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `¿Eliminar el equipo "${teamName}"? Los jugadores no se borran, solo quedan sin equipo.`
    );
    if (!confirmed) return;
    startTransition(() => onDelete());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:border-red-400 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-500/10"
    >
      {isPending ? "Eliminando..." : "Eliminar equipo"}
    </button>
  );
}
