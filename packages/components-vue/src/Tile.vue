<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type TileVariant = 'static' | 'clickable' | 'selectable';

export type TileProps = {
  title?: string | number;
  description?: string | number;
  variant?: TileVariant;
  /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
  href?: string;
  /** Pour `selectable` : état coché. */
  selected?: boolean;
  disabled?: boolean;
  class?: string;
};

defineOptions({ name: 'Tile' });
const props = withDefaults(defineProps<TileProps>(), {
  title: undefined, description: undefined, variant: 'static', href: undefined,
  selected: false, disabled: false, class: undefined,
});
const emit = defineEmits<{ select: [checked: boolean] }>();
defineSlots<{
  default?: () => unknown;
  title?: () => unknown;
  description?: () => unknown;
}>();

const tileClass = computed(() => classNames(
  'st-tile',
  `st-tile--${props.variant}`,
  props.variant === 'selectable' && props.selected && 'st-tile--selected',
  props.disabled && 'st-tile--disabled',
  props.class,
));

function onSelect(event: Event) {
  emit('select', (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <a v-if="props.variant === 'clickable' && props.href" :class="tileClass" :href="props.href" :aria-disabled="props.disabled ? 'true' : undefined">
    <span class="st-tile__content">
      <template v-if="$slots.default"><slot /></template>
      <template v-else>
        <span v-if="$slots.title || props.title" class="st-tile__title"><template v-if="$slots.title"><slot name="title" /></template><template v-else>{{ scalarContent(props.title) }}</template></span>
        <span v-if="$slots.description || props.description" class="st-tile__description"><template v-if="$slots.description"><slot name="description" /></template><template v-else>{{ scalarContent(props.description) }}</template></span>
      </template>
    </span>
  </a>
  <button v-else-if="props.variant === 'clickable'" type="button" :class="tileClass" :disabled="props.disabled">
    <span class="st-tile__content">
      <template v-if="$slots.default"><slot /></template>
      <template v-else>
        <span v-if="$slots.title || props.title" class="st-tile__title"><template v-if="$slots.title"><slot name="title" /></template><template v-else>{{ scalarContent(props.title) }}</template></span>
        <span v-if="$slots.description || props.description" class="st-tile__description"><template v-if="$slots.description"><slot name="description" /></template><template v-else>{{ scalarContent(props.description) }}</template></span>
      </template>
    </span>
  </button>
  <label v-else-if="props.variant === 'selectable'" :class="tileClass">
    <input type="checkbox" class="st-tile__input" :checked="props.selected" :disabled="props.disabled" @change="onSelect" />
    <span class="st-tile__content">
      <template v-if="$slots.default"><slot /></template>
      <template v-else>
        <span v-if="$slots.title || props.title" class="st-tile__title"><template v-if="$slots.title"><slot name="title" /></template><template v-else>{{ scalarContent(props.title) }}</template></span>
        <span v-if="$slots.description || props.description" class="st-tile__description"><template v-if="$slots.description"><slot name="description" /></template><template v-else>{{ scalarContent(props.description) }}</template></span>
      </template>
    </span>
  </label>
  <div v-else :class="tileClass">
    <span class="st-tile__content">
      <template v-if="$slots.default"><slot /></template>
      <template v-else>
        <span v-if="$slots.title || props.title" class="st-tile__title"><template v-if="$slots.title"><slot name="title" /></template><template v-else>{{ scalarContent(props.title) }}</template></span>
        <span v-if="$slots.description || props.description" class="st-tile__description"><template v-if="$slots.description"><slot name="description" /></template><template v-else>{{ scalarContent(props.description) }}</template></span>
      </template>
    </span>
  </div>
</template>
