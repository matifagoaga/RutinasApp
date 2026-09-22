"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

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
      className="flex items-center gap-2 rounded-button border border-line px-3 py-2 text-sm font-medium text-danger hover:border-danger/40 hover:bg-danger-tint disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      {isPending ? "Eliminando..." : "Eliminar equipo"}
    </button>
  );
}
