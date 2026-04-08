"use client";

import { C } from "@/lib/colors";

interface BudgetSlice {
  label: string;
  value: number;
  color: string;
}

interface BudgetChartProps {
  items: { category: string; estimated: number; actual?: number | null }[];
  total: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  lieu: "#C4532A",
  traiteur: "#D4733A",
  photo: "#A03820",
  musique: "#E08050",
  déco: "#B84830",
  deco: "#B84830",
  fleurs: "#CC6040",
  robe: "#F09060",
  autre: "#8C6A5A",
};

function getCategoryColor(cat: string): string {
  const key = cat.toLowerCase().trim();
  return CATEGORY_COLORS[key] ?? "#8C6A5A";
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function BudgetChart({ items, total }: BudgetChartProps) {
  // Group by category
  const grouped: Record<string, number> = {};
  for (const item of items) {
    const cat = item.category || "autre";
    grouped[cat] = (grouped[cat] ?? 0) + (item.actual ?? item.estimated);
  }

  const spent = Object.values(grouped).reduce((s, v) => s + v, 0);
  const slices: BudgetSlice[] = Object.entries(grouped).map(([label, value]) => ({
    label,
    value,
    color: getCategoryColor(label),
  }));

  const cx = 80;
  const cy = 80;
  const outerR = 65;
  const innerR = 42;
  const size = 160;

  let currentAngle = 0;
  const paths: { d: string; color: string; label: string; value: number }[] = [];

  if (spent > 0) {
    for (const slice of slices) {
      const angle = (slice.value / spent) * 360;
      const endAngle = currentAngle + angle;

      const outerStart = polarToCartesian(cx, cy, outerR, currentAngle);
      const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
      const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
      const innerEnd = polarToCartesian(cx, cy, innerR, currentAngle);
      const largeArc = angle > 180 ? "1" : "0";

      const d =
        `M ${outerStart.x} ${outerStart.y} ` +
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} ` +
        `L ${innerStart.x} ${innerStart.y} ` +
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} ` +
        `Z`;

      paths.push({ d, color: slice.color, label: slice.label, value: slice.value });
      currentAngle = endAngle;
    }
  }

  const pct = total > 0 ? Math.round((spent / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      {/* Donut SVG */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths.length === 0 ? (
            <circle
              cx={cx}
              cy={cy}
              r={outerR}
              fill="none"
              stroke="var(--momento-anthracite)"
              strokeWidth={outerR - innerR}
            />
          ) : (
            paths.map((p, i) => (
              <path key={i} d={p.d} fill={p.color} opacity={0.9} />
            ))
          )}
          {/* Center text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill={C.terra}
          >
            {pct}%
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fontSize="9"
            fill="var(--momento-mist)"
          >
            dépensé
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.slice(0, 6).map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span
              className="text-xs capitalize truncate flex-1"
              style={{ color: "var(--momento-mist)" }}
            >
              {s.label}
            </span>
            <span
              className="text-xs font-medium flex-shrink-0"
              style={{ color: "var(--momento-white)" }}
            >
              {s.value.toLocaleString("fr-FR")} €
            </span>
          </div>
        ))}
        {slices.length === 0 && (
          <p className="text-xs" style={{ color: "var(--momento-mist)" }}>
            Aucune dépense enregistrée
          </p>
        )}
      </div>
    </div>
  );
}
