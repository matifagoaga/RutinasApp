"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { processImageFile } from "@/lib/image";
import { EXERCISE_CATEGORIES } from "@/lib/exerciseCategories";

export type ExerciseTemplateFormValues = {
  name: string;
  category: string;
  sets: string;
  reps: string;
  weight: string;
  restSeconds: string;
  notes: string;
  videoUrl: string;
  imageData: string;
};

const EMPTY_VALUES: ExerciseTemplateFormValues = {
  name: "",
  category: "",
  sets: "3",
  reps: "10-12",
  weight: "",
  restSeconds: "",
  notes: "",
  videoUrl: "",
  imageData: "",
};

export function ExerciseTemplateForm({
  initial = EMPTY_VALUES,
  submitLabel = "Guardar",
  onSave,
}: {
  initial?: ExerciseTemplateFormValues;
  submitLabel?: string;
  onSave: (formData: FormData) => Promise<void>;
}) {
  const [imageData, setImageData] = useState(initial.imageData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleImageChange(file: File | null) {
    if (!file) return;
    setError(null);
    try {
      setImageData(await processImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la imagen.");
    }
  }

  return (
    <form
      action={(formData) => startTransition(async () => onSave(formData))}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="imageData" value={imageData} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          name="name"
          required
          defaultValue={initial.name}
          placeholder="Ejercicio (ej: Sentadilla)"
          className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <select
          name="category"
          defaultValue={initial.category}
          className="rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        >
          <option value="">Sin categoría</option>
          {EXERCISE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          type="number"
          min={1}
          name="sets"
          defaultValue={initial.sets}
          placeholder="Series"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="text"
          name="reps"
          defaultValue={initial.reps}
          placeholder="Reps (ej 8-12)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="text"
          name="weight"
          defaultValue={initial.weight}
          placeholder="Peso sugerido"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="number"
          min={0}
          name="restSeconds"
          defaultValue={initial.restSeconds}
          placeholder="Descanso (seg)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          name="notes"
          defaultValue={initial.notes}
          placeholder="Notas (opcional)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
        <input
          type="text"
          name="videoUrl"
          defaultValue={initial.videoUrl}
          placeholder="Link de video (opcional)"
          className="rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
        />
      </div>

      <div className="flex items-center gap-3">
        {imageData ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageData}
              alt=""
              className="h-14 w-14 rounded-button border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => setImageData("")}
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

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-button bg-accent px-4 py-2 text-sm font-medium text-ivory hover:bg-accent-hover disabled:opacity-60"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
