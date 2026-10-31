/**
 * The four-framework parity guard (§5.1): for each catalogued component, the
 * names and JSON types of the catalogued props are compared against the
 * public props types of the React, Vue and Angular packages. A mismatch
 * FAILS generation (the stronger arm of §5.1); the outcome is recorded in
 * `x-sentropic.parity` either way.
 *
 * React's `BarChartProps` intersects `React.HTMLAttributes<HTMLDivElement>`,
 * so the guard first derives that DOM passthrough base mechanically (via the
 * committed bridge `packages/elements/parity/react-html-attributes.ts`) and
 * subtracts it: what remains must be the component's own members. The style
 * hook is `class` everywhere except React, where the same hook is `className`
 * — the alias is applied before the exclusion list is enforced.
 */

import { createGenerator, type Config } from "ts-json-schema-generator";

import type { ContractModule, FrameworkName } from "../contracts/types.js";
import { canonicalize, type Json } from "./canonical.js";

export interface PropDrop {
  readonly prop: string;
  readonly members: readonly string[];
}

export interface CompareOptions {
  /** Props the contract excludes (callbacks, style hook), by source name. */
  readonly excluded: readonly { readonly prop: string }[];
  /** Declared narrowing drops, e.g. dataLabels.format. */
  readonly drops: readonly PropDrop[];
  /** Top-level required props of the catalogued contract (compared too). */
  readonly catalogRequired: readonly string[];
  /** Top-level required props of the framework adapter, unfiltered. */
  readonly frameworkRequired: readonly string[];
}

export interface CompareResult {
  readonly status: "match" | "mismatch";
  readonly differences: readonly string[];
}

/** Annotation-only keywords never participate in parity. */
const ANNOTATION_KEYS = new Set(["description", "$comment", "title", "default", "examples", "$schema", "definitions"]);

function structuralSignature(node: Json): Json {
  if (Array.isArray(node)) return node.map((element) => structuralSignature(element));
  if (node !== null && typeof node === "object") {
    const stripped: { [key: string]: Json } = {};
    for (const [key, value] of Object.entries(node)) {
      if (ANNOTATION_KEYS.has(key)) continue;
      stripped[key] = structuralSignature(value as Json);
    }
    return canonicalize(stripped);
  }
  return node;
}

function deleteMembers(node: Json, members: readonly string[]): Json {
  if (Array.isArray(node)) return node.map((child) => deleteMembers(child, members));
  if (node !== null && typeof node === "object") {
    const copy: { [key: string]: Json } = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "properties" && value !== null && typeof value === "object" && !Array.isArray(value)) {
        const properties: { [key: string]: Json } = {};
        for (const [name, schema] of Object.entries(value as { [key: string]: Json })) {
          if (!members.includes(name)) properties[name] = schema;
        }
        copy[key] = properties;
        continue;
      }
      if (key === "required" && Array.isArray(value)) {
        copy[key] = value.filter((name): name is string => typeof name === "string" && !members.includes(name));
        continue;
      }
      copy[key] = deleteMembers(value as Json, members);
    }
    return copy;
  }
  return node;
}

/** The guard's comparison rule, exported for its unit tests. */
export function compareJsonProps(
  catalogProps: Record<string, Json>,
  frameworkPropsInput: Record<string, Json>,
  options: CompareOptions,
): CompareResult {
  const differences: string[] = [];
  const frameworkProps: Record<string, Json> = { ...frameworkPropsInput };

  for (const drop of options.drops) {
    const target = frameworkProps[drop.prop];
    if (target === undefined) {
      differences.push(`declared drop has no framework prop: ${drop.prop}`);
      continue;
    }
    frameworkProps[drop.prop] = deleteMembers(target, drop.members);
  }

  for (const excluded of options.excluded) {
    if (!(excluded.prop in frameworkProps)) {
      differences.push(`excluded prop no longer present in framework: ${excluded.prop}`);
      continue;
    }
    delete frameworkProps[excluded.prop];
  }

  const catalogNames = Object.keys(catalogProps).sort();
  const frameworkNames = Object.keys(frameworkProps).sort();
  for (const name of catalogNames) {
    if (!(name in frameworkProps)) differences.push(`missing in framework: ${name}`);
  }
  for (const name of frameworkNames) {
    if (!(name in catalogProps)) differences.push(`not catalogued, not excluded: ${name}`);
  }

  // Required-ness of the SHARED props is compared too: a prop required in
  // the catalogue but optional in a framework adapter (or the reverse) is
  // a drift even when the prop's JSON type matches. The framework set is
  // filtered by membership in the post-exclusion surface, so excluded and
  // dropped-away props do not count.
  const frameworkRequired = new Set(options.frameworkRequired.filter((name) => name in frameworkProps));

  for (const name of catalogNames) {
    if (!(name in frameworkProps)) continue;
    const left = JSON.stringify(structuralSignature(catalogProps[name] as Json));
    const right = JSON.stringify(structuralSignature(frameworkProps[name] as Json));
    if (left !== right) {
      differences.push(`${name}: catalog ${left} != framework ${right}`);
    }
    const requiredInCatalog = options.catalogRequired.includes(name);
    const requiredInFramework = frameworkRequired.has(name);
    if (requiredInCatalog !== requiredInFramework) {
      differences.push(
        `${name}: required in ${requiredInCatalog ? "catalog" : "framework"} but optional in ${
          requiredInCatalog ? "framework" : "catalog"
        }`,
      );
    }
  }

  return { status: differences.length === 0 ? "match" : "mismatch", differences };
}

/** Generation settings per compared framework (paths are workspace-relative). */
const FRAMEWORK_CONFIG: Record<Exclude<FrameworkName, "svelte">, { tsconfig: string; skipTypeCheck: boolean; styleHook: string }> = {
  react: { tsconfig: "packages/components-react/tsconfig.json", skipTypeCheck: true, styleHook: "className" },
  vue: { tsconfig: "packages/components-vue/tsconfig.json", skipTypeCheck: false, styleHook: "class" },
  angular: { tsconfig: "packages/components-angular/tsconfig.json", skipTypeCheck: false, styleHook: "class" },
};

const REACT_BASE_BRIDGE = "packages/elements/parity/react-html-attributes.ts";

interface GenerationInput {
  readonly path: string;
  readonly type: string;
  readonly tsconfig: string;
  readonly skipTypeCheck: boolean;
}

function generateSchema(input: GenerationInput): Json {
  const config: Config = {
    path: input.path,
    type: input.type,
    tsconfig: input.tsconfig,
    expose: "none",
    topRef: false,
    jsDoc: "none",
    skipTypeCheck: input.skipTypeCheck,
    functions: "comment",
  };
  return createGenerator(config).createSchema(input.type) as unknown as Json;
}

function propertiesOf(schema: Json): Record<string, Json> {
  if (schema !== null && typeof schema === "object" && !Array.isArray(schema)) {
    const properties = (schema as { [key: string]: Json }).properties;
    if (properties !== null && typeof properties === "object" && !Array.isArray(properties)) {
      return properties as { [key: string]: Json };
    }
  }
  return {};
}

function requiredOf(schema: Json): readonly string[] {
  if (schema !== null && typeof schema === "object" && !Array.isArray(schema)) {
    const required = (schema as { [key: string]: Json }).required;
    if (Array.isArray(required)) {
      return required.filter((name): name is string => typeof name === "string");
    }
  }
  return [];
}

/** The `x-sentropic.parity` row for one framework. */
export interface ParityRow {
  readonly status: "match" | "mismatch" | "source-of-truth" | "no-counterpart";
  readonly file: string;
  readonly type?: string;
  readonly comparedProps?: number;
  readonly note?: string;
  readonly differences?: readonly string[];
}

/**
 * Runs the whole guard for one contract module against the committed catalog
 * entry's props (names, JSON types AND required-ness), and returns the
 * `x-sentropic.parity` rows. Throws on any mismatch (§5.1: the guard fails)
 * or on a stale contract declaration.
 */
export function runParityGuard(
  contract: ContractModule,
  catalogProps: Record<string, Json>,
  catalogRequired: readonly string[],
  repoRoot: string,
): Record<string, ParityRow> {
  const rows: Record<string, ParityRow> = {};

  for (const source of contract.frameworks) {
    if (source.role === "source-of-truth") {
      rows[source.framework] = {
        status: "source-of-truth",
        file: source.file,
        type: source.typeName,
        note: source.note ?? "Reference pilot (§3.1); the catalogue is derived from it.",
      };
      continue;
    }

    const frameworkPath = `${repoRoot}/${source.file}`;
    if (source.role === "no-counterpart") {
      rows[source.framework] = {
        status: "no-counterpart",
        file: source.file,
        note: "No counterpart in this framework package (§5.1: components with no framework counterpart record that fact).",
      };
      continue;
    }

    const config = FRAMEWORK_CONFIG[source.framework as Exclude<FrameworkName, "svelte">];
    const schema = generateSchema({
      path: frameworkPath,
      type: source.typeName,
      tsconfig: `${repoRoot}/${config.tsconfig}`,
      skipTypeCheck: config.skipTypeCheck,
    });
    let frameworkProps = propertiesOf(schema);

    if (source.framework === "react") {
      // Subtract the DOM passthrough base; className and onSelect are Omit'd
      // from the base and re-added by the own block, so they survive.
      const base = propertiesOf(
        generateSchema({
          path: `${repoRoot}/${REACT_BASE_BRIDGE}`,
          type: "DivHTMLAttributes",
          tsconfig: `${repoRoot}/${config.tsconfig}`,
          skipTypeCheck: true,
        }),
      );
      const baseNames = new Set(Object.keys(base));
      frameworkProps = Object.fromEntries(
        Object.entries(frameworkProps).filter(([name]) => !(baseNames.has(name) && name !== "className" && name !== "onSelect")),
      );
    }

    const excluded = contract.excluded.map((entry) => ({
      prop: entry.prop === "class" && config.styleHook === "className" ? "className" : entry.prop,
    }));
    const drops = contract.narrowedUnions.map((entry) => ({ prop: entry.prop, members: entry.dropped }));
    const result = compareJsonProps(catalogProps, frameworkProps, {
      excluded,
      drops,
      catalogRequired,
      frameworkRequired: requiredOf(schema),
    });

    rows[source.framework] = {
      status: result.status,
      file: source.file,
      type: source.typeName,
      comparedProps: Object.keys(catalogProps).length,
      ...(source.framework === "react"
        ? {
            note: "Own members after subtracting React.HTMLAttributes<HTMLDivElement>; className is React's name for the class style hook.",
          }
        : {}),
      ...(result.status === "mismatch" ? { differences: result.differences } : {}),
    };

    if (result.status === "mismatch") {
      throw new Error(
        `parity guard: ${contract.component} differs from ${source.framework} ${source.typeName}:\n` +
          result.differences.map((difference) => `  - ${difference}`).join("\n"),
      );
    }
  }

  return rows;
}
