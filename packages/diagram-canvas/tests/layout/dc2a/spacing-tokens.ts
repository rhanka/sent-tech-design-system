import { readFileSync } from 'node:fs';
// Read the canonical token data without adding a tokens runtime dependency or
// compiling another workspace under canvas's stricter tsconfig.
const source = readFileSync(new URL('../../../../tokens/src/diagramSpacing.ts', import.meta.url), 'utf8');
const data = /DIAGRAM_SCENE_SPACING = (\{[\s\S]*?\}) as const/.exec(source)?.[1];
if (!data) throw new Error('Missing canonical diagram spacing tokens');
export const DIAGRAM_SCENE_SPACING = JSON.parse(data.replace(/(\w+):/g, '"$1":').replace(/,\s*}/g, '}')) as {
  gapMin: number; gapMinBlock: number; gapBase: number; gapBaseBlock: number;
  trackSpacing: number; trackSpacingBlock: number; labelBand: number; gapMax: number; containerPadding: number;
};
