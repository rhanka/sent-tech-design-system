<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type TranscriptionSegment = {
  speaker?: string;
  startTime?: string;
  endTime?: string;
  text: string;
};

export type TranscriptionProps = {
  title?: string;
  segments?: TranscriptionSegment[];
  text?: string;
  class?: string;
  open?: boolean;
  showTimestamps?: boolean;
};

defineOptions({ name: 'Transcription', inheritAttrs: false });
const props = withDefaults(defineProps<TranscriptionProps>(), {
  title: 'Transcription', segments: undefined, text: undefined,
  open: false, showTimestamps: true, class: undefined,
});

const formatInterval = (segment: TranscriptionSegment): string => {
  if (!props.showTimestamps || (!segment.startTime && !segment.endTime)) return '';
  if (!segment.startTime) return segment.endTime ? `- ${segment.endTime}` : '';
  if (!segment.endTime) return `${segment.startTime} -`;
  return `${segment.startTime} - ${segment.endTime}`;
};

const resolvedSegments = computed(() => (props.segments ?? []).filter((segment) => Boolean(segment.text?.trim())));
const hasSegments = computed(() => resolvedSegments.value.length > 0);
const hasText = computed(() => Boolean(props.text && props.text.trim().length));
const separator = ' • ';
</script>

<template>
  <details v-bind="{ ...($attrs), class: (classNames('st-transcription', props.class)) }" :open="props.open" >
    <summary>{{ props.title }}</summary>
    <div class="st-transcription__content">
      <ol v-if="hasSegments" class="st-transcription__list">
        <li v-for="(segment, index) in resolvedSegments" :key="index" class="st-transcription__item">
          <p class="st-transcription__meta">
            <span v-if="segment.speaker" class="st-transcription__speaker">{{ segment.speaker }}</span>
            <span v-if="segment.speaker && formatInterval(segment)" aria-hidden="true">{{ separator }}</span>
            <time v-if="formatInterval(segment)">
              <span class="st-transcription__sr-only">{{ `Horodatage ${formatInterval(segment)}` }}</span>
              <span aria-hidden="true">{{ formatInterval(segment) }}</span>
            </time>
          </p>
          <p class="st-transcription__text">{{ segment.text }}</p>
        </li>
      </ol>
      <p v-else-if="hasText" class="st-transcription__text">{{ props.text }}</p>
      <p v-else class="st-transcription__text">Aucun contenu de transcription fourni.</p>
    </div>
  </details>
</template>
