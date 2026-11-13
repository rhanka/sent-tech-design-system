import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { frame: { src: 'https://example.com/embed', title: 'Embedded report' } } },
  { id: 'defaults', props: { frame: { src: 'https://example.com/default' } } },
  { id: 'sandbox', props: { frame: { src: 'https://example.com/form', title: '<b>Form</b>', sandbox: ['allow-scripts', 'allow-forms'], referrerPolicy: 'no-referrer', loading: 'eager', allow: 'fullscreen' }, class: 'consumer' } },
  { id: 'empty-sandbox', props: { frame: { src: '/local', title: '', sandbox: '', allow: '' } } },
] satisfies Fixture[];
