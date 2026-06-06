import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type BarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BarChartDatum = {
  label: string;
  value: number;
  tone?: BarChartTone;
};

export type BarChartProps = {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Keys of the currently selected bars (a bar's key is its `label`).
   * CONTROLLED — the parent owns the toggle; the component never stores
   * selection. When non-empty the selected bars stay full opacity (+ accent)
   * and the rest dim; when empty every bar is normal. Defaults to [].
   */
  selectedKeys?: string[];
  /**
   * Called with the bar's key (its `label`) when the user selects it. When
   * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
   * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
   * The SVG bars themselves stay decorative (aria-hidden) and only offer a
   * mouse click shortcut for sighted pointer users. When omitted the chart is
   * purely presentational (no interactivity, unchanged).
   */
  onSelect?: (key: string) => void;
  class?: string;
};

const MARGIN = CHART_MARGIN;

export const BarChart = defineComponent({
  name: "BarChart",
  props: {
    data: { type: Array as () => BarChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    orientation: { type: String as () => "vertical" | "horizontal", default: "vertical" },
    label: { type: String, required: true },
    selectedKeys: { type: Array as () => string[], default: () => [] },
    onSelect: { type: Function as unknown as () => (key: string) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }
    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredIndex.value = null;
        return;
      }
      const index = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(index) ? index : null;
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const orientation = props.orientation ?? "vertical";
      const label = props.label;
      const data = props.data;

      // Selection (controlled): fast lookup + "is any bar selected" flag. Only
      // when something is selected do we dim the non-selected bars.
      const selectedSet = new Set(props.selectedKeys ?? []);
      const hasSelection = selectedSet.size > 0;
      const interactive = typeof props.onSelect === "function";

      const values = data.map((d) => d.value);
      const minRaw = Math.min(0, ...values);
      const maxRaw = Math.max(0, ...values);
      const ticks = niceTicks(minRaw, maxRaw, 5);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      type Bar = {
        x: number;
        y: number;
        width: number;
        height: number;
        cx: number;
        cy: number;
        datum: BarChartDatum;
        tone: BarChartTone;
      };

      let bars: Bar[] = [];
      if (data.length !== 0) {
        if (orientation === "vertical") {
          const band = plotWidth / data.length;
          const barWidth = band * 0.62;
          const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
          bars = data.map((d, i) => {
            const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
            const y = Math.min(valueY, zeroY);
            const hh = Math.abs(zeroY - valueY);
            const x = MARGIN.left + band * i + (band - barWidth) / 2;
            return {
              x,
              y: MARGIN.top + y,
              width: barWidth,
              height: Math.max(hh, 0.5),
              cx: MARGIN.left + band * (i + 0.5),
              cy: MARGIN.top + valueY,
              datum: d,
              tone: (d.tone ?? "category1") as BarChartTone,
            };
          });
        } else {
          const band = plotHeight / data.length;
          const barHeight = band * 0.62;
          const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
          bars = data.map((d, i) => {
            const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
            const x = Math.min(valueX, zeroX);
            const w = Math.abs(valueX - zeroX);
            const y = MARGIN.top + band * i + (band - barHeight) / 2;
            return {
              x: MARGIN.left + x,
              y,
              width: Math.max(w, 0.5),
              height: barHeight,
              cx: MARGIN.left + valueX,
              cy: MARGIN.top + band * (i + 0.5),
              datum: d,
              tone: (d.tone ?? "category1") as BarChartTone,
            };
          });
        }
      }

      const dataValueItems = data.map((d) => `${d.label}: ${d.value}`);

      const gridChildren: ReturnType<typeof h>[] = [];
      if (orientation === "vertical") {
        for (const tick of ticks) {
          const y = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
          gridChildren.push(
            h("line", { key: `g${tick}`, class: "st-barChart__grid", x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y }),
            h(
              "text",
              { key: `t${tick}`, class: "st-barChart__tickLabel", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
              formatTick(tick),
            ),
          );
        }
      } else {
        for (const tick of ticks) {
          const x = MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth);
          gridChildren.push(
            h("line", { key: `g${tick}`, class: "st-barChart__grid", x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight }),
            h(
              "text",
              { key: `t${tick}`, class: "st-barChart__tickLabel", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
              formatTick(tick),
            ),
          );
        }
      }

      const categoryLabels = bars.map((bar) =>
        orientation === "vertical"
          ? h(
              "text",
              { key: `c${bar.datum.label}`, class: "st-barChart__categoryLabel", x: bar.x + bar.width / 2, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
              bar.datum.label,
            )
          : h(
              "text",
              { key: `c${bar.datum.label}`, class: "st-barChart__categoryLabel", x: MARGIN.left - 6, y: bar.y + bar.height / 2, "text-anchor": "end", "dominant-baseline": "middle" },
              bar.datum.label,
            ),
      );

      // The bars live inside an aria-hidden SVG, so they are NEVER an accessible
      // surface. When `onSelect` is provided they only carry a mouse click
      // shortcut (cursor:pointer) for sighted pointer users — keyboard + screen
      // readers use the filter-chip buttons rendered below, outside this SVG.
      const barRects = bars.map((bar, i) => {
        const isSelected = selectedSet.has(bar.datum.label);
        return h("rect", {
          key: `b${bar.datum.label}`,
          class: classNames(
            "st-barChart__bar",
            `st-barChart__bar--${bar.tone}`,
            isSelected && "st-barChart__bar--selected",
            hasSelection && !isSelected && "st-barChart__bar--dim",
            interactive && "st-barChart__bar--interactive",
          ),
          x: bar.x,
          y: bar.y,
          width: bar.width,
          height: bar.height,
          rx: "2",
          "data-chart-index": i,
          onClick: interactive ? () => props.onSelect?.(bar.datum.label) : undefined,
        });
      });

      // Accessible selection surface — real <button>s OUTSIDE the aria-hidden
      // SVG. This is the keyboard + screen-reader path for filtering.
      const filterGroup = interactive
        ? h(
            "div",
            { class: "st-barChart__filters", role: "group", "aria-label": `Filtrer par ${label}` },
            bars.map((bar) => {
              const isSelected = selectedSet.has(bar.datum.label);
              return h(
                "button",
                {
                  key: `f${bar.datum.label}`,
                  type: "button",
                  class: classNames(
                    "st-barChart__filterChip",
                    `st-barChart__filterChip--${bar.tone}`,
                    isSelected && "st-barChart__filterChip--selected",
                  ),
                  "aria-pressed": isSelected ? "true" : "false",
                  onClick: () => props.onSelect?.(bar.datum.label),
                },
                [
                  h("span", { class: "st-barChart__filterSwatch", "aria-hidden": "true" }),
                  `${bar.datum.label}: ${bar.datum.value}`,
                ],
              );
            }),
          )
        : null;

      const hoveredBar = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-barChart", props.class) }, [
        h(
          "div",
          {
            class: "st-barChart__visual",
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
              [
                ...gridChildren,
                h("line", { class: "st-barChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
                h("line", { class: "st-barChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
                ...categoryLabels,
                ...barRects,
              ],
            ),
          ],
        ),
        filterGroup,
        chartDataList(label, dataValueItems),
        hoveredBar
          ? h(
              "div",
              {
                class: "st-barChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredBar.cx / width) * 100}%; top: ${(hoveredBar.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-barChart__tooltipLabel" }, hoveredBar.datum.label),
                h("span", { class: "st-barChart__tooltipValue" }, String(hoveredBar.datum.value)),
              ],
            )
          : null,
      ]);
    };
  },
});
