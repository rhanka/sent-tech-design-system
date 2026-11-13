import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { messages: [{ id: '1', content: 'Hi' }, { id: '2', role: 'user', content: 'Hello', status: 'sent' }, { id: '3', role: 'assistant', content: 'Typing', status: 'streaming' }] } },
  { id: 'slot-default', props: { messages: [], label: 'Conversation' }, slots: { default: '<p>Custom message</p>' } },
  { id: 'empty-label', props: { messages: [], emptyLabel: 'No messages yet' } },
  { id: 'empty-slot', props: {}, slots: { empty: '<p>Nothing here</p>' } },
  { id: 'custom', props: { messages: [{ id: '1', content: 'Hi' }], autoScroll: false, label: 'Thread', class: 'consumer', style: 'color: red', 'data-bench': 'thread' } },
] satisfies Fixture[];
