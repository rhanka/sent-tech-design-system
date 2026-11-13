<script setup lang="ts">
import { classNames } from './classNames.js';

/** A single field error: `href` points to the offending control, `text` is the message. */
export type ErrorSummaryItem = { href: string; text: string };

export type ErrorSummaryProps = {
  heading?: string;
  errors?: ErrorSummaryItem[];
  class?: string;
};

/**
 * ErrorSummary — GCDS « Error summary »: an aggregated list of a form's errors,
 * each entry linking to the field that needs attention.
 */
defineOptions({ name: 'ErrorSummary', inheritAttrs: false });
const props = withDefaults(defineProps<ErrorSummaryProps>(), {
  heading: 'There was a problem',
  errors: () => [],
  class: undefined,
});
</script>

<template>
  <section v-bind="{ ...($attrs), class: (classNames('st-error-summary', props.class)) }"  role="alert" tabindex="-1">
    <h2 class="st-error-summary__heading">{{ props.heading }}</h2>
    <ul v-if="props.errors.length > 0" class="st-error-summary__list">
      <li v-for="error in props.errors" :key="error.href" class="st-error-summary__item">
        <a class="st-error-summary__link" :href="error.href">{{ error.text }}</a>
      </li>
    </ul>
  </section>
</template>
