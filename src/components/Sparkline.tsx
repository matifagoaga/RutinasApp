export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;

  const width = 240;
  const height = 56;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);

  const linePoints = points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full max-w-xs text-accent">
      <polyline
        points={linePoints}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
