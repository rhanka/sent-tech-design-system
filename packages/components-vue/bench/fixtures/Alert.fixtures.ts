import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Information' } },
  { id: 'success-message', props: { tone: 'success', title: 'Saved', message: 'All changes saved.' }, slots: { default: '<small>Updated now</small>' } },
  { id: 'warning-actions', props: { tone: 'warning', title: 'Review', message: 'Check your input', actions: 'Retry' } },
  { id: 'error-custom', props: { tone: 'error', title: 'Failure', class: 'consumer', style: 'color: red', 'aria-label': 'Error notice' } },
  { id: 'rich-content', props: {    },
    legacyProps: { title: h('strong', 'Review'), message: h('em', 'Details'), actions: h('button', { type: 'button' }, 'Retry') },
    slots: { title: '<strong>Review</strong>', message: '<em>Details</em>', actions: '<button type="button">Retry</button>', default: '<small>Context</small>' } },
  { id: 'empty-message', props: { title: 'Notice', message: '', actions: '' } },
] satisfies Fixture[];
