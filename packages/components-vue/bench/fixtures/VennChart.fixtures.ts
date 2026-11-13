import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ sets: ['A'], value: 10 }, { sets: ['B'], value: 5 }, { sets: ['A', 'B'], value: 2 }], label: 'Overlap' } },
  { id: 'three', props: { data: [{ sets: ['A'], value: 10 }, { sets: ['B'], value: 5 }, { sets: ['C'], value: 7 }, { sets: ['A', 'B', 'C'], value: 2 }], label: 'Three', width: 600, height: 300 } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'invalid', props: { data: [{ sets: [], value: 4 }, { sets: ['A'], value: -1 }, { sets: ['B'], value: NaN }], label: 'Invalid' } },
  { id: 'attrs', props: { data: [{ sets: ['<A>'], value: 4 }], label: '<Chart>', class: 'consumer', 'data-bench': 'venn', style: 'color: red' } },
] satisfies Fixture[];
