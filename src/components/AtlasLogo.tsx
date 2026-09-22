/**
 * Isotipo de Atlas: dos trazos que forman una "A" sin travesaño,
 * rematados por un círculo que cubre el vértice. Usa currentColor, así
 * que el color se controla desde afuera con className="text-...".
 */
export function AtlasLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="10" r="6" fill="currentColor" />
      <path d="M24 11 L9 44" stroke="currentColor" strokeWidth="5.4" strokeLinecap="round" />
      <path d="M24 11 L39 44" stroke="currentColor" strokeWidth="5.4" strokeLinecap="round" />
    </svg>
  );
}
