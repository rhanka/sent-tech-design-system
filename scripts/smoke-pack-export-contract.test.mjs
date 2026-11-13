import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('packed Vue verification rejects missing public names even when export counts match', async () => {
  const template = readFileSync(new URL('./smoke-pack-verify-template.mjs', import.meta.url), 'utf8')
    .replaceAll('__SMOKE_TARGETS_JSON__', '[]')
    .replaceAll('__SMOKE_MIN_EXPORT_COUNTS_JSON__', '{}')
    .replaceAll('__SMOKE_REQUIRED_EXPORTS_JSON__', JSON.stringify({ proof: ['Chart', 'toSpec'] }));
  const source = template + '\nexport { assertModuleExports, failures };';
  const { assertModuleExports, failures } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assertModuleExports('proof', { Chart: {}, unrelated: () => {} }, 2);
  assert.deepEqual(failures.splice(0), ['proof: missing public exports: toSpec']);
  assertModuleExports('proof', { Chart: {}, toSpec: () => {} }, 2);
  assert.deepEqual(failures, []);
});
