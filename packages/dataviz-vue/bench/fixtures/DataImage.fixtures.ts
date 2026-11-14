import type { Fixture } from './types.js';
const image = { src: 'https://example.com/logo.png', alt: 'Logo' };
export default [
 { id: 'default', props: { image } },
 { id: 'template', props: { image: { srcTemplate: 'https://example.com/{{slug}}.png', altTemplate: 'Logo {{customer}}' }, row: { slug: 'acme', customer: 'Acme' } } },
 { id: 'fallback', props: { image: { fallbackSrc: 'fallback.png' } } },
 { id: 'attrs', props: { image, class: 'consumer', 'data-bench': 'image', style: 'color:red' } },
] satisfies Fixture[];
