<script setup lang="ts">
import { computed, ref } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type RenkoChartDirection = 'up' | 'down';

export type RenkoChartDatum = {
  /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
  date: number;
  /** Prix de clôture : pilote la formation des briques. */
  close: number;
};

export type RenkoChartProps = {
  data: RenkoChartDatum[];
  boxSize?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

defineOptions({ name: 'RenkoChart', inheritAttrs: false });
const props = withDefaults(defineProps<RenkoChartProps>(), {
  data: () => [], boxSize: undefined, label: undefined, width: 640, height: 320, size: undefined, class: undefined,
});

const hoveredKey = ref<string | null>(null);

function handlePointerMove(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) {
    hoveredKey.value = null;
    return;
  }
  hoveredKey.value = target.getAttribute('data-chart-key');
}

function handleLeave() {
  hoveredKey.value = null;
}

const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 320);
const label = computed(() => props.label);
const dataListLabel = computed(() => label.value ?? 'renko');

const validData = computed(() =>
  (props.data ?? []).filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close)),
);

const closes = computed(() => validData.value.map((d) => d.close));

const effectiveBox = computed(() => {
  const boxSize = props.boxSize;
  return Number.isFinite(boxSize) && (boxSize as number) > 0
    ? (boxSize as number)
    : closes.value.length
      ? Math.max(...closes.value) - Math.min(...closes.value) > 0
        ? (Math.max(...closes.value) - Math.min(...closes.value)) / 20
        : 1
      : 1;
});

type Brick = { bottom: number; top: number; direction: RenkoChartDirection };
const bricks = computed<Brick[]>(() => {
  const result: Brick[] = [];
  const valid = validData.value;
  const box = effectiveBox.value;
  if (valid.length > 0 && box > 0) {
    let base = valid[0].close;
    let direction: RenkoChartDirection | null = null;
    for (let i = 1; i < valid.length; i++) {
      const price = valid[i].close;

      if (direction !== 'down') {
        while (price >= base + box) {
          result.push({ bottom: base, top: base + box, direction: 'up' });
          base += box;
          direction = 'up';
        }
      }

      if (direction === 'up') {
        if (price <= base - 2 * box) {
          base -= box;
          do {
            result.push({ bottom: base - box, top: base, direction: 'down' });
            base -= box;
            direction = 'down';
          } while (price <= base - box);
        }
        continue;
      }

      while (price <= base - box) {
        result.push({ bottom: base - box, top: base, direction: 'down' });
        base -= box;
        direction = 'down';
      }

      if (direction === 'down' && price >= base + 2 * box) {
        base += box;
        do {
          result.push({ bottom: base, top: base + box, direction: 'up' });
          base += box;
          direction = 'up';
        } while (price >= base + box);
      }
    }
  }
  return result;
});

const priceMin = computed(() => {
  if (bricks.value.length === 0) return closes.value.length ? Math.min(...closes.value) : 0;
  return Math.min(...bricks.value.map((b) => b.bottom));
});
const priceMax = computed(() => {
  if (bricks.value.length === 0) return closes.value.length ? Math.max(...closes.value) : 0;
  return Math.max(...bricks.value.map((b) => b.top));
});

const yTicks = computed(() => niceTicks(priceMin.value, priceMax.value));
const yMin = computed(() => yTicks.value[0]);
const yMax = computed(() => yTicks.value[yTicks.value.length - 1]);
const plotW = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const plotH = computed(() => Math.max(height.value - MARGIN.top - MARGIN.bottom, 1));

const colW = computed(() => (bricks.value.length > 0 ? plotW.value / bricks.value.length : plotW.value));
const brickW = computed(() => colW.value * 0.86);

type Column = {
  key: string;
  brick: Brick;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  direction: RenkoChartDirection;
};
const columns = computed<Column[]>(() =>
  bricks.value.map((b, i) => {
    const cx = MARGIN.left + colW.value * i + colW.value / 2;
    const top = MARGIN.top + scaleLinear(b.top, yMin.value, yMax.value, plotH.value, 0);
    const bottom = MARGIN.top + scaleLinear(b.bottom, yMin.value, yMax.value, plotH.value, 0);
    return {
      key: `${i}`,
      brick: b,
      x: cx - brickW.value / 2,
      y: Math.min(top, bottom),
      width: brickW.value,
      height: Math.max(Math.abs(bottom - top), 0.5),
      cx,
      cy: (top + bottom) / 2,
      direction: b.direction,
    };
  }),
);

const dataValueItems = computed(() =>
  columns.value.map((c) => `${c.direction === 'up' ? '▲' : '▼'} ${formatTick(c.brick.bottom)} → ${formatTick(c.brick.top)}`),
);

const hoveredColumn = computed(() =>
  hoveredKey.value === null ? null : columns.value.find((c) => c.key === hoveredKey.value) ?? null,
);

function gridY(t: number): number {
  return MARGIN.top + scaleLinear(t, yMin.value, yMax.value, plotH.value, 0);
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-renkoChart', props.class)) }" >
    <div
      class="st-renkoChart__visual"
      role="img"
      :aria-label="label"
      @pointermove="handlePointerMove"
      @pointerleave="handleLeave"
    >
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
      >
        <template v-for="t in yTicks" :key="t">
          <line class="st-renkoChart__grid" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="gridY(t)" :y2="gridY(t)" />
          <text class="st-renkoChart__tick" :x="MARGIN.left - 6" :y="gridY(t)" text-anchor="end" dominant-baseline="middle">{{ formatTick(t) }}</text>
        </template>
        <line class="st-renkoChart__axis" :x1="MARGIN.left" :x2="MARGIN.left" :y1="MARGIN.top" :y2="height - MARGIN.bottom" />
        <line class="st-renkoChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="height - MARGIN.bottom" :y2="height - MARGIN.bottom" />
        <rect
          v-for="c in columns"
          :key="c.key"
          :class="classNames(
            'st-renkoChart__brick',
            `st-renkoChart__brick--${c.direction}`,
            hoveredKey !== null && hoveredKey !== c.key ? 'st-renkoChart__brick--dim' : undefined,
          )"
          :x="c.x"
          :y="c.y"
          :width="c.width"
          :height="c.height"
          :data-chart-key="c.key"
        />
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${dataListLabel}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div
      v-if="hoveredColumn"
      class="st-renkoChart__tooltip"
      role="presentation"
      :style="{ left: `${(hoveredColumn.cx / width) * 100}%`, top: `${(hoveredColumn.cy / height) * 100}%` }"
    >
      <span class="st-renkoChart__tooltipLabel">{{ hoveredColumn.direction === 'up' ? '▲' : '▼' }}</span>
      <span class="st-renkoChart__tooltipValue">{{ `${formatTick(hoveredColumn.brick.bottom)} → ${formatTick(hoveredColumn.brick.top)}` }}</span>
    </div>
  </div>
</template>
