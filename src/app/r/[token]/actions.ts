"use server";

import { revalidatePath } from "next/cache";
import { completeWorkout, getRoutineDayById, getStudentByToken, logBodyMetric } from "@/lib/data";

async function requireActiveStudentByToken(token: string) {
  const student = await getStudentByToken(token);
  if (!student || !student.active) throw new Error("No autorizado");
  return student;
}

export async function completeWorkoutAction(token: string, formData: FormData) {
  const student = await requireActiveStudentByToken(token);

  const routineDayId = String(formData.get("routineDayId") ?? "") || null;
  const feeling = String(formData.get("feeling") ?? "").trim() || null;

  let entries: {
    exerciseName: string;
    setsCompleted: number;
    repsActual: string;
    weightActual: string | null;
  }[] = [];

  if (routineDayId) {
    const day = await getRoutineDayById(routineDayId);
    if (day) {
      entries = day.exercises.map((exercise) => ({
        exerciseName: exercise.name,
        setsCompleted: exercise.sets,
        repsActual: exercise.reps,
        weightActual: exercise.weight,
      }));
    }
  }

  await completeWorkout(student.id, { routineDayId, feeling, entries });
  revalidatePath(`/r/${token}`);
}

export async function logBodyMetricPublicAction(token: string, formData: FormData) {
  const student = await requireActiveStudentByToken(token);

  const weightRaw = String(formData.get("weightKg") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const weightKg = weightRaw ? Number(weightRaw) : null;

  if (weightRaw && Number.isNaN(weightKg)) {
    throw new Error("Peso inválido");
  }

  await logBodyMetric(student.id, { weightKg, notes: notes || null });
  revalidatePath(`/r/${token}`);
}
