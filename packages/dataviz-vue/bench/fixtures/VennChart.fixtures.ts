import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { areas: [{ sets: ['A'], value: 40 }, { sets: ['B'], value: 30 }, { sets: ['A', 'B'], value: 10 }], label: 'Venn' } },
  { id: 'three-sets', props: { areas: [{ sets: ['A'], value: 20 }, { sets: ['B'], value: 18 }, { sets: ['C'], value: 15 }, { sets: ['A', 'B'], value: 8 }, { sets: ['B', 'C'], value: 6 }, { sets: ['A', 'B', 'C'], value: 3 }], label: 'Three sets' } },
  { id: 'size-attrs', props: { areas: [{ sets: ['A', 'B'], value: 25 }], label: 'Venn', width: 480, height: 320, class: 'consumer', 'data-bench': 'venn', style: 'color:red' } },
  { id: 'empty', props: { areas: [], label: 'Venn' } },
] satisfies Fixture[];
