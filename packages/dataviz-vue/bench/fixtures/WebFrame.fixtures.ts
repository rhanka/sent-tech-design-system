import type { Fixture } from './types.js';
const frame = { src: 'https://example.com/embed' };
export default [
 { id: 'default', props: { frame } },
 { id: 'title', props: { frame: { ...frame, title: 'Report' } } },
 { id: 'policy', props: { frame: { ...frame, sandbox: ['allow-scripts'], referrerPolicy: 'no-referrer', loading: 'eager', allow: 'fullscreen' } } },
 { id: 'attrs', props: { frame, class: 'consumer', 'data-bench': 'frame', style: 'color:red', id: 'explicit-frame' } },
] satisfies Fixture[];
