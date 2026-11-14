import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { files } from './vue-vapor-source.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

// Source and generated modules are text. Only tab, LF and CR are valid C0 bytes.
export function checkTextFiles(directories) {
  const errors = [];
  for (const directory of directories) for (const file of files(directory)) {
    const bytes = readFileSync(file);
    for (let offset = 0; offset < bytes.length; offset++) {
      const byte = bytes[offset];
      if ((byte < 0x20 && ![0x09, 0x0a, 0x0d].includes(byte)) || byte === 0x7f) {
        errors.push(`${file}: control byte 0x${byte.toString(16).padStart(2, '0')} at byte ${offset}`);
      }
    }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkTextFiles(['src', 'dist'].map(path => resolve(root, 'packages/dataviz-vue', path)));
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('dataviz-vue source + dist: no forbidden control bytes');
}
