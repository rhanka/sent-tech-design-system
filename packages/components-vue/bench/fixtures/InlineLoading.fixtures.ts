import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'explicit-label', props: { status: 'active', label: 'Please wait' } },
  { id: 'success', props: { status: 'success', label: 'Done' } },
  { id: 'error', props: { status: 'error' } },
  { id: 'inactive-en', props: { status: 'inactive', locale: 'en-US' } },
  { id: 'custom-attrs', props: { status: 'success', label: 'OK', class: 'consumer', style: 'color: red', 'aria-label': 'Custom', 'data-bench': 'inline-loading' } },
] satisfies Fixture[];
