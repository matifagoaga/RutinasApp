"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

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
    <nav className="flex w-full flex-col gap-2 md:w-64 md:shrink-0">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Alumnos
        </span>
        <Link
          href="/admin"
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nuevo
        </Link>
      </div>

      {students.length === 0 ? (
        <p className="px-1 text-sm text-ink-muted">Todavía no cargaste alumnos.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {students.map((student) => {
            const isActive = pathname?.includes(`/admin/students/${student.id}`);
            return (
              <li key={student.id}>
                <Link
                  href={`/admin/students/${student.id}`}
                  className={`flex items-center gap-3 rounded-button px-2.5 py-2 text-sm transition ${
                    isActive ? "bg-ink text-ivory" : "text-ink hover:bg-ink/[0.04]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive ? "bg-ivory/15 text-ivory" : "bg-ink/[0.06] text-ink"
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
