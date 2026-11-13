import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }, { label: 'C', value: 15 }], label: 'Metrics' } },
  { id: 'horizontal', props: { data: [{ label: 'A', value: 10, tone: 'category3' }, { label: 'B', value: 20, tone: 'category5' }], orientation: 'horizontal', label: 'Rows' } },
  { id: 'fixed-domain', props: { data: [{ label: 'A', value: 40 }], label: 'Shared', domain: [0, 100], width: 640, height: 300 } },
  { id: 'negatives', props: { data: [{ label: 'Lo', value: -10 }, { label: 'Hi', value: 10 }], label: 'Range' } },
  { id: 'custom-attrs', props: { data: [{ label: 'X', value: 5 }], label: 'Sized', class: 'consumer', style: 'color: red', 'data-bench': 'lollipop' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
] satisfies Fixture[];
