"use client";

import { useState, useTransition } from "react";
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
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <select
          name="category"
          defaultValue={initial.category}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
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
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="text"
          name="reps"
          defaultValue={initial.reps}
          placeholder="Reps (ej 8-12)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="text"
          name="weight"
          defaultValue={initial.weight}
          placeholder="Peso sugerido"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="number"
          min={0}
          name="restSeconds"
          defaultValue={initial.restSeconds}
          placeholder="Descanso (seg)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="text"
          name="notes"
          defaultValue={initial.notes}
          placeholder="Notas (opcional)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
        <input
          type="text"
          name="videoUrl"
          defaultValue={initial.videoUrl}
          placeholder="Link de video (opcional)"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
      </div>

      <div className="flex items-center gap-3">
        {imageData ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageData}
              alt=""
              className="h-14 w-14 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
            />
            <button
              type="button"
              onClick={() => setImageData("")}
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
