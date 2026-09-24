import { db } from "@/lib/db";
import { localWeekday, startOfLocalDay } from "@/lib/format";

// ---------- Entrenadores ----------

export function getTrainerByEmail(email: string) {
  return db.trainer.findUnique({ where: { email: email.trim().toLowerCase() } });
}

// ---------- Alumnos ----------

export function getStudents(trainerId: string) {
  return db.student.findMany({ where: { teamId: null, trainerId }, orderBy: { createdAt: "desc" } });
}

export function getStudentById(id: string, trainerId: string) {
  return db.student.findFirst({ where: { id, trainerId } });
}

// Usado sólo por la página pública /r/[token]: el token es el único límite de
// autorización acá, a propósito no depende de qué entrenador es el dueño.
export function getStudentByToken(token: string) {
  return db.student.findUnique({ where: { token } });
}

export async function deleteStudent(id: string, trainerId: string) {
  const { count } = await db.student.deleteMany({ where: { id, trainerId } });
  if (count === 0) throw new Error("Alumno no encontrado");
}

export async function createStudent(
  trainerId: string,
  input: {
    name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    teamId?: string | null;
  }
) {
  if (input.teamId) {
    const team = await db.team.findFirst({ where: { id: input.teamId, trainerId } });
    if (!team) throw new Error("Equipo no encontrado");
  }

  return db.student.create({
    data: {
      trainerId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
      teamId: input.teamId || null,
    },
  });
}

export async function setStudentTeam(studentId: string, teamId: string | null, trainerId: string) {
  if (teamId) {
    const team = await db.team.findFirst({ where: { id: teamId, trainerId } });
    if (!team) throw new Error("Equipo no encontrado");
  }
  const { count } = await db.student.updateMany({ where: { id: studentId, trainerId }, data: { teamId } });
  if (count === 0) throw new Error("Alumno no encontrado");
}

// ---------- Equipos ----------

export function getTeams(trainerId: string) {
  return db.team.findMany({
    where: { trainerId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { players: true } },
      players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });
}

export function getTeamById(id: string, trainerId: string) {
  return db.team.findFirst({ where: { id, trainerId } });
}

export function getTeamPlayers(teamId: string, trainerId: string) {
  return db.student.findMany({ where: { teamId, trainerId }, orderBy: { name: "asc" } });
}

export function createTeam(name: string, trainerId: string) {
  return db.team.create({ data: { name, trainerId } });
}

export async function deleteTeam(id: string, trainerId: string) {
  const { count } = await db.team.deleteMany({ where: { id, trainerId } });
  if (count === 0) throw new Error("Equipo no encontrado");
}

// ---------- Testeos ----------

export function getTesteos(studentId: string, trainerId: string, limit = 100) {
  return db.testeo.findMany({
    where: { studentId, student: { trainerId } },
    // date es la fecha "lógica" (editable); createdAt e id desempatan cuando
    // dos testeos comparten la misma date, para que el orden en el sparkline
    // no dependa del orden no determinístico que devuelve la base.
    orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });
}

export type TesteoSessionEntryInput = { name: string; value: string };

export async function addTesteoSession(
  studentId: string,
  trainerId: string,
  input: { date: Date; sessionLabel?: string | null; entries: TesteoSessionEntryInput[] }
) {
  const student = await db.student.findFirst({ where: { id: studentId, trainerId }, select: { id: true } });
  if (!student) throw new Error("Alumno no encontrado");

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

export async function updateTesteo(
  id: string,
  trainerId: string,
  input: { name: string; value: string; date: Date }
) {
  const { count } = await db.testeo.updateMany({
    where: { id, student: { trainerId } },
    data: { name: input.name, value: input.value, date: input.date },
  });
  if (count === 0) throw new Error("Testeo no encontrado");
}

export async function deleteTesteo(id: string, trainerId: string) {
  const { count } = await db.testeo.deleteMany({ where: { id, student: { trainerId } } });
  if (count === 0) throw new Error("Testeo no encontrado");
}

export async function getDistinctTesteoNames(trainerId: string) {
  const rows = await db.testeo.findMany({
    where: { student: { trainerId } },
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

export async function saveRoutine(
  studentId: string,
  trainerId: string,
  title: string,
  days: RoutineDayInput[]
) {
  const student = await db.student.findFirst({ where: { id: studentId, trainerId }, select: { id: true } });
  if (!student) throw new Error("Alumno no encontrado");

  return db.$transaction(
    async (tx) => {
      await tx.routine.updateMany({
        where: { studentId, isActive: true },
        data: { isActive: false },
      });

      const routine = await tx.routine.create({ data: { studentId, title, isActive: true } });

      // Se crea nivel por nivel (no con `create` anidado de un solo saque) porque
      // el motor de Prisma 7 + adapter pierde referencias de blockId cuando hay
      // varios días/bloques con arrays paralelos en una sola escritura anidada
      // profunda, y termina violando el FK Exercise_blockId_fkey.
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];
        const createdDay = await tx.routineDay.create({
          data: { routineId: routine.id, label: day.label, order: dayIndex },
        });

        for (let blockIndex = 0; blockIndex < day.blocks.length; blockIndex++) {
          const block = day.blocks[blockIndex];
          const createdBlock = await tx.exerciseBlock.create({
            data: { dayId: createdDay.id, label: block.label, order: blockIndex },
          });

          for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
            const exercise = block.exercises[exerciseIndex];
            await tx.exercise.create({
              data: {
                blockId: createdBlock.id,
                order: exerciseIndex,
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight || null,
                restSeconds: exercise.restSeconds ?? null,
                notes: exercise.notes || null,
                videoUrl: exercise.videoUrl || null,
                imageData: exercise.imageData || null,
              },
            });
          }
        }
      }

      return tx.routine.findUniqueOrThrow({
        where: { id: routine.id },
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
    },
    // Muchas escrituras secuenciales contra Neon (una por fila, no en lote)
    // pueden pasar el timeout default de 5s en rutinas grandes de varios días.
    { timeout: 20000 }
  );
}

export function getActiveRoutine(studentId: string, trainerId: string) {
  return db.routine.findFirst({
    where: { studentId, isActive: true, student: { trainerId } },
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

export function getRoutineDayById(routineDayId: string, trainerId: string) {
  return db.routineDay.findFirst({
    where: { id: routineDayId, routine: { student: { trainerId } } },
    include: {
      blocks: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export function getRoutineHistory(studentId: string, trainerId: string, limit = 10) {
  return db.routine.findMany({
    where: { studentId, student: { trainerId } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ---------- Plantillas de rutina ----------
// Rutinas completas reutilizables (sin alumno dueño, pero sí con entrenador
// dueño). El entrenador las guarda desde el editor de un alumno y las aplica
// a cualquier otro alumno/jugador suyo; aplicar copia los datos, no crea
// ninguna relación.

export function getRoutineTemplates(trainerId: string) {
  return db.routineTemplate.findMany({
    where: { trainerId },
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

export async function createRoutineTemplate(trainerId: string, title: string, days: RoutineDayInput[]) {
  return db.$transaction(
    async (tx) => {
      const template = await tx.routineTemplate.create({ data: { trainerId, title } });

      // Mismo motivo que en saveRoutine: crear nivel por nivel en vez de un
      // `create` anidado de una vez evita que Prisma pierda el blockId con
      // varios días/bloques en paralelo.
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];
        const createdDay = await tx.routineTemplateDay.create({
          data: { routineTemplateId: template.id, label: day.label, order: dayIndex },
        });

        for (let blockIndex = 0; blockIndex < day.blocks.length; blockIndex++) {
          const block = day.blocks[blockIndex];
          const createdBlock = await tx.routineTemplateBlock.create({
            data: { dayId: createdDay.id, label: block.label, order: blockIndex },
          });

          for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
            const exercise = block.exercises[exerciseIndex];
            await tx.routineTemplateExercise.create({
              data: {
                blockId: createdBlock.id,
                order: exerciseIndex,
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight || null,
                restSeconds: exercise.restSeconds ?? null,
                notes: exercise.notes || null,
                videoUrl: exercise.videoUrl || null,
                imageData: exercise.imageData || null,
              },
            });
          }
        }
      }

      return template;
    },
    { timeout: 20000 }
  );
}

export async function deleteRoutineTemplate(id: string, trainerId: string) {
  const { count } = await db.routineTemplate.deleteMany({ where: { id, trainerId } });
  if (count === 0) throw new Error("Plantilla no encontrada");
}

// ---------- Entrenamientos (progreso) ----------

export type WorkoutLogEntryInput = {
  exerciseName: string;
  setsCompleted?: number | null;
  repsActual?: string | null;
  weightActual?: string | null;
};

export async function completeWorkout(
  studentId: string,
  trainerId: string,
  input: {
    routineDayId?: string | null;
    feeling?: string | null;
    entries: WorkoutLogEntryInput[];
  }
) {
  const student = await db.student.findFirst({ where: { id: studentId, trainerId }, select: { id: true } });
  if (!student) throw new Error("Alumno no encontrado");

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

export function getRecentWorkoutLogs(studentId: string, trainerId: string, limit = 10) {
  return db.workoutLog.findMany({
    where: { studentId, student: { trainerId } },
    orderBy: { date: "desc" },
    take: limit,
    include: { entries: true, routineDay: true },
  });
}

// ---------- Peso corporal / progreso físico ----------

export async function logBodyMetric(
  studentId: string,
  trainerId: string,
  input: { weightKg?: number | null; notes?: string | null }
) {
  const student = await db.student.findFirst({ where: { id: studentId, trainerId }, select: { id: true } });
  if (!student) throw new Error("Alumno no encontrado");

  return db.bodyMetric.create({
    data: {
      studentId,
      weightKg: input.weightKg ?? null,
      notes: input.notes || null,
    },
  });
}

export function getBodyMetrics(studentId: string, trainerId: string, limit = 30) {
  return db.bodyMetric.findMany({
    where: { studentId, student: { trainerId } },
    orderBy: { date: "desc" },
    take: limit,
  });
}

// ---------- Panel de inicio ----------

const DAY_MS = 24 * 60 * 60 * 1000;
const ATTENTION_THRESHOLD_DAYS = 7;

export async function getDashboardStats(trainerId: string) {
  const startOfToday = startOfLocalDay(new Date());
  const startOfWeek = new Date(startOfToday.getTime() - localWeekday(startOfToday) * DAY_MS);

  const [totalStudents, workoutsToday, workoutsThisWeek] = await Promise.all([
    db.student.count({ where: { active: true, trainerId } }),
    db.workoutLog.count({ where: { date: { gte: startOfToday }, student: { trainerId } } }),
    db.workoutLog.count({ where: { date: { gte: startOfWeek }, student: { trainerId } } }),
  ]);

  return { totalStudents, workoutsToday, workoutsThisWeek };
}

export function getRecentActivity(trainerId: string, limit = 10) {
  return db.workoutLog.findMany({
    where: { student: { trainerId } },
    orderBy: { date: "desc" },
    take: limit,
    include: { student: true, routineDay: true },
  });
}

export async function getStudentsNeedingAttention(trainerId: string) {
  const students = await db.student.findMany({
    where: { active: true, trainerId },
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

export async function setStudentAttentionNote(studentId: string, trainerId: string, note: string | null) {
  const { count } = await db.student.updateMany({
    where: { id: studentId, trainerId },
    data: { attentionNote: note },
  });
  if (count === 0) throw new Error("Alumno no encontrado");
}

// ---------- Pagos ----------

export function getPayments(studentId: string, trainerId: string, limit = 12) {
  return db.payment.findMany({
    where: { studentId, student: { trainerId } },
    orderBy: { paidAt: "desc" },
    take: limit,
  });
}

export function hasPaidForMonth(studentId: string, trainerId: string, month: string) {
  return db.payment.findFirst({ where: { studentId, month, student: { trainerId } } });
}

export async function registerPayment(
  studentId: string,
  trainerId: string,
  input: { month: string; amount?: number | null; notes?: string | null }
) {
  const student = await db.student.findFirst({ where: { id: studentId, trainerId }, select: { id: true } });
  if (!student) throw new Error("Alumno no encontrado");

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

export function getExerciseTemplates(trainerId: string) {
  return db.exerciseTemplate.findMany({
    where: { trainerId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export function getExerciseTemplateById(id: string, trainerId: string) {
  return db.exerciseTemplate.findFirst({ where: { id, trainerId } });
}

export function createExerciseTemplate(trainerId: string, input: ExerciseTemplateInput) {
  return db.exerciseTemplate.create({
    data: {
      trainerId,
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

export async function updateExerciseTemplate(id: string, trainerId: string, input: ExerciseTemplateInput) {
  const { count } = await db.exerciseTemplate.updateMany({
    where: { id, trainerId },
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
  if (count === 0) throw new Error("Ejercicio no encontrado");
}

export async function deleteExerciseTemplate(id: string, trainerId: string) {
  const { count } = await db.exerciseTemplate.deleteMany({ where: { id, trainerId } });
  if (count === 0) throw new Error("Ejercicio no encontrado");
}
