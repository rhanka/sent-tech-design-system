import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { status: 'sent' } },
  { id: 'sending', props: { status: 'sending' } },
  { id: 'streaming', props: { status: 'streaming' } },
  { id: 'error-tone', props: { status: 'error', tone: 'warning', class: 'consumer', style: 'color: red', 'data-bench': 'status' } },
  { id: 'custom-labels', props: { status: 'completed', labels: { completed: 'Done', status: 'sent' } } },
  { id: 'normalized-label', props: { status: 'failed', labels: { failed: 'Échec' } } },
] satisfies Fixture[];
