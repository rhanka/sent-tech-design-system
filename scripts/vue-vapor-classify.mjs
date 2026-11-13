#!/usr/bin/env node
// Suggested conversion ownership, not the §2.9 acceptance manifest.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { inventory } from './vue-vapor-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv.slice(2).some(arg => arg !== '--check') || process.argv.length > 3) throw new Error('Usage: node scripts/vue-vapor-classify.mjs [--check]');
const output = resolve(root, 'docs/vue-vapor-classification.csv');
const rich = new Set(`Alert Breadcrumb ChatComposer ChatMessage ChatThread Combobox ContentSwitcher DataTable DatePicker Dropdown EmptyState Footer FormGroup Header Highlight InlineLoading LanguageSelector LoadingState MessageActions MessageStatusBadge MultiSelect NavRail NumberInput OrderedList PasswordInput ProgressBar ProgressIndicator Quote Search Select SideNav StreamingMessage StructuredList Switch Table Tabs Textarea Tile TileGroup Toast Toggle Toggletip Tooltip TreeView UnorderedList NavActionStack`.split(' '));
const shells = new Set('AppShell ContextPanel Dashboard IdentityMenu KanbanBoard ListReportPage MasterDetail NavDrawer NavRail NavShell ObjectPage PanelStack ThemeProvider UtilityPanel Wizard'.split(' '));
const helpers = new Map([['MenuLabel', 'V6'], ['cellDecoration', 'V6'], ['chartScale', 'V4']]);
const parse = (file) => ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
const categories = new Map();
function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const strings = Object.fromEntries(node.properties.filter(ts.isPropertyAssignment)
      .filter(p => ts.isStringLiteral(p.initializer)).map(p => [p.name.getText().replace(/['"]/g, ''), p.initializer.text]));
    if (strings.name && strings.category) categories.set(strings.name, strings.category);
  }
  ts.forEachChild(node, visit);
}
visit(parse(resolve(root, 'apps/docs/src/lib/components-catalog.ts')));
const posix = file => relative(root, file).replaceAll('\\', '/');
function local(from, specifier) {
  const stem = resolve(dirname(from), specifier.replace(/\.js$/, ''));
  return [stem, `${stem}.ts`, `${stem}.vue`, resolve(stem, 'index.ts')].find(existsSync);
}
// Resolve dataviz's DS barrel imports to the actual source dependency as well.
const dsBarrel = resolve(root, 'packages/components-vue/src/index.ts');
const dsExports = new Map();
for (const node of parse(dsBarrel).statements) {
  if (!ts.isExportDeclaration(node) || !node.moduleSpecifier || !node.exportClause || !ts.isNamedExports(node.exportClause)) continue;
  for (const entry of node.exportClause.elements) dsExports.set(entry.name.text, local(dsBarrel, node.moduleSpecifier.text));
}
const rows = inventory(root).flatMap(pkg => pkg.legacy.map(file => {
  const name = basename(file, '.ts');
  const category = categories.get(name) ?? 'uncatalogued';
  const group = pkg.name === 'dataviz-vue' ? 'V7' : rich.has(name) ? 'V6' : name === 'Icon' ? 'V9' : helpers.get(name)
    ?? (shells.has(name) ? 'V5b' : category === 'data' ? 'V4' : category === 'form' ? 'V2'
      : ['navigation', 'overlay'].includes(category) ? 'V3' : ['chat', 'other'].includes(category) ? 'V5a' : 'V1');
  const kind = helpers.has(name) ? 'render-helper' : 'component';
  const klass = rich.has(name) ? 'VNode-prop' : (shells.has(name) || helpers.has(name) || name === 'Icon') ? 'hard'
    : pkg.name === 'dataviz-vue' || category === 'data' ? 'data' : category === 'form' ? 'form'
      : ['navigation', 'overlay'].includes(category) ? 'overlay' : 'simple';
  const runtime = new Set(), types = new Set();
  for (const node of parse(file).statements) {
    if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const specifier = node.moduleSpecifier.text;
    const bindings = ts.isImportDeclaration(node) ? node.importClause : node;
    const named = ts.isImportDeclaration(node) ? node.importClause?.namedBindings : node.exportClause;
    const allTypes = bindings?.isTypeOnly || (named && ts.isNamedImports(named) && named.elements.length > 0 && named.elements.every(e => e.isTypeOnly));
    const target = specifier.startsWith('.') ? local(file, specifier) : undefined;
    (allTypes ? types : runtime).add(target ? posix(target) : specifier);
    if (specifier === '@sentropic/design-system-vue' && named && ts.isNamedImports(named)) {
      for (const entry of named.elements) {
        const source = dsExports.get((entry.propertyName ?? entry.name).text);
        if (source) (allTypes || entry.isTypeOnly ? types : runtime).add(posix(source));
      }
    }
  }
  return { module: posix(file), package: pkg.name, kind, class: klass, category, lot: group,
    runtime_dependencies: [...runtime].sort(), type_dependencies: [...types].sort(), lot_dependencies: [],
    public_contract_change: rich.has(name) ? 'rich-content-to-slots' : name === 'Icon' ? 'K7-glyph-data' : '',
    reason: helpers.has(name) ? 'Move rendering into compiled SFC; retain pure TS calculations/types'
      : rich.has(name) ? 'Explicit semantic mapping in vue-vapor-semantic-mapping.md'
        : name === 'Icon' ? 'K7 DS Icon on neutral lucide data'
          : shells.has(name) ? 'Shell composition; preserve state/attrs/listeners' : `Catalogue category: ${category}` };
}));
const byPath = new Map(rows.map(row => [row.module, row]));

// Tarjan SCCs followed by dependency-first ordering; never split a runtime cycle.
function orderedGroups(pool) {
  const wanted = new Set(pool.map(r => r.module)), index = new Map(), low = new Map(), stack = [], active = new Set(), groups = [];
  let next = 0;
  function walk(path) {
    index.set(path, next); low.set(path, next++); stack.push(path); active.add(path);
    for (const dep of byPath.get(path).runtime_dependencies.filter(d => wanted.has(d))) {
      if (!index.has(dep)) { walk(dep); low.set(path, Math.min(low.get(path), low.get(dep))); }
      else if (active.has(dep)) low.set(path, Math.min(low.get(path), index.get(dep)));
    }
    if (low.get(path) === index.get(path)) {
      const group = []; let item;
      do { item = stack.pop(); active.delete(item); group.push(byPath.get(item)); } while (item !== path);
      groups.push(group.sort((a, b) => a.module.localeCompare(b.module)));
    }
  }
  for (const row of [...pool].sort((a,b) => a.module.localeCompare(b.module))) if (!index.has(row.module)) walk(row.module);
  return groups;
}
for (const [prefix, lots] of [['V4', ['V4a', 'V4b', 'V4c']], ['V7', ['V7a', 'V7b']]]) {
  const pool = rows.filter(r => r.lot === prefix);
  let assigned = 0;
  for (const group of orderedGroups(pool)) {
    const lot = lots[Math.min(lots.length - 1, Math.floor(assigned * lots.length / pool.length))];
    for (const row of group) row.lot = lot;
    assigned += group.length;
  }
}
for (const row of rows) {
  const lots = new Set(row.runtime_dependencies.map(path => byPath.get(path)?.lot).filter(lot => lot && lot !== row.lot));
  if (row.runtime_dependencies.includes('lucide-vue-next') && row.lot !== 'V9') lots.add('V9');
  row.lot_dependencies = [...lots].sort();
}
const columns = ['module', 'package', 'kind', 'class', 'category', 'lot', 'runtime_dependencies', 'type_dependencies', 'lot_dependencies', 'public_contract_change', 'reason'];
const cell = value => `"${(Array.isArray(value) ? value.join(';') : value).replaceAll('"', '""')}"`;
const csv = columns.join(',') + '\n' + rows.sort((a,b) => a.module.localeCompare(b.module)).map(row => columns.map(key => cell(row[key])).join(',')).join('\n') + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(output) || readFileSync(output, 'utf8') !== csv) throw new Error('Classification is stale: run node scripts/vue-vapor-classify.mjs');
} else writeFileSync(output, csv);
const count = key => Object.fromEntries([...new Set(rows.map(r => r[key]))].sort().map(value => [value, rows.filter(r => r[key] === value).length]));
console.log(JSON.stringify({ total: rows.length, packages: count('package'), classes: count('class'), lots: count('lot'), helpers: rows.filter(r => r.kind === 'render-helper').map(r => r.module) }, null, 2));
