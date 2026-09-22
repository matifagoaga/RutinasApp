import Link from "next/link";
import { LogOut, BookOpen } from "lucide-react";
import { getStudents, getTeams } from "@/lib/data";
import { StudentSidebar } from "@/components/StudentSidebar";
import { AtlasLogo } from "@/components/AtlasLogo";
import { logout } from "../login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [students, teams] = await Promise.all([getStudents(), getTeams()]);

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="no-print border-b border-line bg-ivory">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <AtlasLogo className="h-6 w-6 text-ink" />
            <span className="font-heading text-lg font-bold tracking-tight text-ink">Atlas</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/exercises"
              className="flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.75} />
              Biblioteca
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row">
        <StudentSidebar students={students} teams={teams} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
