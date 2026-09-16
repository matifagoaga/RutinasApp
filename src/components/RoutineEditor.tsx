"use client";

import { useState, useTransition } from "react";
import { getDayPalette } from "@/lib/dayColors";

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
  imageData?: string | null;
};

export type SavedDay = {
  label: string;
  exercises: SavedExercise[];
};

const MAX_GIF_BYTES = 3 * 1024 * 1024; // 3MB
const MAX_SOURCE_BYTES = 15 * 1024 * 1024; // 15MB tope antes de procesar
const MAX_DIMENSION = 900;
const JPEG_QUALITY = 0.82;

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

function emptyDay(n: number): DayState {
  return { label: `Día ${n}`, exercises: [emptyExercise()] };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = src;
  });
}

async function compressImage(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function processImageFile(file: File): Promise<string> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("La imagen es muy pesada (máx 15MB).");
  }
  if (file.type === "image/gif") {
    if (file.size > MAX_GIF_BYTES) {
      throw new Error("El GIF es muy pesado (máx 3MB). Probá con uno más corto o liviano.");
    }
    return readFileAsDataUrl(file);
  }
  const dataUrl = await readFileAsDataUrl(file);
  try {
    return await compressImage(dataUrl);
  } catch {
    return dataUrl;
  }
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

  async function handleImageChange(dayIndex: number, exIndex: number, file: File | null) {
    if (!file) return;
    setError(null);
    try {
      const processed = await processImageFile(file);
      updateExercise(dayIndex, exIndex, { imageData: processed });
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
            imageData: ex.imageData || null,
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
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
        />
      </div>

      <div className="flex flex-col gap-5">
        {days.map((day, dayIndex) => {
          const palette = getDayPalette(dayIndex);
          return (
            <div
              key={dayIndex}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-zinc-950 ${palette.border}`}
            >
              <div className={`flex items-center justify-between gap-3 px-4 py-3 ${palette.header}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${palette.badge}`} />
                  <input
                    type="text"
                    value={day.label}
                    onChange={(e) => updateDayLabel(dayIndex, e.target.value)}
                    className="rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold outline-none focus:border-current"
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
                {day.exercises.map((ex, exIndex) => (
                  <div
                    key={exIndex}
                    className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => updateExercise(dayIndex, exIndex, { name: e.target.value })}
                        placeholder="Ejercicio (ej: Sentadilla)"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
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
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
                      />
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => updateExercise(dayIndex, exIndex, { reps: e.target.value })}
                        placeholder="Reps (ej 8-12)"
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
                      />
                      <input
                        type="text"
                        value={ex.weight}
                        onChange={(e) => updateExercise(dayIndex, exIndex, { weight: e.target.value })}
                        placeholder="Peso sugerido"
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
                      />
                      <input
                        type="number"
                        min={0}
                        value={ex.restSeconds}
                        onChange={(e) => updateExercise(dayIndex, exIndex, { restSeconds: e.target.value })}
                        placeholder="Descanso (seg)"
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={ex.notes}
                        onChange={(e) => updateExercise(dayIndex, exIndex, { notes: e.target.value })}
                        placeholder="Notas (opcional)"
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
                      />
                      <input
                        type="text"
                        value={ex.videoUrl}
                        onChange={(e) => updateExercise(dayIndex, exIndex, { videoUrl: e.target.value })}
                        placeholder="Link de video (opcional)"
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
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
                            onClick={() => updateExercise(dayIndex, exIndex, { imageData: "" })}
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                          >
                            Quitar foto/GIF
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                          + Foto o GIF del ejercicio
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleImageChange(dayIndex, exIndex, e.target.files?.[0] ?? null);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addExercise(dayIndex)}
                  className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                  + Agregar ejercicio
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addDay}
          className="self-start rounded-lg border border-dashed border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:border-violet-500 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-500/10"
        >
          + Agregar día
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar rutina"}
      </button>
    </form>
  );
}
