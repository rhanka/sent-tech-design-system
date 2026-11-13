import type { Fixture } from './types.js';
import { h } from 'vue';
export default [
  { id: 'default', props: { title: 'No results', message: 'Try another search.' } },
  { id: 'with-action', props: { title: 'Empty', message: 'Nothing here.', action: 'Clear filters', class: 'consumer', style: 'color: red', 'data-bench': 'empty' } },
  { id: 'title-only', props: { title: 'Just a title' } },
  { id: 'action-only', props: { title: 'Title', action: 'Retry' } },
  { id: 'with-slot', props: { title: 'Slot title', message: 'Slot message' }, slots: { default: '<strong>Slot</strong> detail' } },
  { id: 'bare-slot', props: { title: 'Bare' }, slots: { default: 'Slot body' } },
  { id: 'rich-content', props: {}, legacyProps: { title: h('strong', 'Empty'), message: h('em', 'Try again'), action: h('button', 'Retry') }, slots: { title: '<strong>Empty</strong>', message: '<em>Try again</em>', action: '<button>Retry</button>' } },
] satisfies Fixture[];
