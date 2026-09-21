"use client";

import { useMemo, useRef, useState } from "react";
import { processImageFile } from "@/lib/image";
import { exerciseFromTemplate, type ExerciseState, type LibraryExerciseOption } from "./routineTypes";

export function ExerciseRowEditor({
  exercise,
  libraryExercises,
  onChange,
  onRemove,
}: {
  exercise: ExerciseState;
  libraryExercises: LibraryExerciseOption[];
  onChange: (patch: Partial<ExerciseState>) => void;
  onRemove: () => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    const query = exercise.name.trim().toLowerCase();
    if (!query) return [];
    return libraryExercises.filter((t) => t.name.toLowerCase().includes(query)).slice(0, 8);
  }, [exercise.name, libraryExercises]);

  function pickSuggestion(template: LibraryExerciseOption) {
    onChange(exerciseFromTemplate(template));
    setShowSuggestions(false);
  }

  function handleNameBlur() {
    // Delay para permitir que el click en una sugerencia se registre antes de ocultarlas.
    blurTimeout.current = setTimeout(() => setShowSuggestions(false), 150);
  }

  async function handleImageChange(file: File | null) {
    if (!file) return;
    setImageError(null);
    try {
      onChange({ imageData: await processImageFile(file) });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "No se pudo procesar la imagen.");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => {
              onChange({ name: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (blurTimeout.current) clearTimeout(blurTimeout.current);
              setShowSuggestions(true);
            }}
            onBlur={handleNameBlur}
            placeholder="Ejercicio (ej: Sentadilla)"
            autoComplete="off"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {suggestions.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(template)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  >
                    <span className="text-zinc-900 dark:text-zinc-50">{template.name}</span>
                    {template.category && (
                      <span className="shrink-0 text-xs text-zinc-400">{template.category}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-sm text-zinc-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          type="number"
          min={1}
          value={exercise.sets}
          onChange={(e) => onChange({ sets: e.target.value })}
          placeholder="Series"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="text"
          value={exercise.reps}
          onChange={(e) => onChange({ reps: e.target.value })}
          placeholder="Reps (ej 8-12)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="text"
          value={exercise.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          placeholder="Peso sugerido"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="number"
          min={0}
          value={exercise.restSeconds}
          onChange={(e) => onChange({ restSeconds: e.target.value })}
          placeholder="Descanso (seg)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={exercise.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Notas (opcional)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="text"
          value={exercise.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="Link de video (opcional)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        {exercise.imageData ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.imageData}
              alt=""
              className="h-14 w-14 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
            />
            <button
              type="button"
              onClick={() => onChange({ imageData: "" })}
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
                handleImageChange(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
    </div>
  );
}
