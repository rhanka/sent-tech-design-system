import * as ts from "typescript";

/**
 * Declaration program loading (spec 6.1 step 3). One ts.Program over the
 * built `.d.ts` files; all analysis uses the type checker. No network, no
 * type acquisition, no declaration-text regex for types.
 */
export interface LoadedProgram {
  program: ts.Program;
  checker: ts.TypeChecker;
}

/** Load one checker over the given absolute declaration files. */
export function loadDeclarationProgram(absoluteFiles: string[]): LoadedProgram {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    // strictNullChecks is load-bearing: without it `X | null` and `x?`
    // unions collapse and optionality/nullability read wrong. The remaining
    // strict flags stay off; diagnostics are never reported.
    strictNullChecks: true,
    noEmit: true,
    types: [],
  };
  const program = ts.createProgram(absoluteFiles, options);
  return { program, checker: program.getTypeChecker() };
}

/**
 * Find a named type (alias or interface) in one declaration file and return
 * its checker type. Looks at module-local statements only; follows no
 * re-export (that is resolve.ts).
 */
export function getFixtureType(
  loaded: LoadedProgram,
  absoluteFile: string,
  name: string,
): ts.Type {
  const source = loaded.program.getSourceFile(absoluteFile);
  if (source === undefined) throw new Error(`loader: file not in program: ${absoluteFile}`);
  for (const statement of source.statements) {
    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
      return loaded.checker.getTypeFromTypeNode(statement.type);
    }
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === name) {
      const symbol = loaded.checker.getSymbolAtLocation(statement.name);
      if (symbol === undefined) throw new Error(`loader: no symbol for interface "${name}"`);
      return loaded.checker.getDeclaredTypeOfSymbol(symbol);
    }
  }
  throw new Error(`loader: type "${name}" not found in ${absoluteFile}`);
}
