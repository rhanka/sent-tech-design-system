import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Label' } },
  { id: 'empty', props: { label: '' } },
  { id: 'number', props: { label: 12 } },
  { id: 'rich', props: { label: 'Rich' }, legacyProps: { label: h('strong', 'Rich') }, slots: { default: '<strong>Rich</strong>' } },
] satisfies Fixture[];
