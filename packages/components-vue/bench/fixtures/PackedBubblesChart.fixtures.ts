import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Alpha', value: 40 }, { label: 'Beta', value: 25 }, { label: 'Gamma', value: 10 }], label: 'Bubbles' } },
  { id: 'tones', props: { data: [{ label: 'Alpha', value: 30, tone: 'category2' }, { label: 'Beta', value: 20, tone: 'category8' }], label: 'Bubbles', width: 480, height: 360 } },
  { id: 'zeros-filtered', props: { data: [{ label: 'Zero', value: 0 }, { label: 'One', value: 1 }, { label: 'Ten', value: 10 }], label: 'Scale', class: 'consumer', style: 'color: red', 'data-bench': 'bubbles' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
