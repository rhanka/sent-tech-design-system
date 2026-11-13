import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { content: 'Hello' } },
  { id: 'user', props: { role: 'user', content: 'Hi there', status: 'sent' } },
  { id: 'streaming', props: { content: 'Thinking', status: 'streaming', timestamp: '12:00' } },
  { id: 'rich-content', props: { content: 'Hello', avatar: 'A', footer: 'F', actions: 'Retry' },
    legacyProps: { avatar: h('strong', 'A'), footer: h('em', 'F'), actions: h('button', { type: 'button' }, 'Retry') },
    slots: { avatar: '<strong>A</strong>', footer: '<em>F</em>', actions: '<button type="button">Retry</button>' } },
  { id: 'timestamp-only', props: { content: 'Hey', timestamp: '12:34' } },
  { id: 'actions-prop', props: { content: 'Hey', actions: 'Retry' } },
  { id: 'custom', props: { status: 'error', content: 'Failed', class: 'consumer', style: 'color: red', 'data-bench': 'chat' } },
] satisfies Fixture[];
