import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { src: '/img.png', alt: 'Chart' } },
  { id: 'sized', props: { src: '/img.png', alt: 'Chart', width: 200, height: 120, radius: 8 } },
  { id: 'contain-string-size', props: { src: '/img.png', alt: 'Chart', width: '50%', height: 'auto', fit: 'contain', loading: 'eager', decoding: 'sync' } },
  { id: 'custom-class', props: { src: '/img.png', alt: 'Chart', width: 100, radius: '4px', class: 'consumer', style: 'color: red', 'data-bench': 'image' } },
  { id: 'decorative', props: { src: '/deco.png', alt: '', decoding: 'auto' } },
  { id: 'radius-only', props: { src: '/img.png', alt: 'Chart', radius: 16 } },
] satisfies Fixture[];
