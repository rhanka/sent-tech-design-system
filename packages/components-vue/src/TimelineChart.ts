import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type TimelineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TimelineChartEvent = {
  /** Point on the axis (year, day index, ordinal step…). */
  position: number;
  /** Required short label, shown above/below the marker (alternated). */
  label: string;
  /** Optional longer description, surfaced in the accessible list + tooltip. */
  description?: string;
  /** Optional explicit categorical tone; otherwise cycles category1..8. */
  tone?: TimelineChartTone;
};

export type TimelineChartProps = {
  data: TimelineChartEvent[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 32, left: 24 } as const;
const CATEGORY_COUNT = 8;
// Max characters before the label is ellipsised (keeps connectors readable).
const LABEL_MAX = 18;

function toneClass(tone: TimelineChartTone | undefined, index: number): TimelineChartTone {
  if (tone) return tone;
  return `category${(index % CATEGORY_COUNT) + 1}` as TimelineChartTone;
}

function truncate(text: string): string {
  return text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;
}

export const TimelineChart = defineComponent({
  name: "TimelineChart",
  props: {
    data: { type: Array as () => TimelineChartEvent[], required: true },
    label: { type: String, required: true },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 240 },
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
      const width = props.width ?? 640;
      const height = props.height ?? 240;
      const label = props.label;
      const data = props.data;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const axisY = MARGIN.top + Math.max(height - MARGIN.top - MARGIN.bottom, 1) / 2;

      // Sorted, finite-position events. `label` is required so missing labels drop.
      const events = data
        .filter((e) => Number.isFinite(e.position) && typeof e.label === "string")
        .slice()
        .sort((a, b) => a.position - b.position);

      let positionDomain: { min: number; max: number };
      if (events.length === 0) {
        positionDomain = { min: 0, max: 1 };
      } else {
        const xs = events.map((e) => e.position);
        const min = Math.min(...xs);
        const max = Math.max(...xs);
        positionDomain = min === max ? { min: min - 1, max: max + 1 } : { min, max };
      }

      const ticks = niceTicks(positionDomain.min, positionDomain.max, 5);

      // Domain extended to the tick range so markers + axis share a frame.
      const frame = {
        min: Math.min(positionDomain.min, ticks[0]),
        max: Math.max(positionDomain.max, ticks[ticks.length - 1]),
      };

      const markers = events.map((e, i) => {
        const x = MARGIN.left + scaleLinear(e.position, frame.min, frame.max, 0, plotWidth);
        const above = i % 2 === 0;
        return {
          index: i,
          x,
          above,
          tone: toneClass(e.tone, i),
          label: truncate(e.label),
          fullLabel: e.label,
          description: e.description,
          position: e.position,
        };
      });

      const tickEntries = ticks.map((tick) => ({
        value: tick,
        x: MARGIN.left + scaleLinear(tick, frame.min, frame.max, 0, plotWidth),
      }));

      const dataValueItems = events.map((e) =>
        e.description ? `${e.position}: ${e.label} — ${e.description}` : `${e.position}: ${e.label}`,
      );

      const svgChildren: ReturnType<typeof h>[] = [
        h("line", {
          class: "st-timelineChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: axisY,
          y2: axisY,
        }),
      ];

      for (const tick of tickEntries) {
        svgChildren.push(
          h("line", {
            key: `tick${tick.value}`,
            class: "st-timelineChart__tick",
            x1: tick.x,
            x2: tick.x,
            y1: axisY,
            y2: axisY + 5,
          }),
          h(
            "text",
            {
              key: `tickL${tick.value}`,
              class: "st-timelineChart__tickLabel",
              x: tick.x,
              y: height - MARGIN.bottom + 18,
              "text-anchor": "middle",
            },
            formatTick(tick.value),
          ),
        );
      }

      for (const m of markers) {
        const labelY = m.above ? axisY - 26 : axisY + 26;
        const connectorY = m.above ? axisY - 12 : axisY + 12;
        svgChildren.push(
          h("line", {
            key: `conn${m.index}`,
            class: classNames("st-timelineChart__connector", `st-timelineChart__connector--${m.tone}`),
            x1: m.x,
            x2: m.x,
            y1: axisY,
            y2: connectorY,
          }),
          h(
            "text",
            {
              key: `lbl${m.index}`,
              class: "st-timelineChart__eventLabel",
              x: m.x,
              y: labelY,
              "text-anchor": "middle",
              "dominant-baseline": m.above ? "auto" : "hanging",
            },
            m.label,
          ),
          h("circle", {
            key: `marker${m.index}`,
            class: classNames("st-timelineChart__marker", `st-timelineChart__marker--${m.tone}`),
            cx: m.x,
            cy: axisY,
            r: "6",
            "data-chart-index": m.index,
          }),
        );
      }

      const hovered = hoveredIndex.value !== null ? markers[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-timelineChart", props.class) }, [
        h(
          "div",
          {
            class: "st-timelineChart__visual",
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
        hovered
          ? h(
              "div",
              {
                class: "st-timelineChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.x / width) * 100}%; top: ${(axisY / height) * 100}%`,
              },
              [
                h("span", { class: "st-timelineChart__tooltipLabel" }, hovered.fullLabel),
                h("span", { class: "st-timelineChart__tooltipValue" }, String(hovered.position)),
                hovered.description
                  ? h("span", { class: "st-timelineChart__tooltipDesc" }, hovered.description)
                  : null,
              ],
            )
          : null,
      ]);
    };
  },
});
