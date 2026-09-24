"use server";

import { revalidatePath } from "next/cache";
import { requireTrainerSession } from "@/lib/auth";
import { createRoutineTemplate, deleteRoutineTemplate, type RoutineDayInput } from "@/lib/data";

export async function saveRoutineTemplateAction(title: string, days: RoutineDayInput[]) {
  const { trainerId } = await requireTrainerSession();

  if (!title.trim()) throw new Error("El título de la plantilla es obligatorio");
  if (days.length === 0) throw new Error("Agregá al menos un día con ejercicios");

  await createRoutineTemplate(trainerId, title.trim(), days);

  revalidatePath("/admin/routine-templates");
}

export async function deleteRoutineTemplateAction(id: string) {
  const { trainerId } = await requireTrainerSession();
  await deleteRoutineTemplate(id, trainerId);
  revalidatePath("/admin/routine-templates");
}
