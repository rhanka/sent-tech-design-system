import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { code: 'const x = 1;' } },
  { id: 'inline', props: { code: 'npm run dev', inline: true, language: 'sh' } },
  { id: 'no-copy', props: { code: 'let y = 2;', copyable: false, language: 'js' } },
  { id: 'custom', props: { code: 'export {}', language: 'ts', copyLabel: 'Copy code', copiedLabel: 'Done', class: 'consumer', style: 'color: red', 'data-bench': 'code' } },
  { id: 'empty-code', props: { code: '' } },
] satisfies Fixture[];
