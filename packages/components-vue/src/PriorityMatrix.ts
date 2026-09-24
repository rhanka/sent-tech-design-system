import { defineComponent, h } from "vue";
import { placePriorityLabels } from "@sentropic/dataviz-core";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type PriorityMatrixTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PriorityMatrixDatum = {
  /** Complexité, 0–100 (bornée à l'affichage). */
  x: number;
  /** Valeur, 0–100 (bornée à l'affichage). */
  y: number;
  /** Étiquette affichée (une ou deux lignes). */
  label: string;
  tone?: PriorityMatrixTone;
};

export type PriorityMatrixProps = {
  data: PriorityMatrixDatum[];
  /** Titre visible au-dessus du cadre. */
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Seuils de quadrants (0–100). */
  xThreshold?: number;
  yThreshold?: number;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 26, right: 18, bottom: 36, left: 48 } as const;
const TICKS = [0, 20, 40, 60, 80, 100];

const TONES: PriorityMatrixTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const QUADRANT_NAMES: Record<string, string> = {
  "quick-wins": "Gains rapides",
  "major-projects": "Projets majeurs",
  wait: "Attendre",
  drop: "Ne pas faire",
};

function splitLabel(value: string): string[] {
  const chars = [...value];
  if (chars.length <= 12) return [value];
  const mid = Math.ceil(chars.length / 2);
  const space = value.lastIndexOf(" ", mid + 4);
  if (space > 2 && space < value.length - 2) return [value.slice(0, space), value.slice(space + 1)];
  return [value.slice(0, mid), value.slice(mid)];
}

export const PriorityMatrix = defineComponent({
  name: "PriorityMatrix",
  props: {
    data: { type: Array as () => PriorityMatrixDatum[], required: true },
    title: { type: String, default: "Matrice de priorisation" },
    xLabel: { type: String, default: "Complexité (0-100 pts)" },
    yLabel: { type: String, default: "Valeur (0-100 pts)" },
    xThreshold: { type: Number, default: 50 },
    yThreshold: { type: Number, default: 50 },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 400 },
    radius: { type: Number, default: 5 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const width = props.width ?? 640;
      const height = props.height ?? 400;
      const radius = props.radius ?? 5;
      const label = props.label;
      const data = props.data;
      const xThreshold = props.xThreshold ?? 50;
      const yThreshold = props.yThreshold ?? 50;

      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const scaleX = (v: number) => MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * plotW;
      const scaleY = (v: number) => MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * plotH;
      const tx = scaleX(xThreshold);
      const ty = scaleY(yThreshold);

      const quads = [
        { id: "quick-wins", x: MARGIN.left, y: MARGIN.top, w: tx - MARGIN.left, h: ty - MARGIN.top },
        { id: "major-projects", x: tx, y: MARGIN.top, w: MARGIN.left + plotW - tx, h: ty - MARGIN.top },
        { id: "wait", x: MARGIN.left, y: ty, w: tx - MARGIN.left, h: MARGIN.top + plotH - ty },
        { id: "drop", x: tx, y: ty, w: MARGIN.left + plotW - tx, h: MARGIN.top + plotH - ty },
      ];
      const quadNames = [
        { id: "quick-wins", x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: "start" },
        { id: "major-projects", x: MARGIN.left + plotW - 6, y: MARGIN.top + 14, anchor: "end" },
        { id: "wait", x: MARGIN.left + 6, y: MARGIN.top + plotH - 8, anchor: "start" },
        { id: "drop", x: MARGIN.left + plotW - 6, y: MARGIN.top + plotH - 8, anchor: "end" },
      ];

      const points = data.map((d, i) => ({
        cx: scaleX(d.x),
        cy: scaleY(d.y),
        datum: d,
        index: i,
        tone: (d.tone ?? TONES[i % TONES.length]) as PriorityMatrixTone,
      }));

      const boxes = data.map((d) => {
        const lines = splitLabel(d.label);
        const longest = Math.max(...lines.map((l) => [...l].length));
        return { w: Math.min(120, 12 + 7 * longest), h: lines.length > 1 ? 34 : 20, lines };
      });
      const placed = placePriorityLabels(
        data.map((d) => ({ x: d.x, y: d.y, label: d.label })),
        boxes,
        { width, height, marginLeft: MARGIN.left, marginTop: MARGIN.top, plotWidth: plotW, plotHeight: plotH },
        { xThreshold, yThreshold },
      ).map((p) => ({ ...p, lines: boxes[p.index]!.lines as string[] }));

      const dataValueItems = data.map((d) => `${d.label} : complexité ${d.x}, valeur ${d.y}`);

      const svgChildren: ReturnType<typeof h>[] = [];

      if (props.title) {
        svgChildren.push(h("text", { class: "st-priorityMatrix__title", x: MARGIN.left, y: 15, "text-anchor": "start" }, props.title));
      }

      for (const q of quads) {
        svgChildren.push(
          h("rect", { key: q.id, class: `st-priorityMatrix__quad st-priorityMatrix__quad--${q.id}`, x: q.x, y: q.y, width: q.w, height: q.h }),
        );
      }

      for (const t of TICKS) {
        const y = scaleY(t);
        svgChildren.push(
          h("line", { key: `gy${t}`, class: "st-priorityMatrix__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h("text", { key: `ty${t}`, class: "st-priorityMatrix__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" }, String(t)),
        );
      }
      for (const t of TICKS) {
        svgChildren.push(
          h("text", { key: `tx${t}`, class: "st-priorityMatrix__tick", x: scaleX(t), y: height - MARGIN.bottom + 16, "text-anchor": "middle" }, String(t)),
        );
      }

      svgChildren.push(
        h("line", { class: "st-priorityMatrix__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-priorityMatrix__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        h("line", { class: "st-priorityMatrix__threshold", x1: tx, x2: tx, y1: MARGIN.top, y2: MARGIN.top + plotH }),
        h("line", { class: "st-priorityMatrix__threshold", x1: MARGIN.left, x2: MARGIN.left + plotW, y1: ty, y2: ty }),
      );

      for (const q of quadNames) {
        svgChildren.push(
          h("text", { key: q.id, class: "st-priorityMatrix__quadName", x: q.x, y: q.y, "text-anchor": q.anchor }, QUADRANT_NAMES[q.id]!),
        );
      }

      if (props.xLabel) {
        svgChildren.push(
          h("text", { class: "st-priorityMatrix__axisLabel", x: MARGIN.left + plotW / 2, y: height - 4, "text-anchor": "middle" }, props.xLabel),
        );
      }
      if (props.yLabel) {
        svgChildren.push(
          h(
            "text",
            { class: "st-priorityMatrix__axisLabel", x: 12, y: MARGIN.top + plotH / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${MARGIN.top + plotH / 2})` },
            props.yLabel,
          ),
        );
      }

      for (const p of points) {
        svgChildren.push(
          h("circle", { key: `p${p.index}`, class: `st-priorityMatrix__point st-priorityMatrix__point--${p.tone}`, cx: p.cx, cy: p.cy, r: radius }),
        );
      }

      for (const p of placed) {
        svgChildren.push(
          h("line", { key: `l${p.index}`, class: "st-priorityMatrix__leader", x1: p.leaderX1, y1: p.leaderY1, x2: p.leaderX2, y2: p.leaderY2 }),
          h("rect", { key: `b${p.index}`, class: "st-priorityMatrix__labelBox", x: p.x, y: p.y, width: p.w, height: p.h, rx: "3" }),
          ...p.lines.map((line, li) =>
            h("text", { key: `t${p.index}-${li}`, class: "st-priorityMatrix__labelText", x: p.x + p.w / 2, y: p.y + 13 + li * 13, "text-anchor": "middle" }, line),
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-priorityMatrix", props.class) }, [
        h(
          "div",
          { class: "st-priorityMatrix__visual", role: "img", "aria-label": label },
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
      ]);
    };
  },
});
