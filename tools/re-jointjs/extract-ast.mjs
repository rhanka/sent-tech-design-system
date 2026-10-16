#!/usr/bin/env node
/**
 * extract-ast.mjs — SECOND, independent extractor for the completeness guard.
 *
 * This module was written separately from enumerate.mjs on purpose. It never
 * imports enumerate.mjs and shares with it only the TypeScript library and
 * the counting conventions stated in spec/SPEC_RE_JOINTJS_PARITY.md §2.
 * enumerate.mjs parses with ts.createSourceFile; this extractor builds a
 * ts.createProgram over the pinned sources and walks the AST (with the
 * TypeChecker instantiated) using its own traversal helpers below.
 *
 * It returns the expected inventory key set: Map<`${family}\0${key}`, item>.
 * verify.mjs compares that set bidirectionally with the stored inventory:
 * any key present on exactly one side is a guard failure.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const wt = resolve(here, '..', '..');

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
const catalogueFile = join(wt, 'docs', 'graph-dataviz-reference-catalog.json');

function probeWalk(dir, pred) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...probeWalk(p, pred));
    else if (!pred || pred(p)) out.push(p);
  }
  return out;
}
function probeLine(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function probeName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) return node.text;
  if (ts.isPrivateIdentifier(node)) return null;
  if (ts.isComputedPropertyName(node)) {
    const inner = node.expression.getText();
    return inner === 'Symbol.iterator' ? '[Symbol.iterator]' : `[${inner}]`;
  }
  return node.getText();
}
function probeHas(node, kind) {
  return !!(node.modifiers && node.modifiers.some((m) => m.kind === kind));
}
// Collect deduplicated public/protected members of a class/interface body.
function probeMembers(sf, body) {
  const map = new Map();
  for (const mem of body) {
    let nm = null;
    let kind = null;
    if (ts.isConstructorDeclaration(mem)) { nm = 'constructor'; kind = 'constructor'; }
    else if (ts.isMethodDeclaration(mem) || ts.isMethodSignature(mem)) { nm = probeName(mem.name); kind = 'method'; }
    else if (ts.isPropertyDeclaration(mem) || ts.isPropertySignature(mem)) { nm = probeName(mem.name); kind = 'property'; }
    else if (ts.isGetAccessor(mem) || ts.isSetAccessor(mem)) { nm = probeName(mem.name); kind = 'property'; }
    else continue;
    if (!nm || nm.startsWith('_')) continue;
    if (probeHas(mem, ts.SyntaxKind.PrivateKeyword)) continue;
    if (!map.has(nm)) map.set(nm, { nm, kind, at: probeLine(sf, mem) });
  }
  return map;
}
function probeEachClass(sf, cb) {
  const walk = (node, prefix) => {
    if (ts.isClassDeclaration(node) && node.name) {
      cb(prefix ? `${prefix}.${node.name.text}` : node.name.text, node.name.text, node);
    }
    if (ts.isModuleDeclaration(node) && node.body) {
      const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      if (ts.isModuleBlock(node.body)) node.body.statements.forEach((s) => walk(s, next));
      else walk(node.body, next);
      return;
    }
    node.forEachChild((c) => walk(c, prefix));
  };
  sf.statements.forEach((s) => walk(s, ''));
}
function probeEachInterface(sf, cb) {
  const walk = (node, prefix) => {
    if (ts.isInterfaceDeclaration(node)) cb(prefix ? `${prefix}.${node.name.text}` : node.name.text, node.name.text, node);
    if (ts.isModuleDeclaration(node) && node.body) {
      const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      if (ts.isModuleBlock(node.body)) node.body.statements.forEach((s) => walk(s, next));
      else walk(node.body, next);
      return;
    }
    node.forEachChild((c) => walk(c, prefix));
  };
  sf.statements.forEach((s) => walk(s, ''));
}
function probeEachEnum(sf, cb) {
  const walk = (node, prefix) => {
    if (ts.isEnumDeclaration(node)) cb(prefix ? `${prefix}.${node.name.text}` : node.name.text, node.name.text, node);
    if (ts.isModuleDeclaration(node) && node.body) {
      const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      if (ts.isModuleBlock(node.body)) node.body.statements.forEach((s) => walk(s, next));
      else walk(node.body, next);
      return;
    }
    node.forEachChild((c) => walk(c, prefix));
  };
  sf.statements.forEach((s) => walk(s, ''));
}
// Exported names of an index-like TS file, resolved without enumerate helpers:
// returns Map<exportedName, {at, isType}>.
function probeIndexExports(sf) {
  const out = new Map();
  const note = (nm, at, isType) => { if (nm && !out.has(nm)) out.set(nm, { at, isType }); };
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      const isType = stmt.exportClause.isTypeOnly;
      for (const el of stmt.exportClause.elements) note(el.name.text, probeLine(sf, stmt), isType);
    } else if (ts.isExportDeclaration(stmt) && !stmt.exportClause && stmt.moduleSpecifier) {
      // `export * from '...'` is resolved by the caller, not here.
    } else if ((ts.isClassDeclaration(stmt) || ts.isFunctionDeclaration(stmt) || ts.isEnumDeclaration(stmt)) && stmt.name && probeHas(stmt, ts.SyntaxKind.ExportKeyword)) {
      note(stmt.name.text, probeLine(sf, stmt), false);
    } else if (ts.isVariableStatement(stmt) && probeHas(stmt, ts.SyntaxKind.ExportKeyword)) {
      for (const decl of stmt.declarationList.declarations) if (ts.isIdentifier(decl.name)) note(decl.name.text, probeLine(sf, stmt), false);
    } else if (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) {
      if (probeHas(stmt, ts.SyntaxKind.ExportKeyword)) note(stmt.name.text, probeLine(sf, stmt), true);
    }
  }
  return out;
}

export function extractWithProgram() {
  const expected = new Map();
  const put = (family, key, label, file, at) => {
    const ck = `${family}\0${key}`;
    if (!expected.has(ck)) expected.set(ck, { family, key, label, file, at });
  };
  // Build one program over every type surface the conventions read, plus the
  // two runtime surfaces parsed as TypeScript (RouterService, react).
  const roots = [
    ...probeWalk(join(core, 'types'), (p) => p.endsWith('.d.ts')),
    join(joint, 'packages', 'joint-router-avoid', 'src', 'RouterService.mts'),
    join(joint, 'packages', 'joint-react', 'src', 'index.ts'),
    join(joint, 'packages', 'joint-react', 'src', 'internal.ts'),
    join(joint, 'packages', 'joint-layout-directed-graph', 'DirectedGraph.d.ts'),
  ].filter((p) => existsSync(p));
  const program = ts.createProgram(roots, {
    allowJs: true,
    checkJs: false,
    skipLibCheck: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  // The checker is part of the independent path: exported symbols must exist.
  const checker = program.getTypeChecker();
  if (!checker) throw new Error('TypeChecker unavailable');
  const sfOf = (abs) => program.getSourceFile(abs) || ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true);
  const jsSf = (abs) => ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const T = (rel) => join(core, 'types', rel);
  const S = (rel) => join(core, 'src', rel);
  const P = (rel) => join(joint, 'packages', rel);

  // ---- dia-api: top-level classes + namespace enums
  {
    const sf = sfOf(T('dia.d.ts'));
    for (const stmt of sf.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
      for (const mem of probeMembers(sf, stmt.members).values()) put('dia-api', `${stmt.name.text}.${mem.nm}`, mem.nm, T('dia.d.ts'), mem.at);
    }
    probeEachEnum(sf, (qualified, short, node) => put('dia-api', qualified, short, T('dia.d.ts'), probeLine(sf, node)));
  }
  // ---- paper-option: Paper.Options properties
  {
    const sf = sfOf(T('dia.d.ts'));
    probeEachInterface(sf, (qualified, short, node) => {
      if (qualified !== 'Paper.Options') return;
      for (const mem of probeMembers(sf, node.members).values()) if (mem.kind === 'property') put('paper-option', mem.nm, mem.nm, T('dia.d.ts'), mem.at);
    });
  }
  // ---- event: EventMap keys + trigger calls (JS AST)
  {
    const sf = sfOf(T('dia.d.ts'));
    probeEachInterface(sf, (qualified, short, node) => {
      if (short !== 'EventMap') return;
      for (const mem of node.members) {
        if (ts.isIndexSignatureDeclaration(mem)) {
          // `[changeEvent: \`change:${string}\`]` dynamic keys live on index signatures.
          const paramText = mem.parameters.map((p) => (p.type ? p.type.getText(sf) : '')).join(' ');
          const m = paramText.match(/`(change|layer:change):\$\{string\}`/);
          if (m) put('event', `${m[1]}:<attribute>`, `${m[1]}:<attribute>`, T('dia.d.ts'), probeLine(sf, mem));
          continue;
        }
        if (ts.isPropertySignature(mem) && mem.name && ts.isStringLiteralLike(mem.name)) put('event', mem.name.text, mem.name.text, T('dia.d.ts'), probeLine(sf, mem));
      }
    });
    for (const file of probeWalk(join(core, 'src'), (p) => p.endsWith('.mjs'))) {
      const js = jsSf(file);
      const visit = (node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'trigger' && node.arguments.length > 0) {
          const first = node.arguments[0];
          if (ts.isStringLiteralLike(first)) put('event', first.text, first.text, file, probeLine(js, node));
          else if (ts.isBinaryExpression(first)) {
            const txt = first.getText(js);
            if (/^'change:'\s*\+/.test(txt) || /^"change:"\s*\+/.test(txt)) put('event', 'change:<attribute>', 'change:<attribute>', file, probeLine(js, node));
            const pm = txt.match(/eventPrefix\s*\+\s*'([^']+)'/) || txt.match(/eventPrefix\s*\+\s*"([^"]+)"/);
            if (pm) put('event', `<prefix>${pm[1]}`, `<prefix>${pm[1]}`, file, probeLine(js, node));
          }
        }
        // Dynamic patterns also occur outside trigger(...) heads.
        if (ts.isBinaryExpression(node)) {
          const txt = node.getText(js);
          if (/^'change:'\s*\+/.test(txt)) put('event', 'change:<attribute>', 'change:<attribute>', file, probeLine(js, node));
          const pm = txt.match(/^eventPrefix\s*\+\s*'([^']+)'/);
          if (pm) put('event', `<prefix>${pm[1]}`, `<prefix>${pm[1]}`, file, probeLine(js, node));
        }
        node.forEachChild(visit);
      };
      visit(js);
    }
  }
  // ---- routers / connectors: argument maps + enums
  {
    const mapKeys = (file, ifaceName, family) => {
      const sf = sfOf(file);
      probeEachInterface(sf, (qualified, short, node) => {
        if (short !== ifaceName) return;
        for (const mem of node.members) {
          if (ts.isPropertySignature(mem) && mem.name && ts.isStringLiteralLike(mem.name)) put(family, mem.name.text, mem.name.text, file, probeLine(sf, mem));
          else if (ts.isPropertySignature(mem) && mem.name && ts.isIdentifier(mem.name)) put(family, mem.name.text, mem.name.text, file, probeLine(sf, mem));
        }
      });
    };
    mapKeys(T('routers.d.ts'), 'RouterArgumentsMap', 'router');
    mapKeys(T('connectors.d.ts'), 'ConnectorArgumentsMap', 'connector');
    probeEachEnum(sfOf(T('routers.d.ts')), (qualified, short, node) => {
      if (short === 'RightAngleDirections') put('router', 'rightAngle.Directions', 'Directions', T('routers.d.ts'), probeLine(sfOf(T('routers.d.ts')), node));
    });
    probeEachEnum(sfOf(T('connectors.d.ts')), (qualified, short, node) => {
      if (short === 'CurveDirections') put('connector', 'curve.Directions', 'Directions', T('connectors.d.ts'), probeLine(sfOf(T('connectors.d.ts')), node));
      if (short === 'CurveTangentDirections') put('connector', 'curve.TangentDirections', 'TangentDirections', T('connectors.d.ts'), probeLine(sfOf(T('connectors.d.ts')), node));
    });
  }
  // ---- src-export families (JS AST export statements)
  {
    const srcExports = (file) => {
      const sf = jsSf(file);
      const out = new Map();
      for (const stmt of sf.statements) {
        if (ts.isVariableStatement(stmt) && probeHas(stmt, ts.SyntaxKind.ExportKeyword)) {
          for (const decl of stmt.declarationList.declarations) if (ts.isIdentifier(decl.name)) out.set(decl.name.text, probeLine(sf, stmt));
        } else if (ts.isFunctionDeclaration(stmt) && stmt.name && probeHas(stmt, ts.SyntaxKind.ExportKeyword)) {
          out.set(stmt.name.text, probeLine(sf, stmt));
        } else if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
          for (const el of stmt.exportClause.elements) out.set(el.name.text, probeLine(sf, stmt));
        }
      }
      return out;
    };
    for (const [nm, at] of srcExports(S('anchors/index.mjs'))) put('anchor', nm, nm, S('anchors/index.mjs'), at);
    for (const [nm, at] of srcExports(S('linkAnchors/index.mjs'))) { if (nm !== 'resolveRef') put('link-anchor', nm, nm, S('linkAnchors/index.mjs'), at); }
    for (const [nm, at] of srcExports(S('connectionPoints/index.mjs'))) put('connection-point', nm, nm, S('connectionPoints/index.mjs'), at);
    for (const [nm, at] of srcExports(S('connectionStrategies/index.mjs'))) put('connection-strategy', nm, nm, S('connectionStrategies/index.mjs'), at);
    for (const file of probeWalk(S('highlighters'), (p) => p.endsWith('.mjs') && !p.endsWith('index.mjs'))) {
      for (const [nm, at] of srcExports(file)) put('highlighter', nm, nm, file, at);
    }
    // Highlighter members + list enums from the type surface.
    const hsf = sfOf(T('highlighters.d.ts'));
    probeEachClass(hsf, (qualified, short, node) => {
      if (qualified.includes('.')) return;
      for (const mem of probeMembers(hsf, node.members).values()) put('highlighter', `${short}.${mem.nm}`, mem.nm, T('highlighters.d.ts'), mem.at);
    });
    probeEachEnum(hsf, (qualified, short, node) => put('highlighter', qualified, short, T('highlighters.d.ts'), probeLine(hsf, node)));
  }
  // ---- tools and shapes (classes, nested classes, members)
  {
    const toolFile = (family, file) => {
      const sf = sfOf(file);
      // Top-level class entries come from the class list itself.
      const seenTop = new Set();
      probeEachClass(sf, (qualified, short, node) => {
        if (!qualified.includes('.')) seenTop.add(short);
      });
      for (const nm of seenTop) {
        // Line: first class with this short name at top level.
        let at = 1;
        probeEachClass(sf, (qualified, short, node) => { if (qualified === short && short === nm) at = probeLine(sf, node); });
        put(family, nm, nm, file, at);
      }
      probeEachClass(sf, (qualified, short, node) => {
        if (qualified.includes('.')) put(family, qualified, short, file, probeLine(sf, node));
        for (const mem of probeMembers(sf, node.members).values()) {
          if (mem.kind === 'constructor') continue;
          put(family, `${qualified}.${mem.nm}`, mem.nm, file, mem.at);
        }
      });
    };
    toolFile('link-tool', T('linkTools.d.ts'));
    toolFile('element-tool', T('elementTools.d.ts'));
    const ssf = sfOf(T('shapes-standard.d.ts'));
    probeEachClass(ssf, (qualified, short, node) => {
      if (!qualified.includes('.')) put('shape', short, short, T('shapes-standard.d.ts'), probeLine(ssf, node));
      for (const mem of probeMembers(ssf, node.members).values()) {
        if (mem.kind === 'constructor') continue;
        put('shape', `${qualified}.${mem.nm}`, mem.nm, T('shapes-standard.d.ts'), mem.at);
      }
    });
  }
  // ---- layout ports (namespace variables)
  {
    const sf = sfOf(T('layout.d.ts'));
    const visitNs = (node, prefix) => {
      if (ts.isModuleDeclaration(node) && node.body) {
        const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
        const fam = next === 'Port' ? 'layout-port' : next === 'PortLabel' ? 'layout-port-label' : null;
        if (fam && ts.isModuleBlock(node.body)) {
          for (const stmt of node.body.statements) {
            if (ts.isVariableStatement(stmt)) {
              for (const decl of stmt.declarationList.declarations) if (ts.isIdentifier(decl.name)) put(fam, decl.name.text, decl.name.text, T('layout.d.ts'), probeLine(sf, stmt));
            }
          }
        }
        if (ts.isModuleBlock(node.body)) node.body.statements.forEach((s) => visitNs(s, next));
        return;
      }
      node.forEachChild((c) => visitNs(c, prefix));
    };
    sf.statements.forEach((s) => visitNs(s, ''));
  }
  // ---- geometry: classes, Segment interface, types enum, functions
  {
    const file = T('geometry.d.ts');
    const sf = sfOf(file);
    for (const stmt of sf.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
      for (const mem of probeMembers(sf, stmt.members).values()) put('geometry', `${stmt.name.text}.${mem.nm}`, mem.nm, file, mem.at);
    }
    probeEachInterface(sf, (qualified, short, node) => {
      if (qualified !== 'Segment') return;
      for (const mem of probeMembers(sf, node.members).values()) put('geometry', `Segment.${mem.nm}`, mem.nm, file, mem.at);
    });
    probeEachEnum(sf, (qualified, short, node) => { if (short === 'types') put('geometry', 'types', 'types', file, probeLine(sf, node)); });
    // Standalone and namespace functions (bezier/scale/intersection + top level).
    const visitFn = (node, prefix) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const key = prefix ? `${prefix}.${node.name.text}` : node.name.text;
        // Only exported or namespace-internal helpers count (mirrors conventions).
        if (prefix || probeHas(node, ts.SyntaxKind.ExportKeyword)) put('geometry', key, node.name.text, file, probeLine(sf, node));
      }
      if (ts.isModuleDeclaration(node) && node.body) {
        const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
        if (ts.isModuleBlock(node.body)) node.body.statements.forEach((s) => visitFn(s, next));
        else visitFn(node.body, next);
        return;
      }
      node.forEachChild((c) => visitFn(c, prefix));
    };
    sf.statements.forEach((s) => visitFn(s, ''));
  }
  // ---- vectorizer
  {
    const file = T('vectorizer.d.ts');
    const sf = sfOf(file);
    for (const stmt of sf.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name || stmt.name.text !== 'VElement') continue;
      for (const mem of probeMembers(sf, stmt.members).values()) put('vectorizer', mem.nm, mem.nm, file, mem.at);
    }
    probeEachInterface(sf, (qualified, short, node) => {
      if (qualified === 'VStatic') for (const mem of probeMembers(sf, node.members).values()) put('vectorizer', `V.${mem.nm}`, mem.nm, file, mem.at);
      if (qualified === 'VCallable') {
        for (const mem of node.members) if (ts.isCallSignatureDeclaration(mem)) put('vectorizer', 'V', 'V', file, probeLine(sf, mem));
      }
    });
  }
  // ---- util
  {
    const file = T('util.d.ts');
    const sf = sfOf(file);
    const visit = (node, prefix) => {
      if (ts.isFunctionDeclaration(node) && node.name && probeHas(node, ts.SyntaxKind.ExportKeyword)) {
        put('util', prefix ? `${prefix}.${node.name.text}` : node.name.text, node.name.text, file, probeLine(sf, node));
      }
      if (ts.isVariableStatement(node) && probeHas(node, ts.SyntaxKind.ExportKeyword)) {
        for (const decl of node.declarationList.declarations) if (ts.isIdentifier(decl.name)) put('util', prefix ? `${prefix}.${decl.name.text}` : decl.name.text, decl.name.text, file, probeLine(sf, node));
      }
      if (ts.isModuleDeclaration(node) && node.body) {
        const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
        if (ts.isModuleBlock(node.body)) node.body.statements.forEach((s) => visit(s, next));
        else visit(node.body, next);
        return;
      }
      node.forEachChild((c) => visit(c, prefix));
    };
    sf.statements.forEach((s) => visit(s, ''));
  }
  // ---- mvc: typed classes + Data methods (JS class)
  {
    const file = T('mvc.d.ts');
    const sf = sfOf(file);
    for (const stmt of sf.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
      for (const mem of probeMembers(sf, stmt.members).values()) put('mvc', `${stmt.name.text}.${mem.nm}`, mem.nm, file, mem.at);
    }
    const idx = S('mvc/index.mjs');
    const idxText = readFileSync(idx, 'utf8');
    put('mvc', 'Data', 'Data', idx, idxText.split(/\r?\n/).findIndex((l) => l.includes('Data')) + 1);
    put('mvc', '$', '$', idx, idxText.split(/\r?\n/).findIndex((l) => l.includes('Dom/index')) + 1);
    const dataFile = S('mvc/Data.mjs');
    const dsf = jsSf(dataFile);
    for (const stmt of dsf.statements) {
      if (!ts.isClassDeclaration(stmt)) continue;
      for (const mem of probeMembers(dsf, stmt.members).values()) if (mem.kind !== 'constructor') put('mvc', `Data.${mem.nm}`, mem.nm, dataFile, mem.at);
    }
  }
  // ---- presentation attributes (JS object literals + bracket aliases)
  {
    const attrDir = S('dia/attributes');
    for (const file of probeWalk(attrDir, (p) => p.endsWith('.mjs'))) {
      if (file.endsWith('props.mjs') || file.endsWith('eval.mjs')) continue;
      const sf = jsSf(file);
      const visit = (node) => {
        if (ts.isObjectLiteralExpression(node) && node.parent && ts.isVariableDeclaration(node.parent)) {
          const varName = node.parent.name.getText(sf);
          if (varName.endsWith('AttributesNS') || varName === 'attributesNS') {
            for (const prop of node.properties) {
              if (ts.isPropertyAssignment(prop) && (ts.isStringLiteralLike(prop.name) || ts.isIdentifier(prop.name))) put('presentation-attribute', prop.name.text, prop.name.text, file, probeLine(sf, prop));
              else if (ts.isShorthandPropertyAssignment(prop)) put('presentation-attribute', prop.name.text, prop.name.text, file, probeLine(sf, prop));
            }
          }
        }
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(node.left) && ts.isStringLiteralLike(node.left.argumentExpression)) {
          // Only namespace bracket aliases (XxxAttributesNS['...'] = ...) count;
          // element writes such as marker['stroke-opacity'] do not.
          if (/AttributesNS$/.test(node.left.expression.getText(sf))) put('presentation-attribute', node.left.argumentExpression.text, node.left.argumentExpression.text, file, probeLine(sf, node));
        }
        node.forEachChild(visit);
      };
      visit(sf);
    }
    const idx = S('dia/attributes/index.mjs');
    put('presentation-attribute', 'props', 'props', idx, readFileSync(idx, 'utf8').split(/\r?\n/).findIndex((l) => l.includes('props,')) + 1);
    const evalFile = S('dia/attributes/eval.mjs');
    const evalText = readFileSync(evalFile, 'utf8').split(/\r?\n/);
    put('presentation-attribute', 'evalAttributes', 'evalAttributes', evalFile, evalText.findIndex((l) => l.includes('export function evalAttributes')) + 1);
    put('presentation-attribute', 'evalAttribute', 'evalAttribute', evalFile, evalText.findIndex((l) => l.includes('export function evalAttribute')) + 1);
    const textFile = S('dia/attributes/text.mjs');
    put('presentation-attribute', 'use-no-break-space', 'use-no-break-space', textFile, readFileSync(textFile, 'utf8').split(/\r?\n/).findIndex((l) => l.includes('use-no-break-space')) + 1);
    const attrTypes = T('attributes.d.ts');
    const atLines = readFileSync(attrTypes, 'utf8').split(/\r?\n/);
    for (const nm of ['event', 'magnet', 'magnetSelector', 'highlighterSelector', 'containerSelector']) {
      put('presentation-attribute', nm, nm, attrTypes, atLines.findIndex((l) => l.includes(`${nm}?:`)) + 1);
    }
  }
  // ---- core-config and alg
  {
    const cfg = S('config/index.mjs');
    const sf = jsSf(cfg);
    const visit = (node) => {
      if (ts.isObjectLiteralExpression(node)) {
        // The config default export object: take identifier keys at depth 1.
        for (const prop of node.properties) {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            // Heuristic mirror of the convention: only the top config object
            // is visited first; nested objects are separate literals and are
            // filtered by requiring the literal to be large (config-sized).
          }
        }
      }
      node.forEachChild(visit);
    };
    visit(sf);
    // Direct convention: identifier keys of the exported config object.
    // Re-derive by locating the object literal assigned at top level.
    for (const stmt of sf.statements) {
      const findObj = (node) => {
        if (ts.isObjectLiteralExpression(node) && node.properties.length >= 4) {
          for (const prop of node.properties) if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) put('core-config', `config.${prop.name.text}`, prop.name.text, cfg, probeLine(sf, prop));
        }
        node.forEachChild(findObj);
      };
      findObj(stmt);
    }
    const envFile = S('env/index.mjs');
    const envLines = readFileSync(envFile, 'utf8').split(/\r?\n/);
    put('core-config', 'env.addTest', 'addTest', envFile, envLines.findIndex((l) => l.includes('addTest')) + 1);
    put('core-config', 'env.test', 'test', envFile, envLines.findIndex((l) => l.includes('test: function')) + 1);
    put('core-config', 'setTheme', 'setTheme', S('setTheme.mjs'), 1);
    const jt = T('joint.d.ts');
    put('core-config', 'version', 'version', jt, readFileSync(jt, 'utf8').split(/\r?\n/).findIndex((l) => l.includes('version')) + 1);
    const alg = T('alg.d.ts');
    put('alg', 'rightAnglePath', 'rightAnglePath', alg, readFileSync(alg, 'utf8').split(/\r?\n/).findIndex((l) => l.includes('rightAnglePath(source')) + 1);
  }
  // ---- packages and package-api
  {
    const pkgsDir = join(joint, 'packages');
    for (const entry of readdirSync(pkgsDir).sort()) {
      const dir = join(pkgsDir, entry);
      if (!statSync(dir).isDirectory() || !existsSync(join(dir, 'package.json'))) continue;
      const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      put('package', manifest.name, manifest.name, join(dir, 'package.json'), 1);
    }
    // DirectedGraph exported functions (AST, inside the DirectedGraph namespace).
    {
      const file = P('joint-layout-directed-graph/DirectedGraph.d.ts');
      const sf = sfOf(file);
      const visit = (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) put('package-api', `@joint/layout-directed-graph:${node.name.text}`, node.name.text, file, probeLine(sf, node));
        node.forEachChild(visit);
      };
      visit(sf);
    }
    // MSAGL layout + enums.
    {
      const file = P('joint-layout-msagl/src/index.mts');
      if (existsSync(file)) put('package-api', '@joint/layout-msagl:layout', 'layout', file, readFileSync(file, 'utf8').split(/\r?\n/).findIndex((l) => l.includes('export function layout')) + 1);
      const enums = P('joint-layout-msagl/src/enums.mts');
      if (existsSync(enums)) {
        const sf = ts.createSourceFile(enums, readFileSync(enums, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const visit = (node) => {
          if (ts.isEnumDeclaration(node)) put('package-api', `@joint/layout-msagl:${node.name.text}`, node.name.text, enums, probeLine(sf, node));
          if (ts.isVariableStatement(node) && probeHas(node, ts.SyntaxKind.ExportKeyword)) for (const d of node.declarationList.declarations) if (ts.isIdentifier(d.name)) put('package-api', `@joint/layout-msagl:${d.name.text}`, d.name.text, enums, probeLine(sf, node));
          if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) for (const el of node.exportClause.elements) put('package-api', `@joint/layout-msagl:${el.name.text}`, el.name.text, enums, probeLine(sf, node));
          node.forEachChild(visit);
        };
        visit(sf);
      }
    }
    // Router-avoid service (AST over the program source file).
    {
      const idx = P('joint-router-avoid/src/index.mts');
      for (const nm of ['initAvoidRouter', 'loadAvoidRouter']) put('package-api', `@joint/router-avoid:${nm}`, nm, idx, readFileSync(idx, 'utf8').split(/\r?\n/).findIndex((l) => l.includes(nm)) + 1);
      const svc = P('joint-router-avoid/src/RouterService.mts');
      if (existsSync(svc)) {
        const sf = sfOf(svc);
        put('package-api', '@joint/router-avoid:RouterService', 'RouterService', svc, sf.statements.findIndex(() => false) >= 0 ? 1 : (() => { let at = 1; probeEachClass(sf, (q, s, n) => { if (s === 'RouterService') at = probeLine(sf, n); }); return at; })());
        probeEachClass(sf, (qualified, short, node) => {
          if (short !== 'RouterService') return;
          for (const mem of probeMembers(sf, node.members).values()) if (mem.kind !== 'constructor') put('package-api', `@joint/router-avoid:RouterService.${mem.nm}`, `RouterService.${mem.nm}`, svc, mem.at);
        });
        probeEachInterface(sf, (qualified, short, node) => {
          if (qualified === 'RouterServiceEventMap') for (const mem of probeMembers(sf, node.members).values()) put('package-api', `@joint/router-avoid:RouterService.event:${mem.nm}`, mem.nm, svc, mem.at);
          if (['RouterServiceOptions', 'RoutingResult', 'FallbackRouteAttributes', 'RouteAttributes'].includes(short) && !qualified.includes('.')) put('package-api', `@joint/router-avoid:${short}`, short, svc, probeLine(sf, node));
        });
      }
    }
    // shapes-general / shapes-general-tools via one-level export * (AST).
    const starExports = (indexFile) => {
      const out = new Map();
      if (!existsSync(indexFile)) return out;
      const sf = ts.createSourceFile(indexFile, readFileSync(indexFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      for (const stmt of sf.statements) {
        if (!ts.isExportDeclaration(stmt) || stmt.exportClause || !stmt.moduleSpecifier) continue;
        const spec = stmt.moduleSpecifier.text;
        let target = join(dirname(indexFile), spec);
        if (!existsSync(target)) for (const cand of [`${target}.ts`, `${target}.tsx`, join(target, 'index.ts')]) if (existsSync(cand)) { target = cand; break; }
        if (!existsSync(target)) continue;
        const tsf = ts.createSourceFile(target, readFileSync(target, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        probeEachClass(tsf, (qualified, short, node) => { if (!qualified.includes('.') && probeHas(node, ts.SyntaxKind.ExportKeyword) && !out.has(short)) out.set(short, { at: probeLine(tsf, node), file: target }); });
        for (const s2 of tsf.statements) {
          if (ts.isVariableStatement(s2) && probeHas(s2, ts.SyntaxKind.ExportKeyword)) for (const d of s2.declarationList.declarations) if (ts.isIdentifier(d.name) && !out.has(d.name.text)) out.set(d.name.text, { at: probeLine(tsf, s2), file: target });
          if (ts.isFunctionDeclaration(s2) && s2.name && probeHas(s2, ts.SyntaxKind.ExportKeyword) && !out.has(s2.name.text)) out.set(s2.name.text, { at: probeLine(tsf, s2), file: target });
        }
      }
      return out;
    };
    for (const [dir, label] of [['joint-shapes-general', '@joint/shapes-general'], ['joint-shapes-general-tools', '@joint/shapes-general-tools']]) {
      for (const [nm, info] of starExports(P(`${dir}/src/index.ts`))) put('package-api', `${label}:${nm}`, nm, info.file, info.at);
    }
    // react "." and "./internal" (AST index exports + one-level star for internal).
    {
      const idx = P('joint-react/src/index.ts');
      const sf = sfOf(idx);
      for (const [nm, info] of probeIndexExports(sf)) put('package-api', `@joint/react:${nm}`, nm, idx, info.at);
      const internal = P('joint-react/src/internal.ts');
      if (existsSync(internal)) {
        const isf = sfOf(internal);
        for (const [nm, info] of probeIndexExports(isf)) put('package-api', `@joint/react/internal:${nm}`, nm, internal, info.at);
        for (const [nm, info] of starExports(internal)) put('package-api', `@joint/react/internal:${nm}`, nm, info.file, info.at);
      }
    }
    // decorators, CLI, eslint-config, vitest mock.
    {
      const idx = P('joint-decorators/src/index.ts');
      if (existsSync(idx)) {
        for (const [nm, info] of starExports(idx)) put('package-api', `@joint/decorators:${nm}`, nm, info.file, info.at);
        for (const file of probeWalk(P('joint-decorators/src/decorators'), (p) => p.endsWith('.ts'))) {
          const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
          probeEachEnum(sf, (qualified, short, node) => put('package-api', `@joint/decorators:${short}`, short, file, probeLine(sf, node)));
        }
      }
      for (const file of probeWalk(P('joint-cli/src/commands'), (p) => p.endsWith('.ts'))) {
        const base = file.split('/').pop().replace(/\.ts$/, '');
        put('package-api', `@joint/cli:${base}`, base, file, 1);
      }
      const eslintIdx = P('joint-eslint-config/index.mjs');
      if (existsSync(eslintIdx)) {
        const sf = jsSf(eslintIdx);
        for (const stmt of sf.statements) if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) for (const el of stmt.exportClause.elements) put('package-api', `@joint/eslint-config:${el.name.text}`, el.name.text, eslintIdx, probeLine(sf, stmt));
      }
      const mock = P('joint-vitest-plugin-mock-svg/src/index.ts');
      if (existsSync(mock)) put('package-api', '@joint/vitest-plugin-mock-svg:mockSVG', 'mockSVG', mock, readFileSync(mock, 'utf8').split(/\r?\n/).findIndex((l) => l.includes('mockSVG')) + 1);
    }
  }
  // ---- catalogue rows (data source, read independently)
  {
    const catalogue = JSON.parse(readFileSync(catalogueFile, 'utf8'));
    const lines = readFileSync(catalogueFile, 'utf8').split(/\r?\n/);
    for (const app of catalogue.jointjs_apps_and_recipes || []) {
      const at = lines.findIndex((l) => l.includes(`"entry_key": "${app.entry_key}"`)) + 1;
      put('catalog-app', app.entry_key, app.name, catalogueFile, at || 1);
    }
  }
  return expected;
}
