<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { formatTick, niceTicks, scaleLinear } from './chartScale.js';

export type TimelineChartTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

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

defineOptions({ name: 'TimelineChart' });
const props = withDefaults(defineProps<TimelineChartProps>(), {
  width: 640, height: 240, class: undefined,
});

const attrs = useAttrs();
const rootProps = computed(() => ({
  ...attrs,
  class: classNames('st-timelineChart', props.class),
}));

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

const width = computed(() => props.width ?? 640);
const height = computed(() => props.height ?? 240);
const plotWidth = computed(() => Math.max(width.value - MARGIN.left - MARGIN.right, 1));
const axisY = computed(() => MARGIN.top + Math.max(height.value - MARGIN.top - MARGIN.bottom, 1) / 2);

// Sorted, finite-position events. `label` is required so missing labels drop.
const events = computed(() => (props.data ?? [])
  .filter((e: TimelineChartEvent) => Number.isFinite(e.position) && typeof e.label === 'string')
  .slice()
  .sort((a: TimelineChartEvent, b: TimelineChartEvent) => a.position - b.position));

const frame = computed(() => {
  const evs = events.value;
  let positionDomain: { min: number; max: number };
  if (evs.length === 0) {
    positionDomain = { min: 0, max: 1 };
  } else {
    const xs = evs.map((e: TimelineChartEvent) => e.position);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    positionDomain = min === max ? { min: min - 1, max: max + 1 } : { min, max };
  }
  const ticks = niceTicks(positionDomain.min, positionDomain.max, 5);
  return {
    min: Math.min(positionDomain.min, ticks[0]),
    max: Math.max(positionDomain.max, ticks[ticks.length - 1]),
  };
});

const markers = computed(() => events.value.map((e, i) => {
  const x = MARGIN.left + scaleLinear(e.position, frame.value.min, frame.value.max, 0, plotWidth.value);
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
}));

const tickEntries = computed(() => niceTicks(frame.value.min, frame.value.max, 5).map((tick) => ({
  value: tick,
  x: MARGIN.left + scaleLinear(tick, frame.value.min, frame.value.max, 0, plotWidth.value),
})));

const dataValueItems = computed(() => events.value.map((e: TimelineChartEvent) =>
  e.description ? `${e.position}: ${e.label} — ${e.description}` : `${e.position}: ${e.label}`,
));

const hovered = computed(() => hoveredIndex.value !== null ? markers.value[hoveredIndex.value] : undefined);
</script>

<template>
  <div v-bind="rootProps">
    <div class="st-timelineChart__visual" role="img" :aria-label="props.label" @pointermove="handleVisualPointerMove" @pointerleave="handleLeave">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
        <line class="st-timelineChart__axis" :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="axisY" :y2="axisY" />
        <template v-for="tick in tickEntries" :key="`tick${tick.value}`">
          <line class="st-timelineChart__tick" :x1="tick.x" :x2="tick.x" :y1="axisY" :y2="axisY + 5" />
          <text class="st-timelineChart__tickLabel" :x="tick.x" :y="height - MARGIN.bottom + 18" text-anchor="middle">{{ formatTick(tick.value) }}</text>
        </template>
        <template v-for="m in markers" :key="`conn${m.index}`">
          <line :class="classNames('st-timelineChart__connector', `st-timelineChart__connector--${m.tone}`)" :x1="m.x" :x2="m.x" :y1="axisY" :y2="m.above ? axisY - 12 : axisY + 12" />
          <text class="st-timelineChart__eventLabel" :x="m.x" :y="m.above ? axisY - 26 : axisY + 26" text-anchor="middle" :dominant-baseline="m.above ? 'auto' : 'hanging'">{{ m.label }}</text>
          <circle :class="classNames('st-timelineChart__marker', `st-timelineChart__marker--${m.tone}`)" :cx="m.x" :cy="axisY" r="6" :data-chart-index="m.index" />
        </template>
      </svg>
    </div>
    <ul v-if="dataValueItems.length > 0" class="st-chartDataList" :aria-label="`Data values for ${props.label}`">
      <li v-for="(item, i) in dataValueItems" :key="i">{{ item }}</li>
    </ul>
    <div v-if="hovered" class="st-timelineChart__tooltip" role="presentation" :style="`left: ${(hovered.x / width) * 100}%; top: ${(axisY / height) * 100}%`">
      <span class="st-timelineChart__tooltipLabel">{{ hovered.fullLabel }}</span>
      <span class="st-timelineChart__tooltipValue">{{ String(hovered.position) }}</span>
      <span v-if="hovered.description" class="st-timelineChart__tooltipDesc">{{ hovered.description }}</span>
    </div>
  </div>
</template>
