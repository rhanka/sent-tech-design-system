import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Info' } },
  { id: 'open', props: { label: 'Info', open: true, content: 'Tip text' } },
  { id: 'open-slot', props: { label: 'Details', open: true }, slots: { default: 'Slotted tip' } },
  { id: 'content-precedence', props: { label: 'Help', open: true, content: 'Prop tip' }, slots: { default: 'Slot tip' } },
  { id: 'placement-bottom', props: { label: 'Bottom', open: true, placement: 'bottom', content: 'Below' } },
  { id: 'rich-label', props: { label: 'Info', open: true },
    legacyProps: { label: h('strong', 'Info') },
    slots: { label: '<strong>Info</strong>' } },
  { id: 'rich-content', props: { label: 'Info', open: true, content: 'Plain' },
    legacyProps: { content: h('em', 'Rich tip') },
    slots: { content: '<em>Rich tip</em>' } },
  { id: 'custom-attrs', props: { label: 'Info', open: true, content: 'Tip', class: 'consumer', style: 'color: red', 'data-bench': 'toggletip' } },
] satisfies Fixture[];
