import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type CalendarHeatmapChartDatum = {
  date: string;
  value: number;
};

export type CalendarHeatmapChartProps = {
  data: CalendarHeatmapChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
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

/** Number of whole days between two UTC timestamps */
function daysDiff(tsA: number, tsB: number): number {
  return Math.round((tsB - tsA) / 86400000);
}

export const CalendarHeatmapChart = defineComponent({
  name: "CalendarHeatmapChart",
  props: {
    data: { type: Array as () => CalendarHeatmapChartDatum[], default: () => [] },
    label: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 140 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredDate = ref<string | null>(null);

    function handleLeave() {
      hoveredDate.value = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) { hoveredDate.value = null; return; }
      hoveredDate.value = target.getAttribute("data-chart-date") ?? null;
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 480;
      const height = props.height ?? 140;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      type Cell = {
        date: string;
        value: number | null;
        tone: Tone | null;
        x: number;
        y: number;
        w: number;
        h: number;
      };

      let cells: Cell[] = [];
      let monthLabels: { label: string; x: number }[] = [];

      if (data.length > 0) {
        // FIX: strict validation (UTC parse + round-trip)
        const validData = data.filter(
          (d) => parseUTCDate(d.date) !== null && Number.isFinite(d.value)
        );

        if (validData.length > 0) {
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

          const monthLabelMap = new Map<string, number>();

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
              date: dateStr, value: val, tone, x, y,
              w: Math.max(cellW - 2, 1),
              h: Math.max(cellH - 2, 1),
            });

            // FIX: use getUTCFullYear/getUTCMonth
            const mKey = `${curDate.getUTCFullYear()}-${curDate.getUTCMonth()}`;
            if (!monthLabelMap.has(mKey)) {
              monthLabelMap.set(mKey, x);
            }
          }

          monthLabels = Array.from(monthLabelMap.entries()).map(([key, x]) => {
            const [, month] = key.split("-").map(Number);
            return { label: MONTH_ABBR[month], x };
          });
        }
      }

      // FIX: SR lists only valid dates
      const dataValueItems = data
        .filter((d) => parseUTCDate(d.date) !== null && Number.isFinite(d.value))
        .map((d) => `${d.date}: ${d.value}`);

      const svgChildren: ReturnType<typeof h>[] = [];

      // day-of-week labels
      for (let di = 0; di < DAY_LABELS.length; di++) {
        if (di % 2 !== 1) continue;
        svgChildren.push(h("text", {
          key: `dl${di}`,
          class: "st-calendarHeatmapChart__dayLabel",
          x: MARGIN.left - 4,
          y: MARGIN.top + di * (plotHeight / 7) + plotHeight / 14,
          "text-anchor": "end",
          "dominant-baseline": "middle",
        }, DAY_LABELS[di]));
      }

      // month labels
      for (const ml of monthLabels) {
        svgChildren.push(h("text", {
          key: `ml${ml.label}${ml.x}`,
          class: "st-calendarHeatmapChart__monthLabel",
          x: ml.x, y: MARGIN.top - 6,
          "dominant-baseline": "auto",
        }, ml.label));
      }

      // cells
      for (const cell of cells) {
        const isDim = hoveredDate.value !== null && hoveredDate.value !== cell.date;
        svgChildren.push(h("rect", {
          key: cell.date,
          class: classNames(
            "st-calendarHeatmapChart__cell",
            cell.tone
              ? `st-calendarHeatmapChart__cell--${cell.tone}`
              : "st-calendarHeatmapChart__cell--empty",
            isDim ? "st-calendarHeatmapChart__cell--dim" : undefined,
          ),
          x: cell.x, y: cell.y, width: cell.w, height: cell.h,
          rx: 2,
          "data-chart-date": cell.date,
        }));
      }

      const hoveredCell =
        hoveredDate.value !== null
          ? cells.find((c) => c.date === hoveredDate.value) ?? null
          : null;

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-calendarHeatmapChart__visual",
          role: "img",
          "aria-label": label,
          onPointermove: handlePointerMove,
          onPointerleave: handleLeave,
        }, [
          h("svg", {
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: "xMidYMid meet",
            width: "100%", height: "100%",
            focusable: "false", "aria-hidden": "true",
          }, svgChildren),
        ]),
        chartDataList(label, dataValueItems),
      ];

      if (hoveredCell !== null && hoveredCell.value !== null) {
        children.push(h("div", {
          class: "st-calendarHeatmapChart__tooltip",
          role: "presentation",
          style: `left:${((hoveredCell.x + hoveredCell.w / 2) / width) * 100}%;top:${((hoveredCell.y + hoveredCell.h / 2) / height) * 100}%`,
        }, [
          h("span", { class: "st-calendarHeatmapChart__tooltipLabel" }, hoveredCell.date),
          h("span", { class: "st-calendarHeatmapChart__tooltipValue" }, `${hoveredCell.value}`),
        ]));
      }

      return h("div", { ...attrs, class: classNames("st-calendarHeatmapChart", props.class) }, children);
    };
  },
});
