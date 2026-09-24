import Link from "next/link";
import { LogOut, BookOpen, LayoutTemplate } from "lucide-react";
import { requireTrainerSessionOrRedirect } from "@/lib/auth";
import { getStudents, getTeams } from "@/lib/data";
import { StudentSidebar } from "@/components/StudentSidebar";
import { AtlasLogo } from "@/components/AtlasLogo";
import { logout } from "../login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { trainerId } = await requireTrainerSessionOrRedirect();
  const [students, teams] = await Promise.all([getStudents(trainerId), getTeams(trainerId)]);

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="no-print border-b border-line bg-ivory">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <AtlasLogo className="h-6 w-6 text-ink" />
            <span className="font-heading text-lg font-bold tracking-tight text-ink">Atlas</span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/admin/exercises"
              aria-label="Biblioteca"
              className="flex items-center gap-1.5 rounded-button px-2 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink sm:gap-2 sm:px-3"
            >
              <BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden sm:inline">Biblioteca</span>
            </Link>
            <Link
              href="/admin/routine-templates"
              aria-label="Plantillas"
              className="flex items-center gap-1.5 rounded-button px-2 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink sm:gap-2 sm:px-3"
            >
              <LayoutTemplate className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden sm:inline">Plantillas</span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Salir"
                className="flex items-center gap-1.5 rounded-button px-2 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink sm:gap-2 sm:px-3"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row">
        <StudentSidebar students={students} teams={teams} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
