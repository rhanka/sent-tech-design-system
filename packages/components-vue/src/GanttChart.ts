import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type GanttChartTask = {
  task: string;
  start: number;
  end: number;
  category?: string;
};

export type GanttChartProps = {
  data: GanttChartTask[];
  label: string;
  width?: number;
  height?: number;
  marker?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

export const GanttChart = defineComponent({
  name: "GanttChart",
  props: {
    data: { type: Array as () => GanttChartTask[], default: () => [] },
    label: { type: String, required: true },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 320 },
    marker: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredIndex.value = null;
        return;
      }
      const idx = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(idx) ? idx : null;
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 640;
      const height = props.height ?? 320;
      const marker = props.marker;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Normalise start ≤ end and drop non-finite (or unlabeled) tasks.
      const validData = data
        .filter(
          (d) =>
            typeof d.task === "string" &&
            d.task.length > 0 &&
            Number.isFinite(d.start) &&
            Number.isFinite(d.end),
        )
        .map((d) => ({
          task: d.task,
          start: Math.min(d.start, d.end),
          end: Math.max(d.start, d.end),
          category: d.category,
        }));

      // Distinct categories (first-seen order) → categoryN index (1..8, cycled).
      const categoryOrder: string[] = [];
      for (const d of validData) {
        if (d.category && !categoryOrder.includes(d.category)) categoryOrder.push(d.category);
      }
      const hasCategories = categoryOrder.length > 0;
      const toneOf = (category: string | undefined): string => {
        if (!category) return "category1";
        const idx = categoryOrder.indexOf(category);
        return `category${(idx % 8) + 1}`;
      };
      const legendItems = categoryOrder.map((category) => ({ category, tone: toneOf(category) }));

      const vals: number[] = [];
      for (const d of validData) vals.push(d.start, d.end);
      if (typeof marker === "number" && Number.isFinite(marker)) vals.push(marker);
      const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
      const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
      const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;

      const ticks = niceTicks(rawMin, rawMax, 5);
      const domainMin = ticks[0] ?? rawMin;
      const domainMax = ticks[ticks.length - 1] ?? rawMax;

      const xOf = (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth);

      type Bar = {
        datum: (typeof validData)[number];
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        rowCenterY: number;
        cx: number;
        tone: string;
      };

      let bars: Bar[] = [];
      if (validData.length > 0) {
        const band = plotHeight / validData.length;
        const barHeight = Math.min(band * 0.62, 28);
        bars = validData.map((d, i) => {
          const x0 = xOf(d.start);
          const x1 = xOf(d.end);
          const x = Math.min(x0, x1);
          const w = Math.max(Math.abs(x1 - x0), 1);
          const y = MARGIN.top + band * i + (band - barHeight) / 2;
          return {
            datum: d,
            index: i,
            x,
            y,
            width: w,
            height: barHeight,
            rowCenterY: MARGIN.top + band * (i + 0.5),
            cx: x + w / 2,
            tone: toneOf(d.category),
          };
        });
      }

      const markerGeom =
        typeof marker === "number" && Number.isFinite(marker) ? { x: xOf(marker), value: marker } : null;

      const dataValueItems = validData.map((d) => `${d.task}: ${d.start} → ${d.end}`);

      const svgChildren: ReturnType<typeof h>[] = [];

      // gridlines + tick labels (time axis)
      for (const tick of ticks) {
        const tx = xOf(tick);
        svgChildren.push(
          h("line", {
            key: `g${tick}`,
            class: "st-ganttChart__grid",
            x1: tx,
            x2: tx,
            y1: MARGIN.top,
            y2: height - MARGIN.bottom,
          }),
        );
        svgChildren.push(
          h(
            "text",
            {
              key: `t${tick}`,
              class: "st-ganttChart__tickLabel",
              x: tx,
              y: height - MARGIN.bottom + 16,
              "text-anchor": "middle",
            },
            formatTick(tick),
          ),
        );
      }

      // axes
      svgChildren.push(
        h("line", { class: "st-ganttChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
      );
      svgChildren.push(
        h("line", { class: "st-ganttChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      // one bar per task + left task label
      for (const bar of bars) {
        const i = bar.index;
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h(
            "text",
            {
              key: `lbl${i}`,
              class: "st-ganttChart__taskLabel",
              x: MARGIN.left - 8,
              y: bar.rowCenterY,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            ellipsize(bar.datum.task, 18),
          ),
        );
        svgChildren.push(
          h("rect", {
            key: `bar${i}-${bar.datum.task}`,
            class: classNames(
              "st-ganttChart__bar",
              `st-ganttChart__bar--${bar.tone}`,
              isDim ? "st-ganttChart__bar--dim" : undefined,
            ),
            x: bar.x,
            y: bar.y,
            width: bar.width,
            height: bar.height,
            rx: 2,
            "data-chart-index": i,
          }),
        );
      }

      // "today" marker
      if (markerGeom) {
        svgChildren.push(
          h("line", {
            class: "st-ganttChart__marker",
            x1: markerGeom.x,
            x2: markerGeom.x,
            y1: MARGIN.top,
            y2: height - MARGIN.bottom,
          }),
        );
      }

      const hoveredBar = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-ganttChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handlePointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${width} ${height}`,
                preserveAspectRatio: "xMidYMid meet",
                width: "100%",
                height: "100%",
                focusable: "false",
                "aria-hidden": "true",
              },
              svgChildren,
            ),
          ],
        ),
      ];

      if (hasCategories) {
        children.push(
          h(
            "ul",
            { class: "st-ganttChart__legend", "aria-label": `Catégories de ${label}` },
            legendItems.map((item) =>
              h("li", { key: item.category, class: "st-ganttChart__legendItem" }, [
                h("span", {
                  class: `st-ganttChart__legendSwatch st-ganttChart__legendSwatch--${item.tone}`,
                  "aria-hidden": "true",
                }),
                item.category,
              ]),
            ),
          ),
        );
      }

      children.push(chartDataList(label, dataValueItems));

      if (hoveredBar) {
        children.push(
          h(
            "div",
            {
              class: "st-ganttChart__tooltip",
              role: "presentation",
              style: `left:${(hoveredBar.cx / width) * 100}%;top:${(hoveredBar.rowCenterY / height) * 100}%`,
            },
            [
              h("span", { class: "st-ganttChart__tooltipLabel" }, hoveredBar.datum.task),
              h("span", { class: "st-ganttChart__tooltipValue" }, `${hoveredBar.datum.start} → ${hoveredBar.datum.end}`),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-ganttChart", props.class) }, children);
    };
  },
});
