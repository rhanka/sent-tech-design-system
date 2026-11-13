import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ term: 'Name', description: 'Ada' }, { term: 'Age', description: '30' }] } },
  { id: 'label-value-bordered', props: { items: [{ label: 'Email', value: 'a@b.c' }], bordered: true } },
  { id: 'empty', props: { items: [] } },
  { id: 'custom', props: { items: [{ term: 'X', value: 'Y' }], class: 'consumer', style: 'color: red', 'data-bench': 'structured' } },
  { id: 'partial', props: { items: [{ term: 'Only' }, { description: 'No term' }] } },
] satisfies Fixture[];
