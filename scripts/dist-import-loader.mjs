// Node executes the actual JS graph. Only framework source/assets need format
// adapters: Svelte is compiled to SSR JS; CSS is read, then has no Node effects.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const project = realpathSync(process.cwd()) + sep;
const { lane } = JSON.parse(readFileSync('target.json', 'utf8'));
export async function resolve(specifier, context, nextResolve) {
  if (lane === 'vapor' && ['vue', '@vue/runtime-dom', '@vue/runtime-core', '@vue/reactivity', '@vue/shared', '@vue/server-renderer'].includes(specifier)) {
    const basename = specifier === 'vue' ? 'vue.runtime' : specifier.split('/')[1];
    specifier = pathToFileURL(`${project}node_modules/${specifier}/dist/${basename}.esm-bundler.js`).href;
  }
  // Svelte ships component source with bundler-style relative imports. Apply
  // its source resolution only to compiled .svelte parents; published JS still
  // has to obey Node's normal explicit-extension rules.
  if (context.parentURL?.endsWith('.svelte') && specifier.startsWith('.') && !extname(specifier)) {
    for (const suffix of ['.js', '.svelte', '/index.js']) {
      const url = new URL(specifier + suffix, context.parentURL);
      if (existsSync(url)) { specifier = url.href; break; }
    }
  }
  const result = await nextResolve(specifier, context);
  if (result.url.startsWith('file:') && !realpathSync(fileURLToPath(result.url)).startsWith(project)) {
    throw new Error(`Import escaped isolated consumer: ${specifier} -> ${result.url}`);
  }
  return result;
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    readFileSync(fileURLToPath(url));
    return { format: 'module', source: 'export default {};', shortCircuit: true };
  }
  if (url.endsWith('.svelte')) {
    const compiler = await import(pathToFileURL(`${project}node_modules/svelte/compiler/index.js`));
    const compile = compiler.compile ?? compiler.default.compile;
    const source = readFileSync(fileURLToPath(url), 'utf8');
    return { format: 'module', source: compile(source, { filename: fileURLToPath(url), generate: 'server' }).js.code, shortCircuit: true };
  }
  return nextLoad(url, context);
}
