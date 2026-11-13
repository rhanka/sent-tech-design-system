import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as ts from "typescript";
import { publicComponentBarrelPaths } from "../barrels.js";

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
    match: /^packages\/components-vue\/src\/(.+)\.vue$/,
    replace: (stem) => `packages/components-vue/dist/${stem}.vue.d.ts`,
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
    match: /^packages\/dataviz-vue\/src\/(.+)\.vue$/,
    replace: (stem) => `packages/dataviz-vue/dist/${stem}.vue.d.ts`,
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
  const source = program.getSourceFile(startAbsoluteFile);
  if (source === undefined) return null;
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(source);
  if (module === undefined) return null;
  const exported = checker.getExportsOfModule(module).find(symbol => symbol.name === symbolName);
  if (exported === undefined) return null;
  const target = (exported.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(exported) : exported;
  return target.declarations?.[0]?.getSourceFile().fileName ?? null;
}

const fileCache = new Map<string, ts.SourceFile>();

function moduleSpecifierText(statement: ts.ExportDeclaration): string | null {
  return statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : null;
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
  const barrels = publicComponentBarrelPaths(packageDir);
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
    const imports = new Map<string, { specifier: string; name: string }>();
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.importClause?.isTypeOnly) continue;
      const clause = statement.importClause;
      if (clause?.name) imports.set(clause.name.text, { specifier: statement.moduleSpecifier.text, name: clause.name.text });
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          if (!element.isTypeOnly) imports.set(element.name.text, { specifier: statement.moduleSpecifier.text, name: element.propertyName?.text ?? element.name.text });
        }
      }
    }
    for (const statement of source.statements) {
      if (!ts.isExportDeclaration(statement)) continue;
      // Type-only re-exports (`export type { XProps }`) name types, not
      // the component value; only value exports elect the identifier.
      if (statement.isTypeOnly) continue;
      const specifier = moduleSpecifierText(statement);
      if (specifier === null) {
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) {
            if (element.isTypeOnly) continue;
            const imported = imports.get(element.propertyName?.text ?? element.name.text);
            if (imported === undefined || !imported.specifier.startsWith(".")) continue;
            const resolved = resolveSourceSpecifierText(dir, imported.specifier);
            if (resolved?.replace(/\\/g, "/") === wanted && !collected.includes(imported.name)) collected.push(imported.name);
          }
        }
        continue;
      }
      if (!specifier.startsWith(".")) continue;
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
  for (const barrel of barrels) visit(barrel, 0);
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
