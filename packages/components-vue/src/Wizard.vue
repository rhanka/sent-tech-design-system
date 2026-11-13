<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type WizardStep = { label: string; description?: string };

export type WizardProps = {
  stepperLabel?: string;
  steps: WizardStep[];
  currentStep?: number;
  stepTitle?: string;
  cancelLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  isLast?: boolean;
  oncancel?: () => void;
  onback?: () => void;
  onnext?: () => void;
  onfinish?: () => void;
  class?: string;
};

defineOptions({ name: 'Wizard', inheritAttrs: false });
const props = withDefaults(defineProps<WizardProps>(), {
  stepperLabel: 'Progress', currentStep: 0, stepTitle: undefined, cancelLabel: 'Cancel',
  backLabel: 'Back', nextLabel: 'Next', finishLabel: 'Finish', isLast: false,
  oncancel: undefined, onback: undefined, onnext: undefined, onfinish: undefined,
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();


const rootProps = computed(() => ({

  class: classNames('st-wz', props.class),
}));

const current = computed(() => props.currentStep ?? 0);

function onCancel() {
  props.oncancel?.();
}

function onBack() {
  props.onback?.();
}

function onNext() {
  props.onnext?.();
}

function onFinish() {
  props.onfinish?.();
}
</script>

<template>
  <div v-bind="{ ...$attrs, ...rootProps }">
    <div class="st-wz__stepper">
      <p class="st-wz__stepper-label">{{ props.stepperLabel ?? 'Progress' }}</p>
      <ol class="st-stepper" :aria-label="props.stepperLabel ?? 'Progress'">
        <li v-for="(step, i) in props.steps ?? []" :key="i" :class="classNames('st-stepper__item', i < current ? 'st-stepper__item--complete' : i === current ? 'st-stepper__item--current' : undefined)">
          <span class="st-stepper__index">{{ String(i + 1) }}</span>
          <span class="st-stepper__label">{{ step.label }}</span>
          <span v-if="step.description" class="st-stepper__description">{{ step.description }}</span>
        </li>
      </ol>
    </div>
    <div class="st-wz__body">
      <h3 v-if="props.stepTitle" class="st-wz__step-title">{{ props.stepTitle }}</h3>
      <div class="st-wz__content"><slot /></div>
    </div>
    <div class="st-wz__footer">
      <button type="button" class="st-button st-button--ghost" @click="onCancel">{{ props.cancelLabel ?? 'Cancel' }}</button>
      <div class="st-wz__footer-actions">
        <button v-if="current > 0" type="button" class="st-button st-button--secondary" @click="onBack">{{ props.backLabel ?? 'Back' }}</button>
        <button v-if="props.isLast" type="button" class="st-button st-button--primary" @click="onFinish">{{ props.finishLabel ?? 'Finish' }}</button>
        <button v-else type="button" class="st-button st-button--primary" @click="onNext">{{ props.nextLabel ?? 'Next' }}</button>
      </div>
    </div>
  </div>
</template>
