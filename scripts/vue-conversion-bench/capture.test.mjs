import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateGoldens } from './generate-goldens.mjs';

function sandbox(action) {
  const bench = mkdtempSync(resolve('packages/dataviz-vue/bench', '.tmp-capture-'));
  const src = resolve(bench, 'src/lib');
  mkdirSync(src, { recursive: true });
  mkdirSync(resolve(bench, 'fixtures'));
  writeFileSync(resolve(bench, 'src/index.ts'), "export { Proof } from './lib/Proof.js';\nexport type { ProofProps, Extra } from './lib/Proof.js';\nexport { Other } from './lib/Other.js';\nexport type { OtherProps } from './lib/Other.js';\n");
  for (const name of ['Proof', 'Other']) {
    writeFileSync(resolve(src, name + '.ts'), `export const ${name} = {}; export type ${name}Props = {};`);
    writeFileSync(resolve(bench, 'fixtures', name + '.fixtures.ts'), 'export default [];');
  }
  writeFileSync(resolve(bench, 'worker.mjs'), "console.log(JSON.stringify({ok:true,implementation:'ts',fixtures:['default','a','b','c'].map(id=>({id,html:'<div></div>'}))}));");
  const argv = process.argv;
  const capture = (...selected) => {
    process.argv = [process.execPath, 'generate-goldens.mjs', ...selected];
    return generateGoldens({ bench, pkg: bench, src, packageSrc: resolve(bench, 'src'), names: ['Proof', 'Other'], modulePath: name => name });
  };
  try { action({ bench, src, capture }); }
  finally { process.argv = argv; rmSync(bench, { recursive: true, force: true }); }
}

test('captures selected originals under src/lib with every auxiliary public type', () => sandbox(({ bench, capture }) => {
  capture('Proof');
  const frozen = JSON.parse(readFileSync(resolve(bench, 'goldens/Proof.json')));
  assert.equal(frozen.source, 'src/lib/Proof.ts');
  assert.equal(frozen.schema, 1);
  assert.equal(frozen.fixtures.length, 4);
  assert.match(frozen.sourceSha256, /^[a-f0-9]{64}$/);
  assert.match(frozen.fixtureSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(frozen.publicExports, [{ name: 'Proof', typeOnly: false }, { name: 'ProofProps', typeOnly: true }, { name: 'Extra', typeOnly: true }]);
  assert.equal(existsSync(resolve(bench, 'goldens/Other.json')), false);
}));

test('refuses overwriting a frozen original capture byte for byte', () => sandbox(({ bench, capture }) => {
  capture('Proof');
  const path = resolve(bench, 'goldens/Proof.json');
  const before = readFileSync(path);
  assert.throws(() => capture('Proof'), /golden already exists/);
  assert.deepEqual(readFileSync(path), before);
}));

test('allows another original capture after a prior target is converted', () => sandbox(({ src, capture }) => {
  writeFileSync(resolve(src, 'Proof.vue'), '<template><div /></template>');
  assert.throws(() => capture('Proof'), /original .ts required/);
  capture('Other');
}));

test('writes no goldens when any selected original fails SSR', () => sandbox(({ bench, capture }) => {
  writeFileSync(resolve(bench, 'worker.mjs'), "if(process.argv[3]==='Other') process.exit(1); console.log(JSON.stringify({ok:true,implementation:'ts',fixtures:[]}));");
  assert.throws(() => capture('Proof', 'Other'), /Other:/);
  assert.equal(existsSync(resolve(bench, 'goldens/Proof.json')), false);
}));

test('refuses duplicate and unknown capture selections', () => sandbox(({ capture }) => {
  assert.throws(() => capture('Proof', 'Proof'), /unique component/);
  assert.throws(() => capture('Missing'), /unique component/);
}));

test('detects original mutation during SSR before freezing metadata', () => sandbox(({ bench, src, capture }) => {
  writeFileSync(resolve(bench, 'worker.mjs'), "import {writeFileSync} from 'node:fs';writeFileSync(" + JSON.stringify(resolve(src, 'Proof.ts')) + ", 'changed');console.log(JSON.stringify({ok:true,implementation:'ts',fixtures:[]}));");
  assert.throws(() => capture('Proof'), /changed during capture/);
  assert.equal(existsSync(resolve(bench, 'goldens/Proof.json')), false);
}));
