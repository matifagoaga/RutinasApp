import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getActiveRoutine,
  getBodyMetrics,
  getRecentWorkoutLogs,
  getStudentById,
} from "@/lib/data";
import { getBaseUrl } from "@/lib/url";
import { formatDate } from "@/lib/format";
import { getDayPalette } from "@/lib/dayColors";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PrintButton } from "@/components/PrintButton";
import { Sparkline } from "@/components/Sparkline";
import { ExerciseTable } from "@/components/ExerciseTable";
import { logBodyMetricAction } from "./actions";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const [routine, workoutLogs, bodyMetrics, baseUrl] = await Promise.all([
    getActiveRoutine(id),
    getRecentWorkoutLogs(id, 10),
    getBodyMetrics(id, 30),
    getBaseUrl(),
  ]);

  const publicUrl = `${baseUrl}/r/${student.token}`;
  const sparklinePoints = [...bodyMetrics]
    .reverse()
    .map((m) => m.weightKg)
    .filter((w): w is number => w != null);

  const boundLogMetric = logBodyMetricAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-md">
        <div>
          <Link href="/admin" className="no-print text-sm text-indigo-100 hover:text-white">
            ← Alumnos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{student.name}</h1>
          {(student.email || student.phone) && (
            <p className="text-sm text-indigo-100">
              {[student.email, student.phone].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={publicUrl} />
          <PrintButton />
          <Link
            href={`/admin/students/${id}/routine`}
            className="no-print rounded-lg bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            {routine ? "Editar rutina" : "Crear rutina"}
          </Link>
        </div>
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>🏋️</span> Rutina activa
        </h2>
        {!routine ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no tiene una rutina cargada.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-5">
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{routine.title}</p>
            {routine.days.map((day, index) => {
              const palette = getDayPalette(index);
              return (
                <div
                  key={day.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-zinc-950 ${palette.border}`}
                >
                  <div className={`flex items-center gap-2 px-4 py-3 ${palette.header}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${palette.badge}`} />
                    <h3 className="font-semibold">{day.label}</h3>
                  </div>
                  <div className="p-4">
                    <ExerciseTable exercises={day.exercises} headerClass={palette.header} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <span>⚖️</span> Peso corporal
          </h2>
          {sparklinePoints.length >= 2 && (
            <div className="mt-3">
              <Sparkline points={sparklinePoints} />
            </div>
          )}
          {bodyMetrics.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Todavía no hay registros.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
              {bodyMetrics.slice(0, 8).map((m) => (
                <li key={m.id} className="flex justify-between gap-2">
                  <span>{formatDate(m.date)}</span>
                  <span className="text-right">
                    {m.weightKg != null ? `${m.weightKg} kg` : "—"}
                    {m.notes ? ` · ${m.notes}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={boundLogMetric} className="no-print mt-4 flex flex-wrap items-end gap-2">
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
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm dark:border-sky-950 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <span>📅</span> Entrenamientos recientes
          </h2>
          {workoutLogs.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Todavía no registró ningún entrenamiento.</p>
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
                  {log.feeling && <p className="mt-1 text-xs text-zinc-500">Sensación: {log.feeling}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
