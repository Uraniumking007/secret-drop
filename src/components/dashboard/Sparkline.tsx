interface SparklineProps {
  points: number[]; // values over time, oldest -> newest
  width?: number;
  height?: number;
}

export function Sparkline({ points, width = 80, height = 24 }: SparklineProps) {
  if (!points || points.length === 0) {
    return (
      <svg width={width} height={height} aria-hidden>
        <rect
          width={width}
          height={height}
          rx="4"
          fill="currentColor"
          className="text-muted/30"
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const stepX = width / Math.max(1, points.length - 1);

  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / range) * (height - 2) - 1; // padding
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary/70"
      />
      {/* baseline */}
      <line
        x1="0"
        y1={height - 1}
        x2={width}
        y2={height - 1}
        stroke="currentColor"
        strokeWidth="1"
        className="text-muted/30"
      />
    </svg>
  );
}
