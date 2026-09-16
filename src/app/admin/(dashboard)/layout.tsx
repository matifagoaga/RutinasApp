import Link from "next/link";
import { logout } from "../login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="no-print bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-white">
            <span className="text-xl">🏋️</span>
            RutinasApp
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-100 hover:bg-white/10 hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
