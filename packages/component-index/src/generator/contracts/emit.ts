import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";

import { contractDigest, contractsRevision } from "../digest.js";
import { loadDeclarationProgram, type LoadedProgram } from "./loader.js";
import { barrelNamesForSource, declarationPathForSource, followExportChain } from "./resolve.js";
import { extractSvelte } from "./svelte.js";
import { extractReact } from "./react.js";
import { extractVue } from "./vue.js";
import { extractAngular } from "./angular.js";
import { ABSENT_LIMITATION } from "./types.js";
import type { Completeness, FrameworkBody, FrameworkInput } from "./types.js";
import { PRODUCER_ID, type Framework } from "../constants.js";

/**
 * Derived-contract emission (spec sections 5, 8, 9). One
 * component-contract/v1 document per K1a population entry plus the
 * component-contract-index/v1. GEN-C4 is enforced here: contractSource is
 * always "derived", a complete cell never carries a loss, every cell carries
 * its limitations.
 */

export interface BaselineCell {
  status: Completeness;
  reason?: string;
  props?: string[];
  slots?: string[];
  events?: string[];
  bindable?: string[];
}

export interface ContractBaseline {
  version: number;
  components: Record<string, Partial<Record<Framework, BaselineCell>>>;
}

export function loadContractBaseline(packageDir: string): ContractBaseline {
  const path = join(packageDir, "contract-baseline.json");
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`emit: cannot read contract-baseline.json: ${(error as Error).message}`);
  }
  const baseline = parsed as Partial<ContractBaseline>;
  if (baseline.version !== 1 || typeof baseline.components !== "object" || baseline.components === null) {
    throw new Error("emit: contract-baseline.json must be the versioned K1b expectations (version: 1)");
  }
  return baseline as ContractBaseline;
}

/** Baseline deviation fails loudly, naming the component and framework. */
export function checkBaselineCell(
  componentId: string,
  framework: Framework,
  body: FrameworkBody,
  expected: BaselineCell,
): void {
  if (body.status !== expected.status) {
    throw new Error(
      `emit: contract baseline deviation for "${componentId}" (${framework}): ` +
        `extracted ${body.status}, baseline expects ${expected.status}`,
    );
  }
  for (const [kind, actual] of [
    ["props", body.props === undefined ? [] : Object.keys(body.props["properties"] ?? {})],
    ["slots", body.slots.map((slot) => slot.name)],
    ["events", body.events.map((event) => event.name)],
    ["bindable", body.bindable],
  ] as const) {
    const wanted = expected[kind];
    if (wanted !== undefined && JSON.stringify([...actual].sort()) !== JSON.stringify([...wanted].sort())) {
      throw new Error(
        `emit: contract baseline deviation for "${componentId}" (${framework} ${kind}): ` +
          `extracted [${[...actual].sort().join(", ")}], baseline expects [${[...wanted].sort().join(", ")}]`,
      );
    }
  }
}

export interface AssembledContract {
  document: Record<string, unknown>;
  digest: string;
}

export function assembleContractDocument(args: {
  componentId: string;
  entryDigest: string;
  frameworks: Record<Framework, FrameworkBody>;
}): AssembledContract {
  for (const framework of ["svelte", "react", "vue", "angular"] as const) {
    const body = args.frameworks[framework] as FrameworkBody;
    // GEN-C4: every cell carries its limitations; complete never hides a loss.
    if (body.limitations.length === 0) {
      throw new Error(`emit: "${args.componentId}" (${framework}) omits limitations (GEN-C4)`);
    }
    const losses = body.dropped.length + body.replaced.length + body.unresolved.length;
    if (body.status === "complete" && losses > 0) {
      throw new Error(`emit: "${args.componentId}" (${framework}) is complete with a non-empty loss list (GEN-C4)`);
    }
    if (body.status === "none") {
      if (body.reason === undefined || body.reason.length === 0) {
        throw new Error(`emit: "${args.componentId}" (${framework}) none without a reason (GEN-C1)`);
      }
      if (body.props !== undefined) {
        throw new Error(`emit: "${args.componentId}" (${framework}) none must not carry props (GEN-C1)`);
      }
    }
  }
  const digestless = {
    format: "component-contract/v1",
    producerId: PRODUCER_ID,
    componentId: args.componentId,
    entryDigest: args.entryDigest,
    // The DS generator profile emits only derived (the schema keeps the
    // published|derived vocabulary; see tests/contracts/schemas.test.ts).
    contractSource: "derived",
    frameworks: {
      svelte: finalizeCell(args.frameworks.svelte),
      react: finalizeCell(args.frameworks.react),
      vue: finalizeCell(args.frameworks.vue),
      angular: finalizeCell(args.frameworks.angular),
    },
  };
  const digest = contractDigest(digestless);
  return { document: { ...digestless, digest }, digest };
}

function finalizeCell(body: FrameworkBody): Record<string, unknown> {
  const cell: Record<string, unknown> = {
    status: body.status,
    source: body.source,
    slots: body.slots,
    events: body.events,
    bindable: body.bindable,
    dropped: body.dropped,
    replaced: body.replaced,
    unresolved: body.unresolved,
    limitations: body.limitations,
    warnings: body.warnings,
  };
  if (body.reason !== undefined) cell["reason"] = body.reason;
  if (body.props !== undefined) cell["props"] = body.props;
  if (body.passthrough !== undefined) cell["passthrough"] = body.passthrough;
  return cell;
}

export interface IndexRowInput {
  componentId: string;
  entryDigest: string;
  contractDigest: string;
  bodies: Record<Framework, FrameworkBody>;
}

export function assembleContractIndex(args: {
  rows: IndexRowInput[];
  excluded: { componentId: string; reason: string }[];
}): {
  format: string;
  producerId: string;
  contractsRevision: string;
  counts: { contracts: number; byFramework: Record<Framework, { complete: number; partial: number; none: number }> };
  entries: Record<string, unknown>[];
  excluded: { componentId: string; reason: string }[];
} {
  const sorted = [...args.rows].sort((a, b) => (a.componentId < b.componentId ? -1 : 1));
  const entries = sorted.map((row) => ({
    producerId: PRODUCER_ID,
    componentId: row.componentId,
    entryDigest: row.entryDigest,
    contractDigest: row.contractDigest,
    completeness: {
      svelte: row.bodies.svelte.status,
      react: row.bodies.react.status,
      vue: row.bodies.vue.status,
      angular: row.bodies.angular.status,
    },
    path: `contracts/${row.componentId}.json`,
  }));
  const counts = {
    contracts: entries.length,
    byFramework: {
      svelte: { complete: 0, partial: 0, none: 0 },
      react: { complete: 0, partial: 0, none: 0 },
      vue: { complete: 0, partial: 0, none: 0 },
      angular: { complete: 0, partial: 0, none: 0 },
    } as Record<Framework, { complete: number; partial: number; none: number }>,
  };
  for (const row of entries) {
    const completeness = row.completeness as Record<Framework, Completeness>;
    for (const framework of ["svelte", "react", "vue", "angular"] as const) {
      counts.byFramework[framework][completeness[framework]] += 1;
    }
  }
  // GEN mirror assertion: counts sum to the population per framework.
  for (const framework of ["svelte", "react", "vue", "angular"] as const) {
    const sum =
      counts.byFramework[framework].complete +
      counts.byFramework[framework].partial +
      counts.byFramework[framework].none;
    if (sum !== entries.length) throw new Error(`emit: contract counts do not sum (${framework})`);
  }
  return {
    format: "component-contract-index/v1",
    producerId: PRODUCER_ID,
    contractsRevision: contractsRevision(entries, PRODUCER_ID),
    counts,
    entries,
    excluded: [...args.excluded].sort((a, b) => (a.componentId < b.componentId ? -1 : 1)),
  };
}

export interface K1aDelivery {
  channel: string;
  framework?: string | undefined;
  package: string;
  path?: string | undefined;
}

export interface K1aEntryInput {
  componentId: string;
  digest: string;
  delivery: K1aDelivery[];
}

const COMPONENT_PACKAGES: Record<string, string> = {
  svelte: "packages/components-svelte",
  react: "packages/components-react",
  vue: "packages/components-vue",
  angular: "packages/components-angular",
};

const DATAVIZ_PACKAGES: Record<string, string> = {
  svelte: "packages/dataviz-svelte",
  react: "packages/dataviz-react",
  vue: "packages/dataviz-vue",
  angular: "packages/dataviz-angular",
};

function packageDistFiles(repoRoot: string, packageRelPath: string): string[] {
  const dist = join(repoRoot, packageRelPath, "dist");
  const found: string[] = [];
  const walk = (dir: string): void => {
    let names: string[];
    try {
      names = readdirSync(dir).sort();
    } catch {
      throw new Error(`emit: missing source: declaration build (${packageRelPath}/dist)`);
    }
    for (const name of names) {
      const absolute = join(dir, name);
      if (statSync(absolute).isDirectory()) {
        walk(absolute);
      } else if (name.endsWith(".d.ts")) {
        found.push(absolute);
      }
    }
  };
  walk(dist);
  return found;
}

export interface ContractDocumentInput {
  componentId: string;
  entryDigest: string;
  contractDigest: string;
  document: Record<string, unknown>;
}

export interface ContractIndexInput {
  format: string;
  producerId: string;
  contractsRevision: string;
  counts: { contracts: number; byFramework: Record<Framework, { complete: number; partial: number; none: number }> };
  entries: Record<string, unknown>[];
  excluded: { componentId: string; reason: string }[];
}

export interface BuildContractsResult {
  contracts: ContractDocumentInput[];
  index: ContractIndexInput;
  excluded: { componentId: string; reason: string }[];
}

/**
 * Derive every population contract from the built declarations.
 * entries: the K1a entries (bar-chart and design-tokens excluded here).
 * Missing declaration input is a loud missing-source failure, never a guess.
 */
export interface MeasuredContract {
  componentId: string;
  entryDigest: string;
  bodies: Record<Framework, FrameworkBody>;
}

/**
 * Run extraction for every population entry without any baseline
 * comparison. The baseline author (contract-baseline.json) measures from
 * this output and reviews it; generation (buildContracts) enforces it.
 */
export function measureContracts(repoRoot: string, entries: K1aEntryInput[]): MeasuredContract[] {
  const programs = new Map<string, LoadedProgram>();
  const manifests = new Map<string, { name: string; version: string }>();

  const programFor = (packageRelPath: string): LoadedProgram => {
    const cached = programs.get(packageRelPath);
    if (cached !== undefined) return cached;
    const distFiles = packageDistFiles(repoRoot, packageRelPath);
    if (distFiles.length === 0) {
      throw new Error(`emit: missing source: declaration build (${packageRelPath}/dist)`);
    }
    const loaded = loadDeclarationProgram(distFiles);
    programs.set(packageRelPath, loaded);
    return loaded;
  };

  const manifestFor = (packageRelPath: string): { name: string; version: string } => {
    const cached = manifests.get(packageRelPath);
    if (cached !== undefined) return cached;
    const parsed = JSON.parse(readFileSync(join(repoRoot, packageRelPath, "package.json"), "utf8")) as {
      name?: unknown;
      version?: unknown;
    };
    if (typeof parsed.name !== "string" || typeof parsed.version !== "string") {
      throw new Error(`emit: ${packageRelPath}/package.json has no name/version`);
    }
    const manifest = { name: parsed.name, version: parsed.version };
    manifests.set(packageRelPath, manifest);
    return manifest;
  };

  const measured: MeasuredContract[] = [];

  for (const entry of [...entries].sort((a, b) => (a.componentId < b.componentId ? -1 : 1))) {
    const bodies = {} as Record<Framework, FrameworkBody>;
    const identifier = resolveIdentifier(repoRoot, entry);
    for (const framework of ["svelte", "react", "vue", "angular"] as const) {
      const delivery = entry.delivery.find(
        (candidate) => candidate.channel === "source" && candidate.framework === framework,
      );
      if (delivery === undefined || delivery.path === undefined) {
        bodies[framework] = absentBody(repoRoot, manifestFor, framework, entry, identifier);
        continue;
      }
      bodies[framework] = extractOne(
        repoRoot,
        programFor,
        manifestFor,
        framework,
        entry,
        delivery.path,
        identifier,
        undefined,
      );
    }
    measured.push({ componentId: entry.componentId, entryDigest: entry.digest, bodies });
  }
  return measured;
}

/**
 * Component identifier recovery: the barrel-side export name for the entry's
 * delivery sources (spec 6.1). The first delivery whose source is
 * barrel-exported wins; entries with no barrel-exported delivery fall back
 * to the PascalCase componentId for absent-cell prose only (extraction
 * without a barrel name is a loud failure in extractOne, never a guess).
 */
function resolveIdentifier(repoRoot: string, entry: K1aEntryInput): string {
  const found = new Set<string>();
  for (const delivery of entry.delivery) {
    if (delivery.channel !== "source" || delivery.path === undefined) continue;
    const packageRelPath = packageOfSource(delivery.path);
    const name = barrelNamesForSource(join(repoRoot, packageRelPath), delivery.path, entry.componentId);
    if (name !== null) found.add(name);
  }
  if (found.size === 1) return [...found][0] as string;
  if (found.size === 0) return pascalCase(entry.componentId);
  throw new Error(
    `emit: inconsistent barrel names for "${entry.componentId}": ${[...found].sort().join(", ")} (missing source: identifier)`,
  );
}

function pascalCase(componentId: string): string {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(componentId)) {
    throw new Error(`emit: componentId "${componentId}" is not kebab-case (missing source: identifier)`);
  }
  return componentId
    .split("-")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Derive every population contract from the built declarations, enforcing
 * the reviewed contract baseline. entries: the K1a population (bar-chart
 * and design-tokens excluded by the caller).
 */
export function buildContracts(
  repoRoot: string,
  packageDir: string,
  entries: K1aEntryInput[],
): BuildContractsResult {
  const baseline = loadContractBaseline(packageDir);
  const measured = measureContracts(repoRoot, entries);
  const rows: IndexRowInput[] = [];
  const documents = new Map<string, Record<string, unknown>>();
  for (const item of measured) {
    const expectedCells = baseline.components[item.componentId];
    if (expectedCells === undefined) {
      throw new Error(`emit: contract baseline has no component "${item.componentId}"`);
    }
    for (const framework of ["svelte", "react", "vue", "angular"] as const) {
      const expected = expectedCells[framework];
      if (expected === undefined) {
        throw new Error(`emit: contract baseline has no expectation for "${item.componentId}" (${framework})`);
      }
      checkBaselineCell(item.componentId, framework, item.bodies[framework] as FrameworkBody, expected);
    }
    const { document, digest } = assembleContractDocument({
      componentId: item.componentId,
      entryDigest: item.entryDigest,
      frameworks: item.bodies,
    });
    rows.push({
      componentId: item.componentId,
      entryDigest: item.entryDigest,
      contractDigest: digest,
      bodies: item.bodies,
    });
    documents.set(item.componentId, document);
  }

  const excluded = [
    {
      componentId: "bar-chart",
      reason: "published: the Elements BarChart contract is the declared truth; no derivation",
    },
    { componentId: "design-tokens", reason: "no-props: token packages expose no component props" },
    {
      componentId: "bpmn-canvas",
      reason: "published, entry pending FR source: no FR copy in-repo; entry omitted, logged at generation",
    },
    {
      componentId: "decision-dossier",
      reason: "published, entry pending FR source: no FR copy in-repo; entry omitted, logged at generation",
    },
    {
      componentId: "geo-map",
      reason: "missing source: branch feat/geo-adapter-svelte not landed; packages/components-geo-svelte absent",
    },
  ];
  const index = assembleContractIndex({ rows, excluded });
  return {
    contracts: rows.map((row) => ({
      componentId: row.componentId,
      entryDigest: row.entryDigest,
      contractDigest: row.contractDigest,
      document: documents.get(row.componentId) as Record<string, unknown>,
    })),
    index,
    excluded,
  };
}

const COMPONENT_BARREL_PATHS: Record<Framework, string> = {
  svelte: "packages/components-svelte/src/lib/index.ts",
  react: "packages/components-react/src/index.ts",
  vue: "packages/components-vue/src/index.ts",
  angular: "packages/components-angular/src/index.ts",
};

/**
 * The conventional declaration path for an identifier in a framework
 * package. Used only for absent cells (no export, no declaration).
 */
export function conventionalDeclPath(framework: Framework, identifier: string): string {
  switch (framework) {
    case "svelte":
      return `packages/components-svelte/dist/${identifier}.svelte.d.ts`;
    case "react":
      return `packages/components-react/dist/${identifier}.d.ts`;
    case "vue":
      return `packages/components-vue/dist/${identifier}.d.ts`;
    case "angular":
      return `packages/components-angular/dist/${identifier}.d.ts`;
  }
}

/**
 * Absent frameworks (no export in that framework's barrels) still emit a
 * none cell with a schema-valid source. The source pins real bytes: the
 * component package manifest (name/version) and the searched barrel file
 * (digest). The declarationPath is the layout-conventional path the
 * component would have; the reason and warning state the absence and name
 * the barrel whose bytes the digest covers. Nothing is fabricated: the
 * digest is computed, the path is conventional, and the two are tied
 * together in prose, never silently.
 */
function absentBody(
  repoRoot: string,
  manifestFor: (packageRelPath: string) => { name: string; version: string },
  framework: Framework,
  entry: K1aEntryInput,
  identifier: string,
): FrameworkBody {
  const packageRelPath = COMPONENT_PACKAGES[framework] as string;
  const manifest = manifestFor(packageRelPath);
  const barrelRelPath = COMPONENT_BARREL_PATHS[framework];
  const barrelDigest = `sha256:${createHash("sha256").update(readFileSync(join(repoRoot, barrelRelPath))).digest("hex")}`;
  return {
    status: "none",
    reason: `absent: "${identifier}" is not exported from ${manifest.name} (${barrelRelPath})`,
    source: {
      package: manifest.name,
      version: manifest.version,
      declarationPath: conventionalDeclPath(framework, identifier),
      declarationDigest: barrelDigest,
      propsType: `${identifier}Props`,
    },
    slots: [],
    events: [],
    bindable: [],
    dropped: [],
    replaced: [],
    unresolved: [],
    limitations: [ABSENT_LIMITATION],
    warnings: [
      `absent: declarationDigest pins the searched barrel (${barrelRelPath}), not a declaration`,
    ],
  };
}

function extractOne(
  repoRoot: string,
  programFor: (packageRelPath: string) => LoadedProgram,
  manifestFor: (packageRelPath: string) => { name: string; version: string },
  framework: Framework,
  entry: K1aEntryInput,
  sourceRepoPath: string,
  identifier: string,
  baselineCell: BaselineCell | undefined,
): FrameworkBody {
  // Compatibility wrappers still own the exported public Props types for
  // several SFCs. Read those declarations while delivery metadata names
  // the converted implementation, preserving the measured public contract.
  const wrapperSource = sourceRepoPath.replace(/\.vue$/, ".ts");
  const declarationSource = framework === "vue" && wrapperSource !== sourceRepoPath &&
    existsSync(join(repoRoot, wrapperSource)) ? wrapperSource : sourceRepoPath;
  const declRel = declarationPathForSource(declarationSource);
  if (declRel === null) {
    throw new Error(`emit: no declaration layout for source "${sourceRepoPath}" (missing source)`);
  }
  const packageRelPath = packageOfSource(sourceRepoPath);
  const loaded = programFor(packageRelPath);
  const manifest = manifestFor(packageRelPath);
  const startAbs = join(repoRoot, declRel);
  if (!existsSync(startAbs)) {
    throw new Error(`emit: declaration missing: ${declRel} (missing source: declaration build)`);
  }
  const resolvedAbs =
    framework === "vue" ? startAbs : followExportChain(loaded.program, startAbs, `${identifier}Props`) ?? startAbs;
  const resolvedRel = relative(repoRoot, resolvedAbs).split("\\").join("/");
  const declarationDigest = `sha256:${createHash("sha256").update(readFileSync(resolvedAbs)).digest("hex")}`;
  const declFile = loaded.program.getSourceFile(resolvedAbs);
  if (declFile === undefined) throw new Error(`emit: declaration not in program: ${resolvedRel}`);
  const input: FrameworkInput = {
    program: loaded.program,
    checker: loaded.checker,
    declFile,
    repoDeclPath: resolvedRel,
    declarationDigest,
    packageName: manifest.name,
    packageVersion: manifest.version,
    identifier,
    expectedSlots: baselineCell?.slots,
  };
  switch (framework) {
    case "svelte":
      return extractSvelte(input);
    case "react":
      return extractReact(input);
    case "vue":
      return extractVue(input);
    case "angular":
      return extractAngular(input);
  }
}

function packageOfSource(sourceRepoPath: string): string {
  for (const packageRelPath of [...Object.values(COMPONENT_PACKAGES), ...Object.values(DATAVIZ_PACKAGES)]) {
    if (sourceRepoPath === packageRelPath || sourceRepoPath.startsWith(`${packageRelPath}/`)) {
      return packageRelPath;
    }
  }
  throw new Error(`emit: source "${sourceRepoPath}" belongs to no known component package`);
}

export type { FrameworkBody };
