"use client";

import { useState, useTransition } from "react";
import { processImageFile } from "@/lib/image";

type ExerciseState = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restSeconds: string;
  notes: string;
  videoUrl: string;
  imageData: string;
};

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

export type LibraryExerciseOption = {
  id: string;
  name: string;
  category: string | null;
  sets: number;
  reps: string;
  weight: string | null;
  restSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  imageData: string | null;
};

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

function exerciseFromTemplate(template: LibraryExerciseOption): ExerciseState {
  return {
    name: template.name,
    sets: String(template.sets),
    reps: template.reps,
    weight: template.weight ?? "",
    restSeconds: template.restSeconds != null ? String(template.restSeconds) : "",
    notes: template.notes ?? "",
    videoUrl: template.videoUrl ?? "",
    imageData: template.imageData ?? "",
  };
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

  async function handleImageChange(
    dayIndex: number,
    blockIndex: number,
    exIndex: number,
    file: File | null
  ) {
    if (!file) return;
    setError(null);
    try {
      const processed = await processImageFile(file);
      updateExercise(dayIndex, blockIndex, exIndex, { imageData: processed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la imagen.");
    }
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
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Título de la rutina
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Fuerza - Fase 1"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
      </div>

      <div className="flex flex-col gap-5">
        {days.map((day, dayIndex) => {
          const showBlockChrome = day.blocks.length > 1;
          return (
            <div
              key={dayIndex}
              className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-950 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
                  <input
                    type="text"
                    value={day.label}
                    onChange={(e) => updateDayLabel(dayIndex, e.target.value)}
                    className="rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-emerald-900 outline-none focus:border-emerald-400 dark:text-emerald-200"
                  />
                </div>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Quitar día
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 p-4">
                {day.blocks.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className={
                      showBlockChrome
                        ? "rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
                        : ""
                    }
                  >
                    {showBlockChrome && (
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={block.label}
                          onChange={(e) => updateBlock(dayIndex, blockIndex, { label: e.target.value })}
                          placeholder="Nombre del bloque"
                          className="rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-800 outline-none focus:border-emerald-500 dark:border-emerald-900 dark:bg-zinc-950 dark:text-emerald-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeBlock(dayIndex, blockIndex)}
                          className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Quitar bloque
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {block.exercises.map((ex, exIndex) => (
                        <div
                          key={exIndex}
                          className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { name: e.target.value })
                              }
                              placeholder="Ejercicio (ej: Sentadilla)"
                              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                            <button
                              type="button"
                              onClick={() => removeExercise(dayIndex, blockIndex, exIndex)}
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
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { sets: e.target.value })
                              }
                              placeholder="Series"
                              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { reps: e.target.value })
                              }
                              placeholder="Reps (ej 8-12)"
                              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                            <input
                              type="text"
                              value={ex.weight}
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { weight: e.target.value })
                              }
                              placeholder="Peso sugerido"
                              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                            <input
                              type="number"
                              min={0}
                              value={ex.restSeconds}
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { restSeconds: e.target.value })
                              }
                              placeholder="Descanso (seg)"
                              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <input
                              type="text"
                              value={ex.notes}
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { notes: e.target.value })
                              }
                              placeholder="Notas (opcional)"
                              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                            <input
                              type="text"
                              value={ex.videoUrl}
                              onChange={(e) =>
                                updateExercise(dayIndex, blockIndex, exIndex, { videoUrl: e.target.value })
                              }
                              placeholder="Link de video (opcional)"
                              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
                            />
                          </div>

                          <div className="mt-3 flex items-center gap-3">
                            {ex.imageData ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={ex.imageData}
                                  alt=""
                                  className="h-14 w-14 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateExercise(dayIndex, blockIndex, exIndex, { imageData: "" })
                                  }
                                  className="text-xs font-medium text-red-600 hover:text-red-700"
                                >
                                  Quitar foto/GIF
                                </button>
                              </>
                            ) : (
                              <label className="cursor-pointer text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400">
                                + Foto o GIF del ejercicio
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleImageChange(dayIndex, blockIndex, exIndex, e.target.files?.[0] ?? null);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => addExercise(dayIndex, blockIndex)}
                          className="self-start text-sm font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
                        >
                          + Agregar ejercicio{showBlockChrome ? ` a ${block.label || "este bloque"}` : ""}
                        </button>
                        {libraryExercises.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) addExerciseFromLibrary(dayIndex, blockIndex, e.target.value);
                            }}
                            className="rounded-lg border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
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
                  className="self-start text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
                >
                  + Agregar bloque (ejercicios en circuito/superserie)
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addDay}
          className="self-start rounded-lg border border-dashed border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          + Agregar día
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar rutina"}
      </button>
    </form>
  );
}
