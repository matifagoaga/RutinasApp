"use client";

import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

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
      className="no-print flex items-center gap-2 rounded-button border border-line px-3 py-2 text-sm font-medium text-ink hover:border-ink/30 hover:bg-ink/[0.03]"
    >
      {copied ? <Check className="h-4 w-4" strokeWidth={1.75} /> : <LinkIcon className="h-4 w-4" strokeWidth={1.75} />}
      {copied ? "¡Copiado!" : "Copiar link del alumno"}
    </button>
  );
}
