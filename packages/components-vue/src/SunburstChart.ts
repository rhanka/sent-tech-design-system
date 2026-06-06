import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type SunburstChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SunburstChartDatum = {
  label: string;
  value?: number;
  tone?: SunburstChartTone;
  children?: SunburstChartDatum[];
};

export type SunburstChartProps = {
  data: SunburstChartDatum;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

const TONES: SunburstChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];
const TWO_PI = Math.PI * 2;

type ArcDatum = {
  datum: SunburstChartDatum;
  pathLabel: string[];
  value: number;
  tone: SunburstChartTone;
  depth: number;
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
  index: number;
};

function leafValue(value: number | undefined): number {
  return Number.isFinite(value) && (value ?? 0) > 0 ? (value as number) : 0;
}

function sumValue(node: SunburstChartDatum): number {
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, child) => sum + sumValue(child), 0);
  }
  return leafValue(node.value);
}

function maxDepth(node: SunburstChartDatum, depth = 0): number {
  if (!node.children || node.children.length === 0) return depth;
  return Math.max(depth, ...node.children.map((child) => maxDepth(child, depth + 1)));
}

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, start: number, end: number): string {
  const safeEnd = Math.min(end, start + TWO_PI - 0.0001);
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, outerRadius, start);
  const [x1o, y1o] = polar(cx, cy, outerRadius, safeEnd);

  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${x0o} ${y0o} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x1o} ${y1o} Z`;
  }

  const [x1i, y1i] = polar(cx, cy, innerRadius, safeEnd);
  const [x0i, y0i] = polar(cx, cy, innerRadius, start);
  return `M ${x0o} ${y0o} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${x0i} ${y0i} Z`;
}

function collectLeafItems(node: SunburstChartDatum, path: string[]): string[] {
  if (node.children && node.children.length > 0) {
    return node.children.flatMap((child) => collectLeafItems(child, [...path, child.label]));
  }
  const v = leafValue(node.value);
  if (v === 0) return [];
  return [`${path.join(", ")}: ${v}`];
}

export const SunburstChart = defineComponent({
  name: "SunburstChart",
  props: {
    data: { type: Object as () => SunburstChartDatum, required: true },
    width: { type: Number, default: 320 },
    height: { type: Number, default: 320 },
    legend: { type: Boolean, default: false },
    label: { type: String, required: true },
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
      const data = props.data;
      const width = props.width ?? 320;
      const height = props.height ?? 320;
      const legend = props.legend ?? false;
      const label = props.label;

      const cx = width / 2;
      const cy = height / 2;
      const ringCount = Math.max(1, maxDepth(data));
      const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
      const ring = outerLimit / ringCount;
      const total = sumValue(data);

      const arcs: ArcDatum[] = [];

      function visit(
        node: SunburstChartDatum,
        depth: number,
        start: number,
        end: number,
        pathLabel: string[],
        inheritedTone: SunburstChartTone,
        siblingIndex: number,
      ) {
        if (depth > 0) {
          const tone = node.tone ?? inheritedTone ?? TONES[siblingIndex % TONES.length];
          const innerRadius = (depth - 1) * ring;
          const outerRadius = depth * ring;
          const midAngle = (start + end) / 2;
          const midRadius = (innerRadius + outerRadius) / 2;
          const [lx, ly] = polar(cx, cy, midRadius, midAngle);
          const index = arcs.length;
          arcs.push({
            datum: node,
            pathLabel,
            value: sumValue(node),
            tone,
            depth,
            start,
            end,
            path: arcPath(cx, cy, innerRadius, outerRadius, start, end),
            labelX: lx,
            labelY: ly,
            index,
          });
        }

        const children = node.children ?? [];
        const nodeTotal = children.reduce((sum, child) => sum + sumValue(child), 0);
        if (children.length === 0 || nodeTotal <= 0) return;

        let cursor = start;
        children.forEach((child, childIndex) => {
          const value = sumValue(child);
          if (value <= 0) return;
          const span = ((end - start) * value) / nodeTotal;
          const tone = child.tone ?? (depth === 0 ? TONES[childIndex % TONES.length] : inheritedTone);
          visit(child, depth + 1, cursor, cursor + span, [...pathLabel, child.label], tone, childIndex);
          cursor += span;
        });
      }

      if (total > 0 && data.children && data.children.length > 0) {
        visit(data, 0, -Math.PI / 2, Math.PI * 1.5, [data.label], "category1" as SunburstChartTone, 0);
      }

      const svgChildren: ReturnType<typeof h>[] = [];

      // Arcs
      arcs.forEach((arc, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h("path", {
            key: arc.pathLabel.join("/"),
            class: classNames(
              "st-sunburstChart__arc",
              `st-sunburstChart__arc--${arc.tone}`,
              isDim ? "st-sunburstChart__arc--dim" : undefined,
            ),
            d: arc.path,
            "data-chart-index": arc.index,
          }),
        );
      });

      // Labels with contrast
      arcs.forEach((arc) => {
        if (arc.end - arc.start > 0.28) {
          svgChildren.push(
            h(
              "text",
              {
                key: `lbl${arc.pathLabel.join("/")}`,
                class: "st-sunburstChart__label",
                x: arc.labelX,
                y: arc.labelY,
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                fill: contrastTextForTone(arc.tone),
              },
              arc.datum.label,
            ),
          );
        }
      });

      const leafItems = collectLeafItems(data, [data.label]);
      const hovered = hoveredIndex.value !== null ? arcs[hoveredIndex.value] : undefined;

      const legendItems = (data.children ?? []).map((child, index) => ({
        label: child.label,
        tone: child.tone ?? TONES[index % TONES.length],
      }));

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-sunburstChart__visual",
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
        chartDataList(label, leafItems),
      ];

      if (hovered) {
        children.push(
          h(
            "div",
            {
              class: "st-sunburstChart__tooltip",
              role: "presentation",
              style: `left: ${(hovered.labelX / width) * 100}%; top: ${(hovered.labelY / height) * 100}%`,
            },
            [
              h("span", { class: "st-sunburstChart__tooltipLabel" }, hovered.pathLabel.join(", ")),
              h("span", { class: "st-sunburstChart__tooltipValue" }, String(hovered.value)),
            ],
          ),
        );
      }

      if (legend && legendItems.length > 0) {
        children.push(
          h(
            "ul",
            { class: "st-sunburstChart__legend", "aria-hidden": "true" },
            legendItems.map((item) =>
              h("li", { key: item.label, class: "st-sunburstChart__legendItem" }, [
                h("span", { class: `st-sunburstChart__legendSwatch st-sunburstChart__legendSwatch--${item.tone}`, "aria-hidden": "true" }),
                ` ${item.label}`,
              ]),
            ),
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-sunburstChart", props.class) }, children);
    };
  },
});
