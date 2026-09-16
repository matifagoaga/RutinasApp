export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;

  const width = 240;
  const height = 56;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);

  const coords = points.map((point, index) => {
    const x = index * step;
    const y = height - ((point - min) / range) * height;
    return { x, y };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;
  const gradientId = "sparkline-fill";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full max-w-xs text-indigo-600 dark:text-indigo-400">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} stroke="none" />
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
