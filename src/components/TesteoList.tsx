"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { formatDate, toDateInputValue } from "@/lib/format";

export type TesteoEntry = {
  id: string;
  name: string;
  value: string;
  date: Date;
  notes: string | null;
  sessionLabel: string | null;
};

type UpdateInput = { name: string; value: string; date: string };

export function TesteoList({
  testeos,
  onUpdate,
  onDelete,
}: {
  testeos: TesteoEntry[];
  onUpdate: (testeoId: string, input: UpdateInput) => Promise<void>;
  onDelete: (testeoId: string) => Promise<void>;
}) {
  if (testeos.length === 0) {
    return <p className="mt-2 text-sm text-ink-muted">Todavía no hay testeos registrados.</p>;
  }

  const groups = new Map<string, TesteoEntry[]>();
  for (const t of testeos) {
    if (!groups.has(t.name)) groups.set(t.name, []);
    groups.get(t.name)!.push(t);
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      {[...groups.entries()].map(([name, entries]) => (
        <TesteoGroup key={name} name={name} entries={entries} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

function TesteoGroup({
  name,
  entries,
  onUpdate,
  onDelete,
}: {
  name: string;
  entries: TesteoEntry[];
  onUpdate: (testeoId: string, input: UpdateInput) => Promise<void>;
  onDelete: (testeoId: string) => Promise<void>;
}) {
  const points = [...entries]
    .reverse()
    .map((t) => parseFloat(t.value))
    .filter((v) => !Number.isNaN(v));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{name}</p>
      {points.length >= 2 && (
        <div className="mt-1">
          <Sparkline points={points} />
        </div>
      )}
      <ul className="mt-1 flex flex-col gap-1 text-sm text-ink-muted">
        {entries.slice(0, 4).map((t) => (
          <TesteoRow key={t.id} testeo={t} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

function TesteoRow({
  testeo,
  onUpdate,
  onDelete,
}: {
  testeo: TesteoEntry;
  onUpdate: (testeoId: string, input: UpdateInput) => Promise<void>;
  onDelete: (testeoId: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(testeo.name);
  const [value, setValue] = useState(testeo.value);
  const [date, setDate] = useState(() => toDateInputValue(testeo.date));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const extra = [testeo.sessionLabel, testeo.notes].filter(Boolean).join(" · ");

  function handleDelete() {
    if (!window.confirm(`¿Eliminar el testeo "${testeo.name}" del ${formatDate(testeo.date)}?`)) return;
    startTransition(() => onDelete(testeo.id));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await onUpdate(testeo.id, { name, value, date });
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  function cancelEdit() {
    setName(testeo.name);
    setValue(testeo.value);
    setDate(toDateInputValue(testeo.date));
    setError(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li className="no-print flex flex-col gap-1.5 rounded-button border border-line p-2">
        <div className="flex flex-wrap gap-1.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Testeo"
            aria-label="Nombre del testeo"
            className="min-w-0 flex-1 rounded-button border border-line px-2 py-1 text-xs text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor"
            aria-label="Valor del testeo"
            className="w-20 rounded-button border border-line px-2 py-1 text-xs text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Fecha del testeo"
            className="rounded-button border border-line px-2 py-1 text-xs text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
        </div>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={cancelEdit} className="text-xs text-ink-muted hover:text-ink">
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2">
      <span>{formatDate(testeo.date)}</span>
      <span className="flex items-center gap-2 text-right">
        <span>
          {testeo.value}
          {extra ? ` · ${extra}` : ""}
        </span>
        <span className="no-print flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={`Editar testeo ${testeo.name} del ${formatDate(testeo.date)}`}
            className="text-ink-muted hover:text-accent"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`Eliminar testeo ${testeo.name} del ${formatDate(testeo.date)}`}
            className="text-ink-muted hover:text-danger disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </span>
      </span>
    </li>
  );
}
