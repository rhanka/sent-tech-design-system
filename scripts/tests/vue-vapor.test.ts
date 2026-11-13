// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { renderCalls } from '../vue-vapor-source.mjs';

it('should reject aliased and namespace render calls while accepting signal helpers', () => {
  expect(renderCalls(`import {h as render, defineComponent as component} from 'vue'; component({setup:()=>()=>render('p')})`)).toHaveLength(2);
  expect(renderCalls(`import * as Vue from 'vue'; Vue.defineComponent({}); Vue.h('p');`)).toHaveLength(2);
  expect(renderCalls(`import { ref, computed } from 'vue'; const value=ref(1); computed(()=>value.value);`)).toEqual([]);
});

it('should fail the build lint for a new module and require removal after conversion', () => {
  const root = mkdtempSync(join(tmpdir(), 'k25-'));
  try {
    mkdirSync(join(root, 'scripts'));
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    for (const name of ['vue-vapor-lint.mjs', 'vue-vapor-source.mjs']) cpSync(resolve('scripts', name), join(root, 'scripts', name));
    for (const name of ['components-vue', 'dataviz-vue']) mkdirSync(join(root, 'packages', name, 'src'), { recursive: true });
    const module = 'packages/dataviz-vue/src/Chart.ts';
    writeFileSync(join(root, 'scripts/vue-vapor-legacy.json'), '[]');
    writeFileSync(join(root, module), `import {h as render} from 'vue'; export const chart=()=>render('p');`);
    const lint = () => spawnSync(process.execPath, [join(root, 'scripts/vue-vapor-lint.mjs')], { encoding: 'utf8' });
    expect(lint().status).toBe(1); expect(lint().stderr).toContain('new render-function module');
    writeFileSync(join(root, 'scripts/vue-vapor-legacy.json'), JSON.stringify([module]));
    expect(lint().status).toBe(0);
    writeFileSync(join(root, module), `export const value = 1;`);
    expect(lint().status).toBe(1); expect(lint().stderr).toContain('remove converted/deleted file');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
