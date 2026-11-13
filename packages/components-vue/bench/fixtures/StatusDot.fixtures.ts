import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { tone: 'success' } },
  { id: 'color-size', props: { color: 'var(--brand)', size: 12 } },
  { id: 'label-pulse', props: { label: 'Live', tone: 'info', pulse: true } },
  { id: 'custom', props: { tone: 'warning', size: 16, class: 'consumer', style: 'color: red', 'data-bench': 'dot' } },
  { id: 'label-color', props: { label: 'Status', color: '#123456' } },
] satisfies Fixture[];
