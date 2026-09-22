"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { ExerciseRowEditor } from "./ExerciseRowEditor";
import {
  exerciseFromTemplate,
  type ExerciseState,
  type LibraryExerciseOption,
} from "./routineTypes";

type BlockState = {
  label: string;
  exercises: ExerciseState[];
};

type DayState = {
  label: string;
  blocks: BlockState[];
};

export type SavedExercise = {
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
  imageData?: string | null;
};

export type SavedBlock = {
  label: string;
  exercises: SavedExercise[];
};

export type SavedDay = {
  label: string;
  blocks: SavedBlock[];
};

export type { LibraryExerciseOption };

function blockLabelForIndex(index: number) {
  return `Bloque ${String.fromCharCode(65 + index)}`;
}

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function emptyExercise(): ExerciseState {
  return {
    name: "",
    sets: "3",
    reps: "10-12",
    weight: "",
    restSeconds: "",
    notes: "",
    videoUrl: "",
    imageData: "",
  };
}

function emptyBlock(index: number): BlockState {
  return { label: blockLabelForIndex(index), exercises: [emptyExercise()] };
}

function emptyDay(n: number): DayState {
  return { label: WEEKDAYS[(n - 1) % WEEKDAYS.length], blocks: [emptyBlock(0)] };
}

export function RoutineEditor({
  initialTitle,
  initialDays,
  libraryExercises = [],
  onSave,
}: {
  initialTitle: string;
  initialDays: DayState[];
  libraryExercises?: LibraryExerciseOption[];
  onSave: (title: string, days: SavedDay[]) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [days, setDays] = useState<DayState[]>(initialDays.length ? initialDays : [emptyDay(1)]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateDayLabel(dayIndex: number, label: string) {
    setDays((prev) => prev.map((day, i) => (i === dayIndex ? { ...day, label } : day)));
  }

  function updateBlock(dayIndex: number, blockIndex: number, patch: Partial<BlockState>) {
    setDays((prev) =>
      prev.map((day, i) =>
        i !== dayIndex
          ? day
          : { ...day, blocks: day.blocks.map((b, j) => (j === blockIndex ? { ...b, ...patch } : b)) }
      )
    );
  }

  function updateExercise(
    dayIndex: number,
    blockIndex: number,
    exIndex: number,
    patch: Partial<ExerciseState>
  ) {
    setDays((prev) =>
      prev.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              blocks: day.blocks.map((block, j) =>
                j !== blockIndex
                  ? block
                  : {
                      ...block,
                      exercises: block.exercises.map((ex, k) => (k === exIndex ? { ...ex, ...patch } : ex)),
                    }
              ),
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

  function addBlock(dayIndex: number) {
    setDays((prev) =>
      prev.map((day, i) => (i === dayIndex ? { ...day, blocks: [...day.blocks, emptyBlock(day.blocks.length)] } : day))
    );
  }

  function removeBlock(dayIndex: number, blockIndex: number) {
    setDays((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, blocks: day.blocks.filter((_, j) => j !== blockIndex) } : day
      )
    );
  }

  function addExercise(dayIndex: number, blockIndex: number) {
    setDays((prev) =>
      prev.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              blocks: day.blocks.map((block, j) =>
                j === blockIndex ? { ...block, exercises: [...block.exercises, emptyExercise()] } : block
              ),
            }
      )
    );
  }

  function addExerciseFromLibrary(dayIndex: number, blockIndex: number, templateId: string) {
    const template = libraryExercises.find((t) => t.id === templateId);
    if (!template) return;
    setDays((prev) =>
      prev.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              blocks: day.blocks.map((block, j) =>
                j === blockIndex
                  ? { ...block, exercises: [...block.exercises, exerciseFromTemplate(template)] }
                  : block
              ),
            }
      )
    );
  }

  function removeExercise(dayIndex: number, blockIndex: number, exIndex: number) {
    setDays((prev) =>
      prev.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              blocks: day.blocks.map((block, j) =>
                j === blockIndex
                  ? { ...block, exercises: block.exercises.filter((_, k) => k !== exIndex) }
                  : block
              ),
            }
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
        blocks: day.blocks
          .map((block) => ({
            label: block.label.trim(),
            exercises: block.exercises
              .filter((ex) => ex.name.trim())
              .map((ex) => ({
                name: ex.name.trim(),
                sets: Math.max(1, Number(ex.sets) || 1),
                reps: ex.reps.trim() || "-",
                weight: ex.weight.trim() || null,
                restSeconds: ex.restSeconds.trim() ? Number(ex.restSeconds) : null,
                notes: ex.notes.trim() || null,
                videoUrl: ex.videoUrl.trim() || null,
                imageData: ex.imageData || null,
              })),
          }))
          .filter((block) => block.exercises.length > 0),
      }))
      .filter((day) => day.blocks.length > 0);

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

  const libraryGroups: [string, LibraryExerciseOption[]][] = [];
  for (const template of libraryExercises) {
    const key = template.category ?? "Sin categoría";
    let group = libraryGroups.find(([category]) => category === key);
    if (!group) {
      group = [key, []];
      libraryGroups.push(group);
    }
    group[1].push(template);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="text-sm font-medium text-ink">Título de la rutina</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Fuerza - Fase 1"
          className="mt-1 w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
      </div>

      <div className="flex flex-col gap-5">
        {days.map((day, dayIndex) => {
          const showBlockChrome = day.blocks.length > 1;
          return (
            <div key={dayIndex} className="overflow-hidden rounded-card-lg border border-line">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <input
                  type="text"
                  value={day.label}
                  onChange={(e) => updateDayLabel(dayIndex, e.target.value)}
                  className="rounded-button border border-transparent bg-transparent px-2 py-1 font-heading text-sm font-semibold text-ink outline-none focus:border-accent"
                />
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    className="shrink-0 text-xs font-medium text-danger hover:text-danger-hover"
                  >
                    Quitar día
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 p-4">
                {day.blocks.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className={showBlockChrome ? "rounded-card border border-line p-3" : ""}
                  >
                    {showBlockChrome && (
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={block.label}
                          onChange={(e) => updateBlock(dayIndex, blockIndex, { label: e.target.value })}
                          placeholder="Nombre del bloque"
                          className="rounded-button border border-line px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => removeBlock(dayIndex, blockIndex)}
                          className="shrink-0 text-xs font-medium text-danger hover:text-danger-hover"
                        >
                          Quitar bloque
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {block.exercises.map((ex, exIndex) => (
                        <ExerciseRowEditor
                          key={exIndex}
                          exercise={ex}
                          libraryExercises={libraryExercises}
                          onChange={(patch) => updateExercise(dayIndex, blockIndex, exIndex, patch)}
                          onRemove={() => removeExercise(dayIndex, blockIndex, exIndex)}
                        />
                      ))}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => addExercise(dayIndex, blockIndex)}
                          className="flex items-center gap-1.5 self-start text-sm font-medium text-accent hover:text-accent-hover"
                        >
                          <Plus className="h-4 w-4" strokeWidth={1.75} />
                          Agregar ejercicio{showBlockChrome ? ` a ${block.label || "este bloque"}` : ""}
                        </button>
                        {libraryExercises.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) addExerciseFromLibrary(dayIndex, blockIndex, e.target.value);
                            }}
                            className="rounded-button border border-line px-2 py-1 text-xs text-ink outline-none focus:border-accent"
                          >
                            <option value="">+ Desde la biblioteca...</option>
                            {libraryGroups.map(([category, items]) => (
                              <optgroup key={category} label={category}>
                                {items.map((template) => (
                                  <option key={template.id} value={template.id}>
                                    {template.name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addBlock(dayIndex)}
                  className="flex items-center gap-1.5 self-start text-xs font-medium text-accent hover:text-accent-hover"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Agregar bloque (ejercicios en circuito/superserie)
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-1.5 self-start rounded-button border border-dashed border-line px-4 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Agregar día
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-button bg-accent px-5 py-2.5 text-sm font-medium text-ivory hover:bg-accent-hover disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar rutina"}
      </button>
    </form>
  );
}
