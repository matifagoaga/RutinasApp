"use server";

import { revalidatePath } from "next/cache";
import { completeWorkout, getRoutineDayById, getStudentByToken, getTrainerById, logBodyMetric } from "@/lib/data";
import { notifyWorkoutCompleted } from "@/lib/notifications";

async function requireActiveStudentByToken(token: string) {
  const student = await getStudentByToken(token);
  if (!student || !student.active || !student.trainerId) throw new Error("No autorizado");
  return { ...student, trainerId: student.trainerId };
}

export async function completeWorkoutAction(
  token: string,
  dayId: string,
  feeling: string,
  weights: { exerciseId: string; weightActual: string }[]
) {
  const student = await requireActiveStudentByToken(token);

  let entries: {
    exerciseName: string;
    setsCompleted: number;
    repsActual: string;
    weightActual: string | null;
  }[] = [];
  let dayLabel: string | null = null;

  const day = await getRoutineDayById(dayId, student.trainerId);
  if (day) {
    dayLabel = day.label;
    entries = day.blocks.flatMap((block) =>
      block.exercises.map((exercise) => {
        const typed = weights.find((w) => w.exerciseId === exercise.id)?.weightActual.trim();
        return {
          exerciseName: exercise.name,
          setsCompleted: exercise.sets,
          repsActual: exercise.reps,
          weightActual: typed || exercise.weight,
        };
      })
    );
  }

  await completeWorkout(student.id, student.trainerId, {
    routineDayId: dayId,
    feeling: feeling.trim() || null,
    entries,
  });
  revalidatePath(`/r/${token}`);

  // El email es un extra: si Resend falla, no debe romper el flujo de
  // "marcar como completado" del alumno, que ya se guardó arriba.
  try {
    const trainer = await getTrainerById(student.trainerId);
    if (trainer) {
      await notifyWorkoutCompleted(trainer.email, trainer.name, student.name, dayLabel, new Date());
    }
  } catch (err) {
    console.error("No se pudo enviar el email de notificación al entrenador", err);
  }
}

export async function logBodyMetricPublicAction(token: string, formData: FormData) {
  const student = await requireActiveStudentByToken(token);

  const weightRaw = String(formData.get("weightKg") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const weightKg = weightRaw ? Number(weightRaw) : null;

  if (weightRaw && Number.isNaN(weightKg)) {
    throw new Error("Peso inválido");
  }

  await logBodyMetric(student.id, student.trainerId, { weightKg, notes: notes || null });
  revalidatePath(`/r/${token}`);
}
