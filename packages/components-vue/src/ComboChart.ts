import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ComboChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ComboChartBarSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
};

export type ComboChartLineSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
  smooth?: boolean;
};

export type ComboChartProps = {
  categories: string[];
  bars?: ComboChartBarSeries[];
  lines?: ComboChartLineSeries[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  /**
   * Interactive legend (FR-4). Ids/labels of bar/line series hidden from the
   * render (controlled by the parent; default = all visible). Hidden series
   * are omitted and their legend item is shown "off" (`aria-pressed`).
   * Undefined → legacy non-interactive legend, unless `onToggleSeries` is set.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 12, right: 52, bottom: 32, left: 52 };

type Hover =
  | { kind: "bar"; gi: number; si: number }
  | { kind: "line"; li: number; pi: number }
  | null;

export const ComboChart = defineComponent({
  name: "ComboChart",
  props: {
    categories: { type: Array as () => string[], required: true },
    bars: { type: Array as () => ComboChartBarSeries[], default: () => [] },
    lines: { type: Array as () => ComboChartLineSeries[], default: () => [] },
    leftAxisLabel: { type: String, default: undefined },
    rightAxisLabel: { type: String, default: undefined },
    legend: { type: Boolean, default: true },
    hiddenSeries: { type: Array as () => string[], default: undefined },
    onToggleSeries: { type: Function as unknown as () => (seriesId: string) => void, default: undefined },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hovered = ref<Hover>(null);

    function handleLeave() {
      hovered.value = null;
    }
    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hovered.value = null;
        return;
      }
      const kind = target.getAttribute("data-chart-kind");
      const a = Number(target.getAttribute("data-chart-a"));
      const b = Number(target.getAttribute("data-chart-b"));
      if (kind === "bar" && Number.isInteger(a) && Number.isInteger(b)) {
        hovered.value = { kind: "bar", gi: a, si: b };
      } else if (kind === "line" && Number.isInteger(a) && Number.isInteger(b)) {
        hovered.value = { kind: "line", li: a, pi: b };
      } else {
        hovered.value = null;
      }
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const categories = props.categories;
      const bars = props.bars ?? [];
      const lines = props.lines ?? [];
      const leftAxisLabel = props.leftAxisLabel;
      const rightAxisLabel = props.rightAxisLabel;
      const legend = props.legend ?? true;
      const label = props.label;

      // Interactive legend is active as soon as the parent wires either prop.
      const legendInteractive = props.onToggleSeries !== undefined || props.hiddenSeries !== undefined;
      const hiddenSet = new Set(props.hiddenSeries ?? []);

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Une valeur n'est « présente » que si elle est un nombre fini : un trou
      // (undefined/null/NaN) reste un trou, jamais un 0 fantôme.
      const hasValue = (v: number | undefined): v is number => typeof v === "number" && Number.isFinite(v);

      // Left axis (bars): include zero. Hidden series excluded so the axis
      // rescales to what is visible.
      const leftValues = bars.filter((s) => !hiddenSet.has(s.label)).flatMap((s) => s.data).filter(hasValue);
      const leftMinRaw = Math.min(0, ...(leftValues.length ? leftValues : [0]));
      const leftMaxRaw = Math.max(0, ...(leftValues.length ? leftValues : [0]));
      const leftTicks = niceTicks(leftMinRaw, leftMaxRaw, 5);
      const leftScale = { ticks: leftTicks, domainMin: leftTicks[0], domainMax: leftTicks[leftTicks.length - 1] };

      // Right axis (lines): padded domain.
      let rightScale: { ticks: number[]; domainMin: number; domainMax: number };
      const rightValues = lines.filter((s) => !hiddenSet.has(s.label)).flatMap((s) => s.data).filter(hasValue);
      if (rightValues.length === 0) {
        const ticks = niceTicks(0, 1, 5);
        rightScale = { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
      } else {
        const minRaw = Math.min(...rightValues);
        const maxRaw = Math.max(...rightValues);
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        const ticks = niceTicks(minRaw - padded, maxRaw + padded, 5);
        rightScale = { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
      }

      const bandCenter = (i: number): number => {
        const band = plotWidth / Math.max(categories.length, 1);
        return MARGIN.left + band * (i + 0.5);
      };

      type BarSeg = {
        x: number;
        y: number;
        width: number;
        height: number;
        cx: number;
        cy: number;
        value: number;
        seriesLabel: string;
        category: string;
        tone: string;
      };

      let barGroups: (BarSeg | null)[][] = [];
      if (categories.length !== 0 && bars.length !== 0) {
        const { domainMin, domainMax } = leftScale;
        const band = plotWidth / categories.length;
        const groupWidth = band * 0.62;
        const barWidth = groupWidth / bars.length;
        const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
        barGroups = categories.map((_, ci) => {
          const groupX = MARGIN.left + band * ci + (band - groupWidth) / 2;
          return bars.map((series, si) => {
            if (hiddenSet.has(series.label)) return null;
            const value = series.data[ci];
            if (!hasValue(value)) return null; // trou : pas de barre fantôme à 0.
            const valueY = scaleLinear(value, domainMin, domainMax, plotHeight, 0);
            const y = Math.min(valueY, zeroY);
            const hh = Math.abs(zeroY - valueY);
            return {
              x: groupX + barWidth * si,
              y: MARGIN.top + y,
              width: barWidth,
              height: Math.max(hh, 0.5),
              cx: groupX + barWidth * (si + 0.5),
              cy: MARGIN.top + valueY,
              value,
              seriesLabel: series.label,
              category: categories[ci],
              tone: series.tone ?? `category${(si % 8) + 1}`,
            };
          });
        });
      }

      type LinePoint = { x: number; y: number; value: number; category: string };
      type LineSeriesEntry = { path: string; points: LinePoint[]; seriesLabel: string; hidden: boolean; tone: string };
      let lineSeries: LineSeriesEntry[] = [];
      if (categories.length !== 0 && lines.length !== 0) {
        const { domainMin, domainMax } = rightScale;
        lineSeries = lines.map((series, li) => {
          const points = categories.map((_, ci) => {
            const value = series.data[ci] ?? 0;
            return {
              x: bandCenter(ci),
              y: MARGIN.top + scaleLinear(value, domainMin, domainMax, plotHeight, 0),
              value,
              category: categories[ci],
            };
          });
          const path = series.smooth ? buildSmoothPath(points) : buildLinearPath(points);
          return {
            path,
            points,
            seriesLabel: series.label,
            hidden: hiddenSet.has(series.label),
            tone: series.tone ?? `category${((bars.length + li) % 8) + 1}`,
          };
        });
      }

      const leftGridLines = leftScale.ticks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, leftScale.domainMin, leftScale.domainMax, plotHeight, 0),
      }));

      const rightTickEntries =
        lines.length === 0
          ? []
          : rightScale.ticks.map((tick) => ({
              value: tick,
              y: MARGIN.top + scaleLinear(tick, rightScale.domainMin, rightScale.domainMax, plotHeight, 0),
            }));

      const legendItems = [
        ...bars.map((s, i) => ({
          key: `bar-${i}`,
          label: s.label,
          tone: s.tone ?? `category${(i % 8) + 1}`,
          kind: "bar" as const,
        })),
        ...lines.map((s, i) => ({
          key: `line-${i}`,
          label: s.label,
          tone: s.tone ?? `category${((bars.length + i) % 8) + 1}`,
          kind: "line" as const,
        })),
      ];

      const dataValueItems = [
        ...bars
          .filter((s) => !hiddenSet.has(s.label))
          .flatMap((s) => categories.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)),
        ...lines
          .filter((s) => !hiddenSet.has(s.label))
          .flatMap((s) => categories.map((c, ci) => `${s.label}, ${c}: ${s.data[ci] ?? 0}`)),
      ];

      let tooltip: { cx: number; cy: number; label: string; value: number } | null = null;
      const hov = hovered.value;
      if (hov) {
        if (hov.kind === "bar") {
          const seg = barGroups[hov.gi]?.[hov.si];
          if (seg) tooltip = { cx: seg.cx, cy: seg.cy, label: `${seg.seriesLabel} · ${seg.category}`, value: seg.value };
        } else {
          const series = lineSeries[hov.li];
          const p = series?.points[hov.pi];
          if (series && p) tooltip = { cx: p.x, cy: p.y, label: `${series.seriesLabel} · ${p.category}`, value: p.value };
        }
      }

      const svgChildren: ReturnType<typeof h>[] = [];

      for (const g of leftGridLines) {
        svgChildren.push(
          h("line", { key: `lg${g.value}`, class: "st-comboChart__grid", x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: g.y, y2: g.y }),
          h(
            "text",
            { key: `lt${g.value}`, class: "st-comboChart__tickLabel", x: MARGIN.left - 6, y: g.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      for (const g of rightTickEntries) {
        svgChildren.push(
          h(
            "text",
            { key: `rt${g.value}`, class: "st-comboChart__tickLabel", x: MARGIN.left + plotWidth + 6, y: g.y, "text-anchor": "start", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-comboChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-comboChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );
      if (lines.length > 0) {
        svgChildren.push(
          h("line", { class: "st-comboChart__axis", x1: MARGIN.left + plotWidth, x2: MARGIN.left + plotWidth, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        );
      }

      if (leftAxisLabel) {
        svgChildren.push(
          h(
            "text",
            { class: "st-comboChart__axisLabel", "text-anchor": "middle", transform: `translate(${MARGIN.left - 40}, ${MARGIN.top + plotHeight / 2}) rotate(-90)` },
            leftAxisLabel,
          ),
        );
      }
      if (rightAxisLabel) {
        svgChildren.push(
          h(
            "text",
            { class: "st-comboChart__axisLabel", "text-anchor": "middle", transform: `translate(${MARGIN.left + plotWidth + 40}, ${MARGIN.top + plotHeight / 2}) rotate(90)` },
            rightAxisLabel,
          ),
        );
      }

      categories.forEach((category, ci) => {
        svgChildren.push(
          h(
            "text",
            { key: `cat${ci}`, class: "st-comboChart__categoryLabel", x: bandCenter(ci), y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            category,
          ),
        );
      });

      barGroups.forEach((group, gi) => {
        group.forEach((seg, si) => {
          if (!seg) return;
          svgChildren.push(
            h("rect", {
              key: `bar${gi}-${si}`,
              class: `st-comboChart__bar st-comboChart__bar--${seg.tone}`,
              x: seg.x,
              y: seg.y,
              width: seg.width,
              height: seg.height,
              rx: "2",
              "data-chart-kind": "bar",
              "data-chart-a": gi,
              "data-chart-b": si,
            }),
          );
        });
      });

      lineSeries.forEach((series, li) => {
        if (series.hidden) return;
        svgChildren.push(
          h("path", {
            key: `line${li}`,
            class: `st-comboChart__line st-comboChart__line--${series.tone}`,
            d: series.path,
            fill: "none",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          }),
        );
        series.points.forEach((p, pi) => {
          svgChildren.push(
            h("circle", {
              key: `dot${li}-${pi}`,
              class: `st-comboChart__dot st-comboChart__dot--${series.tone}`,
              cx: p.x,
              cy: p.y,
              r: "4",
              "data-chart-kind": "line",
              "data-chart-a": li,
              "data-chart-b": pi,
            }),
          );
        });
      });

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-comboChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
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
        chartDataList(label, dataValueItems),
      ];

      if (legend && legendItems.length > 0) {
        children.push(
          h(
            "ul",
            { class: "st-comboChart__legend", "aria-hidden": legendInteractive ? undefined : "true" },
            legendItems.map((item) => {
              const off = hiddenSet.has(item.label);
              const swatch = h("span", {
                class: `st-comboChart__legendSwatch st-comboChart__legendSwatch--${item.kind} st-comboChart__legendSwatch--${item.tone}`,
              });
              return h(
                "li",
                {
                  key: item.key,
                  class: classNames(
                    "st-comboChart__legendItem",
                    legendInteractive && off && "st-comboChart__legendItem--off",
                  ),
                },
                legendInteractive
                  ? [
                      h(
                        "button",
                        {
                          type: "button",
                          class: "st-comboChart__legendButton",
                          "aria-pressed": off ? "true" : "false",
                          onClick: () => props.onToggleSeries?.(item.label),
                        },
                        [swatch, ` ${item.label}`],
                      ),
                    ]
                  : [swatch, ` ${item.label}`],
              );
            }),
          ),
        );
      }

      if (tooltip) {
        children.push(
          h(
            "div",
            {
              class: "st-comboChart__tooltip",
              role: "presentation",
              style: `left: ${(tooltip.cx / width) * 100}%; top: ${(tooltip.cy / height) * 100}%`,
            },
            [
              h("span", { class: "st-comboChart__tooltipLabel" }, tooltip.label),
              h("span", { class: "st-comboChart__tooltipValue" }, String(tooltip.value)),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-comboChart", props.class) }, children);
    };
  },
});
