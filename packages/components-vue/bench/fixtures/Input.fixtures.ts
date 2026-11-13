import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'label-help-value', props: { label: 'Name', helperText: 'Full name', modelValue: 'Ada & Grace', placeholder: 'Your name', name: 'name' } },
  { id: 'error-small', props: { label: 'Email', helperText: 'Hidden help', errorText: 'Required', size: 'sm', invalid: true } },
  { id: 'disabled-large', props: { label: 'Disabled', disabled: true, size: 'lg', modelValue: 'Fixed' } },
  { id: 'readonly-custom-id', props: { label: 'Reference', readonly: true, id: 'consumer-input', class: 'consumer', style: 'color: red', 'aria-describedby': 'external-help', 'data-bench': 'input' } },
  { id: 'invalid-empty', props: { invalid: true, modelValue: '', placeholder: 'Enter text' } },
] satisfies Fixture[];
