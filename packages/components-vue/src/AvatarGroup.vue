<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { CSSProperties } from 'vue';
import { classNames } from './classNames.js';
import type { AvatarSize } from './Avatar.vue';

export type AvatarGroupProps = {
  /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
  max?: number;
  /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
  size?: AvatarSize;
  /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
  total?: number;
  class?: string;
};

defineOptions({ name: 'AvatarGroup' });
const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: undefined,
  size: 'md',
  total: undefined,
  class: undefined,
});
const attrs = useAttrs();
const overflow = computed(() =>
  props.max != null && props.total != null && props.total > props.max ? props.total - props.max : 0,
);
const groupStyle = computed<CSSProperties>(() => ({
  ...(attrs.style as CSSProperties | undefined),
  ['--st-avatar-group-max' as string]: props.max ?? '',
}));
</script>

<template>
  <div
    :class="classNames('st-avatarGroup', `st-avatarGroup--${props.size}`, props.class)"
    :style="groupStyle"
  >
    <slot />
    <span v-if="overflow > 0" class="st-avatarGroup__overflow" :aria-label="`+${overflow}`">+{{ overflow }}</span>
  </div>
</template>
