import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type CalendarHeatmapChartDatum = {
  date: string;
  value: number;
};

export type CalendarHeatmapChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: CalendarHeatmapChartDatum[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
] as const;
type Tone = typeof TONES[number];

const MARGIN = { top: 24, right: 8, bottom: 8, left: 24 };
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * FIX: strict parse YYYY-MM-DD in UTC.
 * Returns null if date is invalid or round-trip fails.
 */
function parseUTCDate(
  dateStr: string
): { year: number; month: number; day: number; ts: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  // Round-trip: re-serialized UTC date must equal input
  const check = new Date(ts).toISOString().slice(0, 10);
  if (check !== dateStr) return null;
  return { year, month, day, ts };
}

/** Number of whole days between two UTC timestamps (diff ms / ms-per-day) */
function daysDiff(tsA: number, tsB: number): number {
  return Math.round((tsB - tsA) / 86400000);
}

export function CalendarHeatmapChart({
  data = [],
  label,
  width = 480,
  height = 140,
  className,
  ...rest
}: CalendarHeatmapChartProps) {
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const grid = React.useMemo(() => {
    if (data.length === 0) return { cells: [], weeks: 0, monthLabels: [] };

    // FIX: strict validation (UTC parse + round-trip)
    const validData = data.filter(
      (d) => parseUTCDate(d.date) !== null && Number.isFinite(d.value)
    );
    if (validData.length === 0) return { cells: [], weeks: 0, monthLabels: [] };

    const sorted = [...validData].sort((a, b) => a.date.localeCompare(b.date));

    const firstParsed = parseUTCDate(sorted[0].date)!;
    const lastParsed = parseUTCDate(sorted[sorted.length - 1].date)!;

    const vals = sorted.map((d) => d.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const valueRange = maxVal > minVal ? maxVal - minVal : 1;

    const map = new Map<string, number>();
    for (const d of sorted) {
      map.set(d.date, d.value);
    }

    // FIX: use getUTCDay() for day-of-week, NEVER local getDay()
    const firstDate = new Date(firstParsed.ts);
    const lastDate = new Date(lastParsed.ts);

    // Grid start: Sunday of the week containing firstDate (UTC)
    const startDOW = firstDate.getUTCDay(); // 0=Sun
    const gridStartTs = firstParsed.ts - startDOW * 86400000;

    // Grid end: Saturday of the week containing lastDate (UTC)
    const endDOW = lastDate.getUTCDay();
    const gridEndTs = lastParsed.ts + (6 - endDOW) * 86400000;

    // FIX: count weeks in whole calendar days
    const totalDays = daysDiff(gridStartTs, gridEndTs) + 1;
    const weeks = Math.ceil(totalDays / 7);
    const cellW = plotWidth / Math.max(weeks, 1);
    const cellH = plotHeight / 7;

    const cells: {
      date: string;
      value: number | null;
      tone: Tone | null;
      x: number;
      y: number;
      w: number;
      h: number;
    }[] = [];

    const monthLabelMap = new Map<string, number>(); // month key -> x

    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
      const curTs = gridStartTs + dayIndex * 86400000;
      const curDate = new Date(curTs);
      // FIX: use UTC methods everywhere
      const dow = curDate.getUTCDay();
      const week = Math.floor(dayIndex / 7);
      // FIX: UTC serialization
      const dateStr = curDate.toISOString().slice(0, 10);
      const val = map.get(dateStr) ?? null;
      const x = MARGIN.left + week * cellW;
      const y = MARGIN.top + dow * cellH;

      let tone: Tone | null = null;
      if (val !== null && Number.isFinite(val)) {
        const idx = Math.min(
          TONES.length - 1,
          Math.floor(((val - minVal) / valueRange) * TONES.length)
        );
        tone = TONES[Math.max(0, idx)];
      }

      cells.push({
        date: dateStr,
        value: val,
        tone,
        x,
        y,
        w: Math.max(cellW - 2, 1),
        h: Math.max(cellH - 2, 1),
      });

      // Track month label positions (first occurrence of each month)
      // FIX: use getUTCFullYear/getUTCMonth
      const mKey = `${curDate.getUTCFullYear()}-${curDate.getUTCMonth()}`;
      if (!monthLabelMap.has(mKey)) {
        monthLabelMap.set(mKey, x);
      }
    }

    const monthLabels = Array.from(monthLabelMap.entries()).map(([key, x]) => {
      const [, month] = key.split("-").map(Number);
      return { label: MONTH_ABBR[month], x };
    });

    return { cells, weeks, monthLabels };
  }, [data, plotWidth, plotHeight]);

  // FIX: SR lists only valid dates (strict UTC parse + round-trip + finite value)
  const dataValueItems = data
    .filter((d) => parseUTCDate(d.date) !== null && Number.isFinite(d.value))
    .map((d) => `${d.date}: ${d.value}`);

  const hoveredCell =
    hoveredDate !== null ? grid.cells.find((c) => c.date === hoveredDate) ?? null : null;

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredDate(null); return; }
    setHoveredDate(target.getAttribute("data-chart-date") ?? null);
  }

  return (
    <div {...rest} className={classNames("st-calendarHeatmapChart", className)}>
      <div
        className="st-calendarHeatmapChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredDate(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* day-of-week labels */}
          {DAY_LABELS.map((day, di) => {
            if (di % 2 !== 1) return null;
            return (
              <text
                key={day}
                className="st-calendarHeatmapChart__dayLabel"
                x={MARGIN.left - 4}
                y={MARGIN.top + di * (plotHeight / 7) + plotHeight / 14}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {day}
              </text>
            );
          })}

          {/* month labels */}
          {grid.monthLabels.map((ml) => (
            <text
              key={`${ml.label}-${ml.x}`}
              className="st-calendarHeatmapChart__monthLabel"
              x={ml.x}
              y={MARGIN.top - 6}
              dominantBaseline="auto"
            >
              {ml.label}
            </text>
          ))}

          {/* cells */}
          {grid.cells.map((cell) => (
            <rect
              key={cell.date}
              className={classNames(
                "st-calendarHeatmapChart__cell",
                cell.tone
                  ? `st-calendarHeatmapChart__cell--${cell.tone}`
                  : "st-calendarHeatmapChart__cell--empty",
                hoveredDate !== null && hoveredDate !== cell.date
                  ? "st-calendarHeatmapChart__cell--dim"
                  : undefined
              )}
              x={cell.x}
              y={cell.y}
              width={cell.w}
              height={cell.h}
              rx={2}
              data-chart-date={cell.date}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredCell !== null && hoveredCell.value !== null ? (
        <div
          className="st-calendarHeatmapChart__tooltip"
          role="presentation"
          style={{
            left: `${((hoveredCell.x + hoveredCell.w / 2) / width) * 100}%`,
            top: `${((hoveredCell.y + hoveredCell.h / 2) / height) * 100}%`,
          }}
        >
          <span className="st-calendarHeatmapChart__tooltipLabel">{hoveredCell.date}</span>
          <span className="st-calendarHeatmapChart__tooltipValue">{hoveredCell.value}</span>
        </div>
      ) : null}
    </div>
  );
}
