import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type ItemChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ItemChartDatum = {
  label: string;
  value: number;
  tone?: ItemChartTone;
};

export type ItemChartSeat = {
  x: number;
  y: number;
  r: number;
  tone: ItemChartTone;
  groupIndex: number;
};

export type ItemChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ItemChartDatum[];
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const TONES: ItemChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export function seatCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

/**
 * Construit la liste ordonnée des sièges de l'hémicycle, puis affecte chaque
 * siège à un groupe dans l'ordre fourni (blocs contigus). Pur, sans état.
 */
export function buildSeats(
  counts: number[],
  width: number,
  height: number,
): { seats: ItemChartSeat[]; cx: number; cy: number } {
  const total = counts.reduce((sum, c) => sum + c, 0);
  const cx = width / 2;
  const cy = height - 8;
  if (total <= 0) return { seats: [], cx, cy };

  const rows = Math.max(1, Math.min(5, Math.round(Math.sqrt(total / 12)) || 1));
  const outerR = Math.max(Math.min(cx, cy) - 14, 1);
  const innerR = outerR * 0.42;
  const rowGap = rows > 1 ? (outerR - innerR) / (rows - 1) : 0;

  // Poids de chaque rangée ∝ son rayon (rangées extérieures = plus de sièges).
  const radii: number[] = [];
  let weightSum = 0;
  for (let r = 0; r < rows; r++) {
    const radius = rows > 1 ? innerR + rowGap * r : (innerR + outerR) / 2;
    radii.push(radius);
    weightSum += radius;
  }

  // Répartit `total` sièges sur les rangées au prorata du rayon (reste au plus
  // grand résidu) pour conserver exactement `total` sièges.
  const perRowFloat = radii.map((radius) => (total * radius) / weightSum);
  const perRow = perRowFloat.map((v) => Math.floor(v));
  let assigned = perRow.reduce((sum, c) => sum + c, 0);
  const residuals = perRowFloat
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  let ri = 0;
  while (assigned < total) {
    perRow[residuals[ri % residuals.length].i] += 1;
    assigned += 1;
    ri += 1;
  }

  // Rayon du point ≈ moitié de l'espacement de rangée, borné par l'arc.
  const seatR = Math.max(2, Math.min(rowGap > 0 ? rowGap * 0.34 : outerR * 0.12, outerR * 0.12));

  const ordered: { x: number; y: number; r: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const radius = radii[r];
    const n = perRow[r];
    if (n <= 0) continue;
    // Demi-cercle de la GAUCHE (π) vers la DROITE (0) en passant par le HAUT.
    for (let s = 0; s < n; s++) {
      const t = n === 1 ? 0.5 : s / (n - 1);
      const angle = Math.PI - t * Math.PI;
      ordered.push({
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle),
        r: seatR,
      });
    }
  }

  // Attribution des sièges ordonnés aux groupes (blocs contigus).
  const seats: ItemChartSeat[] = [];
  let cursor = 0;
  for (let g = 0; g < counts.length; g++) {
    const tone = TONES[g % TONES.length];
    for (let k = 0; k < counts[g] && cursor < ordered.length; k++) {
      const seat = ordered[cursor++];
      seats.push({ x: seat.x, y: seat.y, r: seat.r, tone, groupIndex: g });
    }
  }
  return { seats, cx, cy };
}

export function ItemChart({
  data,
  width = 480,
  height = 280,
  label,
  className,
  ...rest
}: ItemChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const groups = data.map((datum, index) => ({
    datum,
    count: seatCount(datum.value),
    tone: datum.tone ?? TONES[index % TONES.length],
  }));

  const layout = buildSeats(
    groups.map((g) => g.count),
    width,
    height,
  );

  // Sièges avec le ton EFFECTIF du groupe (respecte un `tone` explicite).
  const seats = layout.seats.map((seat) => ({
    ...seat,
    tone: groups[seat.groupIndex]?.tone ?? seat.tone,
  }));

  const dataValueItems = groups.map((g) => `${g.datum.label}: ${g.count}`);
  const total = groups.reduce((sum, g) => sum + g.count, 0);

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? groups[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-itemChart", className)}>
      <div
        className="st-itemChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {seats.map((seat, i) => (
            <circle
              key={`seat-${i}`}
              className={classNames(
                "st-itemChart__seat",
                `st-itemChart__seat--${seat.tone}`,
                hoveredIndex !== null && hoveredIndex !== seat.groupIndex ? "st-itemChart__seat--dim" : undefined,
              )}
              cx={seat.x}
              cy={seat.y}
              r={seat.r}
              data-chart-index={seat.groupIndex}
            />
          ))}
          {total > 0 ? (
            <text className="st-itemChart__total" x={layout.cx} y={layout.cy - 6} textAnchor="middle">
              {total}
            </text>
          ) : null}
        </svg>
      </div>

      <ul className="st-itemChart__legend" aria-hidden="true">
        {groups.map((group, i) => (
          <li
            key={group.datum.label}
            className={classNames(
              "st-itemChart__legendItem",
              hoveredIndex !== null && hoveredIndex !== i ? "st-itemChart__legendItem--dim" : undefined,
            )}
          >
            <span className={classNames("st-itemChart__swatch", `st-itemChart__swatch--${group.tone}`)} />
            <span className="st-itemChart__legendLabel">{group.datum.label}</span>
            <span className="st-itemChart__legendValue">{group.count}</span>
          </li>
        ))}
      </ul>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div className="st-itemChart__tooltip" role="presentation">
          <span className="st-itemChart__tooltipLabel">{hovered.datum.label}</span>
          <span className="st-itemChart__tooltipValue">{hovered.count}</span>
        </div>
      ) : null}
    </div>
  );
}
