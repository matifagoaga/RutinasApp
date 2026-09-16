"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { saveRoutine, type RoutineDayInput } from "@/lib/data";

export async function saveRoutineAction(studentId: string, title: string, days: RoutineDayInput[]) {
  await requireAdminSession();

  if (!title.trim()) throw new Error("El título es obligatorio");
  if (days.length === 0) throw new Error("Agregá al menos un día con ejercicios");

  await saveRoutine(studentId, title.trim(), days);

  revalidatePath(`/admin/students/${studentId}`);
  redirect(`/admin/students/${studentId}`);
}
