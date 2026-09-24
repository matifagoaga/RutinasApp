import Link from "next/link";
import { AlertTriangle, CalendarDays, Plus } from "lucide-react";
import { requireTrainerSession } from "@/lib/auth";
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
  const { trainerId } = await requireTrainerSession();
  const [stats, attention, activity] = await Promise.all([
    getDashboardStats(trainerId),
    getStudentsNeedingAttention(trainerId),
    getRecentActivity(trainerId, 10),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Panel de inicio</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Resumen general. Elegí un alumno de la izquierda para ver el detalle.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line p-6">
          <p className="text-sm text-ink-muted">Alumnos activos</p>
          <p className="mt-2 font-heading text-3xl font-bold text-ink">{stats.totalStudents}</p>
        </div>
        <div className="rounded-card border border-line p-6">
          <p className="text-sm text-ink-muted">Entrenamientos hoy</p>
          <p className="mt-2 font-heading text-3xl font-bold text-ink">{stats.workoutsToday}</p>
        </div>
        <div className="rounded-card border border-line p-6">
          <p className="text-sm text-ink-muted">Entrenamientos esta semana</p>
          <p className="mt-2 font-heading text-3xl font-bold text-ink">{stats.workoutsThisWeek}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-card border border-line p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
            <AlertTriangle className="h-4.5 w-4.5 text-accent" strokeWidth={1.75} />
            Necesitan atención
          </h2>
          {attention.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Todos tus alumnos están al día.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {attention.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="flex items-center justify-between rounded-button border border-accent/25 bg-accent-tint px-3 py-2.5 hover:border-accent/50"
                  >
                    <span className="font-medium text-ink">{student.name}</span>
                    <span className="text-xs text-accent">{student.reason}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-card border border-line p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
            <CalendarDays className="h-4.5 w-4.5 text-ink-muted" strokeWidth={1.75} />
            Actividad reciente
          </h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Todavía no hay entrenamientos registrados.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {activity.map((log) => (
                <li key={log.id}>
                  <Link
                    href={`/admin/students/${log.studentId}`}
                    className="flex items-center justify-between rounded-button border border-line px-3 py-2.5 hover:border-ink/20"
                  >
                    <span className="font-medium text-ink">{log.student.name}</span>
                    <span className="text-right text-xs text-ink-muted">
                      {log.routineDay?.label ?? "Sesión libre"} · {formatDate(log.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="max-w-lg rounded-card border border-line p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
          <Plus className="h-4.5 w-4.5 text-ink-muted" strokeWidth={1.75} />
          Agregar alumno
        </h2>
        <form action={createStudentAction} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre y apellido"
            className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              name="email"
              placeholder="Email (opcional)"
              className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-button border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-tint"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-button bg-accent px-4 py-2 text-sm font-medium text-ivory hover:bg-accent-hover"
          >
            Agregar alumno
          </button>
        </form>
      </section>
    </div>
  );
}
