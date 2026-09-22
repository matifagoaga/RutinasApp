"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Descargar PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 rounded-button border border-line px-3 py-2 text-sm font-medium text-ink hover:border-ink/30 hover:bg-ink/[0.03]"
    >
      <Printer className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}
