import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { legend: 'Toppings', value: ['cheese'], options: [{ label: 'Cheese', value: 'cheese' }, { label: 'Bacon', value: 'bacon', helperText: 'Smoky' }, { label: 'Tofu', value: 'tofu', disabled: true }] } },
  { id: 'horizontal', props: { legend: 'Size', orientation: 'horizontal', value: [], options: [{ label: 'S', value: 's' }, { label: 'M', value: 'm' }] } },
  { id: 'no-options', props: { legend: 'Empty', value: [] } },
  { id: 'custom', props: { legend: 'Extras', name: 'extras', helperText: 'Pick any', disabled: true, value: ['a'], options: [{ label: 'A', value: 'a' }], class: 'consumer', style: 'color: red', 'data-bench': 'checks' } },
  { id: 'with-slot', props: { legend: 'Mixed', value: [], options: [{ label: 'A', value: 'a' }] }, slots: { default: '<label class="extra">Extra</label>' } },
] satisfies Fixture[];
