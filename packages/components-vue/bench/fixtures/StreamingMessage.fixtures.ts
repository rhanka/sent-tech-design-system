import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { text: 'Hello streaming' } },
  { id: 'passive-events', props: { text: 'Working', mode: 'passive', events: [{ id: '1', label: 'First' }, { id: '2', label: 'Second' }] } },
  { id: 'empty-placeholder', props: { placeholder: 'Waiting…' } },
  { id: 'custom', props: { text: 'Hi', class: 'consumer', style: 'color: red', 'data-bench': 'streaming' } },
  { id: 'no-events', props: { text: '', placeholder: '', events: [] } },
] satisfies Fixture[];
