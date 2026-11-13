/**
 * Barrel parsing (spec section 6.2): the eight barrel files carry presence
 * and source-file resolution only — never editorial metadata (D4.2).
 *
 * Parsed with the TypeScript compiler API. Value exports map to their
 * module specifier; `export type` names are recorded separately and never
 * count as presence. `export *` re-exports resolve one filesystem level so
 * dataviz adapter surfaces are inventoried, not silently dropped.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import * as ts from "typescript";

// Public, deliberately separate component entrypoints: inventorying them must
// not pull their editor engine into the framework package's root runtime.
const COMPONENT_SUBPATHS = ["rich-text-editor", "presence-badge"] as const;

export function publicComponentBarrelPaths(packageDir: string): string[] {
  const root = [join(packageDir, "src", "index.ts"), join(packageDir, "src", "lib", "index.ts")]
    .find((candidate) => existsSync(candidate));
  if (root === undefined) throw new Error(`${packageDir}: no component barrel`);
  const manifestPath = join(packageDir, "package.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8")) as { exports?: Record<string, unknown> }
    : {};
  const paths = [root];
  for (const subpath of COMPONENT_SUBPATHS) {
    if (manifest.exports?.[`./${subpath}`] === undefined) continue;
    const barrel = join(dirname(root), subpath, "index.ts");
    if (!existsSync(barrel)) throw new Error(`${packageDir}: public ./${subpath} has no source barrel`);
    paths.push(barrel);
  }
  return paths;
}

/** Merge public subpath presence, retaining root-relative source specifiers. */
export function parseComponentBarrels(packageDir: string): ParsedBarrel {
  const [root, ...subpaths] = publicComponentBarrelPaths(packageDir);
  const parsed = parseBarrelFile(root!);
  for (const path of subpaths) {
    const nested = parseBarrelFile(path);
    assertNoEditorialMetadata(nested, path);
    for (const [name, specifier] of nested.values) {
      if (name === "default" || parsed.values.has(name)) continue;
      const rebased = specifier === null ? null : relative(dirname(root!), join(dirname(path), specifier)).split("\\").join("/");
      parsed.values.set(name, rebased === null || rebased.startsWith(".") ? rebased : `./${rebased}`);
    }
    for (const name of nested.types) parsed.types.add(name);
  }
  return parsed;
}

export interface BarrelExports {
  /** Exported value name -> module specifier (null for locals). */
  values: Map<string, string | null>;
  /** Type-only export names (never presence, never metadata). */
  types: Set<string>;
}

export interface ParsedBarrel extends BarrelExports {
  /** Star specifiers merged during file parsing (audit trail). */
  stars: string[];
}

/** Editorial keys that must never appear as barrel value exports (D4.2). */
const EDITORIAL_KEYS = ["category", "status", "groupSlug", "description"];

function recordNamed(
  clause: ts.NamedExports,
  moduleSpecifier: string | null,
  values: Map<string, string | null>,
  types: Set<string>,
  importedModules: Map<string, string>,
): void {
  for (const element of clause.elements) {
    const exported = element.name.text;
    if (element.isTypeOnly) {
      types.add(exported);
      continue;
    }
    if (values.has(exported)) continue;
    values.set(exported, moduleSpecifier ?? importedModules.get(element.propertyName?.text ?? exported) ?? null);
  }
}

function hasExportModifier(statement: ts.Statement): boolean {
  const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
  return modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function addBindingName(name: ts.BindingName, values: Map<string, string | null>): void {
  if (ts.isIdentifier(name)) {
    if (!values.has(name.text)) values.set(name.text, null);
    return;
  }
  for (const element of name.elements) {
    if (ts.isOmittedExpression(element)) continue;
    addBindingName(element.name, values);
  }
}

/** Parse barrel exports from source text (fileName labels errors). */
export function parseBarrelText(sourceText: string, fileName: string): ParsedBarrel {
  // Barrels are TypeScript index files; component sources are resolved by
  // module specifier, never parsed here.
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const values = new Map<string, string | null>();
  const types = new Set<string>();
  const stars: string[] = [];
  const importedModules = new Map<string, string>();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.importClause?.isTypeOnly) continue;
    const clause = statement.importClause;
    if (clause?.name) importedModules.set(clause.name.text, statement.moduleSpecifier.text);
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if (!element.isTypeOnly) importedModules.set(element.name.text, statement.moduleSpecifier.text);
      }
    }
  }
  for (const statement of source.statements) {
    // D4.2: an exported variable/function/class statement also declares a
    // barrel export (for example `export const category = …`). Record it so
    // the editorial-metadata guard flags it.
    if (ts.isVariableStatement(statement)) {
      if (hasExportModifier(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          addBindingName(declaration.name, values);
        }
      }
      continue;
    }
    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      if (hasExportModifier(statement) && statement.name !== undefined) {
        if (!values.has(statement.name.text)) values.set(statement.name.text, null);
      }
      continue;
    }
    // K1b section 11: enum, namespace/module, interface and type-alias
    // declarations are type-side surface (props-type carriers the extractor
    // must not mistake for components). Recorded in `types`, never in
    // `values` (never presence, never editorial metadata).
    if (
      ts.isEnumDeclaration(statement) ||
      ts.isModuleDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      if (hasExportModifier(statement) && statement.name !== undefined && ts.isIdentifier(statement.name)) {
        types.add(statement.name.text);
      }
      continue;
    }
    if (!ts.isExportDeclaration(statement)) continue;
    const specifier =
      statement.moduleSpecifier !== undefined && ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : null;
    if (statement.exportClause === undefined) {
      // `export * from "..."`: recorded, resolved by parseBarrelFile.
      if (specifier !== null) stars.push(specifier);
      continue;
    }
    if (ts.isNamespaceExport(statement.exportClause)) continue;
    if (statement.isTypeOnly) {
      for (const element of statement.exportClause.elements) types.add(element.name.text);
      continue;
    }
    recordNamed(statement.exportClause, specifier, values, types, importedModules);
  }
  return { values, types, stars };
}

/**
 * Parse a committed barrel file, resolving relative star re-exports.
 *
 * K1b section 11: a star specifier in one of the eight barrel files that is
 * not relative fails generation (a bare `export *` would silently drop
 * surface the baseline cannot pin). Nested files keep the K1a leniency —
 * their bare stars (for example the dataviz `adapter.ts` re-export of an
 * external package) are recorded but not followed — so the depth flag guards
 * only the barrel the generator was asked to parse.
 */
export function parseBarrelFile(
  barrelPath: string,
  visited: Set<string> = new Set(),
  depth: number = 0,
): ParsedBarrel {
  if (visited.has(barrelPath)) return { values: new Map(), types: new Set(), stars: [] };
  visited.add(barrelPath);
  const parsed = parseBarrelText(readFileSync(barrelPath, "utf8"), barrelPath);
  const dir = dirname(barrelPath);
  for (const star of parsed.stars) {
    if (!star.startsWith(".")) {
      if (depth === 0) {
        throw new Error(
          `${barrelPath}: non-relative star re-export "${star}" fails generation (K1b section 11)`,
        );
      }
      continue;
    }
    const target = resolveModuleFile(dir, star);
    if (target === null) {
      throw new Error(`${barrelPath}: cannot resolve star re-export "${star}"`);
    }
    const nested = parseBarrelFile(target, visited, depth + 1);
    for (const [name, specifier] of nested.values) {
      if (!parsed.values.has(name)) parsed.values.set(name, specifier);
    }
    for (const name of nested.types) parsed.types.add(name);
  }
  return parsed;
}

/** Resolve a relative module specifier to an existing file (null if none). */
export function resolveModuleFile(fromDir: string, specifier: string): string | null {
  const direct = join(fromDir, specifier);
  if (specifier.endsWith(".svelte") || specifier.endsWith(".vue") || specifier.endsWith(".ts") || specifier.endsWith(".tsx")) {
    return existsSync(direct) ? direct : null;
  }
  const stem = specifier.endsWith(".js") ? specifier.slice(0, -3) : specifier;
  const candidates = [`${stem}.tsx`, `${stem}.ts`, `${stem}.svelte`]
    .map((candidate) => join(fromDir, candidate))
    .filter((candidate) => existsSync(candidate) && !candidate.includes(".test."));
  if (candidates.length > 1) {
    throw new Error(`resolveModuleFile: ambiguous "${specifier}" in ${fromDir}`);
  }
  return candidates[0] ?? null;
}

/**
 * Map a barrel value export to its committed source file, repo-relative
 * with posix separators. Unresolved exports fail — never a guessed path.
 */
export function resolveSourceFile(
  barrelPath: string,
  exportName: string,
  specifier: string | null,
  repoRoot: string,
): string {
  if (specifier === null) {
    throw new Error(`${barrelPath}: export "${exportName}" has no module specifier`);
  }
  const target = resolveModuleFile(dirname(barrelPath), specifier);
  if (target === null) {
    throw new Error(`${barrelPath}: export "${exportName}" resolves to no committed file ("${specifier}")`);
  }
  return relative(repoRoot, target).split("\\").join("/");
}

/** D4.2 guard: barrels carry no editorial metadata keys as values. */
export function assertNoEditorialMetadata(exports: BarrelExports, barrelPath: string): void {
  for (const key of EDITORIAL_KEYS) {
    if (exports.values.has(key)) {
      throw new Error(`${barrelPath}: editorial key "${key}" exported as data (D4.2)`);
    }
  }
}
