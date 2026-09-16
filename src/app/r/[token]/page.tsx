import { notFound } from "next/navigation";
import { getActiveRoutine, getBodyMetrics, getRecentWorkoutLogs, getStudentByToken } from "@/lib/data";
import { formatDate, isSameDay } from "@/lib/format";
import { getDayPalette } from "@/lib/dayColors";
import { PrintButton } from "@/components/PrintButton";
import { Sparkline } from "@/components/Sparkline";
import { ExerciseTable } from "@/components/ExerciseTable";
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="flex items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-md">
        <div>
          <p className="text-sm text-indigo-100">Rutina de</p>
          <h1 className="text-2xl font-semibold">{student.name}</h1>
        </div>
        <PrintButton />
      </div>

      {!routine ? (
        <p className="mt-6 text-sm text-zinc-500">
          Todavía no tenés una rutina cargada. Consultá a tu entrenador.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{routine.title}</p>
          {routine.days.map((day, index) => {
            const palette = getDayPalette(index);
            const done = completedDayIdsToday.has(day.id);
            return (
              <div
                key={day.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-zinc-950 ${palette.border}`}
              >
                <div className={`flex items-center gap-2 px-4 py-3 ${palette.header}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${palette.badge}`} />
                  <h2 className="font-semibold">{day.label}</h2>
                </div>
                <div className="p-4">
                  <ExerciseTable exercises={day.exercises} headerClass={palette.header} />
                  <form action={boundComplete} className="no-print mt-4">
                    <input type="hidden" name="routineDayId" value={day.id} />
                    <button
                      type="submit"
                      className={`w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                        done
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                      }`}
                    >
                      {done ? "Marcado como completado hoy ✓" : "Marcar como completado hoy"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="no-print mt-10 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>⚖️</span> Tu peso corporal
        </h2>
        {sparklinePoints.length >= 2 && (
          <div className="mt-3">
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
              className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="block text-xs text-zinc-500">Notas</label>
            <input
              type="text"
              name="notes"
              className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Registrar
          </button>
        </form>
      </section>

      <section className="no-print mt-8 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm dark:border-sky-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>📅</span> Tus últimos entrenamientos
        </h2>
        {workoutLogs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no marcaste ningún entrenamiento.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            {workoutLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-950 dark:bg-sky-500/5"
              >
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
