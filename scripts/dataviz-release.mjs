import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const adapters = ['core', 'svelte', 'react', 'vue', 'angular'];
const root = fileURLToPath(new URL('../', import.meta.url));

function parseVersion(version) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/.exec(version);
  if (!match || match[4]?.split('.').some(part => /^\d+$/.test(part) && part.length > 1 && part.startsWith('0')))
    throw new Error(`Invalid release version: ${version}`);
  return { base: match.slice(1, 4).map(Number), prerelease: match[4] };
}

export function releasePlan(tag, manifests) {
  // Match Vue first: dataviz-vue-v also starts with dataviz-v.
  const vueOnly = tag.startsWith('dataviz-vue-v');
  const prefix = vueOnly ? 'dataviz-vue-v' : 'dataviz-v';
  if (!tag.startsWith(prefix)) throw new Error(`Unknown Dataviz tag: ${tag}`);
  const version = tag.slice(prefix.length);
  const expected = parseVersion(version);
  const distTag = expected.prerelease?.split('.')[0] ?? 'latest';
  if (expected.prerelease && distTag === 'latest') throw new Error('Refusing to publish a prerelease under latest');
  if (vueOnly && !expected.prerelease) throw new Error('The independent Vue tag requires a prerelease');

  const vue = parseVersion(manifests.vue.version);
  const firstDifference = vue.base.findIndex((part, index) => part !== expected.base[index]);
  const vueAhead = vue.prerelease && firstDifference >= 0 && vue.base[firstDifference] > expected.base[firstDifference];
  const selected = vueOnly ? ['vue'] : adapters.filter(adapter => !(adapter === 'vue' && vueAhead));
  for (const adapter of selected) {
    const manifest = manifests[adapter];
    if (manifest.version !== version) throw new Error(`${manifest.name}: ${manifest.version} does not match ${version}`);
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const [name, pin] of Object.entries(manifest[field] ?? {})) {
        if (!name.startsWith('@sentropic/dataviz-')) continue;
        const sibling = manifests[name.slice('@sentropic/dataviz-'.length)];
        if (!sibling || pin !== (vueOnly ? sibling.version : version))
          throw new Error(`${manifest.name} -> ${name}: ${pin} does not match ${vueOnly ? sibling?.version : version}`);
      }
    }
  }
  const packages = selected.map(adapter => manifests[adapter].name);
  return { version, packages: packages.join(' '), workspaces: packages.join(',') };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifests = Object.fromEntries(adapters.map(adapter => [adapter,
    JSON.parse(readFileSync(resolve(root, `packages/dataviz-${adapter}/package.json`), 'utf8'))]));
  const plan = releasePlan(process.env.TAG ?? '', manifests);
  const output = Object.entries(plan).map(([name, value]) => `${name}=${value}\n`).join('');
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
  process.stdout.write(output);
}
