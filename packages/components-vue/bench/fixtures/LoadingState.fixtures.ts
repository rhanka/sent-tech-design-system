import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'label', props: { label: 'Please wait' } },
  { id: 'title-fallback', props: { title: 'Loading data' } },
  { id: 'skeleton', props: { variant: 'skeleton', label: 'Fetching' } },
  { id: 'rich-label', props: { label: 'Loading' },
    legacyProps: { label: h('strong', 'Loading') },
    slots: { label: '<strong>Loading</strong>' } },
  { id: 'custom-attrs', props: { label: 'Wait', class: 'consumer', style: 'color: red', 'data-bench': 'loading' } },
] satisfies Fixture[];
