import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { media: 'https://example.test/photo.jpg', mediaAlt: 'A sunrise over the bay', title: 'Sunrise', caption: 'Captured at dawn.', byline: 'J. Moreau' }, slots: { default: 'Fallback' } },
  { id: 'video-controls', props: { media: 'https://example.test/clip.mp4', mediaAlt: '', mediaKind: 'video', mediaControls: true, title: 'Interview' } },
  { id: 'video-no-controls-captions', props: { media: 'https://example.test/clip.mp4', mediaKind: 'video', mediaControls: false, mediaCaptions: 'https://example.test/fr.vtt', mediaCaptionsLabel: 'English', mediaCaptionsLang: 'en', title: '' } },
  { id: 'slot-fallback', props: { title: 'No media yet', aspectRatio: '4/3' }, slots: { default: '<strong>Upload</strong> your image' } },
  { id: 'custom-ratio', props: { media: 'https://example.test/photo.jpg', aspectRatio: '1/1', class: 'consumer', style: 'border: 1px solid red', 'data-bench': 'media' } },
  { id: 'caption-only', props: { caption: 'A caption without media.' }, slots: { default: 'Fallback text' } },
] satisfies Fixture[];
