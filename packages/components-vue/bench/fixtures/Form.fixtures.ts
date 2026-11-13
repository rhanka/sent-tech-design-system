import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<input value="x">' } },
  { id: 'submitted-message', props: { status: 'submitted', message: 'Saved.' }, slots: { default: 'OK' } },
  { id: 'error-message', props: { status: 'error', message: 'Failed.' }, slots: { default: 'Retry' } },
  { id: 'submitting-help', props: { status: 'submitting', message: 'Wait…' }, slots: { default: 'Busy' } },
  { id: 'custom-attrs', props: { class: 'consumer', 'data-bench': 'form', novalidate: true }, slots: { default: '<button>Go</button>' } },
] satisfies Fixture[];
