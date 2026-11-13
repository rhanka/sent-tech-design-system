import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Enable notifications' } },
  { id: 'checked-helper', props: { label: 'Dark mode', helperText: 'Applies immediately', modelValue: true, name: 'theme', value: 'dark' } },
  { id: 'legacy-checked-disabled', props: { label: 'Legacy checked', checked: true, disabled: true } },
  { id: 'model-overrides-checked', props: { label: 'Not switched', modelValue: false, checked: true } },
  { id: 'rich-label', props: { label: 'Plain', helperText: 'Plain help' },
    legacyProps: { label: h('strong', 'Rich'), helperText: h('em', 'Help') },
    slots: { label: '<strong>Rich</strong>', 'helper-text': '<em>Help</em>' } },
  { id: 'custom-attrs', props: { label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'switch', 'aria-describedby': 'external-help' } },
] satisfies Fixture[];
