<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { ICONS, type IconGlyph, type IconName } from './icon-data.js';
import SvgNodes from './SvgNodes.vue';
export type { IconGlyph, IconName } from './icon-data.js';
export type IconProps = {
  /** Complete SVG class list for DS controls preserving their reference markup. */
  svgClass?: string;
  size?: number; strokeWidth?: number; title?: string; class?: string; name?: IconName; glyph?: IconGlyph;
  /** Preserve the existing Lucide markup when composing DS controls. */
  bare?: boolean;
};
defineOptions({ name: 'Icon', inheritAttrs: false });
const props = withDefaults(defineProps<IconProps>(), { size: 18, strokeWidth: undefined, title: undefined, class: undefined, name: undefined, glyph: undefined, bare: false });
defineSlots<{ default?: () => unknown }>();

const attrs = useAttrs();
declare const process: { env?: Record<string, string | undefined> } | undefined;
if ((typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') && (props.name != null) === (props.glyph != null)) console.warn('[st-icon] Icon requires exactly one of `name` or `glyph`.');
const svgAttrs = computed(() => {
  const { color = 'currentColor', absoluteStrokeWidth, 'absolute-stroke-width': absoluteKebab, ...rest } = attrs;
  const absolute = absoluteStrokeWidth === true || absoluteStrokeWidth === '' || absoluteKebab === true || absoluteKebab === '';
  return { ...rest, width: props.size, height: props.size, stroke: color as string, 'stroke-width': absolute ? (props.strokeWidth ?? 2.25) * 24 / props.size : props.strokeWidth ?? 2.25 };
});
const glyph = computed(() => props.glyph ?? (props.name ? ICONS[props.name] : undefined));
const iconClass = computed(() => props.bare ? props.class : classNames('st-icon', props.class));
const classes = computed(() => props.svgClass ?? classNames('lucide', iconClass.value, glyph.value?.name ? `lucide-${glyph.value.name}-icon lucide-${glyph.value.name}` : 'lucide-icon', iconClass.value));

</script>

<template>
  <svg v-if="glyph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" :data-st-icon-stroke="!props.bare && props.strokeWidth != null ? 'prop' : undefined" :role="!props.bare && props.title ? 'img' : undefined" :aria-label="props.title" :aria-hidden="!props.bare && !props.title ? 'true' : undefined" :focusable="props.bare ? undefined : 'false'" v-bind="svgAttrs" :class="classes"><SvgNodes :nodes="glyph.nodes" /><slot /></svg>
</template>
