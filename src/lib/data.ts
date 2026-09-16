import { db } from "@/lib/db";

// ---------- Alumnos ----------

export function getStudents() {
  return db.student.findMany({ orderBy: { createdAt: "desc" } });
}

export function getStudentById(id: string) {
  return db.student.findUnique({ where: { id } });
}

export function getStudentByToken(token: string) {
  return db.student.findUnique({ where: { token } });
}

export function createStudent(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}) {
  return db.student.create({
    data: {
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
    },
  });
}

// ---------- Rutinas ----------

export type ExerciseInput = {
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
};

export type RoutineDayInput = {
  label: string;
  exercises: ExerciseInput[];
};

export function saveRoutine(studentId: string, title: string, days: RoutineDayInput[]) {
  return db.$transaction(async (tx) => {
    await tx.routine.updateMany({
      where: { studentId, isActive: true },
      data: { isActive: false },
    });

    return tx.routine.create({
      data: {
        studentId,
        title,
        isActive: true,
        days: {
          create: days.map((day, dayIndex) => ({
            label: day.label,
            order: dayIndex,
            exercises: {
              create: day.exercises.map((exercise, exerciseIndex) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight || null,
                restSeconds: exercise.restSeconds ?? null,
                notes: exercise.notes || null,
                videoUrl: exercise.videoUrl || null,
                order: exerciseIndex,
              })),
            },
          })),
        },
      },
      include: {
        days: { orderBy: { order: "asc" }, include: { exercises: { orderBy: { order: "asc" } } } },
      },
    });
  });
}

export function getActiveRoutine(studentId: string) {
  return db.routine.findFirst({
    where: { studentId, isActive: true },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export function getRoutineDayById(routineDayId: string) {
  return db.routineDay.findUnique({
    where: { id: routineDayId },
    include: { exercises: true },
  });
}

export function getRoutineHistory(studentId: string, limit = 10) {
  return db.routine.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ---------- Entrenamientos (progreso) ----------

export type WorkoutLogEntryInput = {
  exerciseName: string;
  setsCompleted?: number | null;
  repsActual?: string | null;
  weightActual?: string | null;
};

export function completeWorkout(
  studentId: string,
  input: {
    routineDayId?: string | null;
    feeling?: string | null;
    entries: WorkoutLogEntryInput[];
  }
) {
  return db.workoutLog.create({
    data: {
      studentId,
      routineDayId: input.routineDayId || null,
      feeling: input.feeling || null,
      entries: { create: input.entries },
    },
    include: { entries: true },
  });
}

export function getRecentWorkoutLogs(studentId: string, limit = 10) {
  return db.workoutLog.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    take: limit,
    include: { entries: true, routineDay: true },
  });
}

// ---------- Peso corporal / progreso físico ----------

export function logBodyMetric(
  studentId: string,
  input: { weightKg?: number | null; notes?: string | null }
) {
  return db.bodyMetric.create({
    data: {
      studentId,
      weightKg: input.weightKg ?? null,
      notes: input.notes || null,
    },
  });
}

export function getBodyMetrics(studentId: string, limit = 30) {
  return db.bodyMetric.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    take: limit,
  });
}
