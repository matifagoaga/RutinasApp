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
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PrintButton } from "@/components/PrintButton";
import { Sparkline } from "@/components/Sparkline";
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
            ← Alumnos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{student.name}</h1>
          {(student.email || student.phone) && (
            <p className="text-sm text-zinc-500">
              {[student.email, student.phone].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={publicUrl} />
          <PrintButton />
          <Link
            href={`/admin/students/${id}/routine`}
            className="no-print rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {routine ? "Editar rutina" : "Crear rutina"}
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Rutina activa</h2>
        {!routine ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no tiene una rutina cargada.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            <p className="text-sm font-medium text-zinc-500">{routine.title}</p>
            {routine.days.map((day) => (
              <div
                key={day.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{day.label}</h3>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {day.exercises.map((ex) => (
                    <li key={ex.id}>
                      {ex.name} — {ex.sets}x{ex.reps}
                      {ex.weight ? ` @ ${ex.weight}` : ""}
                      {ex.restSeconds ? ` · descanso ${ex.restSeconds}s` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Peso corporal</h2>
          {sparklinePoints.length >= 2 && (
            <div className="mt-3 text-zinc-700 dark:text-zinc-200">
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
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Entrenamientos recientes</h2>
          {workoutLogs.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Todavía no registró ningún entrenamiento.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              {workoutLogs.map((log) => (
                <li key={log.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
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
