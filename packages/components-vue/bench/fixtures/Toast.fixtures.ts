import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Saved', message: 'Done', onClose: () => {} } },
  { id: 'no-listener', props: { tone: 'error', title: 'Error', locale: 'en' }, slots: { default: '<p>Details</p>', actions: '<button>Retry</button>' } },
  { id: 'queue', props: { items: [{ id: 'a', title: 'One', message: 'First', tone: 'warning', actions: 'Undo' }, { id: 'b', title: 'Two', tone: 'error' }], onDismiss: () => {}, closeLabel: 'Dismiss', class: 'consumer', 'data-bench': 'toast' } },
  { id: 'empty-queue', props: { items: [], title: 'Fallback', message: '', locale: 'en' } },
  { id: 'rich-single', props: { title: 'Saved', message: 'Done' }, legacyProps: { title: h('strong', 'Saved'), message: h('em', 'Done') }, slots: { title: '<strong>Saved</strong>', message: '<em>Done</em>' } },
  { id: 'rich-queue', props: { items: [{ id: 'a', title: 'One', message: 'First', actions: 'Undo' }] }, legacyProps: { items: [{ id: 'a', title: h('strong', 'One'), message: h('em', 'First'), actions: h('button', 'Undo') }] }, slots: { title: { scope: '{ item }', html: '<strong>{{ item.title }}</strong>' }, message: { scope: '{ item }', html: '<em>{{ item.message }}</em>' }, actions: { scope: '{ item }', html: '<button>{{ item.actions }}</button>' } } },
] satisfies Fixture[];
