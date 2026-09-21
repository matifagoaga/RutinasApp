"use client";

import { useTransition } from "react";

export function DeleteTemplateButton({
  exerciseName,
  onDelete,
}: {
  exerciseName: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`¿Eliminar "${exerciseName}" de la biblioteca?`)) return;
    startTransition(() => onDelete());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
    >
      {isPending ? "..." : "Eliminar"}
    </button>
  );
}
