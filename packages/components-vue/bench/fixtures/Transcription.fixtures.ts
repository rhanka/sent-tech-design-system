import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'open-text', props: { open: true, text: 'Hello world' } },
  { id: 'segments', props: { open: true, title: 'Meeting', segments: [{ speaker: 'Alice', startTime: '00:02', endTime: '00:05', text: 'Welcome everyone.' }, { speaker: 'Bob', startTime: '00:06', endTime: '00:10', text: 'Thanks Alice.' }] } },
  { id: 'segments-no-timestamps', props: { segments: [{ speaker: 'Alice', startTime: '00:02', endTime: '00:05', text: 'Welcome.' }], showTimestamps: false } },
  { id: 'segment-partial', props: { segments: [{ speaker: 'Alice', endTime: '00:05', text: 'Started earlier.' }, { startTime: '00:06', text: 'No speaker.' }, { text: 'No times at all.' }] } },
  { id: 'blank-text', props: { text: '   ' } },
  { id: 'custom-attrs', props: { title: 'Recording', open: true, text: 'Transcript body', class: 'consumer', style: 'color: red', 'data-bench': 'transcription' } },
] satisfies Fixture[];
