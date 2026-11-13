import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { status: 'idle' } },
  { id: 'saving', props: { status: 'saving' } },
  { id: 'saved-time', props: { status: 'saved', lastSaved: '2020-01-01T00:00:00Z' } },
  { id: 'error-retry', props: { status: 'error', onRetry: () => {} } },
  { id: 'custom-labels-en', props: { status: 'error', locale: 'en-US', labels: { error: 'Boom' }, retryLabel: 'Try again', onRetry: () => {} } },
  { id: 'custom', props: { status: 'saved', lastSaved: 'not-a-date', class: 'consumer', style: 'color: red', 'data-bench': 'autosave' } },
] satisfies Fixture[];
