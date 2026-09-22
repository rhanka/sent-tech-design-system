#!/usr/bin/env node
/** Read-only source enumeration; --write only writes the adjacent JSON inventory. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const graphRoot = process.env.GRAPHIFY_SOURCE_ROOT ?? '/home/antoinefa/src/graphify';
const datavizRoot = process.env.DATAVIZ_SOURCE_ROOT ?? '/home/antoinefa/src/dataviz';
const ts = require(process.env.SOURCE_MAP_TYPESCRIPT ?? path.join(datavizRoot, 'node_modules/typescript'));
const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, 'graph-dataviz-source-map.json');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const fail = (message) => { throw new Error(message); };
const packages = [
  { root: graphRoot, repo: 'graphify', dir: 'packages/graph', trackKey: 'GD-M1-GRAPH' },
  ...['core', 'svelte', 'react', 'vue', 'angular'].map((framework) => ({
    root: datavizRoot, repo: 'dataviz', dir: `packages/dataviz-${framework}`,
    trackKey: `GD-M1-DATAVIZ-${framework.toUpperCase()}`,
  })),
].map((p) => ({ ...p, absolute: path.join(p.root, p.dir), manifest: JSON.parse(fs.readFileSync(path.join(p.root, p.dir, 'package.json'), 'utf8')) }));
const packageByName = new Map(packages.map((p) => [p.manifest.name, p]));
const options = {
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true,
  allowJs: true, jsx: ts.JsxEmit.Preserve, baseUrl: datavizRoot,
  paths: { '@sentropic/dataviz-core': ['packages/dataviz-core/src/index.ts'] },
};
const entries = packages.map((p) => path.join(p.absolute, 'src/index.ts'));
const program = ts.createProgram(entries, options);
const checker = program.getTypeChecker();
const sourceFile = (file) => program.getSourceFile(file) ?? ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
const locate = (file) => {
  const p = packages.find((candidate) => file.startsWith(`${candidate.absolute}/`));
  if (!p) fail(`Source outside the six libraries: ${file}`);
  return { repository: p.repo, file: path.relative(p.root, file), package: p.manifest.name };
};
const relativeModule = (from, specifier) => {
  if (packageByName.has(specifier)) return path.join(packageByName.get(specifier).absolute, 'src/index.ts');
  if (!specifier.startsWith('.')) return null;
  const bare = path.resolve(path.dirname(from), specifier);
  return [bare.replace(/\.js$/, '.ts'), bare.replace(/\.js$/, '.tsx'), bare, `${bare}.ts`, `${bare}.tsx`, path.join(bare, 'index.ts')].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? fail(`Unresolved source module: ${from} -> ${specifier}`);
};
const hasModifier = (node, kind) => node.modifiers?.some((modifier) => modifier.kind === kind);
const namesOfBinding = (binding) => ts.isIdentifier(binding) ? [binding.text] : binding.elements.flatMap((element) => ts.isOmittedExpression(element) ? [] : namesOfBinding(element.name));
const independentCache = new Map();
const svelteDefaults = [];
const namespaceExports = [];

function syntaxIdentity(item) {
  if (!item.module) return `${item.declarationFile}#${item.imported}`;
  const target = relativeModule(item.declarationFile, item.module);
  if (!target || target.endsWith('.svelte') || item.imported === '*') return `${target ?? item.module}#${item.imported}`;
  const forwarded = enumerateSyntax(target).get(item.imported);
  return forwarded ? syntaxIdentity(forwarded) : `${target}#${item.imported}`;
}

// Independent AST walk: wildcard recursion + explicit names + exported declarations.
// It deliberately does not use checker.getExportsOfModule to compute its set.
function enumerateSyntax(file, pending = new Set()) {
  if (independentCache.has(file)) return independentCache.get(file);
  if (pending.has(file)) fail(`Export cycle needs explicit treatment: ${file}`);
  const next = new Set([...pending, file]);
  const sf = sourceFile(file);
  const direct = new Map();
  const stars = [];
  const imports = new Map();
  for (const statement of sf.statements) if (ts.isImportDeclaration(statement) && statement.importClause) {
    const clause = statement.importClause;
    if (clause.name) imports.set(clause.name.text, { imported: 'default', module: statement.moduleSpecifier.text });
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const element of clause.namedBindings.elements) imports.set(element.name.text, { imported: element.propertyName?.text ?? element.name.text, module: statement.moduleSpecifier.text });
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.set(clause.namedBindings.name.text, { imported: '*', module: statement.moduleSpecifier.text });
  }
  const put = (name, node, typeOnly = false, imported = name, module = null) => {
    if (module === null && imports.has(imported)) ({ imported, module } = imports.get(imported));
    const item = { name, declarationFile: file, declarationLine: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, typeOnly, imported, module };
    const prior = direct.get(name);
    if (prior && (prior.module !== module || prior.imported !== imported)) fail(`Conflicting explicit export ${file}#${name}`);
    direct.set(name, item);
  };
  for (const statement of sf.statements) {
    if (ts.isExportDeclaration(statement)) {
      const module = statement.moduleSpecifier?.text ?? null;
      if (!statement.exportClause) {
        const target = relativeModule(file, module);
        if (!target) fail(`External wildcard export requires explicit resolution: ${file} -> ${module}`);
        stars.push(enumerateSyntax(target, next));
      } else if (ts.isNamespaceExport(statement.exportClause)) {
        namespaceExports.push(`${file}#${statement.exportClause.name.text}`);
        put(statement.exportClause.name.text, statement, statement.isTypeOnly, '*', module);
      } else {
        for (const element of statement.exportClause.elements) {
          const imported = element.propertyName?.text ?? element.name.text;
          if (imported === 'default' && module?.endsWith('.svelte')) svelteDefaults.push(`${file}#${element.name.text}`);
          put(element.name.text, element, statement.isTypeOnly || element.isTypeOnly, imported, module);
        }
      }
    } else if (ts.isExportAssignment(statement)) {
      if (statement.isExportEquals) fail(`CommonJS export assignment needs explicit treatment: ${file}`);
      put('default', statement);
    } else if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      const typeOnly = ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement);
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) for (const name of namesOfBinding(declaration.name)) put(name, declaration);
      } else if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) {
        put('default', statement, typeOnly);
      } else if (statement.name) {
        put(statement.name.text, statement, typeOnly);
      } else fail(`Unhandled export syntax: ${file}:${statement.getStart(sf)}`);
    }
  }
  const all = new Map();
  for (const star of stars) for (const [name, item] of star) {
    if (name === 'default' || direct.has(name)) continue;
    const prior = all.get(name);
    if (prior && syntaxIdentity(prior) !== syntaxIdentity(item)) fail(`Ambiguous wildcard name: ${file}#${name}`);
    all.set(name, item);
  }
  for (const item of direct) all.set(...item);
  independentCache.set(file, all);
  return all;
}

function resolveOrigin(item, symbol) {
  if (item.module && !item.module.startsWith('.') && !packageByName.has(item.module)) {
    return { repository: 'external-Sentropic', package: item.module, file: null, export: item.imported, line: null, verification: 'explicit-public-reexport' };
  }
  if (item.module) {
    const target = relativeModule(item.declarationFile, item.module);
    if (target.endsWith('.svelte')) {
      // Svelte component default is implicit; named types/functions live in module script.
      const text = fs.readFileSync(target, 'utf8');
      let line = 1;
      if (item.imported !== 'default') {
        const moduleScripts = [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter((match) => /\bmodule\b|context\s*=\s*["']module["']/.test(match[1]));
        let found = false;
        for (const block of moduleScripts) {
          const prefix = text.slice(0, block.index + block[0].indexOf('>') + 1);
          const virtual = ts.createSourceFile(target, prefix.replace(/[^\n]/g, ' ') + block[2], ts.ScriptTarget.Latest, true);
          for (const statement of virtual.statements) {
            if (statement.name?.text === item.imported && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
              line = virtual.getLineAndCharacterOfPosition(statement.getStart(virtual)).line + 1;
              found = true;
            }
            if (ts.isVariableStatement(statement) && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) for (const declaration of statement.declarationList.declarations) {
              if (namesOfBinding(declaration.name).includes(item.imported)) { line = virtual.getLineAndCharacterOfPosition(declaration.getStart(virtual)).line + 1; found = true; }
            }
            if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) for (const element of statement.exportClause.elements) {
              if (element.name.text === item.imported) { line = virtual.getLineAndCharacterOfPosition(element.getStart(virtual)).line + 1; found = true; }
            }
          }
        }
        if (!found) fail(`Svelte named export missing from module script: ${target}#${item.imported}`);
      }
      return { ...locate(target), export: item.imported, line, verification: item.imported === 'default' ? 'svelte-implicit-component-default' : 'svelte-module-script-ast' };
    }
    const forwarded = enumerateSyntax(target).get(item.imported);
    if (forwarded?.module && (forwarded.declarationFile !== item.declarationFile || forwarded.module !== item.module)) return resolveOrigin(forwarded, symbol);
  }
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declaration = resolved.declarations?.[0];
  if (!declaration) fail(`No resolved declaration for ${item.declarationFile}#${item.name}`);
  const sf = declaration.getSourceFile();
  return { ...locate(sf.fileName), export: resolved.getName(), line: sf.getLineAndCharacterOfPosition(declaration.getStart(sf)).line + 1, verification: 'typescript-resolved-declaration' };
}

function layer(origin) {
  const stem = path.basename(origin.file ?? '', path.extname(origin.file ?? ''));
  if (origin.package === '@sentropic/graph') {
    if (['types', 'positions'].includes(stem)) return 'contrats-noyau';
    if (stem.startsWith('layout')) return 'processing';
    if (stem === 'renderer' || stem.startsWith('webgl-')) return 'moteurs-rendu';
    if (stem === 'gitflow-labels') return 'interaction-labels';
    return 'scene-geometrie';
  }
  if (origin.package === '@sentropic/dataviz-core') {
    if (['layout', 'objects', 'annotations'].includes(stem)) return 'dataviz-scene-dashboard';
    if (['store', 'crossfilter', 'serialize', 'actions', 'hover', 'model', 'fields', 'query', 'describe', 'index'].includes(stem)) return 'dataviz-etat-contrats';
    if (['color', 'format-value', 'format'].includes(stem)) return 'dataviz-couleur-format';
    return 'dataviz-processing-builders';
  }
  return origin.repository === 'external-Sentropic' ? 'reexport-contrat-DS-theme' : 'adaptateurs-DS-dataviz';
}

const rows = [];
const summaries = [];
for (let index = 0; index < packages.length; index++) {
  const p = packages[index];
  const manifest = p.manifest;
  const subpaths = Object.keys(manifest.exports ?? {});
  if (subpaths.length !== 1 || subpaths[0] !== '.') fail(`New subpath or manifest wildcard requires source entry mapping: ${manifest.name}`);
  const entry = entries[index];
  const sf = program.getSourceFile(entry);
  const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(sf));
  const syntax = enumerateSyntax(entry);
  const fromChecker = symbols.map((symbol) => symbol.getName()).sort();
  const fromSyntax = [...syntax.keys()].sort();
  if (JSON.stringify(fromChecker) !== JSON.stringify(fromSyntax)) fail(`Checker/AST export mismatch: ${manifest.name}`);
  const packageRows = symbols.map((symbol) => {
    const name = symbol.getName();
    const item = syntax.get(name);
    const origin = resolveOrigin(item, symbol);
    const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const kind = item.typeOnly ? 'type' : origin.verification === 'svelte-implicit-component-default' ? 'value' : resolved.flags & ts.SymbolFlags.Namespace ? 'namespace' : resolved.flags & ts.SymbolFlags.Value ? (resolved.flags & ts.SymbolFlags.Type ? 'value+type' : 'value') : 'type';
    const canonical = packageByName.get(origin.package);
    const decision = origin.repository === 'external-Sentropic' ? 'preserve-external-type-reexport' : canonical.manifest.name !== manifest.name ? 'preserve-core-reexport-single-implementation' : 'repatriate-preserve-public-contract';
    return {
      key: `${manifest.name}#${name}`, source: { repository: p.repo, package: manifest.name, subpath: '.', export: name },
      kind, origin, declaredAt: { ...locate(item.declarationFile), line: item.declarationLine },
      destination: { package: manifest.name, subpath: '.', export: name, entryFile: `${p.dir}/src/index.ts`, canonicalFile: origin.file, canonicalPackage: origin.package },
      decision, responsibility: layer(origin), trackKey: p.trackKey,
      dependencyTrackKeys: canonical && canonical.trackKey !== p.trackKey ? [canonical.trackKey] : [],
      status: 'mapped-M0-migration-not-proved',
    };
  }).sort((a, b) => a.key.localeCompare(b.key, 'en'));
  rows.push(...packageRows);
  const reexports = packageRows.filter((row) => row.origin.package !== manifest.name);
  summaries.push({
    name: manifest.name, version: manifest.version, private: manifest.private === true,
    repository: p.repo, sourceDirectory: p.dir, destinationDirectory: p.dir,
    trackKey: p.trackKey, manifest, manifestSha256: sha256(fs.readFileSync(path.join(p.absolute, 'package.json'))),
    entrySha256: sha256(fs.readFileSync(entry)), publicSubpaths: subpaths,
    exportCount: symbols.length, ownExportCount: symbols.length - reexports.length,
    reexportCount: reexports.length,
    kinds: Object.fromEntries(['value', 'type', 'value+type', 'namespace'].map((kind) => [kind, packageRows.filter((row) => row.kind === kind).length])),
    proof: { checkerCount: symbols.length, independentAstCount: syntax.size, namesIdentical: true,
      exportNamesSha256: sha256(fromChecker.join('\n')), sourceTypesOnly: true, buildOrPublishedArtifactParity: 'unverified' },
  });
}

const capabilities = [
  ['src/graph-layout.ts', 'computeLayout; attachLayoutPositions', 'processing force Barnes-Hut + adaptateur de sortie', 'extraire le calcul générique M2 ; laisser le raccord scene.json au consommateur', 'GD-M2-PROCESSING', '315ade690067240225ca0c2aaa9b270c5da27997'],
  ['src/hierarchy-layout.ts', 'computeHierarchyAwarePositions', 'processing hierarchy-aware', 'rapatrier la math ; isoler types/projection produit', 'GD-M2-PROCESSING', 'b4d0e02099fcc1622e4d9d26d5f987a6ca84269a'],
  ['studio/src/lib/layoutWorker.js', 'worker layout', 'processing worker versionné', 'adapter sur snapshot/révision/annulation ; conserver calcul Sentropic', 'GD-M2-WORKERS', null],
  ['studio/src/lib/forceLayoutClient.js', 'solveForce', 'client worker + fallback sync', 'rapatrier pattern worker et fallback ; remplacer alias @graphify/graph-layout', 'GD-M2-WORKERS', null],
  ['studio/src/lib/renderBackend.js', 'choix backend; fallback; overlay texte', 'interaction/backend-adapter', 'adapter bibliothèque générique après inventaire des couplages GraphCanvas', 'GD-M2-PROCESSING', null],
  ['src/scene-layout.ts', 'applySceneLayout; resolveSceneLayoutId; attach*Positions', 'graphify consumer wiring', 'laisser sélection produit ; déléguer aux moteurs canoniques DS', 'GD-M6-GRAPHIFY', 'e976bbe86be0c5f36782a6c8930783dae21f7b33'],
  ['src/typed-layer-layout.ts', 'shim re-export @sentropic/graph', 'graphify compatibility shim', 'conserver délégation transitoire ; retirer après bascule vérifiée', 'GD-M6-GRAPHIFY', null],
  ['studio/src/lib/graphRendererPayload.js', 'adaptateur scène→buffers', 'graphify consumer projection', 'adapter via API canonique ; extraire seulement transformations prouvées génériques', 'GD-M6-GRAPHIFY', null],
  ['src/studio-render-buffers.ts', 'bridge serveur buffers', 'graphify consumer projection', 'adapter imports vers package canonique DS', 'GD-M6-GRAPHIFY', null],
  ['studio/src/components/GraphCanvas.svelte', 'binding renderer', 'graphify consumer + futur adaptateur DS', 'conserver UI produit ; réutiliser binding par tranches de parité', 'GD-M6-GRAPHIFY', null],
  ['studio/src/components/TypeShapeGlyph.svelte', 'binding shapeSvgPath', 'graphify consumer', 'conserver composant consommateur ; géométrie reste canonique @sentropic/graph', 'GD-M6-GRAPHIFY', null],
  ['studio/src/lib/graphAdapter.js', 'mapping graph.json→scène', 'graphify produit', 'laisser ingestion/projection métier dans graphify', 'GD-M6-GRAPHIFY', null],
  ['src/studio-scene.ts', 'construction scène produit', 'graphify produit', 'laisser production connaissance/evidence dans graphify', 'GD-M6-GRAPHIFY', null],
].map(([file, exports, destination, decision, trackKey, originCommit]) => ({
  source: { repository: 'graphify', file, exports }, destination, decision, trackKey, originCommit,
  evidence: 'inventaire-M0-conducteur-consolidé', fileAccessible: fs.existsSync(path.join(graphRoot, file)),
  originVerification: originCommit ? 'inventory-provenance' : 'unverified',
}));

const inventory = {
  schemaVersion: 1, auditDate: '2026-09-15', scope: 'six-library-source-public-export-map',
  provenance: [
    { repository: 'graphify', remote: 'https://github.com/rhanka/graphify', head: git(graphRoot, ['rev-parse', 'HEAD']), branch: git(graphRoot, ['branch', '--show-current']), inventoryHead: '8f19554cea3a4397fd66a90c7e9fd5ea54c81626', packageFirstCommit: '0ed0fc76d3af8fc9b9f5335351a7a040d5ef1b24', scopeStatus: git(graphRoot, ['status', '--short', '--', 'packages/graph']) },
    { repository: 'dataviz', remote: 'https://github.com/rhanka/dataviz', head: git(datavizRoot, ['rev-parse', 'HEAD']), branch: git(datavizRoot, ['branch', '--show-current']), inventoryHead: '0869ae5b59bb308be7d43fbe0de58c5487e11f25', describe: git(datavizRoot, ['describe', '--tags', '--always']), scopeStatus: git(datavizRoot, ['status', '--short', '--', 'packages']) },
  ],
  proof: {
    typescriptVersion: ts.version, method: 'TypeScript checker public exports cross-checked with independent recursive TypeScript AST export enumeration; .svelte explicit named exports checked in module scripts',
    totalPackageExportPairs: rows.length, uniqueCanonicalSymbols: new Set(rows.map((row) => `${row.origin.package}:${row.origin.file}#${row.origin.export}`)).size,
    manifestSubpaths: summaries.reduce((sum, p) => sum + p.publicSubpaths.length, 0),
    manifestWildcardCount: 0, namespaceExportCount: namespaceExports.length,
    svelteDefaultAliases: svelteDefaults.length,
    missingDestinationCount: rows.filter((row) => !row.destination || !row.decision || !row.trackKey).length,
    duplicatePairCount: rows.length - new Set(rows.map((row) => row.key)).size,
    implementationTestsRun: false, publishedArtifactParity: 'unverified',
  },
  trackBinding: { method: 'join trackKey to programme item key; this inventory does not write Track', syncStatus: 'see programme checkpoint/replay manifest for actual IDs and synchronization' },
  packages: summaries, exports: rows, extraPackageCapabilities: capabilities,
  limits: [
    'Enumeration proves source public names and destinations, not implementation quality, build compatibility or current npm publication.',
    'No public package subpath wildcard or namespace alias exists in the six inspected manifests/barrels; star reexports and Svelte default aliases are expanded.',
    'External Sentropic type contracts remain reexports, never copied into adapter implementations.',
    'Application/product source groups and tests/docs/packaging assets are covered separately in the accompanying Markdown; they are not library public exports.',
    'Track keys are stable rapprochement keys, not a claim that a write occurred. Programme checkpoint owns the actual Track IDs.',
  ],
};

const bindingPath = path.join(here, 'graph-dataviz-track-sync.json');
if (fs.existsSync(bindingPath)) {
  const binding = JSON.parse(fs.readFileSync(bindingPath, 'utf8'));
  for (const row of [...inventory.packages, ...inventory.exports, ...inventory.extraPackageCapabilities]) {
    if (!binding.ids[row.trackKey]) fail(`Unresolved programme key: ${row.trackKey}`);
    row.trackId = binding.ids[row.trackKey];
  }
  inventory.trackBinding = { method: 'join sourceKey reconciliation to actual programme IDs',
    syncStatus: 'applied-local-worktree; conductor integration pending' };
}

if (process.argv.includes('--write')) {
  fs.writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`);
} else {
  const recorded = JSON.parse(fs.readFileSync(output, 'utf8'));
  const expected = new Map(inventory.exports.map((row) => [row.key, row]));
  if (recorded.exports.length !== expected.size || new Set(recorded.exports.map((row) => row.key)).size !== expected.size) fail('Recorded inventory has duplicate or missing pairs');
  for (const row of recorded.exports) {
    const fresh = expected.get(row.key);
    if (!fresh || JSON.stringify(row.origin) !== JSON.stringify(fresh.origin) || JSON.stringify(row.destination) !== JSON.stringify(fresh.destination) || row.trackKey !== fresh.trackKey || row.kind !== fresh.kind || row.decision !== fresh.decision) fail(`Recorded mapping differs from source: ${row.key}`);
  }
  for (const p of recorded.packages) {
    const fresh = inventory.packages.find((candidate) => candidate.name === p.name);
    if (!fresh || p.manifestSha256 !== fresh.manifestSha256 || p.entrySha256 !== fresh.entrySha256 || p.proof.exportNamesSha256 !== fresh.proof.exportNamesSha256) fail(`Source fingerprint changed: ${p.name}`);
  }
}
console.log(JSON.stringify({ mode: process.argv.includes('--write') ? 'write-inventory' : 'verify-inventory', ...inventory.proof, packages: summaries.map((p) => ({ name: p.name, exports: p.exportCount, own: p.ownExportCount, reexports: p.reexportCount, kinds: p.kinds })) }, null, 2));
