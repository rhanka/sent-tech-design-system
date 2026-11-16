import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { parse } from '@vue/compiler-sfc';

export const packages = ['components-vue', 'dataviz-vue'];
export const excluded = /\.test\.|\.d\.ts$|test-support|fixtures|\/__/;
export function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]).sort();
}

// Report legacy API origins, rather than just calls: once a render API is
// imported or extracted it can be aliased, passed around or called indirectly.
// Namespace escapes are conservative legacy usage too; direct access to known
// non-render members (Vue.ref, for example) remains permitted.
export function renderCalls(source, filename = 'source.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const forbidden = new Set(['h', 'defineComponent']);
  const namespaces = new Set();
  const hits = new Set();
  const report = node => hits.add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1);
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) || node.moduleSpecifier.text !== 'vue') continue;
    if (node.importClause?.isTypeOnly) continue;
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
      if (!item.isTypeOnly && forbidden.has((item.propertyName ?? item.name).text)) report(item);
    }
  }
  function visit(node) {
    // Imports were handled above; type references cannot create VDOM nodes.
    if (ts.isImportDeclaration(node) || ts.isTypeNode(node)) return;
    if (ts.isIdentifier(node) && namespaces.has(node.text)) {
      const parent = node.parent;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === node) {
        if (forbidden.has(parent.name.text)) report(parent);
      } else if (ts.isElementAccessExpression(parent) && parent.expression === node) {
        const key = parent.argumentExpression;
        if (!ts.isStringLiteralLike(key) || forbidden.has(key.text)) report(parent);
      } else {
        // Includes local namespace aliases, destructuring, spreads and escapes
        // through function arguments. No downstream alias can hide the origin.
        report(node);
      }
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && forbidden.has(node.expression.text)) report(node);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return [...hits].sort((a, b) => a - b);
}

export function inventory(root) {
  return packages.map(name => {
    const sources = files(join(root, 'packages', name, 'src')).filter(file => !excluded.test(file));
    return { name, sfc: sources.filter(file => file.endsWith('.vue')),
      legacy: sources.filter(file => /\.[cm]?[jt]sx?$/.test(file) && renderCalls(readFileSync(file, 'utf8'), file).length) };
  });
}

// Process-wide mutable counters are unsafe identities across SSR requests.
export function moduleCounters(source, filename = 'source.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const mutable = new Set(ast.statements.filter(ts.isVariableStatement)
    .filter(s => !(s.declarationList.flags & ts.NodeFlags.Const))
    .flatMap(s => s.declarationList.declarations.filter(d => ts.isIdentifier(d.name)).map(d => d.name.text)));
  const errors = [];
  function visit(node) {
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node))
      && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)
      && ts.isIdentifier(node.operand) && mutable.has(node.operand.text)) errors.push(`module counter: ${node.operand.text}; use useId()`);
    if (ts.isBinaryExpression(node) && ts.isIdentifier(node.left) && mutable.has(node.left.text)
      && [ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken].includes(node.operatorToken.kind)) errors.push(`module counter: ${node.left.text}; use useId()`);
    ts.forEachChild(node, visit);
  }
  visit(ast); return [...new Set(errors)];
}

export function sfcSafety(source, filename = 'Component.vue') {
  const blocks = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  const code = blocks.map(m => m[2]).join('\n');
  const ast = ts.createSourceFile(filename + '.ts', code, ts.ScriptTarget.Latest, true);
  const unwrap = node => { while (node && (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node))) node = node.expression; return node; };
  const errors = blocks.filter(m => !/\bsetup\b/.test(m[1])).flatMap(m => moduleCounters(m[2], filename));
  const attrsCalls = new Set(['useAttrs']), slotsCalls = new Set(['useSlots']), computedCalls = new Set(['computed']);
  const vnodeTypes = new Set(['VNode', 'VNodeChild', 'VNodeArrayChildren']);
  for (const statement of ast.statements) if (ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === 'vue') {
    for (const entry of statement.importClause?.namedBindings?.elements ?? []) {
      const original = (entry.propertyName ?? entry.name).text;
      if (original === 'useAttrs') attrsCalls.add(entry.name.text);
      if (original === 'useSlots') slotsCalls.add(entry.name.text);
      if (original === 'computed') computedCalls.add(entry.name.text);
      if (vnodeTypes.has(original)) vnodeTypes.add(entry.name.text);
    }
  }
  const attrs = new Set(['$attrs']), emits = new Set(), callbacks = new Set(), events = new Set();
  let declaresClass = false;
  const declaredTypes = new Map(ast.statements.filter(node => ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)).map(node => [node.name.text, node]));
  const classProp = (node, seen = new Set()) => {
    if (!node || seen.has(node)) return; seen.add(node);
    if (ts.isTypeReferenceNode(node)) return classProp(declaredTypes.get(node.typeName.getText(ast)), seen);
    if ((ts.isPropertySignature(node) || ts.isPropertyAssignment(node)) && node.name?.getText(ast).replace(/['"]/g, '') === 'class') declaresClass = true;
    if (ts.isPropertyAccessExpression(node) && node.expression.getText(ast) === 'props' && node.name.text === 'class') declaresClass = true;
    ts.forEachChild(node, child => classProp(child, seen));
  };
  const findProps = node => {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'defineProps') classProp(node.typeArguments?.[0] ?? node.arguments[0]);
    if (ts.isPropertyAccessExpression(node) && node.expression.getText(ast) === 'props' && node.name.text === 'class') declaresClass = true;
    ts.forEachChild(node, findProps);
  };
  findProps(ast);
  for (const statement of ast.statements) if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
    if (declaration.initializer && ts.isCallExpression(declaration.initializer) && attrsCalls.has(declaration.initializer.expression.getText(ast))) attrs.add(declaration.name.getText(ast));
  }
  // Follow render-time helpers and rest bindings as well as direct $attrs.
  const bindings = new Map();
  function collectBindings(node) {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isIdentifier(node.name)) bindings.set(node.name.text, node.initializer);
      if (ts.isObjectBindingPattern(node.name)) for (const entry of node.name.elements) {
        if (entry.dotDotDotToken && ts.isIdentifier(entry.name)) bindings.set(entry.name.text, node.initializer);
      }
    }
    if (ts.isFunctionDeclaration(node) && node.name && node.body) bindings.set(node.name.text, node.body);
    ts.forEachChild(node, collectBindings);
  }
  collectBindings(ast);
  function dependsOnAttrs(node, seen = new Set()) {
    if (ts.isIdentifier(node)) {
      if (attrs.has(node.text)) return true;
      if (seen.has(node.text) || !bindings.has(node.text)) return false;
      return dependsOnAttrs(bindings.get(node.text), new Set([...seen, node.text]));
    }
    let found = false;
    ts.forEachChild(node, child => { found ||= dependsOnAttrs(child, seen); });
    return found;
  }
  const ownedStyleLast = ast.statements.some(node => ts.getJSDocTags(node).some(tag => tag.tagName.text === 'attrsStyle' && tag.comment?.trim() === 'owned-last'));
  const hasAttrsStyle = node => {
    let found = false;
    const check = n => {
      if (ts.isPropertyAccessExpression(n) && n.name.text === 'style' && attrs.has(n.expression.getText())) found = true;
      ts.forEachChild(n, check);
    };
    check(node); return found;
  };
  function styleVisit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const forwardsAttrs = node.properties.some(p => ts.isSpreadAssignment(p) && [...attrs].some(name => p.expression.getText().includes(name)));
      const style = node.properties.find(p => p.name?.getText().replace(/['"]/g, '') === 'style' && ts.isPropertyAssignment(p));
      const cssClass = node.properties.find(p => p.name?.getText().replace(/['"]/g, '') === 'class' && ts.isPropertyAssignment(p));
      if (forwardsAttrs && cssClass && !declaresClass && ![...attrs].some(name => cssClass.initializer.getText().includes(name + '.class')))
        errors.push('class overwrites caller attrs; declare the class prop or compose caller classes explicitly');
      if (forwardsAttrs && style) {
        if (!hasAttrsStyle(style.initializer)) errors.push('style overwrites caller attrs; compose owned and caller styles explicitly');
        const value = unwrap(style.initializer);
        if (ts.isArrayLiteralExpression(value) && !ownedStyleLast && hasAttrsStyle(value) && !hasAttrsStyle(value.elements.at(-1))) errors.push('caller style must have final precedence');
      }
    }
    ts.forEachChild(node, styleVisit);
  }
  const slotNames = new Set(), renderedSlots = new Set(), templateIdentifiers = new Set(), templateExpressions = [];
  const { descriptor } = parse(source, { filename });
  function templateVisit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 1 && node.tag === 'slot') {
      const name = node.props.find(p => p.type === 6 && p.name === 'name');
      if (!node.props.some(p => p.type === 7 && p.arg?.content === 'name')) renderedSlots.add(name?.value?.content ?? 'default');
    }
    if (node.type === 4 && !node.isStatic) {
      const expression = ts.createSourceFile('template.ts', `(${node.content})`, ts.ScriptTarget.Latest, true);
      templateExpressions.push(expression);
      const identifiers = n => {
        if (ts.isIdentifier(n)) templateIdentifiers.add(n.text);
        if (ts.isPropertyAccessExpression(n) && n.expression.getText() === 'props' && n.name.text === 'class') declaresClass = true;
        ts.forEachChild(n, identifiers);
      };
      identifiers(expression);
      // Directive values can be object expressions; wrap before parsing so
      // TypeScript does not interpret an opening brace as a statement block.
      styleVisit(ts.createSourceFile('binding.ts', `(${node.content})`, ts.ScriptTarget.Latest, true));
    }
    for (const [key, value] of Object.entries(node)) if (key !== 'loc') {
      if (Array.isArray(value)) value.forEach(templateVisit);
      else if (value && typeof value === 'object') templateVisit(value);
    }
  }
  templateVisit(descriptor.template?.ast);
  let forwardsAttrs = false;
  function attrsPath(node, ancestorForwards = false) {
    if (!node) return;
    const forwards = node.type === 1 && node.props.some(prop => prop.type === 7 && prop.name === 'bind' && !prop.arg && prop.exp
      && dependsOnAttrs(ts.createSourceFile('attrs.ts', `(${prop.exp.content})`, ts.ScriptTarget.Latest, true)));
    if (forwards && ancestorForwards) errors.push('attrs forwarded on ancestor and descendant; choose one target per rendered path');
    forwardsAttrs ||= forwards;
    for (const child of node.children ?? []) attrsPath(child, ancestorForwards || forwards);
  }
  attrsPath(descriptor.template?.ast);
  let usesAttrs = /\$attrs\b/.test(source), inheritFalse = false;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
      const call = node.initializer, called = call.expression.getText(ast);
      if (attrsCalls.has(called)) { usesAttrs = true; attrs.add(node.name.getText(ast)); }
      if (called === 'defineEmits') emits.add(node.name.getText(ast));
    }
    if (ts.isCallExpression(node)) {
      const called = node.expression.getText(ast);
      if (called === 'defineOptions' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        inheritFalse ||= node.arguments[0].properties.some(p => p.name?.getText(ast).replace(/['"]/g,'') === 'inheritAttrs' && p.initializer?.kind === ts.SyntaxKind.FalseKeyword);
      }
      if (emits.has(called) && ts.isStringLiteralLike(node.arguments[0] ?? {})) events.add(node.arguments[0].text);
      const fn = node.expression;
      if (ts.isPropertyAccessExpression(fn) && /^on[A-Z]/.test(fn.name.text)) callbacks.add(fn.name.text);
      if (ts.isElementAccessExpression(fn) && ts.isStringLiteralLike(fn.argumentExpression) && /^on[A-Z]/.test(fn.argumentExpression.text)) callbacks.add(fn.argumentExpression.text);
      if (computedCalls.has(called)) {
        function cached(x) {
          if (ts.isPropertyAccessExpression(x) && x.name.text === 'style' && attrs.has(x.expression.getText(ast))) errors.push('cached attrs style; compose caller style during render');
          if (ts.isSpreadAssignment(x) && attrs.has(x.expression.getText(ast))) errors.push('cached attrs spread; merge $attrs in the template');
          if (ts.isVariableDeclaration(x) && ts.isObjectBindingPattern(x.name) && x.initializer && attrs.has(unwrap(x.initializer).getText(ast))) errors.push('cached attrs destructuring; evaluate during render');
          ts.forEachChild(x,cached);
        }
        node.arguments.forEach(cached);
      }
      if (called === 'defineSlots' && node.typeArguments?.[0]) {
        const collectSlots = type => {
          if (ts.isIntersectionTypeNode(type)) type.types.forEach(collectSlots);
          if (!ts.isTypeLiteralNode(type)) return;
          for (const slot of type.members) {
            const name = slot.name?.getText(ast).replace(/['"]/g,'');
            if (name) slotNames.add(name);
            if (name && /[A-Z]/.test(name) && !ts.getJSDocDeprecatedTag(slot)) errors.push(`slot must use kebab-case: ${name}`);
          }
        };
        collectSlots(node.typeArguments[0]);
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  styleVisit(ast);
  // Imported/record slot contracts are checked by vue-tsc; local literal
  // contracts can be checked here without pretending to resolve those types.
  const externalSlots = ast.statements.some(statement => statement.getText(ast).includes('defineSlots<') && /defineSlots<(?:Record|MenuLabelSlots)/.test(statement.getText(ast)));
  for (const slot of renderedSlots) if (!slotNames.has(slot) && !externalSlots) errors.push(`rendered slot ${slot} requires defineSlots`);
  // Named content contracts apply to both top-level props and collection item
  // fields. @slot documents an existing scoped/alias name. @vaporData is
  // reserved for inputs consumed as data rather than rendered children.
  function richType(type, seen = new Set()) {
    if (!type || seen.has(type)) return false; seen.add(type);
    if (type.kind === ts.SyntaxKind.UnknownKeyword) return true;
    if (ts.isParenthesizedTypeNode(type)) return richType(type.type, seen);
    if (ts.isUnionTypeNode(type)) return type.types.some(item => richType(item, seen));
    if (ts.isFunctionTypeNode(type)) return richType(type.type, seen);
    if (ts.isTypeReferenceNode(type)) {
      const name = type.typeName.getText(ast);
      if (vnodeTypes.has(name)) return true;
      if (['Partial', 'Record'].includes(name)) return type.typeArguments?.some(item => richType(item, seen)) ?? false;
      const declaration = declaredTypes.get(name);
      if (declaration && ts.isTypeAliasDeclaration(declaration)) return richType(declaration.type, seen);
    }
    return false;
  }
  const richNames = new Set();
  function contentVisit(node) {
    if (ts.isPropertySignature(node) && richType(node.type)) {
      const name = node.name.getText(ast).replace(/['"]/g, '');
      if (!ts.getJSDocTags(node).some(tag => tag.tagName.text === 'vaporData')) {
        richNames.add(name);
        const slotTag = ts.getJSDocTags(node).find(tag => tag.tagName.text === 'slot');
        const slot = slotTag?.comment?.trim() ?? name.replace(/[A-Z]/g, char => '-' + char.toLowerCase());
        if (!node.questionToken) errors.push(`rich content ${name} must be optional`);
        if (!slotNames.has(slot)) errors.push(`rich content ${name} requires slot ${slot}`);
        if (!renderedSlots.has(slot)) errors.push(`rich content ${name} requires rendered slot ${slot}`);
      }
    }
    if (!ts.isFunctionTypeNode(node)) ts.forEachChild(node, contentVisit);
  }
  for (const statement of ast.statements) if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) contentVisit(statement);
  function stringVisit(node) {
    if (ts.isCallExpression(node) && node.expression.getText() === 'String' && node.arguments[0]) {
      let unchecked = false;
      const check = child => {
        if (ts.isCallExpression(child) && child.expression.getText() === 'scalarContent') return;
        if (ts.isPropertyAccessExpression(child) && richNames.has(child.name.text)) unchecked = true;
        ts.forEachChild(child, check);
      };
      check(node.arguments[0]);
      if (unchecked) errors.push('rich content must be checked before String; use scalarContent on the original value');
    }
    ts.forEachChild(node, stringVisit);
  }
  [ast, ...templateExpressions].forEach(stringVisit);
  // Count real identifiers, never comment/string occurrences. Template refs
  // keep setup imports/bindings alive even when only used in markup.
  const references = new Map();
  function referenceVisit(node) {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && !(ts.isVariableDeclaration(node.parent) && node.parent.name === node))
      references.set(node.text, (references.get(node.text) ?? 0) + 1);
    ts.forEachChild(node, referenceVisit);
  }
  referenceVisit(ast);
  for (const statement of ast.statements) {
    if (ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === 'vue') {
      for (const entry of statement.importClause?.namedBindings?.elements ?? []) {
        if (!entry.isTypeOnly && !statement.importClause.isTypeOnly && !references.has(entry.name.text) && !templateIdentifiers.has(entry.name.text))
          errors.push(`unused Vue import: ${entry.name.text}`);
      }
    }
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
      const call = declaration.initializer;
      if (ts.isIdentifier(declaration.name) && call && ts.isCallExpression(call) && (attrsCalls.has(call.expression.getText(ast)) || slotsCalls.has(call.expression.getText(ast)))
        && !references.has(declaration.name.text) && !templateIdentifiers.has(declaration.name.text)) errors.push(`unused Vue binding: ${declaration.name.text}`);
    }
  }
  if (usesAttrs && !inheritFalse) errors.push('explicit attrs require defineOptions({ inheritAttrs: false })');
  const rejectsAttrs = ast.statements.some(node => ts.getJSDocTags(node).some(tag => tag.tagName.text === 'attrs' && /^none\b/.test(tag.comment ?? '')));
  if (inheritFalse && !forwardsAttrs && !rejectsAttrs) errors.push('unforwarded attrs; forward attrs or document intentional rejection with @attrs none');
  for (const event of events) {
    const callback = 'on' + event.replace(/(^|-)(\w)/g,(_,dash,c)=>c.toUpperCase());
    if (callbacks.has(callback)) errors.push(`double notification: ${callback} and emit('${event}')`);
  }
  return [...new Set(errors)];
}
