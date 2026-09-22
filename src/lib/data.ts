import { db } from "@/lib/db";

// ---------- Alumnos ----------

export function getStudents() {
  return db.student.findMany({ where: { teamId: null }, orderBy: { createdAt: "desc" } });
}

export function getStudentById(id: string) {
  return db.student.findUnique({ where: { id } });
}

export function getStudentByToken(token: string) {
  return db.student.findUnique({ where: { token } });
}

export function deleteStudent(id: string) {
  return db.student.delete({ where: { id } });
}

export function createStudent(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  teamId?: string | null;
}) {
  return db.student.create({
    data: {
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
      teamId: input.teamId || null,
    },
  });
}

export function setStudentTeam(studentId: string, teamId: string | null) {
  return db.student.update({ where: { id: studentId }, data: { teamId } });
}

// ---------- Equipos ----------

export function getTeams() {
  return db.team.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { players: true } },
      players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });
}

export function getTeamById(id: string) {
  return db.team.findUnique({ where: { id } });
}

export function getTeamPlayers(teamId: string) {
  return db.student.findMany({ where: { teamId }, orderBy: { name: "asc" } });
}

export function createTeam(name: string) {
  return db.team.create({ data: { name } });
}

export function deleteTeam(id: string) {
  return db.team.delete({ where: { id } });
}

// ---------- Testeos ----------

export function getTesteos(studentId: string, limit = 100) {
  return db.testeo.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export type TesteoSessionEntryInput = { name: string; value: string };

export function addTesteoSession(
  studentId: string,
  input: { date: Date; sessionLabel?: string | null; entries: TesteoSessionEntryInput[] }
) {
  return db.testeo.createMany({
    data: input.entries.map((entry) => ({
      studentId,
      name: entry.name,
      value: entry.value,
      date: input.date,
      sessionLabel: input.sessionLabel || null,
    })),
  });
}

export function deleteTesteo(id: string) {
  return db.testeo.delete({ where: { id } });
}

export async function getDistinctTesteoNames() {
  const rows = await db.testeo.findMany({
    distinct: ["name"],
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
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
  imageData?: string | null;
};

export type BlockInput = {
  label: string;
  exercises: ExerciseInput[];
};

export type RoutineDayInput = {
  label: string;
  blocks: BlockInput[];
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
            blocks: {
              create: day.blocks.map((block, blockIndex) => ({
                label: block.label,
                order: blockIndex,
                exercises: {
                  create: block.exercises.map((exercise, exerciseIndex) => ({
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight || null,
                    restSeconds: exercise.restSeconds ?? null,
                    notes: exercise.notes || null,
                    videoUrl: exercise.videoUrl || null,
                    imageData: exercise.imageData || null,
                    order: exerciseIndex,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        days: {
          orderBy: { order: "asc" },
          include: {
            blocks: {
              orderBy: { order: "asc" },
              include: { exercises: { orderBy: { order: "asc" } } },
            },
          },
        },
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
        include: {
          blocks: {
            orderBy: { order: "asc" },
            include: { exercises: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
}

export function getRoutineDayById(routineDayId: string) {
  return db.routineDay.findUnique({
    where: { id: routineDayId },
    include: {
      blocks: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export function getRoutineHistory(studentId: string, limit = 10) {
  return db.routine.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ---------- Plantillas de rutina ----------
// Rutinas completas reutilizables (sin alumno dueño). El entrenador las
// guarda desde el editor de un alumno y las aplica a cualquier otro
// alumno/jugador; aplicar una copia los datos, no crea ninguna relación.

export function getRoutineTemplates() {
  return db.routineTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          blocks: {
            orderBy: { order: "asc" },
            include: { exercises: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
}

export function createRoutineTemplate(title: string, days: RoutineDayInput[]) {
  return db.routineTemplate.create({
    data: {
      title,
      days: {
        create: days.map((day, dayIndex) => ({
          label: day.label,
          order: dayIndex,
          blocks: {
            create: day.blocks.map((block, blockIndex) => ({
              label: block.label,
              order: blockIndex,
              exercises: {
                create: block.exercises.map((exercise, exerciseIndex) => ({
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight || null,
                  restSeconds: exercise.restSeconds ?? null,
                  notes: exercise.notes || null,
                  videoUrl: exercise.videoUrl || null,
                  imageData: exercise.imageData || null,
                  order: exerciseIndex,
                })),
              },
            })),
          },
        })),
      },
    },
  });
}

export function deleteRoutineTemplate(id: string) {
  return db.routineTemplate.delete({ where: { id } });
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

// ---------- Panel de inicio ----------

const DAY_MS = 24 * 60 * 60 * 1000;
const ATTENTION_THRESHOLD_DAYS = 7;

export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * DAY_MS);

  const [totalStudents, workoutsToday, workoutsThisWeek] = await Promise.all([
    db.student.count({ where: { active: true } }),
    db.workoutLog.count({ where: { date: { gte: startOfToday } } }),
    db.workoutLog.count({ where: { date: { gte: startOfWeek } } }),
  ]);

  return { totalStudents, workoutsToday, workoutsThisWeek };
}

export function getRecentActivity(limit = 10) {
  return db.workoutLog.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: { student: true, routineDay: true },
  });
}

export async function getStudentsNeedingAttention() {
  const students = await db.student.findMany({
    where: { active: true },
    include: {
      routines: { where: { isActive: true }, take: 1, select: { id: true } },
      workoutLogs: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
    },
  });

  const now = Date.now();

  return students
    .map((student) => {
      const hasRoutine = student.routines.length > 0;
      const lastWorkoutDate = student.workoutLogs[0]?.date ?? null;
      const daysSinceLastWorkout = lastWorkoutDate
        ? Math.floor((now - lastWorkoutDate.getTime()) / DAY_MS)
        : null;

      const reasons: string[] = [];
      if (student.attentionNote) reasons.push(student.attentionNote);
      if (!hasRoutine) reasons.push("Todavía no tiene una rutina cargada");
      else if (daysSinceLastWorkout === null) reasons.push("Nunca marcó un entrenamiento");
      else if (daysSinceLastWorkout >= ATTENTION_THRESHOLD_DAYS)
        reasons.push(`Hace ${daysSinceLastWorkout} días que no entrena`);

      return { id: student.id, name: student.name, reason: reasons.join(" · ") || null };
    })
    .filter((student): student is { id: string; name: string; reason: string } => student.reason != null);
}

export function setStudentAttentionNote(studentId: string, note: string | null) {
  return db.student.update({
    where: { id: studentId },
    data: { attentionNote: note },
  });
}

// ---------- Pagos ----------

export function getPayments(studentId: string, limit = 12) {
  return db.payment.findMany({
    where: { studentId },
    orderBy: { paidAt: "desc" },
    take: limit,
  });
}

export function hasPaidForMonth(studentId: string, month: string) {
  return db.payment.findFirst({ where: { studentId, month } });
}

export function registerPayment(
  studentId: string,
  input: { month: string; amount?: number | null; notes?: string | null }
) {
  return db.payment.create({
    data: {
      studentId,
      month: input.month,
      amount: input.amount ?? null,
      notes: input.notes || null,
    },
  });
}

// ---------- Biblioteca de ejercicios ----------

export type ExerciseTemplateInput = {
  name: string;
  category?: string | null;
  sets: number;
  reps: string;
  weight?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
  imageData?: string | null;
};

export function getExerciseTemplates() {
  return db.exerciseTemplate.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
}

export function getExerciseTemplateById(id: string) {
  return db.exerciseTemplate.findUnique({ where: { id } });
}

export function createExerciseTemplate(input: ExerciseTemplateInput) {
  return db.exerciseTemplate.create({
    data: {
      name: input.name,
      category: input.category || null,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight || null,
      restSeconds: input.restSeconds ?? null,
      notes: input.notes || null,
      videoUrl: input.videoUrl || null,
      imageData: input.imageData || null,
    },
  });
}

export function updateExerciseTemplate(id: string, input: ExerciseTemplateInput) {
  return db.exerciseTemplate.update({
    where: { id },
    data: {
      name: input.name,
      category: input.category || null,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight || null,
      restSeconds: input.restSeconds ?? null,
      notes: input.notes || null,
      videoUrl: input.videoUrl || null,
      imageData: input.imageData || null,
    },
  });
}

export function deleteExerciseTemplate(id: string) {
  return db.exerciseTemplate.delete({ where: { id } });
}
