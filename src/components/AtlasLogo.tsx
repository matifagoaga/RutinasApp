/**
 * Isotipo de Atlas — placeholder construido a partir de la descripción
 * (dos trazos que forman una "A" sin travesaño, rematados por un círculo
 * arriba) hasta reemplazarlo por el archivo definitivo. Usa currentColor,
 * así que el color se controla desde afuera con className="text-...".
 */
export function AtlasLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="7" r="4" fill="currentColor" />
      <path d="M10 40 L24 15" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M38 40 L24 15" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
