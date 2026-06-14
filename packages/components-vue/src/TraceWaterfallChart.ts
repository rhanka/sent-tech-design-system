import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type TraceSpan = {
  spanId: string;
  parentSpanId?: string | null;
  service: string;
  start: number;
  duration: number;
};

export type TraceWaterfallChartProps = {
  data: { spans: TraceSpan[] };
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 152 };
const INDENT = 10;

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

type OrderedSpan = { span: TraceSpan; depth: number };

type Bar = {
  span: TraceSpan;
  depth: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rowCenterY: number;
  cx: number;
  tone: string;
};

export const TraceWaterfallChart = defineComponent({
  name: "TraceWaterfallChart",
  props: {
    data: { type: Object as () => { spans: TraceSpan[] }, default: () => ({ spans: [] }) },
    label: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: 320 },
    size: { type: Number, default: undefined },
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
      const label = props.label;
      const height = props.height ?? 320;
      const resolvedWidth = props.width ?? props.size ?? 640;

      const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Normalise: drop spans missing id/service or with non-finite start/duration.
      const validSpans = (props.data?.spans ?? []).filter(
        (s) =>
          s &&
          typeof s.spanId === "string" &&
          s.spanId.length > 0 &&
          typeof s.service === "string" &&
          s.service.length > 0 &&
          Number.isFinite(s.start) &&
          Number.isFinite(s.duration),
      );

      // Hierarchical order: DFS from roots (missing/unknown parentSpanId).
      let ordered: OrderedSpan[] = [];
      if (validSpans.length > 0) {
        const byId = new Map<string, TraceSpan>();
        for (const s of validSpans) if (!byId.has(s.spanId)) byId.set(s.spanId, s);

        const childrenOf = new Map<string, TraceSpan[]>();
        const roots: TraceSpan[] = [];
        for (const s of validSpans) {
          const p = s.parentSpanId;
          if (p == null || !byId.has(p) || p === s.spanId) {
            roots.push(s);
          } else {
            const list = childrenOf.get(p) ?? [];
            list.push(s);
            childrenOf.set(p, list);
          }
        }

        const out: OrderedSpan[] = [];
        const seen = new Set<string>();
        const visit = (s: TraceSpan, depth: number) => {
          if (seen.has(s.spanId)) return;
          seen.add(s.spanId);
          out.push({ span: s, depth });
          for (const k of childrenOf.get(s.spanId) ?? []) visit(k, depth + 1);
        };
        for (const r of roots) visit(r, 0);
        for (const s of validSpans) if (!seen.has(s.spanId)) visit(s, 0);
        ordered = out;
      }

      // Distinct services (DFS first-seen order) → categoryN index (1..8, cycled).
      const serviceOrder: string[] = [];
      for (const o of ordered) {
        if (!serviceOrder.includes(o.span.service)) serviceOrder.push(o.span.service);
      }
      const toneOf = (service: string): string => {
        const idx = serviceOrder.indexOf(service);
        return `category${((idx < 0 ? 0 : idx) % 8) + 1}`;
      };
      const legendItems = serviceOrder.map((service) => ({ service, tone: toneOf(service) }));
      const hasLegend = serviceOrder.length > 0;

      const vals: number[] = [];
      for (const o of ordered) vals.push(o.span.start, o.span.start + Math.max(o.span.duration, 0));
      const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
      const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
      const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;

      const ticks = niceTicks(rawMin, rawMax, 5);
      const domainMin = ticks[0] ?? rawMin;
      const domainMax = ticks[ticks.length - 1] ?? rawMax;

      const xOf = (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth);

      let bars: Bar[] = [];
      if (ordered.length > 0) {
        const band = plotHeight / ordered.length;
        const barHeight = Math.min(band * 0.62, 24);
        bars = ordered.map((o, i) => {
          const x0 = xOf(o.span.start);
          const x1 = xOf(o.span.start + Math.max(o.span.duration, 0));
          const x = Math.min(x0, x1);
          const w = Math.max(Math.abs(x1 - x0), 1);
          const y = MARGIN.top + band * i + (band - barHeight) / 2;
          return {
            span: o.span,
            depth: o.depth,
            index: i,
            x,
            y,
            width: w,
            height: barHeight,
            rowCenterY: MARGIN.top + band * (i + 0.5),
            cx: x + w / 2,
            tone: toneOf(o.span.service),
          };
        });
      }

      const dataValueItems = ordered.map(
        (o) =>
          `${"·".repeat(o.depth)}${o.span.service}: ${o.span.start} → ${o.span.start + Math.max(o.span.duration, 0)}`,
      );

      const svgChildren: ReturnType<typeof h>[] = [];

      // gridlines + tick labels (time axis)
      for (const tick of ticks) {
        const tx = xOf(tick);
        svgChildren.push(
          h("line", {
            key: `g${tick}`,
            class: "st-traceWaterfallChart__grid",
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
              class: "st-traceWaterfallChart__tickLabel",
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
        h("line", {
          class: "st-traceWaterfallChart__axis",
          x1: MARGIN.left,
          x2: MARGIN.left,
          y1: MARGIN.top,
          y2: height - MARGIN.bottom,
        }),
      );
      svgChildren.push(
        h("line", {
          class: "st-traceWaterfallChart__axis",
          x1: MARGIN.left,
          x2: resolvedWidth - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      // one bar per span + indented service label on the left
      for (const bar of bars) {
        const i = bar.index;
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h(
            "text",
            {
              key: `lbl${i}`,
              class: "st-traceWaterfallChart__spanLabel",
              x: MARGIN.left - 8,
              y: bar.rowCenterY,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            ellipsize(bar.span.service, Math.max(2, 16 - bar.depth)),
          ),
        );
        svgChildren.push(
          h("rect", {
            key: `bar${i}-${bar.span.spanId}`,
            class: classNames(
              "st-traceWaterfallChart__bar",
              `st-traceWaterfallChart__bar--${bar.tone}`,
              isDim ? "st-traceWaterfallChart__bar--dim" : undefined,
            ),
            x: bar.x + bar.depth * INDENT,
            y: bar.y,
            width: Math.max(bar.width - bar.depth * INDENT, 1),
            height: bar.height,
            rx: 2,
            "data-chart-index": i,
          }),
        );
      }

      const hoveredBar = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-traceWaterfallChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handlePointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${resolvedWidth} ${height}`,
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

      if (hasLegend) {
        children.push(
          h(
            "ul",
            {
              class: "st-traceWaterfallChart__legend",
              "aria-label": `Services de ${label ?? "trace"}`,
            },
            legendItems.map((item) =>
              h("li", { key: item.service, class: "st-traceWaterfallChart__legendItem" }, [
                h("span", {
                  class: `st-traceWaterfallChart__legendSwatch st-traceWaterfallChart__legendSwatch--${item.tone}`,
                  "aria-hidden": "true",
                }),
                item.service,
              ]),
            ),
          ),
        );
      }

      children.push(chartDataList(label ?? "trace waterfall", dataValueItems));

      if (hoveredBar) {
        children.push(
          h(
            "div",
            {
              class: "st-traceWaterfallChart__tooltip",
              role: "presentation",
              style: `left:${(hoveredBar.cx / resolvedWidth) * 100}%;top:${(hoveredBar.rowCenterY / height) * 100}%`,
            },
            [
              h("span", { class: "st-traceWaterfallChart__tooltipLabel" }, hoveredBar.span.service),
              h(
                "span",
                { class: "st-traceWaterfallChart__tooltipValue" },
                `${hoveredBar.span.start} → ${hoveredBar.span.start + Math.max(hoveredBar.span.duration, 0)}`,
              ),
            ],
          ),
        );
      }

      return h(
        "div",
        { ...attrs, class: classNames("st-traceWaterfallChart", props.class) },
        children,
      );
    };
  },
});
