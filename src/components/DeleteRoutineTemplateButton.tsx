"use client";

import { useTransition } from "react";

export function DeleteRoutineTemplateButton({
  templateTitle,
  onDelete,
}: {
  templateTitle: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`¿Eliminar la plantilla "${templateTitle}"?`)) return;
    startTransition(() => onDelete());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-danger hover:text-danger-hover disabled:opacity-60"
    >
      {isPending ? "..." : "Eliminar"}
    </button>
  );
}
