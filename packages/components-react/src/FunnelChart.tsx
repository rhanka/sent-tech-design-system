import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type FunnelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FunnelChartDatum = {
  label: string;
  value: number;
  tone?: FunnelChartTone;
};

export type FunnelChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: FunnelChartDatum[];
  orientation?: "vertical" | "horizontal";
  showPercentages?: boolean;
  percentMode?: "ofFirst" | "ofPrevious";
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const GAP = 6;
const TONES = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
] as const;

function formatPercent(p: number): string {
  if (!Number.isFinite(p)) return "0%";
  return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
}

export function FunnelChart({
  data,
  orientation = "vertical",
  showPercentages = true,
  percentMode = "ofFirst",
  legend = false,
  label,
  width = 480,
  height = 280,
  className,
  ...rest
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Pourcentages calculés par rapport à la première étape ou à la précédente.
  // Référence nulle → 0% (pas de NaN), première étape ofPrevious → 100%.
  const percents = (() => {
    const first = data[0]?.value ?? 0;
    return data.map((d, i) => {
      const ref = percentMode === "ofPrevious" ? (data[i - 1]?.value ?? d.value) : first;
      return ref === 0 ? 0 : (d.value / ref) * 100;
    });
  })();

  // Trapèzes décroissants centrés : la demi-largeur de chaque étape est
  // proportionnelle à sa valeur (relative au max). Les segments se rejoignent.
  const segments = (() => {
    if (data.length === 0)
      return [] as Array<{
        points: string;
        datum: FunnelChartDatum;
        tone: FunnelChartTone;
        textColor: string;
        cx: number;
        cy: number;
        labelX: number;
        labelY: number;
        percent: number;
      }>;
    const maxValue = Math.max(0, ...data.map((d) => Math.abs(d.value)));
    const safeMax = maxValue === 0 ? 1 : maxValue;
    const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

    if (orientation === "vertical") {
      const band = plotH / data.length;
      const segH = Math.max(band - GAP, 1);
      const cx = MARGIN.left + plotW / 2;
      return data.map((d, i) => {
        const tone = d.tone ?? TONES[i % TONES.length];
        const topHalf = (Math.abs(d.value) / safeMax) * (plotW / 2);
        const nextVal = data[i + 1] ? Math.abs(data[i + 1].value) : Math.abs(d.value);
        const botHalf = Math.min((nextVal / safeMax) * (plotW / 2), topHalf);
        const y0 = MARGIN.top + band * i;
        const y1 = y0 + segH;
        const points = [
          `${cx - topHalf},${y0}`,
          `${cx + topHalf},${y0}`,
          `${cx + botHalf},${y1}`,
          `${cx - botHalf},${y1}`,
        ].join(" ");
        return {
          points,
          datum: d,
          tone,
          textColor: contrastTextForTone(tone),
          cx,
          cy: (y0 + y1) / 2,
          labelX: cx,
          labelY: (y0 + y1) / 2,
          percent: percents[i],
        };
      });
    }

    // horizontal : entonnoir qui se rétrécit de gauche à droite.
    const band = plotW / data.length;
    const segW = Math.max(band - GAP, 1);
    const cy = MARGIN.top + plotH / 2;
    return data.map((d, i) => {
      const tone = d.tone ?? TONES[i % TONES.length];
      const leftHalf = (Math.abs(d.value) / safeMax) * (plotH / 2);
      const nextVal = data[i + 1] ? Math.abs(data[i + 1].value) : Math.abs(d.value);
      const rightHalf = Math.min((nextVal / safeMax) * (plotH / 2), leftHalf);
      const x0 = MARGIN.left + band * i;
      const x1 = x0 + segW;
      const points = [
        `${x0},${cy - leftHalf}`,
        `${x1},${cy - rightHalf}`,
        `${x1},${cy + rightHalf}`,
        `${x0},${cy + leftHalf}`,
      ].join(" ");
      return {
        points,
        datum: d,
        tone,
        textColor: contrastTextForTone(tone),
        cx: (x0 + x1) / 2,
        cy,
        labelX: (x0 + x1) / 2,
        labelY: cy,
        percent: percents[i],
      };
    });
  })();

  const dataValueItems = data.map((d, i) =>
    showPercentages ? `${d.label}: ${d.value} (${formatPercent(percents[i])})` : `${d.label}: ${d.value}`,
  );

  const legendItems = data.map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }));

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredSeg = hoveredIndex !== null ? segments[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-funnelChart", className)}>
      <div
        className="st-funnelChart__visual"
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
          {segments.map((seg, i) => (
            <polygon
              key={seg.datum.label}
              className={classNames(
                "st-funnelChart__segment",
                `st-funnelChart__segment--${seg.tone}`,
                hoveredIndex !== null && hoveredIndex !== i && "st-funnelChart__segment--dim",
              )}
              points={seg.points}
              data-chart-index={i}
            />
          ))}

          {segments.map((seg) => (
            <React.Fragment key={seg.datum.label}>
              <text
                className="st-funnelChart__label"
                x={seg.labelX}
                y={seg.labelY - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: seg.textColor }}
              >
                {seg.datum.label}
              </text>
              <text
                className="st-funnelChart__value"
                x={seg.labelX}
                y={seg.labelY + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: seg.textColor }}
              >
                {seg.datum.value}
                {showPercentages ? ` · ${formatPercent(seg.percent)}` : null}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredSeg ? (
        <div
          className="st-funnelChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredSeg.cx / width) * 100}%`, top: `${(hoveredSeg.cy / height) * 100}%` }}
        >
          <span className="st-funnelChart__tooltipLabel">{hoveredSeg.datum.label}</span>
          <span className="st-funnelChart__tooltipValue">
            {hoveredSeg.datum.value}
            {showPercentages ? ` · ${formatPercent(hoveredSeg.percent)}` : null}
          </span>
        </div>
      ) : null}

      {legend && legendItems.length > 0 ? (
        <ul className="st-funnelChart__legend" aria-hidden="true">
          {legendItems.map((item) => (
            <li key={item.label} className="st-funnelChart__legendItem">
              <span
                className={`st-funnelChart__legendSwatch st-funnelChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
