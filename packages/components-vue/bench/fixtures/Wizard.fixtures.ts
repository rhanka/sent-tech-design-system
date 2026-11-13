import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { steps: [{ label: 'One' }, { label: 'Two', description: 'Second step' }, { label: 'Three' }] } },
  { id: 'midway', props: { steps: [{ label: 'One' }, { label: 'Two' }], currentStep: 1, stepTitle: 'Account details' }, slots: { default: '<p>Form fields here.</p>' } },
  { id: 'last', props: { steps: [{ label: 'One' }, { label: 'Two' }], currentStep: 1, isLast: true } },
  { id: 'custom-labels', props: { steps: [{ label: 'First' }, { label: 'Second' }], stepperLabel: 'Steps', stepTitle: 'Review', cancelLabel: 'Abort', backLabel: 'Previous', nextLabel: 'Continue', finishLabel: 'Done' } },
  { id: 'no-steps', props: { steps: [] } },
  { id: 'custom-attrs', props: { steps: [{ label: 'One' }], class: 'consumer', style: 'color: red', 'data-bench': 'wizard' } },
] satisfies Fixture[];
