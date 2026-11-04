import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as ts from "typescript";

/**
 * Declaration file resolution (spec 6.1 step 2): committed source file to
 * built declaration file by package build layout, with re-export chains
 * inside declaration files followed. An unresolved chain is a generator
 * error, never a guessed path.
 */

const DECL_CANDIDATES: { match: RegExp; replace: (stem: string) => string }[] = [
  {
    match: /^packages\/components-svelte\/src\/lib\/(.+)\.svelte$/,
    replace: (stem) => `packages/components-svelte/dist/${stem}.svelte.d.ts`,
  },
  {
    match: /^packages\/dataviz-svelte\/src\/lib\/(.+)\.svelte$/,
    replace: (stem) => `packages/dataviz-svelte/dist/lib/${stem}.svelte.d.ts`,
  },
  {
    match: /^packages\/components-react\/src\/(.+)\.tsx$/,
    replace: (stem) => `packages/components-react/dist/${stem}.d.ts`,
  },
  {
    match: /^packages\/components-vue\/src\/(.+)\.ts$/,
    replace: (stem) => `packages/components-vue/dist/${stem}.d.ts`,
  },
  {
    match: /^packages\/components-angular\/src\/(.+)\.ts$/,
    replace: (stem) => `packages/components-angular/dist/${stem}.d.ts`,
  },
  {
    match: /^packages\/dataviz-react\/src\/(.+)\.(ts|tsx)$/,
    replace: (stem) => `packages/dataviz-react/dist/${stem}.d.ts`,
  },
  {
    match: /^packages\/dataviz-vue\/src\/(.+)\.ts$/,
    replace: (stem) => `packages/dataviz-vue/dist/${stem}.d.ts`,
  },
  {
    match: /^packages\/dataviz-angular\/src\/(.+)\.ts$/,
    replace: (stem) => `packages/dataviz-angular/dist/${stem}.d.ts`,
  },
  {
    match: /^packages\/dataviz-svelte\/src\/(.+)\.ts$/,
    replace: (stem) => `packages/dataviz-svelte/dist/${stem}.d.ts`,
  },
];

/** Map a repo-relative source path to its repo-relative declaration path (null when no rule). */
export function declarationPathForSource(sourceRepoPath: string): string | null {
  for (const candidate of DECL_CANDIDATES) {
    const found = candidate.match.exec(sourceRepoPath);
    if (found !== null && found[1] !== undefined) {
      return candidate.replace(found[1]);
    }
  }
  return null;
}

/**
 * Follow `export ... from` chains in declaration files to the file that
 * declares `symbolName`. Returns the absolute file path, or null when the
 * chain cannot be resolved (the caller throws the loud failure).
 */
export function followExportChain(
  program: ts.Program,
  startAbsoluteFile: string,
  symbolName: string,
): string | null {
  const visited = new Set<string>();
  let current: string | null = startAbsoluteFile;
  while (current !== null) {
    if (visited.has(current)) return null;
    visited.add(current);
    const source = program.getSourceFile(current);
    if (source === undefined) return null;
    if (declaresSymbol(source, symbolName)) return current;
    current = followOneLevel(source, current, symbolName);
  }
  return null;
}

function declaresSymbol(source: ts.SourceFile, symbolName: string): boolean {
  for (const statement of source.statements) {
    if (
      (ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isFunctionDeclaration(statement) ||
        ts.isVariableStatement(statement) ||
        ts.isModuleDeclaration(statement)) &&
      named(statement)?.text === symbolName
    ) {
      return true;
    }
  }
  return false;
}

function named(statement: ts.Statement): ts.Identifier | undefined {
  if ("name" in statement) {
    const name = (statement as { name?: unknown }).name;
    if (name !== undefined && ts.isIdentifier(name as ts.Node)) return name as ts.Identifier;
  }
  return undefined;
}

function followOneLevel(
  source: ts.SourceFile,
  currentAbsoluteFile: string,
  symbolName: string,
): string | null {
  const dir = dirname(currentAbsoluteFile);
  for (const statement of source.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    if (statement.exportClause === undefined) {
      // `export * from`: only follows when the target declares the symbol.
      const specifier = moduleSpecifierText(statement);
      if (specifier === null || !specifier.startsWith(".")) continue;
      const resolved = resolveDeclSpecifierText(dir, specifier);
      if (resolved !== null && declaresSymbolInFile(resolved, symbolName)) return resolved;
      continue;
    }
    if (ts.isNamespaceExport(statement.exportClause)) continue;
    const matches = statement.exportClause.elements.some((element) => element.name.text === symbolName);
    if (!matches) continue;
    const specifier = moduleSpecifierText(statement);
    if (specifier === null) return currentAbsoluteFile;
    if (!specifier.startsWith(".")) return null;
    return resolveDeclSpecifierText(dir, specifier);
  }
  return null;
}

function moduleSpecifierText(statement: ts.ExportDeclaration): string | null {
  if (statement.moduleSpecifier !== undefined && ts.isStringLiteral(statement.moduleSpecifier)) {
    return statement.moduleSpecifier.text;
  }
  return null;
}

const fileCache = new Map<string, ts.SourceFile>();

function declaresSymbolInFile(absoluteFile: string, symbolName: string): boolean {
  let source = fileCache.get(absoluteFile);
  if (source === undefined) {
    // Cheap parse for the chain probe; the program owns type truth.
    source = ts.createSourceFile(absoluteFile, readFileSync(absoluteFile, "utf8"), ts.ScriptTarget.Latest, true);
    fileCache.set(absoluteFile, source);
  }
  return declaresSymbol(source, symbolName);
}

function resolveDeclSpecifierText(fromDir: string, specifier: string): string | null {
  const stem = specifier.endsWith(".js") ? specifier.slice(0, -3) : specifier;
  for (const extension of [".d.ts", ".svelte.d.ts"]) {
    const candidate = join(fromDir, `${stem}${extension}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Barrel name recovery (spec 6.1 resolution input): in the package root
 * barrel, collect every component value-export name re-exported from the
 * delivery source file (`export { default as X }`, `export { X }`,
 * `export { X as Y }` — the last contributes the declaration-side X).
 * Only export names and module paths are read; component type structure is
 * never read from sources. The componentId picks among the candidates:
 * its PascalCase form wins when exported from the file, else a single
 * candidate wins. Null means not exported (empty) or ambiguous (several):
 * the caller fails loudly, never guesses.
 */
export function barrelNamesForSource(
  packageDir: string,
  sourceRepoPath: string,
  componentId: string,
): string | null {
  const barrelAbs =
    [join(packageDir, "src", "index.ts"), join(packageDir, "src", "lib", "index.ts")].find((candidate) =>
      existsSync(candidate),
    ) ?? null;
  if (barrelAbs === null) return null;
  const repoRoot = join(packageDir, "..", "..");
  const wanted = join(repoRoot, sourceRepoPath).replace(/\\/g, "/");
  const collected: string[] = [];
  const visit = (barrelFile: string, depth: number): void => {
    if (depth > 3) return;
    let source: ts.SourceFile | undefined = fileCache.get(barrelFile);
    if (source === undefined) {
      source = ts.createSourceFile(barrelFile, readFileSync(barrelFile, "utf8"), ts.ScriptTarget.Latest, true);
      fileCache.set(barrelFile, source);
    }
    const dir = dirname(barrelFile);
    for (const statement of source.statements) {
      if (!ts.isExportDeclaration(statement)) continue;
      // Type-only re-exports (`export type { XProps }`) name types, not
      // the component value; only value exports elect the identifier.
      if (statement.isTypeOnly) continue;
      const specifier = moduleSpecifierText(statement);
      if (specifier === null || !specifier.startsWith(".")) continue;
      const resolved = resolveSourceSpecifierText(dir, specifier);
      if (statement.exportClause === undefined) {
        // `export * from`: recurse into barrel-like targets.
        if (resolved !== null && resolved.endsWith("index.ts")) visit(resolved, depth + 1);
        continue;
      }
      if (ts.isNamespaceExport(statement.exportClause)) continue;
      if (resolved === null || resolved.replace(/\\/g, "/") !== wanted) continue;
      for (const element of statement.exportClause.elements) {
        const propertyName = element.propertyName?.text;
        const sourceSide = propertyName === undefined || propertyName === "default" ? element.name.text : propertyName;
        if (sourceSide !== "default" && !collected.includes(sourceSide)) collected.push(sourceSide);
      }
    }
  };
  visit(barrelAbs, 0);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(componentId)) return null;
  const pascal = componentId
    .split("-")
    .map((part) => (part.length === 0 ? "" : part[0]!.toUpperCase() + part.slice(1)))
    .join("");
  if (collected.includes(pascal)) return pascal;
  if (collected.length === 1) return collected[0] as string;
  return null;
}

function resolveSourceSpecifierText(fromDir: string, specifier: string): string | null {
  const stem = specifier.endsWith(".js") ? specifier.slice(0, -3) : specifier;
  const candidates = [stem, `${stem}.svelte`, `${stem}.tsx`, `${stem}.ts`, `${stem}.vue`, `${stem}/index.ts`];
  for (const candidate of candidates) {
    const absolute = join(fromDir, candidate);
    if (existsSync(absolute)) return absolute;
  }
  return null;
}
