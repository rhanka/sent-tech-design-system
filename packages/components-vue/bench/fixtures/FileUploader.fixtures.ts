import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Upload' } },
  { id: 'multiple-with-items', props: { label: 'Files', multiple: true, accept: '.png', items: [{ name: 'a.png', size: 2048 }, { id: 'b', file: { name: 'b.txt', size: 500 }, status: 'complete' }] } },
  { id: 'statuses', props: { label: 'Files', items: [{ name: 'up.bin', size: 1024, status: 'uploading', progress: 40 }, { name: 'bad.bin', size: 99, status: 'error', error: 'Too large' }, { name: 'idle.bin', status: 'idle' }] } },
  { id: 'invalid-disabled', props: { label: 'Files', errorText: 'Required', helperText: 'PDF only', disabled: true, triggerLabel: 'Pick', dropzoneLabel: 'Drop here', removeLabel: (f: string) => `Drop ${f}`, class: 'consumer', style: 'color: red', 'data-bench': 'upload' } },
  { id: 'with-id', props: { id: 'my-upload', label: 'Files', helperText: 'Optional' } },
  { id: 'no-label', props: {} },
] satisfies Fixture[];
