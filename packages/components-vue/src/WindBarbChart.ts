import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WindBarbChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type WindBarbChartDatum = {
  /** Position sur l'axe temporel (timestamp ou index). */
  at: number;
  /** Vitesse du vent en nœuds (≥ 0) : pilote les barbules et la couleur. */
  speed: number;
  /** Direction (d'où vient le vent) en DEGRÉS (0° = Nord). */
  direction: number;
};

export type WindBarbChartProps = {
  data: WindBarbChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 24 } as const;

const TONES: WindBarbChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

// Décompose une vitesse (kt) en barbules météo : fanions (50), pleines (10),
// demi (5). On arrondit au plus proche multiple de 5 (convention standard).
function barbCounts(speed: number): { flags: number; full: number; half: number } {
  let rounded = Math.round(speed / 5) * 5;
  if (rounded < 0) rounded = 0;
  const flags = Math.floor(rounded / 50);
  rounded -= flags * 50;
  const full = Math.floor(rounded / 10);
  rounded -= full * 10;
  const half = Math.floor(rounded / 5);
  return { flags, full, half };
}

type BarbTick = { x1: number; y1: number; x2: number; y2: number; kind: "full" | "half" | "flag1" | "flag2" };

export const WindBarbChart = defineComponent({
  name: "WindBarbChart",
  props: {
    data: { type: Array as () => WindBarbChartDatum[], default: () => [] },
    label: { type: String, default: undefined },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 160 },
    size: { type: Number, default: 32 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredKey = ref<string | null>(null);

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredKey.value = null;
        return;
      }
      hoveredKey.value = target.getAttribute("data-chart-key");
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 640;
      const height = props.height ?? 160;
      const size = props.size ?? 32;

      // Points valides : position finie, vitesse finie ≥ 0, direction finie.
      const validData = data.filter(
        (d) =>
          d &&
          Number.isFinite(d.at) &&
          Number.isFinite(d.speed) &&
          d.speed >= 0 &&
          Number.isFinite(d.direction),
      );

      const ats = validData.map((d) => d.at);
      const xTicks = niceTicks(Math.min(...ats), Math.max(...ats));
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const xMin = xTicks[0];
      const xMax = xTicks[xTicks.length - 1];

      const maxSpeed = validData.reduce((max, d) => (d.speed > max ? d.speed : max), 0);

      // Ligne de base des barbes : centrée verticalement dans la zone de tracé.
      const baseY = MARGIN.top + (height - MARGIN.top - MARGIN.bottom) / 2;

      // Une barbe par point : hampe orientée + barbules le long de la hampe.
      const barbs = validData.map((d, i) => {
        const cx = MARGIN.left + scaleLinear(d.at, xMin, xMax, 0, plotW);
        const cy = baseY;
        const max = maxSpeed > 0 ? maxSpeed : 1;
        const rad = ((d.direction - 90) * Math.PI) / 180;
        const ux = Math.cos(rad);
        const uy = Math.sin(rad);
        const tipX = cx + ux * size;
        const tipY = cy + uy * size;
        const px = -uy;
        const py = ux;
        const { flags, full, half } = barbCounts(d.speed);
        const barbLen = size * 0.42;
        const halfLen = barbLen * 0.55;
        const spacing = size * 0.16;
        const ticks: BarbTick[] = [];
        let along = size - spacing;
        for (let f = 0; f < flags; f++) {
          const aX = cx + ux * along;
          const aY = cy + uy * along;
          const bAlong = along - spacing;
          const bX = cx + ux * bAlong;
          const bY = cy + uy * bAlong;
          const tipFX = aX + px * barbLen;
          const tipFY = aY + py * barbLen;
          ticks.push({ x1: aX, y1: aY, x2: tipFX, y2: tipFY, kind: "flag1" });
          ticks.push({ x1: bX, y1: bY, x2: tipFX, y2: tipFY, kind: "flag2" });
          along = bAlong - spacing;
        }
        for (let f = 0; f < full; f++) {
          const aX = cx + ux * along;
          const aY = cy + uy * along;
          ticks.push({ x1: aX, y1: aY, x2: aX + px * barbLen, y2: aY + py * barbLen, kind: "full" });
          along -= spacing;
        }
        for (let hh = 0; hh < half; hh++) {
          const aX = cx + ux * along;
          const aY = cy + uy * along;
          ticks.push({ x1: aX, y1: aY, x2: aX + px * halfLen, y2: aY + py * halfLen, kind: "half" });
          along -= spacing;
        }
        const bin = Math.min(Math.floor((d.speed / max) * TONES.length), TONES.length - 1);
        return {
          key: `${i}`,
          datum: d,
          cx,
          cy,
          tipX,
          tipY,
          ticks,
          tone: TONES[Math.max(0, bin)],
        };
      });

      const dataValueItems = validData.map(
        (d) => `${formatTick(d.at)} · ${formatTick(d.speed)} kt @ ${formatTick(d.direction)}°`,
      );

      const hoveredBarb =
        hoveredKey.value === null ? null : barbs.find((b) => b.key === hoveredKey.value) ?? null;

      const svgChildren: ReturnType<typeof h>[] = [];

      for (const t of xTicks) {
        const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
        svgChildren.push(
          h(
            "text",
            { key: `tx${t}`, class: "st-windBarbChart__tick", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", {
          class: "st-windBarbChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      barbs.forEach((b) => {
        svgChildren.push(
          h(
            "g",
            {
              key: b.key,
              class: classNames(
                "st-windBarbChart__barb",
                `st-windBarbChart__barb--${b.tone}`,
                hoveredKey.value !== null && hoveredKey.value !== b.key ? "st-windBarbChart__barb--dim" : undefined,
              ),
            },
            [
              h("line", { class: "st-windBarbChart__shaft", x1: b.cx, y1: b.cy, x2: b.tipX, y2: b.tipY, "data-chart-key": b.key }),
              ...b.ticks.map((tk, ti) =>
                h("line", {
                  key: ti,
                  class: classNames("st-windBarbChart__feather", `st-windBarbChart__feather--${tk.kind}`),
                  x1: tk.x1,
                  y1: tk.y1,
                  x2: tk.x2,
                  y2: tk.y2,
                }),
              ),
            ],
          ),
        );
      });

      const children: ReturnType<typeof h>[] = [
        h(
          "div",
          {
            class: "st-windBarbChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handlePointerMove,
            onPointerleave: () => (hoveredKey.value = null),
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

      const list = chartDataList(label ?? "wind barb", dataValueItems);
      if (list) children.push(list);

      if (hoveredBarb) {
        children.push(
          h(
            "div",
            {
              class: "st-windBarbChart__tooltip",
              role: "presentation",
              style: { left: `${(hoveredBarb.cx / width) * 100}%`, top: `${(hoveredBarb.cy / height) * 100}%` },
            },
            [
              h("span", { class: "st-windBarbChart__tooltipLabel" }, `${formatTick(hoveredBarb.datum.at)}`),
              h(
                "span",
                { class: "st-windBarbChart__tooltipValue" },
                `${formatTick(hoveredBarb.datum.speed)} kt @ ${formatTick(hoveredBarb.datum.direction)}°`,
              ),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-windBarbChart", props.class) }, children);
    };
  },
});
