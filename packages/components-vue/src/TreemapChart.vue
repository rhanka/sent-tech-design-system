<script setup lang="ts">
import { computed, useId, useAttrs } from 'vue';
import { ref } from 'vue';
import { classNames } from './classNames.js';
import { labelColorForTone } from './chartScale.js';
export type TreemapChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';
export type TreemapChartDatum = {
  label: string;
  value: number;
  tone?: TreemapChartTone;
  children?: TreemapChartDatum[];
};
export type TreemapTiling = 'squarified';
export type TreemapChartProps = {
  data: TreemapChartDatum[];
  tiling?: TreemapTiling;
  showLabels?: boolean;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};
const TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;
const PADDING = 2;
type Rect = { x: number; y: number; w: number; h: number };
type Cell = {
  datum: TreemapChartDatum;
  value: number;
  tone: TreemapChartTone;
  textColor: string;
  rect: Rect;
  parentLabel?: string;
  depth: number;
};
const sumValue = (d: TreemapChartDatum): number => {
  if (d.children && d.children.length > 0) {
    return d.children.reduce((s, c) => s + sumValue(c), 0);
  }
  return Math.max(d.value, 0);
};
function squarify(
  nodes: Array<{ datum: TreemapChartDatum; value: number }>,
  rect: Rect,
): Array<{ datum: TreemapChartDatum; value: number; rect: Rect }> {
  const out: Array<{ datum: TreemapChartDatum; value: number; rect: Rect }> =
    [];
  const total = nodes.reduce((s, n) => s + n.value, 0);
  if (total <= 0 || nodes.length === 0) return out;

  const area = rect.w * rect.h;
  const scale = area / total;
  const items = nodes.map((n) => ({
    datum: n.datum,
    value: n.value,
    area: n.value * scale,
  }));

  let free: Rect = { ...rect };
  let row: typeof items = [];

  const worst = (r: typeof items, side: number): number => {
    if (r.length === 0 || side <= 0) return Infinity;
    const s = r.reduce((acc, it) => acc + it.area, 0);
    let max = -Infinity;
    let min = Infinity;
    for (const it of r) {
      if (it.area > max) max = it.area;
      if (it.area < min) min = it.area;
    }
    const s2 = s * s;
    const side2 = side * side;
    return Math.max((side2 * max) / s2, s2 / (side2 * min));
  };

  const layoutRow = (r: typeof items, side: number, area2: Rect): Rect => {
    const s = r.reduce((acc, it) => acc + it.area, 0);
    if (side <= 0) return area2;
    const thickness = s / side;
    if (area2.w >= area2.h) {
      let oy = area2.y;
      for (const it of r) {
        const hh = it.area / thickness;
        out.push({
          datum: it.datum,
          value: it.value,
          rect: { x: area2.x, y: oy, w: thickness, h: hh },
        });
        oy += hh;
      }
      return {
        x: area2.x + thickness,
        y: area2.y,
        w: area2.w - thickness,
        h: area2.h,
      };
    } else {
      let ox = area2.x;
      for (const it of r) {
        const w = it.area / thickness;
        out.push({
          datum: it.datum,
          value: it.value,
          rect: { x: ox, y: area2.y, w, h: thickness },
        });
        ox += w;
      }
      return {
        x: area2.x,
        y: area2.y + thickness,
        w: area2.w,
        h: area2.h - thickness,
      };
    }
  };

  for (const it of items) {
    const side = Math.min(free.w, free.h);
    const next = [...row, it];
    if (row.length === 0 || worst(next, side) <= worst(row, side)) {
      row = next;
    } else {
      free = layoutRow(row, side, free);
      row = [it];
    }
  }
  if (row.length > 0) {
    free = layoutRow(row, Math.min(free.w, free.h), free);
  }
  return out;
}
function inset(r: Rect, pad: number): Rect {
  const w = Math.max(r.w - pad * 2, 0);
  const h = Math.max(r.h - pad * 2, 0);
  return { x: r.x + pad, y: r.y + pad, w, h };
}
const LABEL_MIN_W = 44;
const LABEL_MIN_H = 22;
const VALUE_MIN_H = 38;
defineOptions({ name: 'TreemapChart', inheritAttrs: false });
const props = withDefaults(defineProps<TreemapChartProps>(), {
  tiling: 'squarified',
  showLabels: true,
  legend: false,
  width: 480,
  height: 300,
  class: undefined,
});
const attrs = useAttrs();
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
  const index = Number(target.getAttribute('data-chart-index'));
  hoveredIndex.value = Number.isInteger(index) ? index : null;
}
const clipPrefix = 'st-treemap-clip-' + useId().replaceAll('-', '');
const geometry = computed(() => {
  const data = props.data;
  const showLabels = props.showLabels ?? true;
  const legend = props.legend ?? false;
  const width = props.width ?? 480;
  const height = props.height ?? 300;
  const label = props.label;

  let cells: Cell[] = [];
  if (data && data.length !== 0) {
    // Squarify produit de meilleurs ratios d'aspect quand l'entrée est triée
    // par valeur décroissante (voir Bruls, Huizing, van Wijk 2000).
    const roots = data
      .map((d, i) => ({
        datum: d,
        value: sumValue(d),
        tone: d.tone ?? TONES[i % TONES.length],
      }))
      .filter((n) => n.value > 0)
      .sort((a, b) => b.value - a.value);
    if (roots.length !== 0) {
      const topRects = squarify(
        roots.map((r) => ({ datum: r.datum, value: r.value })),
        { x: 0, y: 0, w: width, h: height },
      );
      const result: Cell[] = [];
      topRects.forEach((tr) => {
        const root = roots.find((r) => r.datum === tr.datum)!;
        const children = (tr.datum.children ?? [])
          .filter((c) => Math.max(c.value, 0) > 0)
          .sort((a, b) => Math.max(b.value, 0) - Math.max(a.value, 0));
        if (children.length > 0) {
          const innerRect = inset(tr.rect, PADDING);
          const childRects = squarify(
            children.map((c) => ({ datum: c, value: Math.max(c.value, 0) })),
            innerRect,
          );
          childRects.forEach((cr, ci) => {
            const tone = cr.datum.tone ?? root.tone ?? TONES[ci % TONES.length];
            result.push({
              datum: cr.datum,
              value: cr.value,
              tone,
              textColor: labelColorForTone(tone),
              rect: inset(cr.rect, PADDING / 2),
              parentLabel: tr.datum.label,
              depth: 1,
            });
          });
        } else {
          result.push({
            datum: tr.datum,
            value: tr.value,
            tone: root.tone,
            textColor: labelColorForTone(root.tone),
            rect: inset(tr.rect, PADDING / 2),
            depth: 0,
          });
        }
      });
      cells = result;
    }
  }

  const legendItems = !data
    ? ([] as Array<{ label: string; tone: TreemapChartTone }>)
    : data
        .map((d, i) => ({
          label: d.label,
          tone: d.tone ?? TONES[i % TONES.length],
        }))
        .filter((_, i) => sumValue(data[i]) > 0);

  const dataValueItems = cells.map((c) =>
    c.parentLabel
      ? `${c.parentLabel}, ${c.datum.label}: ${c.value}`
      : `${c.datum.label}: ${c.value}`,
  );

  const hoveredIdx = hoveredIndex.value;

  return {
    cells,
    width,
    height,
    label,
    showLabels,
    legend,
    legendItems,
    dataValueItems,
    hoveredIdx,
    hoveredCell: hoveredIdx === null ? undefined : cells[hoveredIdx],
  };
});
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-treemapChart', props.class)) }" >
    <div
      class="st-treemapChart__visual"
      role="img"
      :aria-label="geometry.label"
      @pointermove="handleVisualPointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <clipPath
            v-for="(cell, i) in geometry.cells"
            :key="i"
            :id="`${clipPrefix}-${i}`"
          >
            <rect
              :x="cell.rect.x"
              :y="cell.rect.y"
              :width="cell.rect.w"
              :height="cell.rect.h"
              rx="2"
            />
          </clipPath>
        </defs>
        <g
          v-for="(cell, i) in geometry.cells"
          :key="
            cell.parentLabel
              ? cell.parentLabel + '/' + cell.datum.label
              : cell.datum.label
          "
          class="st-treemapChart__cell"
          :data-chart-index="i"
        >
          <rect
            :class="
              classNames(
                'st-treemapChart__rect',
                'st-treemapChart__rect--' + cell.tone,
                geometry.hoveredIdx !== null &&
                  geometry.hoveredIdx !== i &&
                  'st-treemapChart__rect--dim',
              )
            "
            :x="cell.rect.x"
            :y="cell.rect.y"
            :width="cell.rect.w"
            :height="cell.rect.h"
            rx="2"
            :data-chart-index="i"
          />
          <g
            v-if="
              geometry.showLabels &&
              cell.rect.w >= LABEL_MIN_W &&
              cell.rect.h >= LABEL_MIN_H
            "
            :clip-path="`url(#${clipPrefix}-${i})`"
          >
            <text
              class="st-treemapChart__label"
              :x="cell.rect.x + 6"
              :y="cell.rect.y + 15"
              :data-chart-index="i"
              :style="'fill: ' + cell.textColor"
            >
              {{ cell.datum.label }}
            </text>
            <text
              v-if="cell.rect.h >= VALUE_MIN_H"
              class="st-treemapChart__value"
              :x="cell.rect.x + 6"
              :y="cell.rect.y + 30"
              :data-chart-index="i"
              :style="'fill: ' + cell.textColor"
            >
              {{ String(cell.value) }}
            </text>
          </g>
        </g>
      </svg>
    </div>
    <ul
      v-if="geometry.dataValueItems.length"
      class="st-chartDataList"
      :aria-label="'Data values for ' + geometry.label"
    >
      <li v-for="(item, i) in geometry.dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="geometry.hoveredCell"
      class="st-treemapChart__tooltip"
      role="presentation"
      :style="`left: ${((geometry.hoveredCell.rect.x + geometry.hoveredCell.rect.w / 2) / geometry.width) * 100}%; top: ${(geometry.hoveredCell.rect.y / geometry.height) * 100}%`"
    >
      <span class="st-treemapChart__tooltipLabel">{{
        geometry.hoveredCell.parentLabel
          ? geometry.hoveredCell.parentLabel +
            ' · ' +
            geometry.hoveredCell.datum.label
          : geometry.hoveredCell.datum.label
      }}</span
      ><span class="st-treemapChart__tooltipValue">{{
        String(geometry.hoveredCell.value)
      }}</span>
    </div>
    <ul
      v-if="geometry.legend && geometry.legendItems.length"
      class="st-treemapChart__legend"
      aria-hidden="true"
    >
      <li
        v-for="item in geometry.legendItems"
        :key="item.label"
        class="st-treemapChart__legendItem"
      >
        <span
          :class="
            'st-treemapChart__legendSwatch st-treemapChart__legendSwatch--' +
            item.tone
          "
          aria-hidden="true"
        />{{ ' ' + item.label }}
      </li>
    </ul>
  </div>
</template>
