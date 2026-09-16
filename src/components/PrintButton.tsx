"use client";

export function PrintButton({ label = "Descargar PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-zinc-950 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
    >
      {label}
    </button>
  );
}
