<script setup lang="ts">
import { classNames } from './classNames.js';
import { deriveInitials } from './Header.js';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

export type AvatarProps = {
  /** Nom complet, utilisé pour dériver les initiales et l'étiquette a11y. */
  name: string;
  /** URL de la photo. Si absente, on rend un cercle d'initiales. */
  src?: string;
  /** Texte alternatif de l'image. Par défaut = `name`. */
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Catégorie de couleur pour le fond des initiales. */
  tone?: AvatarTone;
  class?: string;
};

defineOptions({ name: 'Avatar', inheritAttrs: false });
const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  alt: undefined,
  size: 'md',
  shape: 'circle',
  tone: 'category1',
  class: undefined,
});
</script>

<template>
  <span
    v-bind="$attrs"
    :class="classNames(
      'st-avatar',
      `st-avatar--${props.size}`,
      `st-avatar--${props.shape}`,
      props.src ? 'st-avatar--image' : `st-avatar--${props.tone}`,
      props.class,
    )"
    role="img"
    :aria-label="props.alt ?? props.name"
  >
    <img v-if="props.src" class="st-avatar__image" :src="props.src" :alt="props.alt ?? props.name" />
    <span v-else class="st-avatar__initials" aria-hidden="true">{{ deriveInitials(props.name) }}</span>
  </span>
</template>
