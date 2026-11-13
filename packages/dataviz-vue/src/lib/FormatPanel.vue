<script setup lang="ts">
import { Checkbox, Input, NumberInput, Select } from '@sentropic/design-system-vue';
import {
  updateAxisFormat,
  updateLegendFormat,
  updateMarkerFormat,
  type FormatAxisScale,
  type FormatMarkerShape,
  type FormatPanelState,
} from '@sentropic/dataviz-core';

export type FormatPanelProps = {
  value: FormatPanelState;
  onChange: (next: FormatPanelState) => void;
  label?: string;
  class?: string;
};

const SCALE_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'log', label: 'Log' },
];

const SHAPE_OPTIONS = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'triangle', label: 'Triangle' },
];

function textValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function optionalNumber(value: unknown): number | null {
  const trimmed = textValue(value).trim();
  if (!trimmed) return null;
  const next = Number(trimmed);
  return Number.isFinite(next) ? next : null;
}

function scaleFrom(value: unknown): FormatAxisScale {
  return value === 'log' ? 'log' : 'linear';
}

function shapeFrom(value: unknown): FormatMarkerShape {
  if (value === 'square' || value === 'diamond' || value === 'triangle') return value;
  return 'circle';
}

defineOptions({ name: 'FormatPanel' });
const props = withDefaults(defineProps<FormatPanelProps>(), {
  label: 'Format', class: undefined,
});
function emitAxisNumber(axisId: string, field: 'min' | 'max', raw: unknown) {
  props.onChange(updateAxisFormat(props.value, axisId, { [field]: optionalNumber(raw) }));
}
function emitAxisScale(axisId: string, raw: unknown) {
  props.onChange(updateAxisFormat(props.value, axisId, { scale: scaleFrom(raw) }));
}
function emitMarkerShape(markerId: string, raw: unknown) {
  props.onChange(updateMarkerFormat(props.value, markerId, { shape: shapeFrom(raw) }));
}
</script>

<template>
  <div role="group" :aria-label="props.label" :class="props.class">
    <div v-for="axis in props.value.axes" :key="axis.id">
      <NumberInput :label="`Minimum ${axis.label}`" :aria-label="`Minimum ${axis.label}`" :model-value="axis.min ?? ''" @update:model-value="(raw: number | null) => emitAxisNumber(axis.id, 'min', raw)" />
      <NumberInput :label="`Maximum ${axis.label}`" :aria-label="`Maximum ${axis.label}`" :model-value="axis.max ?? ''" @update:model-value="(raw: number | null) => emitAxisNumber(axis.id, 'max', raw)" />
      <Select :label="`Echelle ${axis.label}`" :aria-label="`Echelle ${axis.label}`" :model-value="axis.scale" :options="SCALE_OPTIONS" @update:model-value="(raw: string) => emitAxisScale(axis.id, raw)" />
      <Checkbox :label="`Inverser ${axis.label}`" :aria-label="`Inverser ${axis.label}`" :model-value="axis.inverted" :checked="axis.inverted" @update:model-value="(checked: boolean) => props.onChange(updateAxisFormat(props.value, axis.id, { inverted: checked }))" />
    </div>
    <div v-for="legend in props.value.legends" :key="legend.id">
      <Input :label="`Titre ${legend.label}`" :aria-label="`Titre ${legend.label}`" :model-value="legend.title" @update:model-value="(raw: string) => props.onChange(updateLegendFormat(props.value, legend.id, { title: raw }))" />
      <Checkbox :label="`Afficher ${legend.label}`" :aria-label="`Afficher ${legend.label}`" :model-value="legend.visible" :checked="legend.visible" @update:model-value="(checked: boolean) => props.onChange(updateLegendFormat(props.value, legend.id, { visible: checked }))" />
    </div>
    <div v-for="marker in props.value.markers" :key="marker.id">
      <Select :label="`Forme ${marker.label}`" :aria-label="`Forme ${marker.label}`" :model-value="marker.shape" :options="SHAPE_OPTIONS" @update:model-value="(raw: string) => emitMarkerShape(marker.id, raw)" />
      <NumberInput :label="`Taille ${marker.label}`" :aria-label="`Taille ${marker.label}`" :model-value="marker.size" :min="1" :step="1" @update:model-value="(raw: number | null) => props.onChange(updateMarkerFormat(props.value, marker.id, { size: optionalNumber(raw) }))" />
      <Input :label="`Couleur ${marker.label}`" :aria-label="`Couleur ${marker.label}`" :model-value="marker.color ?? ''" @update:model-value="(raw: string) => props.onChange(updateMarkerFormat(props.value, marker.id, { color: raw || undefined }))" />
    </div>
  </div>
</template>
