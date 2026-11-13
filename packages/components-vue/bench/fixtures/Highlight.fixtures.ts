import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Body' } },
  { id: 'with-title', props: { tone: 'warning', title: 'Heads up' }, slots: { default: 'Read this' } },
  { id: 'tones', props: { tone: 'success', title: 'Done' }, slots: { default: 'All good' } },
  { id: 'rich-title', props: { title: 'Note' },
    legacyProps: { title: h('strong', 'Note') },
    slots: { title: '<strong>Note</strong>', default: 'Body' } },
  { id: 'custom-attrs', props: { tone: 'error', title: 'Fail', class: 'consumer', style: 'color: red', 'data-bench': 'highlight' }, slots: { default: 'X' } },
] satisfies Fixture[];
