import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { loadDeclarationProgram } from '../../src/generator/contracts/loader.js';
import { extractVue } from '../../src/generator/contracts/vue.js';
import { createConvertState, convertObjectMembers } from '../../src/generator/contracts/convert.js';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../../../..');
let scratch: string;
beforeAll(() => {
  mkdirSync(join(root, 'tmp'), { recursive: true });
  scratch = mkdtempSync(join(root, 'tmp/vue-contract-'));
  cpSync(join(import.meta.dirname, 'fixtures/sfc'), join(scratch, 'src'), { recursive: true });
  writeFileSync(join(scratch, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { strict: true, target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
      declaration: true, emitDeclarationOnly: true, outDir: 'dist', skipLibCheck: true, types: [] },
    include: ['src/**/*.vue', 'src/**/*.ts'],
  }));
  const result = spawnSync(process.execPath, [require.resolve('vue-tsc/bin/vue-tsc.js'), '-p', join(scratch, 'tsconfig.json')], { encoding: 'utf8' });
  expect(result.status, result.stdout + result.stderr).toBe(0);
}, 30000);
afterAll(() => { if (scratch) rmSync(scratch, { recursive: true, force: true }); });

function extract(name: string, expectedSlots: string[] = [], entry = `${name}.vue.d.ts`) {
  const file = join(scratch, 'dist', entry);
  const loaded = loadDeclarationProgram([file]);
  return extractVue({ ...loaded, declFile: loaded.program.getSourceFile(file)!, identifier: name,
    repoDeclPath: entry, declarationDigest: 'sha256:' + '0'.repeat(64), packageName: 'fixture', packageVersion: '0', expectedSlots });
}

describe('emitted SFC public contracts', () => {
  it('extracts imported props, default/named/scoped slots, payloads and model binding from vue-tsc output', () => {
    const body = extract('Probe', ['default', 'header', 'row']);
    expect(body.status).toBe('complete');
    expect(body.props).toMatchObject({ properties: { value: { type: 'string' }, disabled: { type: 'boolean' } }, required: ['value'] });
    expect(body.slots).toEqual([
      { name: 'default' },
      { name: 'header', required: true, params: { type: 'object', properties: { label: { type: 'string' } }, required: ['label'], additionalProperties: false } },
      { name: 'row', params: { type: 'object', properties: { index: { type: 'number' }, value: { type: 'string' } }, required: ['index', 'value'], additionalProperties: false } },
    ]);
    expect(body.events.find(e => e.name === 'change')?.payload).toEqual({ type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }], items: false });
    expect(body.events.find(e => e.name === 'done')).toEqual({ name: 'done' });
    expect(body.bindable).toEqual(['value']);
    expect(body.limitations.some(l => l.includes('Slot surface'))).toBe(false);
    expect(extract('Probe', ['missing']).status).toBe('partial');
  });

  it('keeps the component surface when exported props and the component come from different files', () => {
    writeFileSync(join(scratch, 'dist/Facade.d.ts'), `export type { ProbeProps as FacadeProps } from './Probe.vue.js';\nexport { default as Facade } from './Probe.vue.js';\n`);
    const body = extract('Facade', ['header'], 'Facade.d.ts');
    expect(body.status).toBe('complete');
    expect(body.slots.map(s => s.name)).toEqual(['default', 'header', 'row']);
    expect(body.events.some(e => e.name === 'change')).toBe(true);
    writeFileSync(join(scratch, 'dist/FacadeStar.d.ts'), `export * from './Facade.js';\n`);
    expect(extract('Facade', ['header'], 'FacadeStar.d.ts').slots).toEqual(body.slots);
  });

  it('instantiates generic defaults in callable props, events and scoped slots', () => {
    const body = extract('GenericProbe', ['item']);
    expect(body.status).toBe('complete');
    expect(body.props).toMatchObject({ properties: { value: { const: 'ready' }, items: { type: 'array', items: { const: 'ready' } } } });
    expect(body.slots[0]).toMatchObject({ name: 'item', params: { properties: { value: { const: 'ready' } } } });
    expect(body.events.find(e => e.name === 'select')?.payload).toEqual({ const: 'ready' });
  });

  it('reports generic parameters without defaults instead of widening their constraints', () => {
    const body = extract('GenericUnknown', ['item']);
    expect(body.status).toBe('partial');
    expect(body.unresolved.some(loss => loss.kind === 'generic')).toBe(true);
    expect(body.props?.['properties'] ?? {}).not.toHaveProperty('value');
  });

  it('requires an exported NameProps type', () => {
    writeFileSync(join(scratch, 'dist/Private.d.ts'), 'type PrivateProps = { value: string }; export declare const Private: object;');
    expect(extract('Private', [], 'Private.d.ts').reason).toBe('no-props-type');
  });

  it('retains definitions referenced only by events or slots with empty exported props', () => {
    const body = extract('EventOnly', ['detail']);
    expect(body.status).toBe('complete');
    expect(body.events.find(e => e.name === 'select')?.payload).toEqual({ $ref: '#/$defs/Detail' });
    expect(body.slots[0]?.params).toEqual({ $ref: '#/$defs/Detail' });
    expect(body.props?.['$defs']).toMatchObject({ Detail: { properties: { id: { type: 'string' } } } });
  });

  it('serializes branded primitives and symbol-keyed objects without TypeScript allocation ids', () => {
    const file = join(scratch, 'brand.d.ts');
    writeFileSync(file, `declare const brand: unique symbol; export type Branded = string & { [brand]: 'entity' }; export type BrandProps = { id: Branded; data: { [brand]: 'data'; label: string } };`);
    const run = (noise: boolean) => {
      const extra = join(scratch, 'noise.d.ts');
      writeFileSync(extra, 'declare const unrelated: unique symbol; type Noise = { [unrelated]: true };');
      const loaded = loadDeclarationProgram(noise ? [extra, file] : [file]);
      // Force allocation of an unrelated computed symbol before the target.
      if (noise) for (const statement of loaded.program.getSourceFile(extra)!.statements) loaded.checker.getTypeAtLocation(statement);
      const state = createConvertState(loaded.checker);
      const source = loaded.program.getSourceFile(file)!;
      const symbol = loaded.checker.getExportsOfModule(loaded.checker.getSymbolAtLocation(source)!).find(s => s.name === 'BrandProps')!;
      const schema = convertObjectMembers(loaded.checker.getDeclaredTypeOfSymbol(symbol), state, 'BrandProps');
      return { schema, dropped: state.dropped, replaced: state.replaced };
    };
    const result = run(false);
    expect(run(true)).toEqual(result);
    expect(result.schema.properties.id).toEqual({ type: 'string' });
    expect(JSON.stringify(result)).not.toContain('__@');
    expect(result.dropped).toMatchObject([{ name: 'data.[brand]' }]);
    expect(result.replaced).toMatchObject([{ name: 'BrandProps.id', reason: expect.stringContaining('brands') }]);
  });
});
