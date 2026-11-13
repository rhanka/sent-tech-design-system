import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Quantity' } },
  { id: 'controlled-clamped', props: { label: 'Count', modelValue: 5, min: 0, max: 5, step: 2, helperText: 'Use the steppers.' } },
  { id: 'seeded-value', props: { label: 'Price', value: 12.5, min: 0, max: 100 } },
  { id: 'error-disabled', props: { label: 'Amount', disabled: true, errorText: 'Required' } },
  { id: 'custom-labels', props: { label: 'Qty', incrementLabel: 'Augmenter', decrementLabel: 'Diminuer', size: 'sm', class: 'consumer', style: 'color: red', 'data-bench': 'number' } },
  { id: 'readonly-empty', props: { readonly: true, helperText: '' } },
] satisfies Fixture[];
