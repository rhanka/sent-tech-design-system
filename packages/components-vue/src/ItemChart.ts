import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type ItemChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ItemChartDatum = {
  label: string;
  value: number;
  tone?: ItemChartTone;
};

export type ItemChartSeat = {
  x: number;
  y: number;
  r: number;
  tone: ItemChartTone;
  groupIndex: number;
};

export type ItemChartProps = {
  data: ItemChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ItemChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export function seatCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

/**
 * Construit la liste ordonnée des sièges de l'hémicycle, puis affecte chaque
 * siège à un groupe dans l'ordre fourni (blocs contigus). Pur, sans état.
 */
export function buildSeats(
  counts: number[],
  width: number,
  height: number,
): { seats: ItemChartSeat[]; cx: number; cy: number } {
  const total = counts.reduce((sum, c) => sum + c, 0);
  const cx = width / 2;
  const cy = height - 8;
  if (total <= 0) return { seats: [], cx, cy };

  const rows = Math.max(1, Math.min(5, Math.round(Math.sqrt(total / 12)) || 1));
  const outerR = Math.max(Math.min(cx, cy) - 14, 1);
  const innerR = outerR * 0.42;
  const rowGap = rows > 1 ? (outerR - innerR) / (rows - 1) : 0;

  // Poids de chaque rangée ∝ son rayon (rangées extérieures = plus de sièges).
  const radii: number[] = [];
  let weightSum = 0;
  for (let r = 0; r < rows; r++) {
    const radius = rows > 1 ? innerR + rowGap * r : (innerR + outerR) / 2;
    radii.push(radius);
    weightSum += radius;
  }

  // Répartit `total` sièges sur les rangées au prorata du rayon (reste au plus
  // grand résidu) pour conserver exactement `total` sièges.
  const perRowFloat = radii.map((radius) => (total * radius) / weightSum);
  const perRow = perRowFloat.map((v) => Math.floor(v));
  let assigned = perRow.reduce((sum, c) => sum + c, 0);
  const residuals = perRowFloat
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  let ri = 0;
  while (assigned < total) {
    perRow[residuals[ri % residuals.length].i] += 1;
    assigned += 1;
    ri += 1;
  }

  // Rayon du point ≈ moitié de l'espacement de rangée, borné par l'arc.
  const seatR = Math.max(2, Math.min(rowGap > 0 ? rowGap * 0.34 : outerR * 0.12, outerR * 0.12));

  const ordered: { x: number; y: number; r: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const radius = radii[r];
    const n = perRow[r];
    if (n <= 0) continue;
    // Demi-cercle de la GAUCHE (π) vers la DROITE (0) en passant par le HAUT.
    for (let s = 0; s < n; s++) {
      const t = n === 1 ? 0.5 : s / (n - 1);
      const angle = Math.PI - t * Math.PI;
      ordered.push({
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle),
        r: seatR,
      });
    }
  }

  // Attribution des sièges ordonnés aux groupes (blocs contigus).
  const seats: ItemChartSeat[] = [];
  let cursor = 0;
  for (let g = 0; g < counts.length; g++) {
    const tone = TONES[g % TONES.length];
    for (let k = 0; k < counts[g] && cursor < ordered.length; k++) {
      const seat = ordered[cursor++];
      seats.push({ x: seat.x, y: seat.y, r: seat.r, tone, groupIndex: g });
    }
  }
  return { seats, cx, cy };
}

export const ItemChart = defineComponent({
  name: "ItemChart",
  props: {
    data: { type: Array as () => ItemChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
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
      const data = props.data ?? [];
      const width = props.width ?? 480;
      const height = props.height ?? 280;
      const label = props.label;

      const groups = data.map((datum, index) => ({
        datum,
        count: seatCount(datum.value),
        tone: datum.tone ?? TONES[index % TONES.length],
      }));

      const layout = buildSeats(
        groups.map((g) => g.count),
        width,
        height,
      );

      // Sièges avec le ton EFFECTIF du groupe (respecte un `tone` explicite).
      const seats = layout.seats.map((seat) => ({
        ...seat,
        tone: groups[seat.groupIndex]?.tone ?? seat.tone,
      }));

      const dataValueItems = groups.map((g) => `${g.datum.label}: ${g.count}`);
      const total = groups.reduce((sum, g) => sum + g.count, 0);

      const svgChildren: ReturnType<typeof h>[] = [];

      seats.forEach((seat, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== seat.groupIndex;
        svgChildren.push(
          h("circle", {
            key: `seat-${i}`,
            class: classNames(
              "st-itemChart__seat",
              `st-itemChart__seat--${seat.tone}`,
              isDim ? "st-itemChart__seat--dim" : undefined,
            ),
            cx: seat.x,
            cy: seat.y,
            r: seat.r,
            "data-chart-index": seat.groupIndex,
          }),
        );
      });

      if (total > 0) {
        svgChildren.push(
          h(
            "text",
            {
              key: "total",
              class: "st-itemChart__total",
              x: layout.cx,
              y: layout.cy - 6,
              "text-anchor": "middle",
            },
            String(total),
          ),
        );
      }

      const hovered = hoveredIndex.value !== null ? groups[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-itemChart", props.class) }, [
        h(
          "div",
          {
            class: "st-itemChart__visual",
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
        h(
          "ul",
          { class: "st-itemChart__legend", "aria-hidden": "true" },
          groups.map((group, i) =>
            h(
              "li",
              {
                key: group.datum.label,
                class: classNames(
                  "st-itemChart__legendItem",
                  hoveredIndex.value !== null && hoveredIndex.value !== i ? "st-itemChart__legendItem--dim" : undefined,
                ),
              },
              [
                h("span", { class: classNames("st-itemChart__swatch", `st-itemChart__swatch--${group.tone}`) }),
                h("span", { class: "st-itemChart__legendLabel" }, group.datum.label),
                h("span", { class: "st-itemChart__legendValue" }, String(group.count)),
              ],
            ),
          ),
        ),
        chartDataList(label, dataValueItems),
        hovered
          ? h(
              "div",
              { class: "st-itemChart__tooltip", role: "presentation" },
              [
                h("span", { class: "st-itemChart__tooltipLabel" }, hovered.datum.label),
                h("span", { class: "st-itemChart__tooltipValue" }, String(hovered.count)),
              ],
            )
          : null,
      ]);
    };
  },
});
