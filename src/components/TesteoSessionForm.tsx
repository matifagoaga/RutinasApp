"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toDateInputValue } from "@/lib/format";

type EntryState = { name: string; value: string };

function emptyEntry(): EntryState {
  return { name: "", value: "" };
}

function todayIso() {
  return toDateInputValue(new Date());
}

export function TesteoSessionForm({
  testeoNames,
  onSave,
}: {
  testeoNames: string[];
  onSave: (
    date: string,
    sessionLabel: string,
    entries: { name: string; value: string }[]
  ) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(todayIso);
  const [sessionLabel, setSessionLabel] = useState("");
  const [entries, setEntries] = useState<EntryState[]>([emptyEntry(), emptyEntry()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateEntry(index: number, patch: Partial<EntryState>) {
    setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addRow() {
    setEntries((prev) => [...prev, emptyEntry()]);
  }

  function removeRow(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function resetAndClose() {
    setEntries([emptyEntry(), emptyEntry()]);
    setSessionLabel("");
    setDate(todayIso());
    setError(null);
    setIsOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const filled = entries.filter((entry) => entry.name.trim() && entry.value.trim());
    if (filled.length === 0) {
      setError("Agregá al menos un test con nombre y valor.");
      return;
    }

    startTransition(async () => {
      try {
        await onSave(date, sessionLabel, filled);
        resetAndClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar los testeos.");
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="no-print flex items-center gap-1.5 self-start text-sm font-medium text-accent hover:text-accent-hover"
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
        Nueva sesión de testeos
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="no-print mt-1 flex flex-col gap-3 rounded-card border border-line p-3"
    >
      <datalist id="testeo-names">
        {testeoNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-ink-muted">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="block text-xs text-ink-muted">Sesión (opcional)</label>
          <input
            type="text"
            value={sessionLabel}
            onChange={(e) => setSessionLabel(e.target.value)}
            placeholder="Ej: Inicio de año"
            className="w-full rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={entry.name}
              onChange={(e) => updateEntry(index, { name: e.target.value })}
              list="testeo-names"
              placeholder="Ej: Sprint 40m"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
            />
            <input
              type="text"
              value={entry.value}
              onChange={(e) => updateEntry(index, { value: e.target.value })}
              placeholder="Valor"
              className="w-24 shrink-0 rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="shrink-0 text-ink-muted hover:text-danger"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 self-start text-xs font-medium text-accent hover:text-accent-hover"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        Agregar test
      </button>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-accent px-3 py-1.5 text-sm font-medium text-ivory hover:bg-accent-hover disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar sesión"}
        </button>
        <button
          type="button"
          onClick={resetAndClose}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
