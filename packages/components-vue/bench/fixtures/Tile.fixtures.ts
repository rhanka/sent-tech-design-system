import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Title', description: 'Desc' } },
  { id: 'clickable-link', props: { variant: 'clickable', href: 'https://example.com', title: 'Link' } },
  { id: 'clickable-button', props: { variant: 'clickable', title: 'Go', disabled: true } },
  { id: 'selectable', props: { variant: 'selectable', selected: true, title: 'Pick' } },
  { id: 'rich-title', props: { title: 'Plain', description: 'Plain desc' },
    legacyProps: { title: h('strong', 'Rich'), description: h('em', 'Desc') },
    slots: { title: '<strong>Rich</strong>', description: '<em>Desc</em>' } },
  { id: 'default-slot-wins', props: { title: 'Ignored', description: 'Ignored too' }, slots: { default: 'Body' } },
  { id: 'custom-attrs', props: { title: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'tile' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
