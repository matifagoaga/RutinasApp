"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

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
      <div className="no-print flex items-start justify-between gap-3 rounded-card border border-accent/25 bg-accent-tint px-4 py-3 text-sm">
        <p className="flex items-start gap-2 text-accent">
          <Bookmark className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>
            <span className="font-semibold">Seguimiento: </span>
            {initialNote}
          </span>
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => onClear())}
          className="shrink-0 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-60"
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
        className="no-print flex items-center gap-1.5 self-start text-xs font-medium text-accent hover:text-accent-hover"
      >
        <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
        Marcar para seguimiento
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
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          ¿Qué hay que ver?
          <input
            type="text"
            name="note"
            autoFocus
            placeholder="Ej: le duele el hombro, preguntar la próxima sesión"
            className="w-full rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-accent px-3 py-1.5 text-sm font-medium text-ivory hover:bg-accent-hover disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="text-xs text-ink-muted hover:text-ink"
      >
        Cancelar
      </button>
    </form>
  );
}
