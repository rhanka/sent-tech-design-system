import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { steps: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }], current: 1 } },
  { id: 'vertical-clickable', props: { steps: [{ label: 'A', description: 'First' }, { label: 'B' }], current: 0, orientation: 'vertical', clickable: true, label: 'Steps' } },
  { id: 'empty', props: { steps: [] } },
  { id: 'custom', props: { steps: [{ label: 'Solo', description: 'Only' }], current: 0, class: 'consumer', style: 'color: red', 'data-bench': 'stepper' } },
  { id: 'complete', props: { steps: [{ label: 'A' }, { label: 'B' }], current: 5 } },
] satisfies Fixture[];
