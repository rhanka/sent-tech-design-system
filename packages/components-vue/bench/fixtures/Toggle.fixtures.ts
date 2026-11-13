import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Wi-Fi' } },
  { id: 'checked-controlled', props: { label: 'Wi-Fi', modelValue: true } },
  { id: 'checked-legacy', props: { label: 'Bluetooth', checked: true, size: 'sm' } },
  { id: 'disabled', props: { label: 'Airplane mode', disabled: true, name: 'plane', value: 'on', labelOff: 'Nope' } },
  { id: 'helper', props: { label: 'Location', modelValue: true, helperText: 'Used for nearby suggestions.' } },
  { id: 'rich-label', props: {  },
    legacyProps: { label: h('strong', 'Wi-Fi') },
    slots: { label: '<strong>Wi-Fi</strong>' } },
  { id: 'rich-helper', props: { label: 'Location',  },
    legacyProps: { helperText: h('em', 'Rich help') },
    slots: { helperText: '<em>Rich help</em>' } },
  { id: 'custom-attrs', props: { label: 'Wi-Fi', id: 'consumer-toggle', class: 'consumer', style: 'color: red', 'data-bench': 'toggle', 'aria-describedby': 'toggle-help' } },
] satisfies Fixture[];
