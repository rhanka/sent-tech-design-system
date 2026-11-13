import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Market', data: [{ label: 'A', value: 20 }, { label: 'B', value: 10 }] } },
  { id: 'empty', props: { label: 'Empty', data: [] } },
  { id: 'custom-attrs', props: { label: 'Regions', data: [{ label: 'North', value: 5 }], class: 'consumer', style: 'color: red', 'data-bench': 'treemap' } },
  { id: 'many', props: { label: 'Parts', data: [{ label: 'Alpha', value: 30 }, { label: 'Beta', value: 20 }, { label: 'Gamma', value: 10 }, { label: 'Zero', value: 0 }], width: 640, height: 320 } },
] satisfies Fixture[];
