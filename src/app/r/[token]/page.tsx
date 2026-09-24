import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Scale } from "lucide-react";
import { getActiveRoutine, getBodyMetrics, getRecentWorkoutLogs, getStudentByToken } from "@/lib/data";
import { formatDate, isSameDay } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";
import { Sparkline } from "@/components/Sparkline";
import { ExerciseTable } from "@/components/ExerciseTable";
import { AtlasLogo } from "@/components/AtlasLogo";
import { completeWorkoutAction, logBodyMetricPublicAction } from "./actions";

export default async function PublicRoutinePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const student = await getStudentByToken(token);
  if (!student || !student.active || !student.trainerId) notFound();
  const trainerId = student.trainerId;

  const [routine, workoutLogs, bodyMetrics] = await Promise.all([
    getActiveRoutine(student.id, trainerId),
    getRecentWorkoutLogs(student.id, trainerId, 10),
    getBodyMetrics(student.id, trainerId, 30),
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
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-6 sm:py-10">
      <div className="flex items-start justify-between gap-4 rounded-card-lg border border-line p-6">
        <div className="flex items-start gap-3">
          <AtlasLogo className="mt-1 h-6 w-6 shrink-0 text-ink" />
          <div>
            <p className="text-sm text-ink-muted">Rutina de</p>
            <h1 className="font-heading text-2xl font-semibold text-ink">{student.name}</h1>
          </div>
        </div>
        <PrintButton />
      </div>

      {!routine ? (
        <p className="mt-6 text-sm text-ink-muted">
          Todavía no tenés una rutina cargada. Consultá a tu entrenador.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          <p className="text-sm font-medium text-ink-muted">{routine.title}</p>
          {routine.days.map((day) => {
            const done = completedDayIdsToday.has(day.id);
            const showBlockLabel = day.blocks.length > 1;
            return (
              <div key={day.id} className="overflow-hidden rounded-card-lg border border-line">
                <div className="flex items-center gap-2 bg-ink px-4 py-3 text-ivory">
                  <h2 className="font-heading font-semibold">{day.label}</h2>
                </div>
                <div className="flex flex-col gap-4 p-4">
                  {day.blocks.map((block) => (
                    <div key={block.id}>
                      {showBlockLabel && (
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          {block.label}
                        </p>
                      )}
                      <ExerciseTable exercises={block.exercises} />
                    </div>
                  ))}
                  <form action={boundComplete} className="no-print flex flex-col gap-2">
                    <input type="hidden" name="routineDayId" value={day.id} />
                    {!done && (
                      <textarea
                        name="feeling"
                        rows={2}
                        placeholder="¿Cómo te sentiste? (opcional)"
                        className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
                      />
                    )}
                    <button
                      type="submit"
                      className={`flex w-full items-center justify-center gap-2 rounded-button px-3 py-2.5 text-sm font-semibold transition ${
                        done
                          ? "border border-line bg-ink/[0.04] text-ink-muted"
                          : "bg-accent text-ivory hover:bg-accent-hover"
                      }`}
                    >
                      {done && <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />}
                      {done ? "Marcado como completado hoy" : "Marcar como completado hoy"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="no-print mt-10 rounded-card-lg border border-line p-5">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
          <Scale className="h-5 w-5 text-ink-muted" strokeWidth={1.75} /> Tu peso corporal
        </h2>
        {sparklinePoints.length >= 2 && (
          <div className="mt-3">
            <Sparkline points={sparklinePoints} />
          </div>
        )}
        <form action={boundLogMetric} className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Peso (kg)
              <input
                type="number"
                step="0.1"
                name="weightKg"
                className="w-24 rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
              />
            </label>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Notas
              <input
                type="text"
                name="notes"
                className="w-full rounded-button border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-button bg-accent px-3 py-1.5 text-sm font-medium text-ivory hover:bg-accent-hover"
          >
            Registrar
          </button>
        </form>
      </section>

      <section className="no-print mt-8 rounded-card-lg border border-line p-5">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
          <CalendarDays className="h-5 w-5 text-ink-muted" strokeWidth={1.75} /> Tus últimos entrenamientos
        </h2>
        {workoutLogs.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Todavía no marcaste ningún entrenamiento.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-muted">
            {workoutLogs.map((log) => (
              <li key={log.id} className="rounded-button border border-line p-3">
                <div className="flex justify-between font-medium text-ink">
                  <span>{log.routineDay?.label ?? "Sesión libre"}</span>
                  <span>{formatDate(log.date)}</span>
                </div>
                {log.feeling && <p className="mt-1 text-xs text-ink-muted">{log.feeling}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
