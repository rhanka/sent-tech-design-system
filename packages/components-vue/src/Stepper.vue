<script setup lang="ts">
import { classNames } from './classNames.js';

export interface StepperStep {
  label: string;
  description?: string;
}

export type StepperOrientation = 'horizontal' | 'vertical';

export type StepperProps = {
  steps: StepperStep[];
  /** Index de l'étape courante (0-based). */
  current?: number;
  orientation?: StepperOrientation;
  /** Autorise la navigation au clic sur les étapes. */
  clickable?: boolean;
  onStepClick?: (index: number) => void;
  /** Étiquette a11y de la liste d'étapes. */
  label?: string;
  class?: string;
};

defineOptions({ name: 'Stepper', inheritAttrs: false });
const props = withDefaults(defineProps<StepperProps>(), {
  current: 0, orientation: 'horizontal', clickable: false, onStepClick: undefined,
  label: 'Progression', class: undefined,
});
const emit = defineEmits<{ stepClick: [index: number] }>();

function stateOf(index: number): 'complete' | 'current' | 'upcoming' {
  if (index < props.current) return 'complete';
  if (index === props.current) return 'current';
  return 'upcoming';
}

function handleClick(index: number) {
  if (!props.clickable) return;

  emit('stepClick', index);
}
</script>

<template>
  <ol
    v-bind="{ ...($attrs), class: (classNames('st-stepper', `st-stepper--${props.orientation}`, props.class)) }"

    :aria-label="props.label"
  >
    <li
      v-for="(step, index) in props.steps"
      :key="index"
      :class="classNames('st-stepper__step', `st-stepper__step--${stateOf(index)}`)"
      :aria-current="stateOf(index) === 'current' ? 'step' : undefined"
    >
      <span class="st-stepper__indicator">
        <button
          v-if="props.clickable"
          type="button"
          class="st-stepper__circle st-stepper__circle--button"
          :aria-label="step.label"
          @click="() => handleClick(index)"
        >
          <svg
            v-if="stateOf(index) === 'complete'"
            aria-hidden="true"
            class="lucide lucide-check-icon lucide-check"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          ><path d="M20 6 9 17l-5-5" /></svg>
          <span v-else class="st-stepper__index">{{ index + 1 }}</span>
        </button>
        <span v-else class="st-stepper__circle">
          <svg
            v-if="stateOf(index) === 'complete'"
            aria-hidden="true"
            class="lucide lucide-check-icon lucide-check"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          ><path d="M20 6 9 17l-5-5" /></svg>
          <span v-else class="st-stepper__index">{{ index + 1 }}</span>
        </span>
        <span v-if="index !== props.steps.length - 1" class="st-stepper__connector" />
      </span>
      <span class="st-stepper__text">
        <span class="st-stepper__label">{{ step.label }}</span>
        <span v-if="step.description" class="st-stepper__description">{{ step.description }}</span>
      </span>
    </li>
  </ol>
</template>
