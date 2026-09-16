"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible; no hacemos nada silenciosamente.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="no-print rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-zinc-950 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
    >
      {copied ? "¡Copiado!" : "Copiar link del alumno"}
    </button>
  );
}
