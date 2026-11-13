import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { legend: 'Contact' }, slots: { default: '<input>' } },
  { id: 'with-helper', props: { legend: 'Contact', helperText: 'We never share it.' }, slots: { default: '<input>' } },
  { id: 'empty-legend', props: { legend: '' }, slots: { default: 'Body' } },
  { id: 'rich-content', props: {   },
    legacyProps: { legend: h('strong', 'Contact'), helperText: h('em', 'Help') },
    slots: { legend: '<strong>Contact</strong>', helperText: '<em>Help</em>', default: '<input>' } },
  { id: 'custom-attrs', props: { legend: 'Contact', class: 'consumer', style: 'color: red', 'data-bench': 'form-group' }, slots: { default: 'X' } },
] satisfies Fixture[];
