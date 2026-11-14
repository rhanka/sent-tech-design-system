import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ target: '#chart', store: newStore() });
export default [
  { id: 'default', props: base() },
  { id: 'formats', props: { ...base(), formats: ['csv', 'svg'] } },
  { id: 'labels', props: { target: '#chart', formats: ['png', 'print'], labels: { png: 'Image', print: 'Imprimer' } } },
  { id: 'no-store', props: { target: '#chart' } },
  { id: 'named', props: { ...base(), filename: 'report' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'export' } },
] satisfies Fixture[];
