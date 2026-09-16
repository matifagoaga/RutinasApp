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
      className="no-print rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-700 shadow-sm hover:border-violet-400 hover:bg-violet-50 dark:border-violet-900 dark:bg-zinc-950 dark:text-violet-300 dark:hover:bg-violet-500/10"
    >
      {copied ? "¡Copiado!" : "Copiar link del alumno"}
    </button>
  );
}
