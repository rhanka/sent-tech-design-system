#!/usr/bin/env node
/**
 * extract-ast.mjs — SECOND, independent extractor for the completeness guard.
 *
 * Independence contract (review round 2): this module shares no whitelist,
 * no constant list and no helper function with enumerate.mjs. Where the
 * generator names an item, this extractor derives the same item from the
 * pinned sources through the TypeScript TypeChecker:
 *   - module surfaces come from checker.getExportsOfModule(...), so
 *     `export *` re-exports, per-specifier `type` modifiers and external
 *     aliases are resolved by the compiler, never restated here;
 *   - inherited fields come from checker.getPropertiesOfType(...), filtered
 *     by the file and namespace that declare each property, never by a
 *     restated field list;
 *   - member sets come from the declarations behind checker symbols.
 * The only shared inputs are the pinned sources themselves, the TypeScript
 * library and the counting conventions stated in
 * spec/SPEC_RE_JOINTJS_PARITY.md §2 — conventions, not code.
 *
 * It returns the expected inventory set: Map<`${family}\0${key}`, item>
 * where item = { family, key, label, file, at, kind, signature }.
 * `file` is the repository-relative source path and `at` its 1-based line,
 * so verify.mjs compares the stored source pointer and the declared detail
 * (name, kind, signature header), not only the identifier.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const wt = resolve(here, '..', '..');
const repoRoot = resolve(wt, '..');

function locateSources() {
  const tries = [
    process.env.RE_SOURCES,
    resolve(wt, '..', '.ds-scrap', 're-sources'),
    resolve(wt, '.ds-scrap', 're-sources'),
    resolve(here, '..', '..', '..', '.ds-scrap', 're-sources'),
  ].filter(Boolean);
  for (const t of tries) if (existsSync(join(t, 'MANIFEST.md'))) return t;
  throw new Error(`re-sources not found; tried: ${tries.join(', ')}`);
}
const sources = locateSources();
const joint = join(sources, 'joint');
const core = join(joint, 'packages', 'joint-core');
const pkgs = join(joint, 'packages');
const catalogueFile = join(wt, 'docs', 'graph-dataviz-reference-catalog.json');

function walkFiles(dir, pred) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p, pred));
    else if (!pred || pred(p)) out.push(p);
  }
  return out;
}
const repoRel = (abs) => relative(repoRoot, abs).split('\\').join('/');
const lineOf = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

export function extractWithProgram() {
  const expected = new Map();
  const put = (family, key, label, absFile, at, kind, signature) => {
    const ck = `${family}\0${key}`;
    if (!expected.has(ck)) {
      const file = absFile.startsWith('/') ? repoRel(absFile) : absFile;
      expected.set(ck, { family, key, label, file, at, kind, signature });
    }
  };

  // ---- program over every surface the conventions read -----------------
  const typeRoots = walkFiles(join(core, 'types'), (p) => p.endsWith('.d.ts'));
  const pkgEntries = [
    join(pkgs, 'joint-router-avoid', 'src', 'index.mts'),
    join(pkgs, 'joint-layout-msagl', 'src', 'index.mts'),
    join(pkgs, 'joint-layout-directed-graph', 'DirectedGraph.d.ts'),
    join(pkgs, 'joint-react', 'src', 'index.ts'),
    join(pkgs, 'joint-react', 'src', 'internal.ts'),
    join(pkgs, 'joint-decorators', 'src', 'index.ts'),
    join(pkgs, 'joint-shapes-general', 'src', 'index.ts'),
    join(pkgs, 'joint-shapes-general-tools', 'src', 'index.ts'),
    join(pkgs, 'joint-vitest-plugin-mock-svg', 'src', 'index.ts'),
  ];
  const jsRoots = [
    join(core, 'src', 'core.mjs'),
    join(core, 'src', 'mvc', 'index.mjs'),
    join(core, 'src', 'mvc', 'View.mjs'),
    join(core, 'src', 'mvc', 'Data.mjs'),
    join(core, 'src', 'util', 'index.mjs'),
    join(core, 'src', 'dia', 'Paper.mjs'),
    join(core, 'src', 'config', 'index.mjs'),
    join(core, 'src', 'env', 'index.mjs'),
    ...walkFiles(join(core, 'src', 'dia', 'attributes'), (p) => p.endsWith('.mjs')),
    ...walkFiles(join(core, 'src', 'highlighters'), (p) => p.endsWith('.mjs')),
    ...walkFiles(join(core, 'src'), (p) => p.endsWith('.mjs')),
    join(pkgs, 'joint-eslint-config', 'index.mjs'),
  ];
  const program = ts.createProgram(
    [...typeRoots, ...pkgEntries, ...jsRoots].filter((p, i, a) => existsSync(p) && a.indexOf(p) === i),
    {
      allowJs: true,
      checkJs: false,
      skipLibCheck: true,
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  );
  const checker = program.getTypeChecker();
  const sfOf = (abs) => program.getSourceFile(abs)
    || ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true,
      abs.endsWith('.mjs') ? ts.ScriptKind.JS : ts.ScriptKind.TS);
  const moduleSymbol = (abs) => {
    const sf = sfOf(abs);
    return sf ? checker.getSymbolAtLocation(sf) : undefined;
  };
  const moduleExports = (abs) => {
    const sym = moduleSymbol(abs);
    return sym ? checker.getExportsOfModule(sym) : [];
  };
  const resolveAlias = (sym) => {
    if (!sym) return sym;
    try {
      return (sym.flags & ts.SymbolFlags.Alias) ? checker.getAliasedSymbol(sym) : sym;
    } catch { return sym; }
  };
  const declsOf = (sym) => (sym ? sym.getDeclarations() || [] : []);
  // A symbol counts as type-only when any export specifier for it says so,
  // or when the resolved symbol carries no value meaning at all.
  const symbolIsTypeOnly = (sym) => {
    for (const d of declsOf(sym)) {
      if (!ts.isExportSpecifier(d)) continue;
      if (d.isTypeOnly) return true;
      const block = d.parent && d.parent.parent;
      if (block && block.isTypeOnly) return true;
    }
    const target = resolveAlias(sym);
    if (!target) return false;
    const hasValue = (target.flags & ts.SymbolFlags.Value) !== 0;
    const hasType = (target.flags & ts.SymbolFlags.Type) !== 0;
    return hasType && !hasValue;
  };
  // Header of a declaration: text up to (excluding) any implementation body.
  const headerOf = (sf, node) => {
    const start = node.getStart(sf);
    const end = node.body ? node.body.getStart(sf) : node.end;
    let txt = sf.text.slice(start, end).replace(/\s+/g, ' ').trim().replace(/[;{]\s*$/, '').trim();
    if (txt.length > 420) txt = txt.slice(0, 417) + '...';
    return txt;
  };
  const memberNameOf = (nameNode) => {
    if (!nameNode) return null;
    if (ts.isIdentifier(nameNode) || ts.isStringLiteralLike(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
    if (ts.isPrivateIdentifier(nameNode)) return null;
    if (ts.isComputedPropertyName(nameNode)) {
      const inner = nameNode.expression.getText();
      return inner === 'Symbol.iterator' ? '[Symbol.iterator]' : `[${inner}]`;
    }
    return nameNode.getText();
  };
  const hasModifier = (node, kind) => !!(node.modifiers
    && node.modifiers.some((m) => m.kind === kind));
  // Declared members of a class/interface symbol, via its declarations.
  // Returns Map<name, { kind, file, at, signature }>.
  const declaredMembers = (sym) => {
    const out = new Map();
    for (const decl of declsOf(resolveAlias(sym))) {
      if (!ts.isClassDeclaration(decl) && !ts.isInterfaceDeclaration(decl)) continue;
      const sf = decl.getSourceFile();
      for (const mem of decl.members) {
        let kind = null;
        if (ts.isConstructorDeclaration(mem)) kind = 'constructor';
        else if (ts.isMethodDeclaration(mem) || ts.isMethodSignature(mem)) kind = 'method';
        else if (ts.isPropertyDeclaration(mem) || ts.isPropertySignature(mem)) kind = 'property';
        else if (ts.isGetAccessorDeclaration(mem) || ts.isSetAccessorDeclaration(mem)
          || ts.isGetAccessor(mem) || ts.isSetAccessor(mem)) kind = 'property';
        else continue;
        const nm = kind === 'constructor' ? 'constructor' : memberNameOf(mem.name);
        if (!nm || nm.startsWith('_')) continue;
        if (hasModifier(mem, ts.SyntaxKind.PrivateKeyword)) continue;
        if (!out.has(nm)) out.set(nm, { kind, file: sf.fileName, at: lineOf(sf, mem), signature: headerOf(sf, mem) });
      }
    }
    return out;
  };
  // Where a symbol is publicly anchored: an export specifier in the file
  // that re-exports it wins; otherwise its first local declaration.
  const anchorOf = (sym) => {
    const decls = declsOf(sym);
    for (const d of decls) {
      if (ts.isExportSpecifier(d)) {
        const stmt = d.parent && d.parent.parent;
        const sf = d.getSourceFile();
        return { file: sf.fileName, at: stmt ? lineOf(sf, stmt) : lineOf(sf, d) };
      }
    }
    for (const d of decls) {
      const sf = d.getSourceFile();
      if (sf.fileName.startsWith(sources)) return { file: sf.fileName, at: lineOf(sf, d) };
    }
    const target = resolveAlias(sym);
    for (const d of declsOf(target)) {
      const sf = d.getSourceFile();
      if (sf.fileName.startsWith(sources)) return { file: sf.fileName, at: lineOf(sf, d) };
    }
    return null;
  };
  const T = (rel) => join(core, 'types', rel);
  const S = (rel) => join(core, 'src', rel);
  const P = (rel) => join(pkgs, rel);

  // ---- dia-api: exported classes and their declared members, plus the
  // enums that live in the class namespaces of the same module.
  const diaFile = T('dia.d.ts');
  const diaClasses = [];
  for (const sym of moduleExports(diaFile)) {
    const target = resolveAlias(sym);
    const isClass = declsOf(target).some((d) => ts.isClassDeclaration(d));
    if (isClass) {
      diaClasses.push(sym.name);
      for (const [nm, info] of declaredMembers(sym)) {
        put('dia-api', `${sym.name}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
      }
    }
    // Namespace side of a (possibly merged) export: enums declared inside.
    for (const inner of checker.getExportsOfModule(sym)) {
      const innerTarget = resolveAlias(inner);
      for (const d of declsOf(innerTarget)) {
        if (!ts.isEnumDeclaration(d)) continue;
        const sf = d.getSourceFile();
        const qualified = `${sym.name}.${inner.name}`;
        // Detail for enums: the header is the enum declaration text.
        put('dia-api', qualified, inner.name, sf.fileName, lineOf(sf, d), 'enum', headerOf(sf, d));
      }
    }
  }
  // The sorting-values object of the dia namespace: the value exports of
  // the Paper implementation module that are not dia classes (the Paper
  // class itself is covered above).
  {
    const diaClassNames = new Set(diaClasses);
    for (const sym of moduleExports(S('dia/Paper.mjs'))) {
      if (diaClassNames.has(sym.name)) continue;
      if ((sym.flags & ts.SymbolFlags.Value) === 0) continue;
      const anchor = anchorOf(sym);
      if (anchor) put('dia-api', sym.name, sym.name, anchor.file, anchor.at, 'enum', undefined);
    }
  }
  // ---- paper-option: properties of the Paper options interface, keeping
  // a property only when it is declared inside this file under the Paper
  // namespace (its own fields plus the sibling option interfaces it
  // extends); fields inherited from other files stay out.
  {
    const sf = sfOf(diaFile);
    let optionsSym = null;
    for (const sym of moduleExports(diaFile)) {
      for (const inner of checker.getExportsOfModule(sym)) {
        if (inner.name !== 'Options') continue;
        const decl = declsOf(resolveAlias(inner)).find((d) => ts.isInterfaceDeclaration(d));
        if (!decl || decl.getSourceFile().fileName !== sf.fileName) continue;
        // Only the options interface declared under the Paper namespace.
        let p = decl.parent;
        let underPaper = false;
        while (p) {
          if (ts.isModuleDeclaration(p) && p.name.text === 'Paper') { underPaper = true; break; }
          p = p.parent;
        }
        if (underPaper) optionsSym = inner;
      }
    }
    if (optionsSym) {
      const typ = checker.getDeclaredTypeOfSymbol(resolveAlias(optionsSym));
      for (const prop of checker.getPropertiesOfType(typ)) {
        const keep = declsOf(prop).some((d) => {
          if (d.getSourceFile().fileName !== sf.fileName) return false;
          // The declaring interface must sit under the Paper namespace.
          let p = d.parent;
          while (p) {
            if (ts.isModuleDeclaration(p) && p.name.text === 'Paper') return true;
            p = p.parent;
          }
          return false;
        });
        if (!keep) continue;
        const decl = declsOf(prop).find((d) => d.getSourceFile().fileName === sf.fileName);
        const dsf = decl.getSourceFile();
        const kind = (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) ? 'property' : undefined;
        put('paper-option', prop.name, prop.name, dsf.fileName, lineOf(dsf, decl), kind, headerOf(dsf, decl));
      }
    }
  }
  // ---- event: keys of the Graph/Paper event maps (checker properties,
  // index signatures read from the declarations) and trigger sites in the
  // runtime sources (call expressions, read off the program AST).
  {
    const seenEventDecl = new Set();
    for (const sym of moduleExports(diaFile)) {
      for (const inner of checker.getExportsOfModule(sym)) {
        const decl = declsOf(resolveAlias(inner)).find((d) => ts.isInterfaceDeclaration(d));
        if (!decl || !/EventMap$/.test(decl.name.text)) continue;
        const sf = decl.getSourceFile();
        if (seenEventDecl.has(decl)) continue;
        seenEventDecl.add(decl);
        for (const mem of decl.members) {
          if (ts.isPropertySignature(mem) && mem.name
            && (ts.isStringLiteralLike(mem.name) || ts.isIdentifier(mem.name))) {
            put('event', mem.name.text, mem.name.text, sf.fileName, lineOf(sf, mem));
          } else if (ts.isIndexSignatureDeclaration(mem)) {
            const paramText = mem.parameters.map((p) => (p.type ? p.type.getText(sf) : '')).join(' ');
            const m = paramText.match(/`(change|layer:change):\$\{string\}`/);
            if (m) put('event', `${m[1]}:<attribute>`, `${m[1]}:<attribute>`, sf.fileName, lineOf(sf, mem));
          }
        }
      }
    }
    // Trigger sites are collected first and anchored on the earliest site
    // in (path, line) order, so the chosen anchor does not depend on the
    // program's file order.
    const triggerSites = [];
    for (const sf of program.getSourceFiles()) {
      if (!sf.fileName.startsWith(join(core, 'src'))) continue;
      const visit = (node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
          && node.expression.name.text === 'trigger' && node.arguments.length > 0) {
          const first = node.arguments[0];
          if (ts.isStringLiteralLike(first)) {
            triggerSites.push({ name: first.text, file: sf.fileName, at: lineOf(sf, node) });
          } else if (ts.isBinaryExpression(first)) {
            const txt = first.getText(sf);
            if (/^'change:'\s*\+/.test(txt) || /^"change:"\s*\+/.test(txt)) {
              triggerSites.push({ name: 'change:<attribute>', file: sf.fileName, at: lineOf(sf, node) });
            }
            const pm = txt.match(/eventPrefix\s*\+\s*'([^']+)'/) || txt.match(/eventPrefix\s*\+\s*"([^"]+)"/);
            if (pm) triggerSites.push({ name: `<prefix>${pm[1]}`, file: sf.fileName, at: lineOf(sf, node) });
          }
        }
        if (ts.isBinaryExpression(node)) {
          const txt = node.getText(sf);
          if (/^'change:'\s*\+/.test(txt)) triggerSites.push({ name: 'change:<attribute>', file: sf.fileName, at: lineOf(sf, node) });
          const pm = txt.match(/^eventPrefix\s*\+\s*'([^']+)'/);
          if (pm) triggerSites.push({ name: `<prefix>${pm[1]}`, file: sf.fileName, at: lineOf(sf, node) });
        }
        node.forEachChild(visit);
      };
      visit(sf);
    }
    triggerSites.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.at - b.at));
    for (const site of triggerSites) put('event', site.name, site.name, site.file, site.at);
  }
  // ---- router / connector: keys of the argument maps, and the direction
  // enums reached through the generic router/connector interfaces (the
  // interface heritage names the family key, e.g. GenericRouter<'x'>).
  const argumentMapKeys = (file) => {
    const keys = [];
    for (const sym of moduleExports(file)) {
      const decl = declsOf(resolveAlias(sym)).find((d) => ts.isInterfaceDeclaration(d));
      if (!decl || !/ArgumentsMap$/.test(decl.name.text)) continue;
      const sf = decl.getSourceFile();
      for (const mem of decl.members) {
        if (ts.isPropertySignature(mem) && mem.name
          && (ts.isStringLiteralLike(mem.name) || ts.isIdentifier(mem.name))) {
          keys.push({ name: mem.name.text, file: sf.fileName, at: lineOf(sf, mem) });
        }
      }
    }
    return keys;
  };
  for (const k of argumentMapKeys(T('routers.d.ts'))) put('router', k.name, k.name, k.file, k.at);
  for (const k of argumentMapKeys(T('connectors.d.ts'))) put('connector', k.name, k.name, k.file, k.at);
  const directionEnums = (file, family) => {
    for (const sym of moduleExports(file)) {
      const decl = declsOf(resolveAlias(sym)).find((d) => ts.isInterfaceDeclaration(d));
      if (!decl) continue;
      let familyKey = null;
      for (const clause of decl.heritageClauses || []) {
        for (const t of clause.types) {
          const arg = t.typeArguments && t.typeArguments[0];
          if (arg && ts.isLiteralTypeNode(arg) && ts.isStringLiteral(arg.literal)) familyKey = arg.literal.text;
        }
      }
      if (!familyKey) continue;
      for (const mem of decl.members) {
        if (!ts.isPropertySignature(mem) || !mem.name || !ts.isIdentifier(mem.name)) continue;
        if (!mem.type) continue;
        // The direction fields are typed `typeof SomeEnum` (a type query).
        let refName = null;
        if (ts.isTypeReferenceNode(mem.type)) refName = mem.type.typeName;
        else if (ts.isTypeQueryNode(mem.type)) refName = mem.type.exprName;
        else if (ts.isTypeOperatorNode(mem.type) && ts.isTypeReferenceNode(mem.type.type)) refName = mem.type.type.typeName;
        if (!refName) continue;
        const typeSym = checker.getSymbolAtLocation(refName);
        const enumDecl = declsOf(resolveAlias(typeSym)).find((d) => ts.isEnumDeclaration(d));
        if (!enumDecl) continue;
        const sf = enumDecl.getSourceFile();
        put(family, `${familyKey}.${mem.name.text}`, mem.name.text, sf.fileName, lineOf(sf, enumDecl), 'enum', headerOf(sf, enumDecl));
      }
    }
  };
  directionEnums(T('routers.d.ts'), 'router');
  directionEnums(T('connectors.d.ts'), 'connector');
  // ---- anchor-like families: the exported variables of the typed modules
  // (the public names; runtime helpers that the types never declare, such
  // as an internal resolver, are absent by construction).
  const exportedVars = (file) => {
    const out = [];
    for (const sym of moduleExports(file)) {
      const target = resolveAlias(sym);
      const decl = declsOf(target).find((d) => ts.isVariableDeclaration(d));
      if (!decl) continue;
      const stmt = decl.parent && decl.parent.parent;
      const sf = decl.getSourceFile();
      out.push({ name: sym.name, file: sf.fileName, at: stmt ? lineOf(sf, stmt) : lineOf(sf, decl) });
    }
    return out;
  };
  const coveredAnchorNames = new Set();
  for (const v of exportedVars(T('anchors.d.ts'))) { put('anchor', v.name, v.name, v.file, v.at); coveredAnchorNames.add(v.name); }
  for (const v of exportedVars(T('linkAnchors.d.ts'))) { put('link-anchor', v.name, v.name, v.file, v.at); coveredAnchorNames.add(v.name); }
  for (const v of exportedVars(T('connectionPoints.d.ts'))) put('connection-point', v.name, v.name, v.file, v.at);
  for (const v of exportedVars(T('connectionStrategies.d.ts'))) put('connection-strategy', v.name, v.name, v.file, v.at);
  // Names the anchor argument map declares that no typed variable exports
  // (a runtime-only anchor on this checkout) are anchored on their
  // implementation export in the sibling runtime module.
  for (const k of argumentMapKeys(T('anchors.d.ts'))) {
    if (coveredAnchorNames.has(k.name)) continue;
    for (const sym of moduleExports(S('anchors/index.mjs'))) {
      if (sym.name !== k.name) continue;
      const anchor = anchorOf(sym);
      if (anchor) put('anchor', k.name, k.name, anchor.file, anchor.at);
    }
  }
  // ---- highlighter: runtime names from the implementation modules, plus
  // the declared members of the typed highlighter classes and the enums of
  // their namespaces.
  {
    for (const file of walkFiles(S('highlighters'), (p) => p.endsWith('.mjs') && !p.endsWith('index.mjs'))) {
      for (const sym of moduleExports(file)) {
        if ((sym.flags & ts.SymbolFlags.Value) === 0) continue;
        const anchor = anchorOf(sym);
        if (anchor) put('highlighter', sym.name, sym.name, anchor.file, anchor.at);
      }
    }
    const hFile = T('highlighters.d.ts');
    for (const sym of moduleExports(hFile)) {
      const target = resolveAlias(sym);
      if (declsOf(target).some((d) => ts.isClassDeclaration(d))) {
        for (const [nm, info] of declaredMembers(sym)) {
          put('highlighter', `${sym.name}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
        }
      }
      for (const inner of checker.getExportsOfModule(sym)) {
        for (const d of declsOf(resolveAlias(inner))) {
          if (!ts.isEnumDeclaration(d)) continue;
          const sf = d.getSourceFile();
          put('highlighter', `${sym.name}.${inner.name}`, inner.name, sf.fileName, lineOf(sf, d), 'enum', headerOf(sf, d));
        }
      }
    }
  }
  // ---- tools and standard shapes: every class of the typed modules,
  // including handle classes nested in namespaces, with their declared
  // members (constructors excluded by the conventions of these families).
  const classFamily = (family, file, includeTopLevel) => {
    const walkSymbol = (sym, qualified) => {
      const target = resolveAlias(sym);
      if (declsOf(target).some((d) => ts.isClassDeclaration(d))) {
        if (includeTopLevel || qualified.includes('.')) {
          const decl = declsOf(target).find((d) => ts.isClassDeclaration(d));
          const sf = decl.getSourceFile();
          if (!qualified.includes('.')) put(family, qualified, sym.name, sf.fileName, lineOf(sf, decl));
          else put(family, qualified, sym.name, sf.fileName, lineOf(sf, decl));
        }
        for (const [nm, info] of declaredMembers(sym)) {
          if (info.kind === 'constructor') continue;
          put(family, `${qualified}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
        }
      }
      for (const inner of checker.getExportsOfModule(sym)) walkSymbol(inner, `${qualified}.${inner.name}`);
    };
    for (const sym of moduleExports(file)) walkSymbol(sym, sym.name);
  };
  classFamily('link-tool', T('linkTools.d.ts'), true);
  classFamily('element-tool', T('elementTools.d.ts'), true);
  // Standard shapes: top-level classes are rows, nested classes are not on
  // this checkout; members follow the same rule as the tools.
  classFamily('shape', T('shapes-standard.d.ts'), true);
  // ---- layout ports: the variables of the two namespaces of the layout
  // module; the family name follows the namespace name.
  {
    const file = T('layout.d.ts');
    for (const sym of moduleExports(file)) {
      const isNamespace = declsOf(resolveAlias(sym)).some((d) => ts.isModuleDeclaration(d));
      if (!isNamespace) continue;
      const family = `layout-${sym.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
      for (const inner of checker.getExportsOfModule(sym)) {
        const target = resolveAlias(inner);
        const decl = declsOf(target).find((d) => ts.isVariableDeclaration(d));
        if (!decl) continue;
        const stmt = decl.parent && decl.parent.parent;
        const sf = decl.getSourceFile();
        put(family, inner.name, inner.name, sf.fileName, stmt ? lineOf(sf, stmt) : lineOf(sf, decl));
      }
    }
  }
  // ---- geometry: class members, the path-segment interface (found as
  // the return type of a segment factory method, never named here), the
  // module-level enum, and standalone plus namespace functions.
  {
    const file = T('geometry.d.ts');
    let segmentSym = null;
    for (const sym of moduleExports(file)) {
      const target = resolveAlias(sym);
      if (declsOf(target).some((d) => ts.isClassDeclaration(d))) {
        for (const [nm, info] of declaredMembers(sym)) {
          put('geometry', `${sym.name}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
        }
        // A factory method whose return type contains an interface of
        // this module identifies the segment contract (a segment or a
        // list of segments), without naming the interface here.
        for (const decl of declsOf(target)) {
          if (!ts.isClassDeclaration(decl)) continue;
          for (const mem of decl.members) {
            if (!ts.isMethodDeclaration(mem) && !ts.isMethodSignature(mem)) continue;
            if (!mem.name || !/^create/.test(memberNameOf(mem.name) || '')) continue;
            if (!mem.type) continue;
            const retType = checker.getTypeAtLocation(mem.type);
            const constituents = retType.isUnion() ? retType.types : [retType];
            for (const part of constituents) {
              const partSym = part.getSymbol();
              if (partSym && declsOf(partSym).some((d) => ts.isInterfaceDeclaration(d)
                && d.getSourceFile().fileName === file)) {
                if (!segmentSym) segmentSym = partSym;
              }
            }
          }
        }
      }
      for (const d of declsOf(target)) {
        if (ts.isEnumDeclaration(d)) {
          const sf = d.getSourceFile();
          put('geometry', sym.name, sym.name, sf.fileName, lineOf(sf, d), 'enum', headerOf(sf, d));
        }
      }
      if ((target.flags & ts.SymbolFlags.Function) !== 0) {
        const anchor = anchorOf(sym);
        if (anchor) put('geometry', sym.name, sym.name, anchor.file, anchor.at, 'function', undefined);
      }
      for (const inner of checker.getExportsOfModule(sym)) {
        const innerTarget = resolveAlias(inner);
        if ((innerTarget.flags & ts.SymbolFlags.Function) === 0) continue;
        const anchor = anchorOf(inner);
        if (anchor) put('geometry', `${sym.name}.${inner.name}`, inner.name, anchor.file, anchor.at, 'function', undefined);
      }
    }
    if (segmentSym) {
      for (const [nm, info] of declaredMembers(segmentSym)) {
        put('geometry', `${segmentSym.name}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
      }
    }
  }
  // ---- vectorizer: members of the exported element class, the static
  // helper interface reached through the callable interface heritage, and
  // the call signature itself (anchored on the module's import alias).
  {
    const file = T('vectorizer.d.ts');
    let callableDecl = null;
    let staticSym = null;
    let aliasName = null;
    for (const sym of moduleExports(file)) {
      const target = resolveAlias(sym);
      if (declsOf(target).some((d) => ts.isClassDeclaration(d))) {
        for (const [nm, info] of declaredMembers(sym)) {
          put('vectorizer', nm, nm, info.file, info.at, info.kind, info.signature);
        }
      }
      for (const d of declsOf(target)) {
        if (!ts.isInterfaceDeclaration(d)) continue;
        if (d.members.some((m) => ts.isCallSignatureDeclaration(m))) {
          callableDecl = d;
          for (const clause of d.heritageClauses || []) {
            for (const t of clause.types) {
              const baseSym = resolveAlias(checker.getSymbolAtLocation(t.expression));
              if (baseSym && declsOf(baseSym).some((x) => ts.isInterfaceDeclaration(x))) staticSym = baseSym;
            }
          }
        }
      }
      // The callable interface is not itself exported: it is the declared
      // type of the exported callable constant of this module.
      for (const d of declsOf(target)) {
        if (!ts.isVariableDeclaration(d) || !d.type || !ts.isTypeReferenceNode(d.type)) continue;
        const typeSym = resolveAlias(checker.getSymbolAtLocation(d.type.typeName));
        const idecl = declsOf(typeSym).find((x) => ts.isInterfaceDeclaration(x));
        if (!idecl || !idecl.members.some((m) => ts.isCallSignatureDeclaration(m))) continue;
        callableDecl = idecl;
        for (const clause of idecl.heritageClauses || []) {
          for (const t of clause.types) {
            const baseSym = resolveAlias(checker.getSymbolAtLocation(t.expression));
            if (baseSym && declsOf(baseSym).some((x) => ts.isInterfaceDeclaration(x))) staticSym = baseSym;
          }
        }
      }
      if (sym.name.length === 1) aliasName = sym.name; // the `V` import alias
    }
    if (staticSym && aliasName) {
      for (const [nm, info] of declaredMembers(staticSym)) {
        put('vectorizer', `${aliasName}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
      }
    }
    if (callableDecl && aliasName) {
      const sf = callableDecl.getSourceFile();
      for (const mem of callableDecl.members) {
        if (ts.isCallSignatureDeclaration(mem)) {
          put('vectorizer', aliasName, aliasName, sf.fileName, lineOf(sf, mem), 'callable', headerOf(sf, mem));
        }
      }
    }
  }
  // ---- util: value exports of the typed module (including namespace
  // members), plus runtime exports of the implementation entry that the
  // type surface never names (set difference, derived from the sources).
  {
    const file = T('util.d.ts');
    const typeNames = new Set();
    for (const sym of moduleExports(file)) {
      typeNames.add(sym.name);
      const target = resolveAlias(sym);
      if ((target.flags & ts.SymbolFlags.Value) !== 0
        && !declsOf(target).some((d) => ts.isModuleDeclaration(d))) {
        const anchor = anchorOf(sym);
        if (anchor) put('util', sym.name, sym.name, anchor.file, anchor.at);
      }
      for (const inner of checker.getExportsOfModule(sym)) {
        typeNames.add(inner.name);
        const innerTarget = resolveAlias(inner);
        if ((innerTarget.flags & ts.SymbolFlags.Value) === 0) continue;
        const anchor = anchorOf(inner);
        if (anchor) put('util', `${sym.name}.${inner.name}`, inner.name, anchor.file, anchor.at);
      }
    }
    for (const sym of moduleExports(S('util/index.mjs'))) {
      if (typeNames.has(sym.name)) continue;
      if ((sym.flags & ts.SymbolFlags.Value) === 0) continue;
      const target = resolveAlias(sym);
      const decl = declsOf(target).find((d) => d.getSourceFile().fileName.startsWith(join(core, 'src', 'util')));
      if (!decl) continue;
      const sf = decl.getSourceFile();
      const stmt = ts.isVariableDeclaration(decl) && decl.parent && decl.parent.parent
        ? decl.parent.parent : decl;
      put('util', sym.name, sym.name, sf.fileName, lineOf(sf, stmt), 'runtime-export', undefined);
    }
  }
  // ---- mvc: declared members of the typed classes; the module-level
  // exports that are not classes (a value export of the types, an alias
  // export, the event interface reached from the dia module alias, and
  // the runtime entry exports that are not typed classes); plus the
  // runtime-only members of the view implementation object.
  {
    const file = T('mvc.d.ts');
    const classNames = new Set();
    const typedMemberNames = new Set();
    for (const sym of moduleExports(file)) {
      const target = resolveAlias(sym);
      if (!declsOf(target).some((d) => ts.isClassDeclaration(d))) continue;
      classNames.add(sym.name);
      for (const [nm, info] of declaredMembers(sym)) {
        typedMemberNames.add(nm);
        put('mvc', `${sym.name}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
      }
    }
    const coveredTop = new Set();
    for (const sym of moduleExports(file)) {
      if (classNames.has(sym.name)) continue;
      const target = resolveAlias(sym);
      // Value export declared in the types (the Events singleton).
      if ((target.flags & ts.SymbolFlags.Value) !== 0
        && declsOf(target).some((d) => ts.isVariableDeclaration(d))) {
        const anchor = anchorOf(sym);
        if (anchor) { put('mvc', sym.name, sym.name, anchor.file, anchor.at, 'object', undefined); coveredTop.add(sym.name); }
        continue;
      }
      // Alias export whose target is an interface of the same module.
      if ((sym.flags & ts.SymbolFlags.Alias) !== 0
        && declsOf(target).some((d) => ts.isInterfaceDeclaration(d))) {
        const anchor = anchorOf(sym);
        if (anchor) { put('mvc', sym.name, sym.name, anchor.file, anchor.at, 'type', undefined); coveredTop.add(sym.name); }
      }
    }
    // The event interface: the dia module declares a type alias for its
    // event type that references an interface of this module; follow that
    // reference to the declared interface.
    for (const sym of moduleExports(diaFile)) {
      for (const d of declsOf(sym)) {
        if (!ts.isTypeAliasDeclaration(d) || !d.type || !ts.isTypeReferenceNode(d.type)) continue;
        const refSym = resolveAlias(checker.getSymbolAtLocation(d.type.typeName));
        const decl = declsOf(refSym).find((x) => ts.isInterfaceDeclaration(x));
        if (!decl || decl.getSourceFile().fileName !== file) continue;
        put('mvc', refSym.name, refSym.name, decl.getSourceFile().fileName, lineOf(decl.getSourceFile(), decl), 'type', undefined);
        coveredTop.add(refSym.name);
      }
    }
    // Runtime entry exports that are neither typed classes nor already
    // covered (the data store, the DOM facade, the view registry).
    for (const sym of moduleExports(S('mvc/index.mjs'))) {
      if (classNames.has(sym.name) || coveredTop.has(sym.name)) continue;
      const anchor = anchorOf(sym);
      if (anchor) put('mvc', sym.name, sym.name, anchor.file, anchor.at, undefined, undefined);
    }
    // Runtime-only view members: keys of the implementation object behind
    // the view export whose names no typed mvc member declares.
    {
      const viewFile = S('mvc/View.mjs');
      const sf = sfOf(viewFile);
      const visit = (node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
          && node.expression.name.text === 'extend' && node.arguments.length > 0
          && ts.isObjectLiteralExpression(node.arguments[0])) {
          for (const prop of node.arguments[0].properties) {
            const nm = prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))
              ? prop.name.text : null;
            if (!nm || nm.startsWith('_') || nm === 'constructor' || typedMemberNames.has(nm)) continue;
            if (!ts.isMethodDeclaration(prop) && !ts.isPropertyAssignment(prop)) continue;
            // The owning class name is the variable this object defines.
            let owner = null;
            let p = node.parent;
            if (p && ts.isVariableDeclaration(p) && ts.isIdentifier(p.name)) owner = p.name.text;
            if (!owner) continue;
            put('mvc', `${owner}.${nm}`, nm, sf.fileName, lineOf(sf, prop), 'method', headerOf(sf, prop));
          }
        }
        node.forEachChild(visit);
      };
      if (sf) visit(sf);
    }
    // Data methods from the implementation class behind the entry export.
    {
      const dataFile = S('mvc/Data.mjs');
      for (const sym of moduleExports(dataFile)) {
        const classDecl = declsOf(resolveAlias(sym)).find((d) => ts.isClassDeclaration(d));
        if (!classDecl) continue;
        const className = classDecl.name ? classDecl.name.text : sym.name;
        for (const [nm, info] of declaredMembers(sym)) {
          if (info.kind === 'constructor') continue;
          put('mvc', `${className}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
        }
      }
      // Fallback: the class is the module's default export.
      const dataSym = moduleSymbol(dataFile);
      if (dataSym) {
        for (const inner of checker.getExportsOfModule(dataSym)) {
          if (!declsOf(resolveAlias(inner)).some((d) => ts.isClassDeclaration(d))) continue;
          const classDecl = declsOf(resolveAlias(inner)).find((d) => ts.isClassDeclaration(d));
          const className = classDecl && classDecl.name ? classDecl.name.text : inner.name;
          for (const [nm, info] of declaredMembers(inner)) {
            if (info.kind === 'constructor') continue;
            put('mvc', `${className}.${nm}`, nm, info.file, info.at, info.kind, info.signature);
          }
        }
      }
    }
  }
  // ---- presentation-attribute: keys of the attribute namespace objects,
  // their bracket-assigned aliases, the evaluator functions of the module
  // that holds the calc list, the option keys read off handler arguments
  // that the registry never declares, and the selector attributes derived
  // from the typed attribute interface plus the DOM reads the paper makes.
  {
    const registryKeys = new Set();
    const attrFiles = walkFiles(S('dia/attributes'), (p) => p.endsWith('.mjs'));
    for (const file of attrFiles) {
      const sf = sfOf(file);
      if (!sf) continue;
      const visit = (node) => {
        if (ts.isObjectLiteralExpression(node) && node.parent && ts.isVariableDeclaration(node.parent)) {
          const varName = node.parent.name.getText(sf);
          if (/AttributesNS$/.test(varName) || varName === 'attributesNS') {
            for (const prop of node.properties) {
              if (ts.isPropertyAssignment(prop) && (ts.isStringLiteralLike(prop.name) || ts.isIdentifier(prop.name))) {
                registryKeys.add(prop.name.text);
                put('presentation-attribute', prop.name.text, prop.name.text, file, lineOf(sf, prop));
              } else if (ts.isShorthandPropertyAssignment(prop)) {
                registryKeys.add(prop.name.text);
                put('presentation-attribute', prop.name.text, prop.name.text, file, lineOf(sf, prop));
              }
            }
          }
        }
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
          && ts.isElementAccessExpression(node.left) && ts.isStringLiteralLike(node.left.argumentExpression)
          && /AttributesNS$/.test(node.left.expression.getText(sf))) {
          registryKeys.add(node.left.argumentExpression.text);
          put('presentation-attribute', node.left.argumentExpression.text, node.left.argumentExpression.text, file, lineOf(sf, node));
        }
        node.forEachChild(visit);
      };
      visit(sf);
    }
    // Evaluator functions: named function exports of the attribute module
    // that declares no namespace object (the calc evaluator module).
    for (const file of attrFiles) {
      const sf = sfOf(file);
      if (!sf) continue;
      let hasNamespaceObject = false;
      const scan = (node) => {
        if (ts.isVariableDeclaration(node) && /AttributesNS$/.test(node.name.getText(sf))) hasNamespaceObject = true;
        node.forEachChild(scan);
      };
      scan(sf);
      if (hasNamespaceObject) continue;
      for (const sym of moduleExports(file)) {
        if ((resolveAlias(sym).flags & ts.SymbolFlags.Function) === 0) continue;
        const anchor = anchorOf(sym);
        if (anchor) put('presentation-attribute', sym.name, sym.name, anchor.file, anchor.at);
      }
    }
    // Option keys read through element access on handler attribute bags
    // and compared against a boolean literal (a behaviour switch the
    // registry itself never declares), derived by difference from the
    // registry keys.
    for (const file of attrFiles) {
      const sf = sfOf(file);
      if (!sf) continue;
      const visit = (node) => {
        if (ts.isElementAccessExpression(node) && ts.isStringLiteralLike(node.argumentExpression)
          && node.parent && ts.isBinaryExpression(node.parent)
          && (node.parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken
            || node.parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken)
          && (node.parent.right.kind === ts.SyntaxKind.TrueKeyword
            || node.parent.right.kind === ts.SyntaxKind.FalseKeyword
            || node.parent.left.kind === ts.SyntaxKind.TrueKeyword
            || node.parent.left.kind === ts.SyntaxKind.FalseKeyword)) {
          const key = node.argumentExpression.text;
          if (key.includes('-') && !registryKeys.has(key)) {
            put('presentation-attribute', key, key, file, lineOf(sf, node));
          }
        }
        node.forEachChild(visit);
      };
      visit(sf);
    }
    // Selector/control attributes: the typed attribute interface fields
    // whose names end in Selector, plus the attribute names the paper and
    // cell view read off DOM nodes that this interface declares.
    {
      const attrTypesFile = T('attributes.d.ts');
      const declaredProps = new Map();
      // Keep only the declared properties of the interface that declares
      // the Selector-suffixed fields: the special selector/control fields
      // live there, not in the native base interface.
      const ifaceDecls = [];
      for (const sym of moduleExports(attrTypesFile)) {
        const decl = declsOf(resolveAlias(sym)).find((d) => ts.isInterfaceDeclaration(d));
        if (decl) ifaceDecls.push(decl);
      }
      // The special fields live in the one interface of this module that
      // declares Selector-suffixed fields; only its own declared fields
      // form the reference set (inherited native attributes stay out).
      for (const decl of ifaceDecls) {
        const own = decl.members.filter((m) => ts.isPropertySignature(m) && m.name
          && (ts.isIdentifier(m.name) || ts.isStringLiteralLike(m.name)));
        if (!own.some((m) => /Selector$/.test(m.name.text))) continue;
        const sf = decl.getSourceFile();
        for (const mem of own) {
          if (!declaredProps.has(mem.name.text)) declaredProps.set(mem.name.text, { file: sf.fileName, at: lineOf(sf, mem) });
        }
      }
      const wanted = new Set();
      for (const name of declaredProps.keys()) if (/Selector$/.test(name)) wanted.add(name);
      for (const probeFile of [S('dia/Paper.mjs'), S('dia/CellView.mjs')]) {
        const sf = sfOf(probeFile);
        if (!sf) continue;
        const visit = (node) => {
          if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
            && node.expression.name.text === 'getAttribute' && node.arguments.length > 0
            && ts.isStringLiteralLike(node.arguments[0])) {
            const name = node.arguments[0].text;
            if (declaredProps.has(name)) wanted.add(name);
          }
          node.forEachChild(visit);
        };
        visit(sf);
      }
      for (const name of wanted) {
        if (registryKeys.has(name)) continue;
        const info = declaredProps.get(name);
        put('presentation-attribute', name, name, info.file, info.at, 'selector-attribute', undefined);
      }
    }
  }
  // ---- core-config: properties of the exported configuration object,
  // the environment test registry object, and the function/constant
  // exports of the joint module; alg: its exported functions.
  {
    const objectProps = (file) => {
      const out = [];
      for (const sym of moduleExports(file)) {
        const target = resolveAlias(sym);
        if ((target.flags & ts.SymbolFlags.Value) === 0) continue;
        const decl = declsOf(target).find((d) => ts.isVariableDeclaration(d));
        if (!decl) continue;
        const typ = checker.getTypeOfSymbolAtLocation(target, decl);
        for (const prop of checker.getPropertiesOfType(typ)) {
          if (prop.name.startsWith('_')) continue; // internal state of the registry object
          const pd = declsOf(prop)[0];
          if (!pd) continue;
          const sf = pd.getSourceFile();
          out.push({ owner: sym.name, name: prop.name, file: sf.fileName, at: lineOf(sf, pd) });
        }
      }
      return out;
    };
    for (const p of objectProps(S('config/index.mjs'))) {
      put('core-config', `${p.owner}.${p.name}`, p.name, p.file, p.at);
    }
    for (const p of objectProps(S('env/index.mjs'))) {
      put('core-config', `${p.owner}.${p.name}`, p.name, p.file, p.at);
    }
    for (const sym of moduleExports(T('joint.d.ts'))) {
      const target = resolveAlias(sym);
      const isNamespace = declsOf(target).some((d) => ts.isModuleDeclaration(d));
      if (isNamespace) continue;
      if ((target.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable)) === 0) continue;
      const anchor = anchorOf(sym);
      if (anchor) put('core-config', sym.name, sym.name, anchor.file, anchor.at);
    }
    for (const sym of moduleExports(T('alg.d.ts'))) {
      if ((resolveAlias(sym).flags & ts.SymbolFlags.Function) === 0) continue;
      const anchor = anchorOf(sym);
      if (anchor) put('alg', sym.name, sym.name, anchor.file, anchor.at);
    }
  }
  // ---- packages and package-api. For each package the entry surface is
  // read through the checker: the entry module plus the modules it
  // re-exports with `export *` (resolved by the compiler), flattened
  // through namespace exports. A name is a row; its kind follows the
  // specifier or the resolved symbol. Classes that extend a core view or
  // element type, and the single exported class of a package when it has
  // only one, also yield their own declared members; the event-map
  // interface declared next to such a class yields its events.
  const entrySurface = (entryAbs) => {
    const modules = [entryAbs];
    const sf = sfOf(entryAbs);
    if (sf) {
      for (const stmt of sf.statements) {
        if (!ts.isExportDeclaration(stmt) || stmt.exportClause || !stmt.moduleSpecifier) continue;
        const resolved = ts.resolveModuleName(stmt.moduleSpecifier.text, entryAbs,
          program.getCompilerOptions(), ts.sys).resolvedModule;
        if (resolved && existsSync(resolved.resolvedFileName)) modules.push(resolved.resolvedFileName);
      }
    }
    // A symbol arrives "via star" when the entry neither declares it nor
    // names it with an export specifier.
    const namedInEntry = (sym) => declsOf(sym).some((d) => d.getSourceFile().fileName === entryAbs);
    const flat = [];
    const queue = [];
    for (const mod of modules) {
      for (const sym of moduleExports(mod)) queue.push({ sym, viaStar: !namedInEntry(sym) });
    }
    const seenNames = new Set();
    const peersByName = new Map();
    while (queue.length) {
      const { sym, viaStar } = queue.shift();
      const target = resolveAlias(sym);
      const pureNamespace = declsOf(target).some((d) => ts.isModuleDeclaration(d))
        && !declsOf(target).some((d) => ts.isClassDeclaration(d) || ts.isInterfaceDeclaration(d));
      if (pureNamespace) {
        // Only value exports of a namespace join the surface here: the
        // option interfaces inside a namespace are the parameters of its
        // functions, not separate package entries.
        for (const inner of checker.getExportsOfModule(sym)) {
          if ((resolveAlias(inner).flags & ts.SymbolFlags.Value) !== 0) queue.push({ sym: inner, viaStar });
        }
        continue;
      }
      if (sym.name === 'default') continue; // covered by its named export where one exists
      if (!peersByName.has(sym.name)) peersByName.set(sym.name, []);
      peersByName.get(sym.name).push(sym);
      if (seenNames.has(sym.name)) continue;
      seenNames.add(sym.name);
      flat.push({ sym, viaStar });
    }
    for (const item of flat) item.peers = peersByName.get(item.sym.name) || [item.sym];
    return flat;
  };
  // The class declaration behind an entry name, whichever peer symbol
  // carries it (the entry alias or the declaring module's own symbol).
  const classDeclOf = (item) => {
    for (const peer of item.peers || [item.sym]) {
      const decl = declsOf(resolveAlias(peer)).find((d) => ts.isClassDeclaration(d));
      if (decl) return decl;
    }
    return null;
  };
  const packageSurface = (entryAbs, label, subpath) => {
    const flat = entrySurface(entryAbs);
    const entries = flat.map((x) => x.sym);
    // Members are inventoried for the classes that ARE the product of an
    // entry: classes reached through `export *`, and a class the entry
    // re-exports as a type (the service class pattern). Classes exported
    // as values by name are entry rows only.
    const exportedAsType = (item) => declsOf(item.sym).some((d) => ts.isExportSpecifier(d)
      && (d.isTypeOnly || (d.parent && d.parent.parent && d.parent.parent.isTypeOnly)));
    const memberItems = flat.filter((item) => classDeclOf(item)
      && (item.viaStar || exportedAsType(item)));
    const memberNames = new Set(memberItems.map((item) => item.sym.name));
    const memberClassSet = new Set(memberItems.map((item) => item.sym));
    for (const sym of entries) {
      // The service class of a package anchors on its declaration, not on
      // the type re-export that names it in the entry point.
      let anchor = null;
      if (memberNames.has(sym.name)) {
        const decl = classDeclOf(flat.find((item) => item.sym === sym));
        if (decl) anchor = { file: decl.getSourceFile().fileName, at: lineOf(decl.getSourceFile(), decl) };
      }
      if (!anchor) {
        // Prefer an export specifier located in the entry point itself.
        for (const d of declsOf(sym)) {
          if (!ts.isExportSpecifier(d)) continue;
          const sf = d.getSourceFile();
          if (sf.fileName !== entryAbs) continue;
          const stmt = d.parent && d.parent.parent;
          anchor = { file: sf.fileName, at: stmt ? lineOf(sf, stmt) : lineOf(sf, d) };
          break;
        }
      }
      if (!anchor) anchor = anchorOf(sym);
      if (!anchor) continue;
      const itemForSym = flat.find((item) => item.sym === sym);
      const isClass = !!classDeclOf(itemForSym);
      const isType = !isClass && symbolIsTypeOnly(sym);
      put('package-api', `${label}${subpath}:${sym.name}`, sym.name, anchor.file, anchor.at,
        isType ? 'type' : (memberClassSet.has(sym) ? 'class' : undefined), undefined);
    }
    for (const sym of memberClassSet) {
      for (const [nm, info] of declaredMembers(sym)) {
        if (info.kind === 'constructor') continue;
        put('package-api', `${label}${subpath}:${sym.name}.${nm}`, `${sym.name}.${nm}`,
          info.file, info.at, info.kind, info.signature);
      }
      // Events of the event-map interface declared in the same file.
      const classDecl = declsOf(resolveAlias(sym)).find((d) => ts.isClassDeclaration(d));
      if (!classDecl) continue;
      const classFile = classDecl.getSourceFile().fileName;
      for (const other of moduleExports(classFile)) {
        const otherDecl = declsOf(resolveAlias(other)).find((d) => ts.isInterfaceDeclaration(d));
        if (!otherDecl || !/EventMap$/.test(otherDecl.name.text)) continue;
        for (const [nm, info] of declaredMembers(other)) {
          put('package-api', `${label}${subpath}:${sym.name}.event:${nm}`, nm,
            info.file, info.at, 'event', info.signature);
        }
      }
    }
    return flat;
  };
  {
    for (const entry of readdirSync(pkgs).sort()) {
      const dir = join(pkgs, entry);
      if (!statSync(dir).isDirectory() || !existsSync(join(dir, 'package.json'))) continue;
      const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      put('package', manifest.name, manifest.name, join(dir, 'package.json'), 1);
    }
    packageSurface(P('joint-layout-directed-graph/DirectedGraph.d.ts'), '@joint/layout-directed-graph', '');
    packageSurface(P('joint-layout-msagl/src/index.mts'), '@joint/layout-msagl', '');
    packageSurface(P('joint-router-avoid/src/index.mts'), '@joint/router-avoid', '');
    packageSurface(P('joint-shapes-general/src/index.ts'), '@joint/shapes-general', '');
    packageSurface(P('joint-shapes-general-tools/src/index.ts'), '@joint/shapes-general-tools', '');
    packageSurface(P('joint-react/src/index.ts'), '@joint/react', '');
    packageSurface(P('joint-react/src/internal.ts'), '@joint/react', '/internal');
    packageSurface(P('joint-decorators/src/index.ts'), '@joint/decorators', '');
    packageSurface(P('joint-vitest-plugin-mock-svg/src/index.ts'), '@joint/vitest-plugin-mock-svg', '');
    for (const file of walkFiles(P('joint-cli/src/commands'), (p) => p.endsWith('.ts'))) {
      const base = file.split('/').pop().replace(/\.ts$/, '');
      put('package-api', `@joint/cli:${base}`, base, file, 1);
    }
    for (const sym of moduleExports(P('joint-eslint-config/index.mjs'))) {
      if (((resolveAlias(sym).flags & ts.SymbolFlags.Value) === 0)
        && ((sym.flags & ts.SymbolFlags.Alias) === 0)) continue;
      const anchor = anchorOf(sym);
      if (anchor) put('package-api', `@joint/eslint-config:${sym.name}`, sym.name, anchor.file, anchor.at);
    }
  }
  // ---- catalogue rows (data source, read independently)
  {
    const catalogue = JSON.parse(readFileSync(catalogueFile, 'utf8'));
    const lines = readFileSync(catalogueFile, 'utf8').split(/\r?\n/);
    for (const app of catalogue.jointjs_apps_and_recipes || []) {
      const at = lines.findIndex((l) => l.includes(`"entry_key": "${app.entry_key}"`)) + 1;
      put('catalog-app', app.entry_key, app.name, 'docs/graph-dataviz-reference-catalog.json', at || 1);
    }
  }
  return expected;
}




