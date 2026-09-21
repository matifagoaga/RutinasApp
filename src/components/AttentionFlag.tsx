"use client";

import { useState, useTransition } from "react";

export function AttentionFlag({
  initialNote,
  onSetNote,
  onClear,
}: {
  initialNote: string | null;
  onSetNote: (formData: FormData) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (initialNote) {
    return (
      <div className="no-print flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-500/10">
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">📌 Seguimiento: </span>
          {initialNote}
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => onClear())}
          className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900 disabled:opacity-60 dark:text-amber-400"
        >
          {isPending ? "..." : "Resolver"}
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="no-print self-start text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400"
      >
        📌 Marcar para seguimiento
      </button>
    );
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await onSetNote(formData);
          setShowForm(false);
        })
      }
      className="no-print flex flex-wrap items-end gap-2"
    >
      <div className="min-w-[220px] flex-1">
        <label className="block text-xs text-zinc-500">¿Qué hay que ver?</label>
        <input
          type="text"
          name="note"
          autoFocus
          placeholder="Ej: le duele el hombro, preguntar la próxima sesión"
          className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-amber-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="text-xs text-zinc-500 hover:text-zinc-700"
      >
        Cancelar
      </button>
    </form>
  );
}
