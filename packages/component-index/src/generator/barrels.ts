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
): void {
  for (const element of clause.elements) {
    const exported = element.name.text;
    if (element.isTypeOnly) {
      types.add(exported);
      continue;
    }
    if (values.has(exported)) continue;
    values.set(exported, moduleSpecifier);
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
  for (const statement of source.statements) {
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
    recordNamed(statement.exportClause, specifier, values, types);
  }
  return { values, types, stars };
}

/** Parse a committed barrel file, resolving relative star re-exports. */
export function parseBarrelFile(barrelPath: string, visited: Set<string> = new Set()): ParsedBarrel {
  if (visited.has(barrelPath)) return { values: new Map(), types: new Set(), stars: [] };
  visited.add(barrelPath);
  const parsed = parseBarrelText(readFileSync(barrelPath, "utf8"), barrelPath);
  const dir = dirname(barrelPath);
  for (const star of parsed.stars) {
    if (!star.startsWith(".")) continue;
    const target = resolveModuleFile(dir, star);
    if (target === null) {
      throw new Error(`${barrelPath}: cannot resolve star re-export "${star}"`);
    }
    const nested = parseBarrelFile(target, visited);
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
  if (specifier.endsWith(".svelte") || specifier.endsWith(".ts") || specifier.endsWith(".tsx")) {
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
