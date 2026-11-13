import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { errors: [{ href: '#name', text: 'Name is required' }, { href: '#email', text: 'Email is invalid' }] } },
  { id: 'custom-heading', props: { heading: 'Fix the following', errors: [{ href: '#age', text: 'Age must be positive' }] } },
  { id: 'single-error', props: { errors: [{ href: '#only', text: 'Only error' }] } },
  { id: 'custom-class', props: { errors: [{ href: '#x', text: 'X error' }], class: 'consumer', style: 'color: red', 'data-bench': 'summary' } },
  { id: 'empty-errors', props: { errors: [] } },
  { id: 'no-errors-prop', props: {} },
] satisfies Fixture[];
