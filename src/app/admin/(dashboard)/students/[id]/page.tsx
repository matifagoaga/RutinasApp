import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getActiveRoutine,
  getBodyMetrics,
  getPayments,
  getRecentWorkoutLogs,
  getStudentById,
} from "@/lib/data";
import { getBaseUrl } from "@/lib/url";
import { formatDate, formatMonthLabel, getCurrentMonthKey } from "@/lib/format";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PrintButton } from "@/components/PrintButton";
import { Sparkline } from "@/components/Sparkline";
import { ExerciseTable } from "@/components/ExerciseTable";
import { DeleteStudentButton } from "@/components/DeleteStudentButton";
import { AttentionFlag } from "@/components/AttentionFlag";
import {
  clearAttentionNoteAction,
  deleteStudentAction,
  logBodyMetricAction,
  registerPaymentAction,
  setAttentionNoteAction,
} from "./actions";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const [routine, workoutLogs, bodyMetrics, payments, baseUrl] = await Promise.all([
    getActiveRoutine(id),
    getRecentWorkoutLogs(id, 10),
    getBodyMetrics(id, 30),
    getPayments(id, 12),
    getBaseUrl(),
  ]);

  const publicUrl = `${baseUrl}/r/${student.token}`;
  const sparklinePoints = [...bodyMetrics]
    .reverse()
    .map((m) => m.weightKg)
    .filter((w): w is number => w != null);

  const currentMonth = getCurrentMonthKey();
  const paidCurrentMonth = payments.some((p) => p.month === currentMonth);

  const boundLogMetric = logBodyMetricAction.bind(null, id);
  const boundRegisterPayment = registerPaymentAction.bind(null, id);
  const boundDelete = deleteStudentAction.bind(null, id);
  const boundSetAttention = setAttentionNoteAction.bind(null, id);
  const boundClearAttention = clearAttentionNoteAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-emerald-100 pb-5 dark:border-emerald-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{student.name}</h1>
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
              className="no-print rounded-lg bg-emerald-800 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              {routine ? "Editar rutina" : "Crear rutina"}
            </Link>
            <DeleteStudentButton studentName={student.name} onDelete={boundDelete} />
          </div>
        </div>
        <AttentionFlag
          initialNote={student.attentionNote}
          onSetNote={boundSetAttention}
          onClear={boundClearAttention}
        />
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>🏋️</span> Rutina activa
        </h2>
        {!routine ? (
          <p className="mt-2 text-sm text-zinc-500">Todavía no tiene una rutina cargada.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-5">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{routine.title}</p>
            {routine.days.map((day) => {
              const showBlockLabel = day.blocks.length > 1;
              return (
                <div
                  key={day.id}
                  className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-950 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-2 bg-emerald-900 px-4 py-3 text-white">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    <h3 className="font-semibold">{day.label}</h3>
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    {day.blocks.map((block) => (
                      <div key={block.id}>
                        {showBlockLabel && (
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                            {block.label}
                          </p>
                        )}
                        <ExerciseTable exercises={block.exercises} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              <span>💳</span> Pagos
            </h2>
            <span
              className={`no-print rounded-full px-2.5 py-1 text-xs font-semibold ${
                paidCurrentMonth
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
              }`}
            >
              {paidCurrentMonth ? "Al día" : "Pendiente"} · {formatMonthLabel(currentMonth)}
            </span>
          </div>
          {payments.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Todavía no hay pagos registrados.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
              {payments.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span>{formatMonthLabel(p.month)}</span>
                  <span className="text-right">
                    {p.amount != null ? `$${p.amount}` : ""}
                    {p.notes ? ` · ${p.notes}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={boundRegisterPayment} className="no-print mt-4 flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs text-zinc-500">Mes</label>
              <input
                type="month"
                name="month"
                defaultValue={currentMonth}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">Monto</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                placeholder="Opcional"
                className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Registrar pago
            </button>
          </form>
        </div>

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
                className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="block text-xs text-zinc-500">Notas</label>
              <input
                type="text"
                name="notes"
                className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Registrar
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
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
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
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
