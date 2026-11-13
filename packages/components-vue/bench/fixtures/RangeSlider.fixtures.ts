import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { modelValue: [20, 80], label: 'Range' } },
  { id: 'default-value', props: { defaultValue: [10, 30], min: 0, max: 50, step: 5, label: 'Steps', showValue: true } },
  { id: 'disabled-small-error', props: { modelValue: [0, 100], size: 'sm', disabled: true, errorText: 'Invalid range', valueFormatter: (v: number) => `${v}%` } },
  { id: 'helper-hide-value', props: { modelValue: [40, 60], min: 10, max: 90, helperText: 'Pick a range', showValue: false, ariaLabelMin: 'Low', ariaLabelMax: 'High' } },
  { id: 'custom-attrs', props: { modelValue: [5, 15], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'range' } },
  { id: 'empty-default', props: { label: 'Defaults' } },
] satisfies Fixture[];
