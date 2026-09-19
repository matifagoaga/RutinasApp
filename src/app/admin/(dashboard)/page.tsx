import Link from "next/link";
import {
  getDashboardStats,
  getRecentActivity,
  getStudentsNeedingAttention,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import { createStudentAction } from "./students/actions";

// Las estadísticas cambian todo el tiempo (alumnos, entrenamientos del día);
// sin esto Next.js la generaría estática en el build y quedaría congelada.
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, attention, activity] = await Promise.all([
    getDashboardStats(),
    getStudentsNeedingAttention(),
    getRecentActivity(10),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Panel de inicio</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Resumen general. Elegí un alumno de la izquierda para ver el detalle.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Alumnos activos</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-800 dark:text-emerald-400">
            {stats.totalStudents}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Entrenamientos hoy</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-800 dark:text-emerald-400">
            {stats.workoutsToday}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Entrenamientos esta semana</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-800 dark:text-emerald-400">
            {stats.workoutsThisWeek}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm dark:border-amber-950 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <span>⚠️</span> Necesitan atención
          </h2>
          {attention.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Todos tus alumnos están al día. 👏</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {attention.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 hover:border-amber-300 dark:border-amber-950 dark:bg-amber-500/5"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{student.name}</span>
                    <span className="text-xs text-amber-700 dark:text-amber-400">{student.reason}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <span>📅</span> Actividad reciente
          </h2>
          {activity.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Todavía no hay entrenamientos registrados.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              {activity.map((log) => (
                <li key={log.id}>
                  <Link
                    href={`/admin/students/${log.studentId}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{log.student.name}</span>
                    <span className="text-right text-xs text-zinc-500">
                      {log.routineDay?.label ?? "Sesión libre"} · {formatDate(log.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>➕</span> Agregar alumno
        </h2>
        <form action={createStudentAction} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              name="email"
              placeholder="Email (opcional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Agregar alumno
          </button>
        </form>
      </section>
    </div>
  );
}
