import Link from "next/link";
import { getStudents } from "@/lib/data";
import { StudentSidebar } from "@/components/StudentSidebar";
import { logout } from "../login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const students = await getStudents();

  return (
    <div className="min-h-screen">
      <header className="no-print bg-emerald-900 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-white">
            <span className="text-xl">🏋️</span>
            RutinasApp
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/exercises"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-100 hover:bg-white/10 hover:text-white"
            >
              📚 Biblioteca
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-100 hover:bg-white/10 hover:text-white"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
        <StudentSidebar students={students} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
