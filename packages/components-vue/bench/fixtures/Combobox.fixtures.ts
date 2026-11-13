import type { Fixture } from './types.js';
const options = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma', disabled: true },
];
export default [
  { id: 'default', props: { label: 'Fruit', options } },
  { id: 'selected-small', props: { label: 'Fruit', options, value: 'beta', size: 'sm' } },
  { id: 'open-custom-value', props: { label: 'Fruit', options, value: 'custom', open: true, allowCustomValue: false, placeholder: 'Type fruit', class: 'consumer', style: 'color: red', 'data-bench': 'combo' } },
  { id: 'invalid-disabled', props: { label: 'Fruit', options, errorText: 'Required', invalid: false, disabled: true, size: 'lg', listLabel: 'Fruits', clearLabel: 'Clear fruit', toggleLabel: 'Show fruits' } },
  { id: 'helper-no-results', props: { options, helperText: 'Pick one', noResultsLabel: 'Nothing found', open: true } },
  { id: 'empty', props: { label: 'Fruit', options: [], open: true } },
] satisfies Fixture[];
