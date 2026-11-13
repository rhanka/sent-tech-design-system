import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Comment', modelValue: 'hello' } },
  { id: 'helper', props: { label: 'Notes', helperText: 'Plain help', rows: 3, placeholder: 'Type here', disabled: true } },
  { id: 'error', props: { label: 'Name', errorText: 'Required', invalid: true } },
  { id: 'rich-label', props: {   },
    legacyProps: { label: h('strong', 'Rich'), helperText: h('em', 'Help') },
    slots: { label: '<strong>Rich</strong>', 'helper-text': '<em>Help</em>' } },
  { id: 'rich-error', props: { label: 'Name',  },
    legacyProps: { errorText: h('strong', 'Err') },
    slots: { 'error-text': '<strong>Err</strong>' } },
  { id: 'custom-attrs', props: { label: 'X', id: 'consumer-area', class: 'consumer', style: 'color: red', 'data-bench': 'textarea', 'aria-describedby': 'external-help' } },
] satisfies Fixture[];
