import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Option A', name: 'choice', value: 'a' } },
  { id: 'model-checked', props: { label: 'Selected', name: 'choice', value: 'b', modelValue: 'b' } },
  { id: 'model-unchecked', props: { label: 'Not selected', name: 'choice', value: 'c', modelValue: 'a' } },
  { id: 'checked-overrides-model', props: { label: 'Legacy checked', name: 'choice', value: 'd', modelValue: 'a', checked: true } },
  { id: 'disabled-invalid', props: { label: 'Invalid', name: 'choice', value: 'e', invalid: true, disabled: true } },
  { id: 'helper-custom', props: { label: 'With help', helperText: 'Choose carefully', name: 'choice', value: 'f', class: 'consumer', style: 'color: red', 'data-bench': 'radio' } },
] satisfies Fixture[];
