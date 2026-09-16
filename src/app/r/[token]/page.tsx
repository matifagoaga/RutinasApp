import { notFound } from "next/navigation";
import { getActiveRoutine, getBodyMetrics, getRecentWorkoutLogs, getStudentByToken } from "@/lib/data";
import { formatDate, isSameDay } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";
import { Sparkline } from "@/components/Sparkline";
import { completeWorkoutAction, logBodyMetricPublicAction } from "./actions";

export default async function PublicRoutinePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const student = await getStudentByToken(token);
  if (!student || !student.active) notFound();

  const [routine, workoutLogs, bodyMetrics] = await Promise.all([
    getActiveRoutine(student.id),
    getRecentWorkoutLogs(student.id, 10),
    getBodyMetrics(student.id, 30),
  ]);

  const sparklinePoints = [...bodyMetrics]
    .reverse()
    .map((m) => m.weightKg)
    .filter((w): w is number => w != null);

  const today = new Date();
  const completedDayIdsToday = new Set(
    workoutLogs
      .filter((log) => log.routineDayId && isSameDay(log.date, today))
      .map((log) => log.routineDayId)
  );

  const boundComplete = completeWorkoutAction.bind(null, token);
  const boundLogMetric = logBodyMetricPublicAction.bind(null, token);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Rutina de</p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{student.name}</h1>
        </div>
        <PrintButton />
      </div>

      {!routine ? (
        <p className="mt-6 text-sm text-zinc-500">
          Todavía no tenés una rutina cargada. Consultá a tu entrenador.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          <p className="text-sm font-medium text-zinc-500">{routine.title}</p>
          {routine.days.map((day) => (
            <div
              key={day.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{day.label}</h2>
              <ul className="mt-2 flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                {day.exercises.map((exercise) => (
                  <li key={exercise.id} className="border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-900">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{exercise.name}</span>
                      <span>
                        {exercise.sets}x{exercise.reps}
                        {exercise.weight ? ` @ ${exercise.weight}` : ""}
                      </span>
                    </div>
                    {exercise.restSeconds != null && (
                      <p className="text-xs text-zinc-500">Descanso: {exercise.restSeconds}s</p>
                    )}
                    {exercise.notes && <p className="text-xs text-zinc-500">{exercise.notes}</p>}
                    {exercise.videoUrl && (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print text-xs text-blue-600 hover:underline"
                      >
                        Ver video
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <form action={boundComplete} className="no-print mt-3">
                <input type="hidden" name="routineDayId" value={day.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {completedDayIdsToday.has(day.id)
                    ? "Marcado como completado hoy ✓"
                    : "Marcar como completado hoy"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <section className="no-print mt-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tu peso corporal</h2>
        {sparklinePoints.length >= 2 && (
          <div className="mt-3 text-zinc-700 dark:text-zinc-200">
            <Sparkline points={sparklinePoints} />
          </div>
        )}
        <form action={boundLogMetric} className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-zinc-500">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              name="weightKg"
              className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="block text-xs text-zinc-500">Notas</label>
            <input
              type="text"
              name="notes"
              className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:border-zinc-500 dark:border-zinc-700"
          >
            Registrar
          </button>
        </form>
      </section>

      <section className="no-print mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tus últimos entrenamientos</h2>
        {workoutLogs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no marcaste ningún entrenamiento.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            {workoutLogs.map((log) => (
              <li key={log.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex justify-between font-medium text-zinc-900 dark:text-zinc-50">
                  <span>{log.routineDay?.label ?? "Sesión libre"}</span>
                  <span>{formatDate(log.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
