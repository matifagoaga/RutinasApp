"use client";

import { useState, useTransition } from "react";

type ExerciseState = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restSeconds: string;
  notes: string;
  videoUrl: string;
};

type DayState = {
  label: string;
  exercises: ExerciseState[];
};

export type SavedExercise = {
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
};

export type SavedDay = {
  label: string;
  exercises: SavedExercise[];
};

function emptyExercise(): ExerciseState {
  return { name: "", sets: "3", reps: "10-12", weight: "", restSeconds: "", notes: "", videoUrl: "" };
}

function emptyDay(n: number): DayState {
  return { label: `Día ${n}`, exercises: [emptyExercise()] };
}

export function RoutineEditor({
  initialTitle,
  initialDays,
  onSave,
}: {
  initialTitle: string;
  initialDays: DayState[];
  onSave: (title: string, days: SavedDay[]) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [days, setDays] = useState<DayState[]>(initialDays.length ? initialDays : [emptyDay(1)]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateDayLabel(dayIndex: number, label: string) {
    setDays((prev) => prev.map((day, i) => (i === dayIndex ? { ...day, label } : day)));
  }

  function updateExercise(dayIndex: number, exIndex: number, patch: Partial<ExerciseState>) {
    setDays((prev) =>
      prev.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              exercises: day.exercises.map((ex, j) => (j === exIndex ? { ...ex, ...patch } : ex)),
            }
      )
    );
  }

  function addDay() {
    setDays((prev) => [...prev, emptyDay(prev.length + 1)]);
  }

  function removeDay(dayIndex: number) {
    setDays((prev) => prev.filter((_, i) => i !== dayIndex));
  }

  function addExercise(dayIndex: number) {
    setDays((prev) =>
      prev.map((day, i) => (i === dayIndex ? { ...day, exercises: [...day.exercises, emptyExercise()] } : day))
    );
  }

  function removeExercise(dayIndex: number, exIndex: number) {
    setDays((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, exercises: day.exercises.filter((_, j) => j !== exIndex) } : day
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Ponele un título a la rutina.");
      return;
    }

    const parsedDays: SavedDay[] = days
      .map((day) => ({
        label: day.label.trim() || "Día",
        exercises: day.exercises
          .filter((ex) => ex.name.trim())
          .map((ex) => ({
            name: ex.name.trim(),
            sets: Math.max(1, Number(ex.sets) || 1),
            reps: ex.reps.trim() || "-",
            weight: ex.weight.trim() || null,
            restSeconds: ex.restSeconds.trim() ? Number(ex.restSeconds) : null,
            notes: ex.notes.trim() || null,
            videoUrl: ex.videoUrl.trim() || null,
          })),
      }))
      .filter((day) => day.exercises.length > 0);

    if (parsedDays.length === 0) {
      setError("Agregá al menos un ejercicio con nombre.");
      return;
    }

    startTransition(async () => {
      try {
        await onSave(title.trim(), parsedDays);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar la rutina.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Título de la rutina
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Fuerza - Fase 1"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-5">
        {days.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={day.label}
                onChange={(e) => updateDayLabel(dayIndex, e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              {days.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDay(dayIndex)}
                  className="shrink-0 text-sm text-red-600 hover:text-red-700"
                >
                  Quitar día
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {day.exercises.map((ex, exIndex) => (
                <div
                  key={exIndex}
                  className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { name: e.target.value })}
                      placeholder="Ejercicio (ej: Sentadilla)"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(dayIndex, exIndex)}
                      className="shrink-0 text-sm text-zinc-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input
                      type="number"
                      min={1}
                      value={ex.sets}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { sets: e.target.value })}
                      placeholder="Series"
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { reps: e.target.value })}
                      placeholder="Reps (ej 8-12)"
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <input
                      type="text"
                      value={ex.weight}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { weight: e.target.value })}
                      placeholder="Peso sugerido"
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <input
                      type="number"
                      min={0}
                      value={ex.restSeconds}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { restSeconds: e.target.value })}
                      placeholder="Descanso (seg)"
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={ex.notes}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { notes: e.target.value })}
                      placeholder="Notas (opcional)"
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <input
                      type="text"
                      value={ex.videoUrl}
                      onChange={(e) => updateExercise(dayIndex, exIndex, { videoUrl: e.target.value })}
                      placeholder="Link de video (opcional)"
                      className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addExercise(dayIndex)}
                className="self-start text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                + Agregar ejercicio
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addDay}
          className="self-start rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
        >
          + Agregar día
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "Guardando..." : "Guardar rutina"}
      </button>
    </form>
  );
}
