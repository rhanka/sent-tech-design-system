import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { src: '/video.html', title: 'Video' } },
  { id: 'sandboxed', props: { src: '/app.html', title: 'App', sandbox: 'allow-scripts', aspectRatio: '4/3', allow: 'fullscreen; picture-in-picture', loading: 'eager', class: 'consumer', style: 'color: red', 'data-bench': 'embed' } },
  { id: 'empty-sandbox', props: { src: '/doc.html', title: 'Doc', sandbox: '' } },
  { id: 'portrait', props: { src: '/photo.html', title: 'Photo', aspectRatio: '3/4' } },
  { id: 'square', props: { src: '/map.html', title: 'Map', aspectRatio: '1/1', loading: 'lazy' } },
  { id: 'eager-minimal', props: { src: '/x.html', title: 'X', loading: 'eager' } },
] satisfies Fixture[];
