import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { modelValue: 50, label: 'Volume' } },
  { id: 'value-alias', props: { value: 25, min: 0, max: 100, step: 5, label: 'Steps' } },
  { id: 'invalid-disabled', props: { label: 'Bad', errorText: 'Invalid', invalid: true, disabled: true, size: 'lg', modelValue: 80, valueFormatter: (v: number) => `${v}%` } },
  { id: 'helper-hide', props: { modelValue: 10, helperText: 'Pick one', showValue: false } },
  { id: 'custom', props: { label: 'Custom', modelValue: 33, class: 'consumer', style: 'color: red', 'data-bench': 'slider' } },
  { id: 'clamped', props: { modelValue: 200, min: 0, max: 100, label: 'Clamped' } },
] satisfies Fixture[];
