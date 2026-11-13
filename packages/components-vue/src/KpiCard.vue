<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';
import {
  cellDecorationClass,
  cellDecorationIconNodes,
  cellDecorationLabel,
  hasCellDecorationIcon,
  type CellDecoration,
} from './cellDecoration.js';

export type { CellDecoration, CellDecorationIntent } from './cellDecoration.js';

export type KpiCardSize = 'sm' | 'md' | 'lg';
export type KpiCardTrend = 'up' | 'down' | 'flat';
export type KpiCardFormat = 'number' | 'currency' | 'percent';
export type KpiCardDeltaFormat = 'percent' | 'absolute';
export type KpiCardTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type KpiCardProps = {
  /**
   * Valeur principale. Si `format="percent"`, `value` est une FRACTION (0–1) :
   * passer `0.42` affiche « 42 % » (Intl multiplie par 100). Le formatage ne
   * s'applique qu'aux `number` ; une `string` est rendue telle quelle.
   */
  value: number | string;
  label: string;
  /**
   * Variation. En `deltaFormat="percent"` (défaut), `delta` est une FRACTION :
   * `0.12` → « +12 % ». NaN/Infinity sont rendus inertes.
   */
  delta?: number;
  deltaFormat?: KpiCardDeltaFormat;
  trend?: KpiCardTrend;
  format?: KpiCardFormat;
  unit?: string;
  currency?: string;
  locale?: string;
  sparkline?: number[];
  size?: KpiCardSize;
  tone?: KpiCardTone;
  /**
   * Conditional formatting : décoration sémantique de la carte (intent → token
   * feedback en fond teinté accessible + icône lucide optionnelle).
   */
  decoration?: CellDecoration;
  class?: string;
};

defineOptions({ name: 'KpiCard', inheritAttrs: false });
const props = withDefaults(defineProps<KpiCardProps>(), {
  delta: undefined, deltaFormat: 'percent', trend: undefined, format: 'number', unit: undefined,
  currency: 'EUR', locale: undefined, sparkline: undefined, size: 'md', tone: undefined,
  decoration: undefined, class: undefined,
});

const resolvedTrend = computed<KpiCardTrend | undefined>(() => {
  const delta = props.delta;
  return props.trend ?? (delta == null ? undefined : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat');
});

const formattedValue = computed(() => {
  const value = props.value;
  const format = props.format ?? 'number';
  const currency = props.currency ?? 'EUR';
  const locale = props.locale;
  if (typeof value === 'string') {
    return value;
  }
  if (!Number.isFinite(value)) {
    // Jamais de « NaN »/« ∞ » dans le DOM ni l'aria.
    return '—';
  }
  if (format === 'currency') {
    // Un code devise invalide fait lever Intl ; on retombe sur le nombre brut.
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    } catch {
      return new Intl.NumberFormat(locale).format(value);
    }
  }
  if (format === 'percent') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat(locale).format(value);
});

const formattedDelta = computed<string | undefined>(() => {
  const delta = props.delta;
  if (delta == null || !Number.isFinite(delta)) return undefined;
  const deltaFormat = props.deltaFormat ?? 'percent';
  const locale = props.locale;
  const sign = delta > 0 ? '+' : '';
  if (deltaFormat === 'percent') {
    const pct = new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(delta);
    return `${sign}${pct}`;
  }
  return `${sign}${new Intl.NumberFormat(locale).format(delta)}`;
});

const sparklineTone = computed(() =>
  resolvedTrend.value === 'up' ? 'success' : resolvedTrend.value === 'down' ? 'error' : 'neutral',
);

const arrow = computed(() =>
  resolvedTrend.value === 'up'
    ? 'M3 8.5 7 4l4 4.5'
    : resolvedTrend.value === 'down'
      ? 'M3 5.5 7 10l4-4.5'
      : 'M3 7h8',
);

const trendLabel = computed(() =>
  resolvedTrend.value === 'up'
    ? 'en hausse'
    : resolvedTrend.value === 'down'
      ? 'en baisse'
      : resolvedTrend.value === 'flat'
        ? 'stable'
        : undefined,
);

const ariaLabel = computed(() => {
  const format = props.format ?? 'number';
  const decoration = props.decoration;
  // L'unité est redondante quand le format est déjà autosuffisant.
  const ariaUnit = format === 'currency' || format === 'percent' ? undefined : props.unit;
  return [
    props.label,
    formattedValue.value,
    ariaUnit,
    formattedDelta.value && `${formattedDelta.value} ${trendLabel.value ?? ''}`.trim(),
    decoration && cellDecorationLabel[decoration.intent],
  ]
    .filter(Boolean)
    .join(', ');
});

const classes = computed(() => {
  const size = props.size ?? 'md';
  const tone = props.tone;
  const decoration = props.decoration;
  return classNames(
    'st-kpiCard',
    `st-kpiCard--${size}`,
    tone && `st-kpiCard--${tone}`,
    tone && 'st-kpiCard--toned',
    decoration && 'st-cell',
    decoration && cellDecorationClass(decoration.intent),
    props.class,
  );
});

const decorationNodes = computed(() => {
  const icon = props.decoration?.icon;
  if (!hasCellDecorationIcon(icon)) return null;
  return cellDecorationIconNodes[icon as string];
});

const sparklinePaths = computed(() => {
  const data = props.sparkline;
  const width = 120;
  const height = 28;
  const PADDING = 2;
  let line = '';
  let areaPath = '';
  if (data && data.length !== 0) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const innerWidth = Math.max(width - PADDING * 2, 1);
    const innerHeight = Math.max(height - PADDING * 2, 1);
    const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
    const pts = data.map((value, index) => {
      const x = PADDING + step * index;
      const normalised = (value - min) / span;
      const y = PADDING + (1 - normalised) * innerHeight;
      return { x, y };
    });
    line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const baseline = height - PADDING;
    const first = pts[0];
    const last = pts[pts.length - 1];
    areaPath = `${line} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
  }
  return { width, height, line, areaPath };
});
</script>

<template>
  <article v-bind="{ ...($attrs), class: (classes) }"  role="group" :aria-label="ariaLabel">
    <p class="st-kpiCard__label">{{ props.label }}</p>
    <p class="st-kpiCard__value">
      <svg v-if="decorationNodes" class="st-cell__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><component v-for="([tag, nodeAttrs], i) in decorationNodes" :key="i" :is="tag" v-bind="nodeAttrs" /></svg>
      <span class="st-kpiCard__number">{{ formattedValue }}</span>
      <span v-if="props.unit" class="st-kpiCard__unit">{{ props.unit }}</span>
    </p>
    <div v-if="formattedDelta || props.sparkline" class="st-kpiCard__footer">
      <span v-if="formattedDelta" :class="`st-kpiCard__delta st-kpiCard__delta--${resolvedTrend ?? 'flat'}`" aria-hidden="true">
        <svg class="st-kpiCard__arrow" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path :d="arrow" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span class="st-kpiCard__deltaValue">{{ formattedDelta }}</span>
      </span>
      <span v-if="props.sparkline && props.sparkline.length > 0" :class="classNames('st-sparkline', `st-sparkline--${sparklineTone}`, 'st-kpiCard__sparkline')" role="img">
        <svg :width="sparklinePaths.width" :height="sparklinePaths.height" :viewBox="`0 0 ${sparklinePaths.width} ${sparklinePaths.height}`" preserveAspectRatio="none" focusable="false">
          <path v-if="sparklinePaths.areaPath" :d="sparklinePaths.areaPath" class="st-sparkline__area" />
          <path v-if="sparklinePaths.line" :d="sparklinePaths.line" class="st-sparkline__line" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>
  </article>
</template>
