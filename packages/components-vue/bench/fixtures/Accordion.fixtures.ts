import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ id: 'a', title: 'First', content: 'Alpha' }, { id: 'b', title: 'Second', content: 'Beta' }], defaultOpenIds: ['a'] } },
  { id: 'align-start-lg', props: { items: [{ id: 'a', title: 'First', content: 'Alpha' }, { id: 'b', title: 'Second', content: 'Beta' }], align: 'start', size: 'lg' } },
  { id: 'multiple-open', props: { items: [{ id: 'a', title: 'First', content: 'Alpha' }, { id: 'b', title: 'Second', content: 'Beta' }, { title: 'Third', content: 'Gamma' }], allowMultiple: true, defaultOpenIds: ['a', 'b'] } },
  { id: 'disabled-controlled', props: { items: [{ id: 'a', title: 'First', content: 'Alpha', disabled: true }, { id: 'b', title: 'Second', content: 'Beta' }], openIds: ['b'], size: 'sm' } },
  { id: 'custom', props: { items: [{ id: 'a', title: 'First', content: 'Alpha' }], open: ['a'], class: 'consumer', style: 'color: red', 'data-bench': 'accordion' } },
  { id: 'empty', props: { items: [] } },
] satisfies Fixture[];
