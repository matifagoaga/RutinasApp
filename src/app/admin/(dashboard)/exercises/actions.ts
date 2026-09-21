"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import {
  createExerciseTemplate,
  deleteExerciseTemplate,
  updateExerciseTemplate,
  type ExerciseTemplateInput,
} from "@/lib/data";

function parseTemplateInput(formData: FormData): ExerciseTemplateInput {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const category = String(formData.get("category") ?? "").trim();
  const setsRaw = String(formData.get("sets") ?? "").trim();
  const sets = Math.max(1, Number(setsRaw) || 1);

  const reps = String(formData.get("reps") ?? "").trim() || "-";
  const weight = String(formData.get("weight") ?? "").trim();
  const restSecondsRaw = String(formData.get("restSeconds") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const imageData = String(formData.get("imageData") ?? "").trim();

  return {
    name,
    category: category || null,
    sets,
    reps,
    weight: weight || null,
    restSeconds: restSecondsRaw ? Number(restSecondsRaw) : null,
    notes: notes || null,
    videoUrl: videoUrl || null,
    imageData: imageData || null,
  };
}

export async function createExerciseTemplateAction(formData: FormData) {
  await requireAdminSession();
  await createExerciseTemplate(parseTemplateInput(formData));
  revalidatePath("/admin/exercises");
}

export async function updateExerciseTemplateAction(templateId: string, formData: FormData) {
  await requireAdminSession();
  await updateExerciseTemplate(templateId, parseTemplateInput(formData));
  revalidatePath("/admin/exercises");
  redirect("/admin/exercises");
}

export async function deleteExerciseTemplateAction(templateId: string) {
  await requireAdminSession();
  await deleteExerciseTemplate(templateId);
  revalidatePath("/admin/exercises");
}
