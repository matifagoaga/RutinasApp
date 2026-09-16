"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StudentSidebar({
  students,
}: {
  students: { id: string; name: string; email: string | null; phone: string | null }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-1 md:w-64 md:shrink-0">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Alumnos</span>
        <Link
          href="/admin"
          className="text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
        >
          + Nuevo
        </Link>
      </div>

      {students.length === 0 ? (
        <p className="px-1 text-sm text-zinc-500">Todavía no cargaste alumnos.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {students.map((student) => {
            const isActive = pathname?.includes(`/admin/students/${student.id}`);
            return (
              <li key={student.id}>
                <Link
                  href={`/admin/students/${student.id}`}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-zinc-700 hover:bg-emerald-50 dark:text-zinc-300 dark:hover:bg-emerald-500/10"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                  >
                    {getInitials(student.name)}
                  </span>
                  <span className="truncate">{student.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
