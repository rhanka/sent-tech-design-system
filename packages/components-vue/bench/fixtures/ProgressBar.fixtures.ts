import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Uploading', value: 40 } },
  { id: 'indeterminate', props: { label: 'Loading', indeterminate: true, showValue: true } },
  { id: 'error-custom-value', props: { value: 150, max: 100, tone: 'error', showValue: true, valueText: 'Total: 150', helperText: 'Over max.' } },
  { id: 'size-lg', props: { value: 25, size: 'lg', tone: 'success', class: 'consumer', style: 'color: red', 'data-bench': 'bar' } },
  { id: 'zero', props: { value: 0 } },
] satisfies Fixture[];
