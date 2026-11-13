import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Password' } },
  { id: 'model-helper', props: { label: 'Secret', modelValue: 'hunter2', helperText: 'Min. 8 chars.', placeholder: '••••••' } },
  { id: 'error-disabled', props: { label: 'Password', errorText: 'Required', disabled: true } },
  { id: 'custom-toggles', props: { label: 'Pwd', showLabel: 'Afficher', hideLabel: 'Masquer', size: 'lg', class: 'consumer', style: 'color: red', 'data-bench': 'pwd' } },
] satisfies Fixture[];
