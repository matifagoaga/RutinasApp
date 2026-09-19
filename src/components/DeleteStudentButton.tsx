"use client";

import { useTransition } from "react";

export function DeleteStudentButton({
  studentName,
  onDelete,
}: {
  studentName: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar a ${studentName}? Se borra también su rutina, historial y progreso. Esto no se puede deshacer.`
    );
    if (!confirmed) return;
    startTransition(() => {
      onDelete();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="no-print rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:border-red-400 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-500/10"
    >
      {isPending ? "Eliminando..." : "Eliminar alumno"}
    </button>
  );
}
