<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type MediaKind = 'image' | 'video';

export type MediaContentProps = {
  title?: string;
  caption?: string;
  byline?: string;
  media?: string;
  mediaAlt?: string;
  mediaKind?: MediaKind;
  mediaControls?: boolean;
  aspectRatio?: string;
  mediaCaptions?: string;
  mediaCaptionsLabel?: string;
  mediaCaptionsLang?: string;
  class?: string;
};

const DEFAULT_CAPTIONS = 'data:text/vtt,WEBVTT';

defineOptions({ name: 'MediaContent', inheritAttrs: false });
const props = withDefaults(defineProps<MediaContentProps>(), {
  title: undefined, caption: undefined, byline: undefined, media: undefined,
  mediaAlt: '', mediaKind: 'image', mediaControls: true, aspectRatio: '16/9',
  mediaCaptions: undefined, mediaCaptionsLabel: 'Français', mediaCaptionsLang: 'fr',
  class: undefined,
});

const hasMedia = computed(() => Boolean(props.media?.trim()));
const hasCaption = computed(() => Boolean(props.title || props.caption || props.byline));
defineSlots<{ "default"?: () => unknown }>();
</script>

<template>
  <figure v-bind="{ ...($attrs), class: (classNames('st-mediaContent', props.class)) }" >
    <div class="st-mediaContent__media" :style="{ '--st-mediaContent-ratio': props.aspectRatio }">
      <video
        v-if="hasMedia && props.mediaKind === 'video'"
        :controls="props.mediaControls"
        :src="props.media"
        :aria-label="props.title || 'Contenu média'"
        preload="metadata"
      >
        <track kind="captions" :src="props.mediaCaptions ?? DEFAULT_CAPTIONS" :srclang="props.mediaCaptionsLang" :label="props.mediaCaptionsLabel" default />
      </video>
      <img v-else-if="hasMedia" :src="props.media" :alt="props.mediaAlt" loading="lazy" decoding="async" />
      <slot v-else />
    </div>
    <figcaption v-if="hasCaption" class="st-mediaContent__caption">
      <p v-if="props.title" class="st-mediaContent__title">{{ props.title }}</p>
      <p v-if="props.caption">{{ props.caption }}</p>
      <p v-if="props.byline" class="st-mediaContent__byline">{{ props.byline }}</p>
    </figcaption>
  </figure>
</template>
