import React, { useMemo, useState, useId } from 'react';
import { BenchSeriesPoint, shortTag, formatDate } from '../data/benchmark';

interface BenchmarkChartProps {
  title: string;
  points: BenchSeriesPoint[];
  formatValue: (v: number) => string;
  /** Tooltip subtitle, e.g. "kt" vs "kB" context. */
  hint?: string;
}

const W = 560;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 34, left: 46 };

/**
 * Lightweight dependency-free SVG area chart for benchmark series. Hovering a
 * point highlights it and pins a tooltip. Rounded coordinates keep the SVG
 * path string small for the ~31-point series in stats.json.
 */
export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ title, points, formatValue, hint }) => {
  const gradId = useId().replace(/[:]/g, '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { min, max, xs, ys, linePath, areaPath, ticks } = useMemo(() => {
    const values = points.map((p) => p.value);
    if (values.length === 0) {
      return { min: 0, max: 1, xs: [], ys: [], linePath: '', areaPath: '', ticks: [] as number[] };
    }
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    // Add 8% headroom so the max point isn't glued to the top edge.
    const span = max - min;
    min = min - span * 0.08;
    max = max + span * 0.08;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const xs = points.map((_, i) =>
      points.length === 1
        ? PAD.left + innerW / 2
        : PAD.left + (i / (points.length - 1)) * innerW,
    );
    const ys = points.map((v) => PAD.top + innerH - ((v.value - min) / (max - min)) * innerH);

    const coords = points.map((p, i) => `${xs[i].toFixed(1)},${ys[i].toFixed(1)}`);
    const linePath = `M ${coords.join(' L ')}`;
    const areaPath = `${linePath} L ${xs[xs.length - 1].toFixed(1)},${PAD.top + innerH} L ${xs[0].toFixed(1)},${PAD.top + innerH} Z`;

    const ticks = Array.from({ length: 5 }, (_, i) => {
      const t = i / 4;
      return min + (max - min) * t;
    });

    return { min, max, xs, ys, linePath, areaPath, ticks };
  }, [points]);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="rounded-xl border border-hairline-outline bg-surface-container overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1 border-b border-hairline-subtle">
        <span className="font-mono text-xs font-bold text-text-primary tracking-wide">{title}</span>
        {hovered ? (
          <span className="font-mono text-[11px] text-secondary">
            {shortTag(hovered.tag)} · {formatValue(hovered.value)}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-text-disabled">{points.length} releases</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={`${title} chart`}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines + y labels */}
        {ticks.map((t) => {
          const y = PAD.top + innerH - ((t - min) / (max - min)) * innerH;
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                className="stroke-hairline-subtle"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-text-disabled"
                fontSize="9"
                fontFamily="inherit"
              >
                {formatValue(t)}
              </text>
            </g>
          );
        })}

        {/* X axis labels: first, middle, last */}
        {points.length > 1 && (
          <>
            <text x={xs[0]} y={H - 14} textAnchor="middle" className="fill-text-disabled" fontSize="9">
              {shortTag(points[0].tag)}
            </text>
            <text
              x={xs[Math.floor((points.length - 1) / 2)]}
              y={H - 14}
              textAnchor="middle"
              className="fill-text-disabled"
              fontSize="9"
            >
              {shortTag(points[Math.floor((points.length - 1) / 2)].tag)}
            </text>
            <text x={xs[xs.length - 1]} y={H - 14} textAnchor="middle" className="fill-text-disabled" fontSize="9">
              {shortTag(points[points.length - 1].tag)}
            </text>
          </>
        )}

        {/* Area fill + line */}
        <path d={areaPath} fill={`url(#${gradId}-area)`} />
        <path
          d={linePath}
          fill="none"
          className="stroke-secondary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover dots */}
        {points.map((p, i) => {
          const cx = xs[i];
          const cy = ys[i];
          const isHover = hoverIdx === i;
          return (
            <g key={p.tag}>
              <circle
                cx={cx}
                cy={cy}
                r={isHover ? 5 : 3}
                className="fill-secondary"
                opacity={isHover ? 1 : 0.85}
              />
              {/* Fat invisible hit area */}
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
              />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="px-4 pb-2.5 font-mono text-[10px] text-text-muted">
          <span className="text-text-primary">{shortTag(hovered.tag)}</span>
          <span className="text-text-disabled"> · </span>
          {formatDate(hovered.date)}
          {hint && (
            <>
              <span className="text-text-disabled"> · </span>
              {hint}
            </>
          )}
          <span className="text-text-disabled"> · </span>
          <span className="text-secondary">{formatValue(hovered.value)}</span>
        </div>
      )}
    </div>
  );
};