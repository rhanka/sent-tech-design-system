import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WindBarbChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type WindBarbChartDatum = {
  /** Position sur l'axe temporel (timestamp ou index). */
  at: number;
  /** Vitesse du vent en nœuds (≥ 0) : pilote les barbules et la couleur. */
  speed: number;
  /** Direction (d'où vient le vent) en DEGRÉS (0° = Nord). */
  direction: number;
};

export type WindBarbChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: WindBarbChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 24 } as const;

const TONES: WindBarbChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

// Décompose une vitesse (kt) en barbules météo : fanions (50), pleines (10),
// demi (5). On arrondit au plus proche multiple de 5 (convention standard).
function barbCounts(speed: number): { flags: number; full: number; half: number } {
  let rounded = Math.round(speed / 5) * 5;
  if (rounded < 0) rounded = 0;
  const flags = Math.floor(rounded / 50);
  rounded -= flags * 50;
  const full = Math.floor(rounded / 10);
  rounded -= full * 10;
  const half = Math.floor(rounded / 5);
  return { flags, full, half };
}

type BarbTick = { x1: number; y1: number; x2: number; y2: number; kind: "full" | "half" | "flag1" | "flag2" };

export function WindBarbChart({
  data,
  label,
  width = 640,
  height = 160,
  size = 32,
  className,
  ...rest
}: WindBarbChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  // Points valides : position finie, vitesse finie ≥ 0, direction finie.
  const validData = data.filter(
    (d) =>
      d &&
      Number.isFinite(d.at) &&
      Number.isFinite(d.speed) &&
      d.speed >= 0 &&
      Number.isFinite(d.direction),
  );

  const ats = validData.map((d) => d.at);
  const xTicks = niceTicks(Math.min(...ats), Math.max(...ats));
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];

  const maxSpeed = validData.reduce((max, d) => (d.speed > max ? d.speed : max), 0);

  // Ligne de base des barbes : centrée verticalement dans la zone de tracé.
  const baseY = MARGIN.top + (height - MARGIN.top - MARGIN.bottom) / 2;

  // Une barbe par point : hampe orientée + barbules le long de la hampe.
  const barbs = validData.map((d, i) => {
    const cx = MARGIN.left + scaleLinear(d.at, xMin, xMax, 0, plotW);
    const cy = baseY;
    const max = maxSpeed > 0 ? maxSpeed : 1;
    // Direction météo : 0° = Nord (vers le haut). Angle écran (Y descend) : haut = -90°.
    const rad = ((d.direction - 90) * Math.PI) / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    const tipX = cx + ux * size;
    const tipY = cy + uy * size;
    // Vecteur perpendiculaire (côté barbules, à droite de la hampe).
    const px = -uy;
    const py = ux;
    const { flags, full, half } = barbCounts(d.speed);
    const barbLen = size * 0.42;
    const halfLen = barbLen * 0.55;
    const spacing = size * 0.16;
    const ticks: BarbTick[] = [];
    let along = size - spacing;
    for (let f = 0; f < flags; f++) {
      const aX = cx + ux * along;
      const aY = cy + uy * along;
      const bAlong = along - spacing;
      const bX = cx + ux * bAlong;
      const bY = cy + uy * bAlong;
      const tipFX = aX + px * barbLen;
      const tipFY = aY + py * barbLen;
      ticks.push({ x1: aX, y1: aY, x2: tipFX, y2: tipFY, kind: "flag1" });
      ticks.push({ x1: bX, y1: bY, x2: tipFX, y2: tipFY, kind: "flag2" });
      along = bAlong - spacing;
    }
    for (let f = 0; f < full; f++) {
      const aX = cx + ux * along;
      const aY = cy + uy * along;
      ticks.push({ x1: aX, y1: aY, x2: aX + px * barbLen, y2: aY + py * barbLen, kind: "full" });
      along -= spacing;
    }
    for (let h = 0; h < half; h++) {
      const aX = cx + ux * along;
      const aY = cy + uy * along;
      ticks.push({ x1: aX, y1: aY, x2: aX + px * halfLen, y2: aY + py * halfLen, kind: "half" });
      along -= spacing;
    }
    const bin = Math.min(Math.floor((d.speed / max) * TONES.length), TONES.length - 1);
    return {
      key: `${i}`,
      datum: d,
      cx,
      cy,
      tipX,
      tipY,
      ticks,
      tone: TONES[Math.max(0, bin)],
    };
  });

  const dataValueItems = validData.map(
    (d) => `${formatTick(d.at)} · ${formatTick(d.speed)} kt @ ${formatTick(d.direction)}°`,
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredBarb = hoveredKey === null ? null : barbs.find((b) => b.key === hoveredKey) ?? null;

  return (
    <div {...rest} className={classNames("st-windBarbChart", className)}>
      <div
        className="st-windBarbChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {xTicks.map((t) => {
            const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
            return (
              <text key={`x${t}`} className="st-windBarbChart__tick" x={x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {formatTick(t)}
              </text>
            );
          })}

          <line
            className="st-windBarbChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {barbs.map((b) => (
            <g
              key={b.key}
              className={classNames(
                "st-windBarbChart__barb",
                `st-windBarbChart__barb--${b.tone}`,
                hoveredKey !== null && hoveredKey !== b.key ? "st-windBarbChart__barb--dim" : undefined,
              )}
            >
              <line className="st-windBarbChart__shaft" x1={b.cx} y1={b.cy} x2={b.tipX} y2={b.tipY} data-chart-key={b.key} />
              {b.ticks.map((tk, ti) => (
                <line
                  key={ti}
                  className={classNames("st-windBarbChart__feather", `st-windBarbChart__feather--${tk.kind}`)}
                  x1={tk.x1}
                  y1={tk.y1}
                  x2={tk.x2}
                  y2={tk.y2}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <ChartDataList label={label ?? "wind barb"} items={dataValueItems} />

      {hoveredBarb ? (
        <div
          className="st-windBarbChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredBarb.cx / width) * 100}%`, top: `${(hoveredBarb.cy / height) * 100}%` }}
        >
          <span className="st-windBarbChart__tooltipLabel">{formatTick(hoveredBarb.datum.at)}</span>
          <span className="st-windBarbChart__tooltipValue">
            {formatTick(hoveredBarb.datum.speed)} kt @ {formatTick(hoveredBarb.datum.direction)}°
          </span>
        </div>
      ) : null}
    </div>
  );
}
