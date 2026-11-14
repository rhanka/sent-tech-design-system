// Import the package consumers actually receive, with registry dependencies.
// Workspace links and already-published sibling tarballs must never mask drift.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOrderedWorkspaces } from './run-workspaces.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const metadata = new Map();
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    // Do not inherit resolution hooks or workspace paths from the developer.
    env: { ...process.env, NODE_PATH: '', NODE_OPTIONS: '' },
  });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')}\n${result.error ?? ''}${result.stdout ?? ''}${result.stderr ?? ''}`);
  return result.stdout;
}

function registryManifest(name, range, cwd) {
  const spec = `${name}@${range}`;
  if (metadata.has(spec)) return metadata.get(spec);
  const result = spawnSync('npm', ['view', spec, '--json'], { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    // Authentication/network failures are never evidence of an unpublished version.
    if (!/E404|ETARGET/.test(result.stdout + result.stderr)) throw new Error(`Registry lookup failed for ${spec}: ${result.stdout}${result.stderr}`);
    metadata.set(spec, null);
    return null;
  }
  const data = JSON.parse(result.stdout);
  const manifest = Array.isArray(data) ? data.at(-1) : data;
  if (!manifest?.version) throw new Error(`Invalid registry metadata for ${spec}`);
  metadata.set(spec, manifest);
  return manifest;
}

export function packWorkspace(workspace, destination) {
  const result = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', destination], workspace.dir));
  return join(destination, result[0].filename);
}

export async function checkPackage(workspace, { workspaces = [], tarball, log = console.log } = {}) {
  const temp = mkdtempSync(join(tmpdir(), 'sent-dist-import-'));
  try {
    const byName = new Map(workspaces.map(w => [w.manifest.name, w]));
    const candidate = tarball ?? packWorkspace(workspace, temp);
    const packed = new Map([[workspace.manifest.name, candidate]]);
    const siblings = [];
    const dependencies = {};
    const seen = new Set();
    function visit(manifest) {
      const identity = `${manifest.name}@${manifest.version}`;
      if (seen.has(identity)) return;
      seen.add(identity);
      for (const [name, range] of Object.entries({ ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies })) {
        if (/^(?:file:|link:|workspace:|\.\.?\/)/.test(range)) throw new Error(`Non-registry dependency ${identity}: ${name}@${range}`);
        const sibling = byName.get(name);
        if (sibling) {
          const published = registryManifest(name, range, temp);
          if (published) {
            visit(published);
            continue;
          }
          // Internal release pins are exact. A different local version cannot
          // stand in for the version the packed manifest actually promises.
          if (sibling.manifest.version !== range) throw new Error(`No registry version or matching unpublished sibling for ${name}@${range}`);
          if (!packed.has(name)) packed.set(name, packWorkspace(sibling, temp));
          dependencies[name] = `file:${packed.get(name)}`;
          if (!siblings.includes(`${name}@${range}`)) {
            siblings.push(`${name}@${range}`);
            log(`UNPUBLISHED SIBLING ${name}@${range} (local npm pack; registry lookup returned no matching version)`);
          }
          visit(sibling.manifest);
        }
      }
    }
    visit(workspace.manifest);
    // Optional peers are still needed when testing optional public entries.
    // Use the same declared peers for each local/registry sibling in the graph.
    function peers(manifest) {
      for (const [name, range] of Object.entries(manifest.peerDependencies ?? {})) {
        dependencies[name] ??= range;
      }
    }
    peers(workspace.manifest);
    for (const identity of seen) {
      const published = metadata.get(identity);
      if (published) peers(published);
    }
    for (const name of packed.keys()) if (name !== workspace.manifest.name) peers(byName.get(name).manifest);
    dependencies[workspace.manifest.name] = `file:${candidate}`;
    const vue = workspace.manifest.peerDependencies?.vue;
    const lanes = vue ? ['node', 'vapor'] : ['node'];
    for (const lane of lanes) {
      const project = join(temp, lane);
      mkdirSync(project);
      const deps = { ...dependencies };
      if (vue) {
        // Stable classic exports and the compiler-matched Vapor runtime are
        // independent lanes; both runtimes are downloaded from the registry.
        deps.vue = lane === 'vapor' ? workspace.manifest.devDependencies?.vue : '^3.5.0';
        if (!deps.vue || !/3\.6/.test(deps.vue) && lane === 'vapor') throw new Error('Vapor lane requires an explicit compiler-matched Vue runtime pin');
      }
      writeFileSync(join(project, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: deps }, null, 2));
      run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=true'], project);
      // Angular's partial compilation uses its declared optional compiler peer
      // for a Node import (a consumer bundler normally performs the linking).
      const angular = Object.keys(deps).includes('@angular/core');
      if (angular) {
        const core = readJson(join(project, 'node_modules/@angular/core/package.json'));
        run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', `@angular/compiler@${core.version}`], project);
      }
      for (const file of ['dist-import-loader.mjs', 'dist-import-runner.mjs']) copyFileSync(join(root, 'scripts', file), join(project, file));
      writeFileSync(join(project, 'target.json'), JSON.stringify({ name: workspace.manifest.name, lane, angular }));
      const output = run(process.execPath, ['--no-warnings', '--experimental-loader', './dist-import-loader.mjs', './dist-import-runner.mjs'], project);
      log(output.trim());
    }
    return { name: workspace.manifest.name, unpublishedSiblings: siblings, lanes };
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

async function main() {
  const selectedArg = process.argv.find(arg => arg.startsWith('--workspaces='));
  const selected = selectedArg ? new Set(selectedArg.slice('--workspaces='.length).split(',')) : null;
  const workspaces = getOrderedWorkspaces(root).filter(w => !w.manifest.private);
  const targets = workspaces.filter(w => !selected || selected.has(w.name));
  if (!targets.length || selected && targets.length !== selected.size) throw new Error('Select existing publishable workspaces; an empty gate is an error');
  const failures = [];
  for (const workspace of targets) {
    console.log(`DIST IMPORT CLOSURE ${workspace.name}@${workspace.manifest.version}`);
    try { await checkPackage(workspace, { workspaces }); }
    catch (error) { failures.push(workspace.name); console.error(error.message); }
  }
  if (failures.length) throw new Error(`Dist import closure failed: ${failures.join(', ')}`);
  console.log(`Dist import closure OK: ${targets.length} packed packages (registry dependencies; unpublished siblings marked above)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
