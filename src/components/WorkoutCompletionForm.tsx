"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { ExerciseTable, type ExerciseRow } from "@/components/ExerciseTable";

type Block = { id: string; label: string; exercises: ExerciseRow[] };
type Day = { id: string; blocks: Block[] };

export function WorkoutCompletionForm({
  day,
  done,
  showBlockLabel,
  onComplete,
}: {
  day: Day;
  done: boolean;
  showBlockLabel: boolean;
  onComplete: (
    dayId: string,
    feeling: string,
    weights: { exerciseId: string; weightActual: string }[]
  ) => Promise<void>;
}) {
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [feeling, setFeeling] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleWeightChange(exerciseId: string, value: string) {
    setWeights((prev) => ({ ...prev, [exerciseId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries = Object.entries(weights).map(([exerciseId, weightActual]) => ({
      exerciseId,
      weightActual,
    }));

    startTransition(async () => {
      try {
        await onComplete(day.id, feeling, entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al marcar el entrenamiento.");
      }
    });
  }

  return (
    <>
      {day.blocks.map((block) => (
        <div key={block.id}>
          {showBlockLabel && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {block.label}
            </p>
          )}
          <ExerciseTable
            exercises={block.exercises}
            weightInputs={done ? undefined : weights}
            onWeightChange={done ? undefined : handleWeightChange}
          />
        </div>
      ))}
      <form onSubmit={handleSubmit} className="no-print flex flex-col gap-2">
        {!done && (
          <textarea
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            rows={2}
            placeholder="¿Cómo te sentiste? (opcional)"
            className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={done || isPending}
          className={`flex w-full items-center justify-center gap-2 rounded-button px-3 py-2.5 text-sm font-semibold transition ${
            done
              ? "border border-line bg-ink/[0.04] text-ink-muted"
              : "bg-accent text-ivory hover:bg-accent-hover disabled:opacity-60"
          }`}
        >
          {done && <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />}
          {done ? "Marcado como completado hoy" : isPending ? "Guardando..." : "Marcar como completado hoy"}
        </button>
      </form>
    </>
  );
}
