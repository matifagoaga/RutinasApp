"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { createRoutineTemplate, deleteRoutineTemplate, type RoutineDayInput } from "@/lib/data";

export async function saveRoutineTemplateAction(title: string, days: RoutineDayInput[]) {
  await requireAdminSession();

  if (!title.trim()) throw new Error("El título de la plantilla es obligatorio");
  if (days.length === 0) throw new Error("Agregá al menos un día con ejercicios");

  await createRoutineTemplate(title.trim(), days);

  revalidatePath("/admin/routine-templates");
}

export async function deleteRoutineTemplateAction(id: string) {
  await requireAdminSession();
  await deleteRoutineTemplate(id);
  revalidatePath("/admin/routine-templates");
}
