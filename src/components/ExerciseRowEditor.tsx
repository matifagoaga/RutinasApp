"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
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
    <div className="rounded-card border border-line p-3">
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
            className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-card border border-line bg-ivory text-sm">
              {suggestions.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(template)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-accent-tint"
                  >
                    <span className="text-ink">{template.name}</span>
                    {template.category && (
                      <span className="shrink-0 text-xs text-ink-muted">{template.category}</span>
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
          aria-label={exercise.name ? `Quitar ejercicio ${exercise.name}` : "Quitar ejercicio"}
          className="shrink-0 text-ink-muted hover:text-danger"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          type="number"
          min={1}
          value={exercise.sets}
          onChange={(e) => onChange({ sets: e.target.value })}
          placeholder="Series"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="text"
          value={exercise.reps}
          onChange={(e) => onChange({ reps: e.target.value })}
          placeholder="Reps (ej 8-12)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="text"
          value={exercise.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          placeholder="Peso sugerido"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="number"
          min={0}
          value={exercise.restSeconds}
          onChange={(e) => onChange({ restSeconds: e.target.value })}
          placeholder="Descanso (seg)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={exercise.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Notas (opcional)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="text"
          value={exercise.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="Link de video (opcional)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        {exercise.imageData ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.imageData}
              alt=""
              className="h-14 w-14 rounded-button border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => onChange({ imageData: "" })}
              className="text-xs font-medium text-danger hover:text-danger-hover"
            >
              Quitar foto/GIF
            </button>
          </>
        ) : (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Foto o GIF del ejercicio
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
      {imageError && <p className="mt-1 text-xs text-danger">{imageError}</p>}
    </div>
  );
}
