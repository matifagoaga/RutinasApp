import Link from "next/link";
import { getStudents } from "@/lib/data";
import { getDayPalette } from "@/lib/dayColors";
import { createStudentAction } from "./students/actions";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function AdminDashboard() {
  const students = await getStudents();

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Alumnos
        </h1>

        {students.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            Todavía no cargaste ningún alumno. Agregá el primero abajo.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {students.map((student, index) => {
              const palette = getDayPalette(index);
              return (
                <li key={student.id}>
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${palette.badge}`}
                    >
                      {getInitials(student.name)}
                    </span>
                    <span className="flex-1 font-medium text-zinc-900 dark:text-zinc-50">
                      {student.name}
                    </span>
                    {(student.email || student.phone) && (
                      <span className="text-zinc-500">
                        {student.email || student.phone}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-violet-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>➕</span> Agregar alumno
        </h2>
        <form action={createStudentAction} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              name="email"
              placeholder="Email (opcional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (opcional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-900"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-500 hover:to-violet-500"
          >
            Agregar alumno
          </button>
        </form>
      </section>
    </div>
  );
}
