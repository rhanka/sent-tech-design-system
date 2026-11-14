import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkTextFiles } from './dataviz-vue-text.mjs';

test('source and dist reject NUL and every non-whitespace C0/DEL byte, including nested files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'dataviz-text-'));
  try {
    for (const name of ['src/lib', 'dist/lib', 'dist/vapor/lib']) {
      const path = join(directory, name);
      mkdirSync(path, { recursive: true });
      writeFileSync(join(path, 'BookmarkNavigator.vue.js'), Buffer.from([0, 1, 8, 11, 12, 31, 127]));
    }
    const errors = checkTextFiles([join(directory, 'src'), join(directory, 'dist')]);
    assert.equal(errors.length, 21);
    assert.equal(errors.filter(error => error.includes('control byte 0x00 at byte 0')).length, 3);
    for (let byte = 0; byte < 128; byte++) {
      const file = join(directory, 'src/lib/BookmarkNavigator.vue.js');
      writeFileSync(file, Buffer.from([byte]));
      assert.equal(checkTextFiles([join(directory, 'src')]).length,
        (byte < 32 && ![9, 10, 13].includes(byte)) || byte === 127 ? 1 : 0, `byte ${byte}`);
    }
    writeFileSync(join(directory, 'src/lib/BookmarkNavigator.vue.js'), "// Précédent\r\n\tconst key = '\\u0000';\n");
    assert.deepEqual(checkTextFiles([join(directory, 'src')]), []);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
