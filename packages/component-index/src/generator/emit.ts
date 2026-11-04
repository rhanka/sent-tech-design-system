/**
 * Index emission (frozen spec sections 3, 6.2, 6.4, 6.5): catalogue rows
 * plus overlay entries become `component-entry/v1` objects; the row set
 * becomes `component-index/v1`. Every entry is `doc-only`; nothing is
 * hosted.
 *
 * Fail-closed rules enforced here (each has a test): wrong entry digest
 * (recomputed, never trusted), any `url`, any non-`doc-only` renderable,
 * any `derived` contract, any `esm`/`css-classes` instance, missing
 * delivery file, missing/empty/over-280 bilingual text, overlay collision,
 * baseline mismatch, retired `kind` token (byte scan is the root guard's
 * job; the objects here never carry it by construction).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import Ajv2020, { type AnySchema } from "ajv/dist/2020.js";

import {
  assertNoEditorialMetadata,
  parseBarrelFile,
  resolveSourceFile,
  type ParsedBarrel,
} from "./barrels.js";
import { parseCatalogueFile, stripDatavizMarker, type CatalogueRow } from "./catalog.js";
import {
  DATA_CLASS_DEFAULT,
  DELIVERY_CHANNEL_RANK,
  FORMAT_CONTRACT,
  FORMAT_CONTRACT_INDEX,
  FORMAT_ENTRY,
  FORMAT_INDEX,
  FRAMEWORK_ORDER,
  GENERATOR_NAME,
  HOUSE_THEMES,
  PARITY_STATUSES,
  PRODUCER_ID,
  SCOPE_DEFAULT,
  VISIBILITY_DEFAULT,
  type Framework,
  type ParityMap,
  type ParityStatus,
} from "./constants.js";
import { contractDigest, entryDigest, fileDigestHex, indexRevision } from "./digest.js";
import { buildContracts } from "./contracts/emit.js";
import { loadOverlay, type Overlay } from "./overlay.js";
import { computeParity, parityAllMissing, parityProjection } from "./parity.js";

export interface GeneratedFile {
  path: string;
  text: string;
}

export interface BuildLog {
  lines: string[];
  exclusions: string[];
}

export interface BuiltArtifacts {
  files: GeneratedFile[];
  log: BuildLog;
}

interface Manifest {
  name: string;
  version: string;
}

const EXACT_VERSION = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/;
const COMPONENT_BARREL_PATHS: Record<Framework, string> = {
  svelte: "packages/components-svelte/src/lib/index.ts",
  react: "packages/components-react/src/index.ts",
  vue: "packages/components-vue/src/index.ts",
  angular: "packages/components-angular/src/index.ts",
};
const DATAVIZ_BARREL_PATHS: Record<Framework, string> = {
  svelte: "packages/dataviz-svelte/src/index.ts",
  react: "packages/dataviz-react/src/index.ts",
  vue: "packages/dataviz-vue/src/index.ts",
  angular: "packages/dataviz-angular/src/index.ts",
};
const BASELINE_KEYS = [
  "svelte",
  "react",
  "vue",
  "angular",
  "dataviz-svelte",
  "dataviz-react",
  "dataviz-vue",
  "dataviz-angular",
] as const;

// Committed token sources pinned by the design-tokens entry (spec 9.3):
// the three token layers plus the house theme CSS files. Measured-clone
// `packages/theme-*` packages are never enumerated.
const TOKEN_SOURCE_FILES = [
  "packages/tokens/src/foundation.ts",
  "packages/tokens/src/semantic.ts",
  "packages/tokens/src/component.ts",
];

export interface Delivery {
  channel: string;
  framework?: string;
  element?: string;
  package: string;
  version: string;
  path?: string;
  url?: string;
  digest: string;
}

export interface Entry {
  format: typeof FORMAT_ENTRY;
  producerId: string;
  componentId: string;
  displayName: string;
  description?: { fr: string; en: string };
  category?: string;
  status?: string;
  groupSlug?: string;
  frameworks?: string[];
  renderable: string;
  scope: string;
  visibility: string;
  scopePolicyRef?: string;
  parity: ParityMap;
  dataClass: string;
  delivery: Delivery[];
  contract?: {
    contractId: string;
    version: string;
    contractSource: string;
    schemaDigest?: string;
  };
  digest: string;
}

interface Baseline {
  version: number;
  expectedParity: Record<string, ParityMap>;
  gaps: { componentId: string; parity: ParityMap; reason: string }[];
  barrelOnly: Record<string, string[]>;
  stars: Record<string, string[]>;
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`emit: cannot read JSON at ${path}: ${(error as Error).message}`);
  }
}

function readManifest(manifestPath: string): Manifest {
  const parsed = readJson(manifestPath) as { name?: unknown; version?: unknown };
  if (typeof parsed.name !== "string" || parsed.name.length === 0) {
    throw new Error(`emit: ${manifestPath} has no package name`);
  }
  if (typeof parsed.version !== "string" || !EXACT_VERSION.test(parsed.version)) {
    throw new Error(
      `emit: ${manifestPath} version must be exact semver, got ${JSON.stringify(parsed.version)}`,
    );
  }
  return { name: parsed.name, version: parsed.version };
}

function digestFile(repoRoot: string, repoPath: string): string {
  return fileDigestHex(readFileSync(join(repoRoot, repoPath)));
}

/** Deterministic JSON text: sorted keys, 2-space indent, trailing newline. */
export function serializeDeterministic(value: unknown): string {
  return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

function kebabCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function isParityMap(value: unknown): value is ParityMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return FRAMEWORK_ORDER.every(
    (framework) =>
      typeof record[framework] === "string" &&
      (PARITY_STATUSES as readonly string[]).includes(record[framework] as string),
  );
}

/** Every native value is present (`match` or `source-of-truth`). */
function parityFullPresence(map: ParityMap): boolean {
  return FRAMEWORK_ORDER.every(
    (framework) => map[framework] === "match" || map[framework] === "source-of-truth",
  );
}

/** GEN invariants on a digest-less entry object (throws on violation). */
export function assertEntryInvariants(entry: {
  componentId: string;
  renderable: string;
  scope: string;
  visibility: string;
  scopePolicyRef?: string;
  parity: unknown;
  dataClass: string;
  frameworks?: string[];
  description?: { fr: string; en: string };
  delivery: Delivery[];
  contract?: { contractSource: string };
}): void {
  if (entry.renderable !== "doc-only") {
    throw new Error(`emit: "${entry.componentId}" renderable must be doc-only in K1a`);
  }
  if (entry.scope !== SCOPE_DEFAULT) {
    throw new Error(`emit: "${entry.componentId}" scope must be generic in K1a (DS producer)`);
  }
  if (entry.visibility !== VISIBILITY_DEFAULT) {
    throw new Error(`emit: "${entry.componentId}" visibility must be public in K1a (DS producer)`);
  }
  if (entry.scopePolicyRef !== undefined) {
    throw new Error(`emit: "${entry.componentId}" public entry must not carry scopePolicyRef`);
  }
  if ((entry as Record<string, unknown>)["tenant"] !== undefined) {
    throw new Error(`emit: "${entry.componentId}" retired tenant field is invalid`);
  }
  if (entry.dataClass !== DATA_CLASS_DEFAULT) {
    throw new Error(`emit: "${entry.componentId}" dataClass must be public-safe in K1a`);
  }
  if (!isParityMap(entry.parity)) {
    throw new Error(`emit: "${entry.componentId}" parity must be the four-key frozen map`);
  }
  const parity = entry.parity as ParityMap;
  for (const framework of FRAMEWORK_ORDER) {
    const status = parity[framework] as string;
    if (status === "mismatch") {
      throw new Error(`emit: "${entry.componentId}" parity mismatch fails generation`);
    }
  }
  const projected = parityProjection(parity);
  if (JSON.stringify(entry.frameworks ?? []) !== JSON.stringify(projected)) {
    throw new Error(`emit: "${entry.componentId}" frameworks must project the parity map`);
  }
  if (entry.description !== undefined) {
    for (const language of ["fr", "en"] as const) {
      const text = entry.description[language];
      if (typeof text !== "string" || text.length === 0) {
        throw new Error(`emit: "${entry.componentId}" needs non-empty fr and en descriptions`);
      }
      if (text.length > 280) {
        throw new Error(`emit: "${entry.componentId}" ${language} description exceeds 280 chars`);
      }
    }
  }
  for (const delivery of entry.delivery) {
    if (delivery.url !== undefined) {
      throw new Error(`emit: "${entry.componentId}" must not carry a url in K1a`);
    }
    if (!EXACT_VERSION.test(delivery.version)) {
      throw new Error(`emit: "${entry.componentId}" delivery version must be exact semver`);
    }
    if (delivery.channel === "source" && delivery.framework === undefined) {
      throw new Error(`emit: "${entry.componentId}" source delivery needs a framework`);
    }
    if (delivery.channel === "element" && delivery.element === undefined) {
      throw new Error(`emit: "${entry.componentId}" element delivery needs an element tag`);
    }
    if (delivery.channel === "esm" || delivery.channel === "css-classes") {
      throw new Error(`emit: "${entry.componentId}" channel "${delivery.channel}" has zero instances in K1a`);
    }
  }
  if (entry.contract !== undefined && entry.contract.contractSource !== "published") {
    throw new Error(`emit: "${entry.componentId}" contract must be published in K1a (no derived)`);
  }
}

interface ElementsContract {
  component: string;
  element: string;
  contractVersion: string;
  parity: Partial<Record<Framework, ParityStatus>>;
}

function readElementsContracts(repoRoot: string): {
  contracts: Map<string, ElementsContract>;
  manifest: Manifest;
} {
  const catalog = readJson(join(repoRoot, "packages/elements/catalog.json")) as {
    components?: Record<string, { "x-sentropic"?: { contract?: unknown; element?: unknown; parity?: unknown } }>;
  };
  const contracts = new Map<string, ElementsContract>();
  for (const [component, node] of Object.entries(catalog.components ?? {})) {
    const meta = node["x-sentropic"];
    if (typeof meta?.contract !== "string" || typeof meta?.element !== "string") {
      throw new Error(`emit: Elements component "${component}" misses x-sentropic contract/element`);
    }
    const parity: Partial<Record<Framework, ParityStatus>> = {};
    if (typeof meta?.parity === "object" && meta.parity !== null) {
      for (const framework of FRAMEWORK_ORDER) {
        const status = (meta.parity as Record<string, { status?: unknown }>)[framework]?.status;
        if (status === "no-counterpart") parity[framework] = "no-counterpart";
      }
    }
    contracts.set(component, { component, element: meta.element, contractVersion: meta.contract, parity });
  }
  return { contracts, manifest: readManifest(join(repoRoot, "packages/elements/package.json")) };
}

/**
 * Frameworks with a declared intentional absence for one identifier:
 * Elements contract roles (`no-counterpart`) for that component.
 * Dataviz presence never contributes; catalogue rows take no other set.
 */
function intentionalFor(identifier: string, elements: Map<string, ElementsContract>): Set<Framework> {
  const intentional = new Set<Framework>();
  const contract = elements.get(identifier);
  if (contract !== undefined) {
    for (const framework of FRAMEWORK_ORDER) {
      if (contract.parity[framework] === "no-counterpart") intentional.add(framework);
    }
  }
  return intentional;
}

/**
 * Load the reviewed parity baseline (exported for the K1b contract tests;
 * generation always goes through buildArtifacts, never around it).
 */
export function loadBaseline(packageDir: string): Baseline {
  const parsed = readJson(join(packageDir, "parity-baseline.json")) as Partial<Baseline> & {
    version?: unknown;
  } & { unresolvedStars?: unknown };
  if ((parsed as { version?: unknown }).version !== 2) {
    throw new Error("emit: parity-baseline.json version must be 2 (frozen maps)");
  }
  if ("unresolvedStars" in parsed) {
    throw new Error(
      'emit: parity-baseline.json uses the retired key "unresolvedStars"; rename it to "stars" (K1b section 11)',
    );
  }
  if (
    typeof parsed.expectedParity !== "object" ||
    parsed.expectedParity === null ||
    !Array.isArray(parsed.gaps) ||
    typeof parsed.barrelOnly !== "object" ||
    parsed.barrelOnly === null ||
    typeof parsed.stars !== "object" ||
    parsed.stars === null
  ) {
    throw new Error("emit: parity-baseline.json shape is invalid");
  }
  for (const [slug, map] of Object.entries(parsed.expectedParity)) {
    if (!isParityMap(map)) {
      throw new Error(`emit: baseline expectedParity "${slug}" is not a four-key parity map`);
    }
  }
  for (const gap of parsed.gaps) {
    if (typeof gap.componentId !== "string" || !isParityMap(gap.parity)) {
      throw new Error("emit: baseline gap row is not a parity map row");
    }
  }
  return parsed as Baseline;
}

interface Presence {
  component: boolean[];
  dataviz: boolean;
}

function checkBaseline(
  rows: CatalogueRow[],
  presence: Map<string, Presence>,
  barrels: Map<string, ParsedBarrel>,
  identifiers: Set<string>,
  baseline: Baseline,
  elements: Map<string, ElementsContract>,
): void {
  for (const row of rows) {
    const seen = presence.get(row.slug);
    if (seen === undefined) throw new Error(`emit: no presence computed for "${row.slug}"`);
    const computed = computeParity(
      seen.component,
      seen.dataviz,
      intentionalFor(stripDatavizMarker(row.name), elements),
    );
    if (parityAllMissing(computed) && !seen.dataviz) {
      throw new Error(`emit: "${row.slug}" is exported nowhere (all missing, no dataviz delivery)`);
    }
    const expected = baseline.expectedParity[row.slug];
    if (expected === undefined) {
      throw new Error(`emit: baseline has no expected parity for "${row.slug}" (new gap)`);
    }
    if (JSON.stringify(computed) !== JSON.stringify(expected)) {
      throw new Error(
        `emit: baseline mismatch for "${row.slug}": computed ${JSON.stringify(computed)}, baseline ${JSON.stringify(expected)}`,
      );
    }
  }
  const gapSlugs = new Set(baseline.gaps.map((gap) => gap.componentId));
  for (const row of rows) {
    const expected = baseline.expectedParity[row.slug];
    if (expected === undefined) {
      throw new Error(`emit: baseline has no expected parity for "${row.slug}" (new gap)`);
    }
    if (!parityFullPresence(expected) && !gapSlugs.has(row.slug)) {
      throw new Error(`emit: baseline gap list misses non-complete "${row.slug}"`);
    }
    if (parityFullPresence(expected) && gapSlugs.has(row.slug)) {
      throw new Error(`emit: baseline gap list wrongly contains complete "${row.slug}"`);
    }
  }
  for (const gap of baseline.gaps) {
    const expected = baseline.expectedParity[gap.componentId];
    if (expected === undefined) {
      throw new Error(`emit: baseline gap "${gap.componentId}" has no expected parity row`);
    }
    if (JSON.stringify(gap.parity) !== JSON.stringify(expected)) {
      throw new Error(`emit: baseline gap "${gap.componentId}" map differs from its expected row`);
    }
  }
  for (const key of BASELINE_KEYS) {
    const parsed = barrels.get(key);
    if (parsed === undefined) throw new Error(`emit: barrel "${key}" was not parsed`);
    const only = [...parsed.values.keys()].filter((name) => !identifiers.has(name)).sort();
    const expected = baseline.barrelOnly[key];
    if (expected === undefined) throw new Error(`emit: baseline has no barrelOnly list for "${key}"`);
    if (JSON.stringify(only) !== JSON.stringify([...expected].sort())) {
      const missing = only.filter((name) => !expected.includes(name));
      const extra = expected.filter((name) => !only.includes(name));
      throw new Error(
        `emit: baseline barrelOnly mismatch for "${key}" (missing: ${missing.join(",") || "—"}; ` +
          `stale: ${extra.join(",") || "—"})`,
      );
    }
    const stars = [...parsed.stars].sort();
    const expectedStars = baseline.stars[key];
    if (expectedStars === undefined) throw new Error(`emit: baseline has no stars list for "${key}"`);
    if (JSON.stringify(stars) !== JSON.stringify([...expectedStars].sort())) {
      throw new Error(`emit: baseline stars mismatch for "${key}"`);
    }
  }
}

function sourceDelivery(
  repoRoot: string,
  barrelPath: string,
  exportName: string,
  specifier: string | null,
  framework: Framework,
  manifest: Manifest,
): Delivery {
  const repoPath = resolveSourceFile(join(repoRoot, barrelPath), exportName, specifier, repoRoot);
  return {
    channel: "source",
    framework,
    package: manifest.name,
    version: manifest.version,
    path: repoPath,
    digest: digestFile(repoRoot, repoPath),
  };
}

function orderDeliveries(deliveries: Delivery[]): Delivery[] {
  const rank = (delivery: Delivery): number => DELIVERY_CHANNEL_RANK[delivery.channel] ?? 99;
  const frameworkRank = (delivery: Delivery): number =>
    delivery.framework === undefined ? 99 : FRAMEWORK_ORDER.indexOf(delivery.framework as Framework);
  return [...deliveries].sort(
    (a, b) => rank(a) - rank(b) || frameworkRank(a) - frameworkRank(b) || 0,
  );
}

function finalizeEntry(digestless: Omit<Entry, "digest">): Entry {
  assertEntryInvariants(digestless);
  return { ...digestless, digest: entryDigest(digestless) };
}

function catalogueEntry(
  repoRoot: string,
  row: CatalogueRow,
  presence: Presence,
  barrels: Map<string, ParsedBarrel>,
  manifests: Map<string, Manifest>,
  elements: Map<string, ElementsContract>,
  elementsManifest: Manifest,
): Entry {
  const identifier = stripDatavizMarker(row.name);
  const deliveries: Delivery[] = [];
  if (presence.dataviz && presence.component.every((seen) => !seen)) {
    for (const framework of FRAMEWORK_ORDER) {
      const barrel = barrels.get(`dataviz-${framework}`);
      if (barrel === undefined || !barrel.values.has(identifier)) continue;
      const manifest = manifests.get(`dataviz-${framework}`);
      if (manifest === undefined) throw new Error(`emit: no manifest for dataviz-${framework}`);
      deliveries.push(
        sourceDelivery(
          repoRoot,
          DATAVIZ_BARREL_PATHS[framework],
          identifier,
          barrel.values.get(identifier) ?? null,
          framework,
          manifest,
        ),
      );
    }
    if (deliveries.length === 0) {
      throw new Error(`emit: "${row.slug}" parity dataviz but no dataviz source resolved`);
    }
  } else {
    for (const framework of FRAMEWORK_ORDER) {
      if (!presence.component[FRAMEWORK_ORDER.indexOf(framework)]) continue;
      const barrel = barrels.get(framework);
      if (barrel === undefined || !barrel.values.has(identifier)) {
        throw new Error(`emit: "${row.slug}" presence flag without barrel export (${framework})`);
      }
      const manifest = manifests.get(framework);
      if (manifest === undefined) throw new Error(`emit: no manifest for ${framework}`);
      deliveries.push(
        sourceDelivery(
          repoRoot,
          COMPONENT_BARREL_PATHS[framework],
          identifier,
          barrel.values.get(identifier) ?? null,
          framework,
          manifest,
        ),
      );
    }
  }
  const parity = computeParity(presence.component, presence.dataviz, intentionalFor(identifier, elements));
  const frameworks = parityProjection(parity);
  if (parityAllMissing(parity) && deliveries.length === 0) {
    throw new Error(`emit: "${row.slug}" is exported nowhere (all missing, no dataviz delivery)`);
  }
  const digestless: Omit<Entry, "digest"> = {
    format: FORMAT_ENTRY,
    producerId: PRODUCER_ID,
    componentId: row.slug,
    displayName: row.name,
    description: { ...row.description },
    category: row.category,
    status: row.status,
    frameworks,
    renderable: "doc-only",
    scope: SCOPE_DEFAULT,
    visibility: VISIBILITY_DEFAULT,
    parity,
    dataClass: DATA_CLASS_DEFAULT,
    delivery: orderDeliveries(deliveries),
  };
  if (row.groupSlug !== undefined) digestless.groupSlug = row.groupSlug;
  const contract = elements.get(identifier);
  if (contract !== undefined) {
    const schemaPath = `packages/elements/schemas/${contract.component}.v1.json`;
    const schema = readJson(join(repoRoot, schemaPath)) as { $id?: unknown };
    if (typeof schema.$id !== "string" || schema.$id.length === 0) {
      throw new Error(`emit: ${schemaPath} has no $id`);
    }
    if (!/^[0-9]+\.[0-9]+$/.test(contract.contractVersion)) {
      throw new Error(`emit: Elements contract version "${contract.contractVersion}" is not major.minor`);
    }
    deliveries.push({
      channel: "element",
      element: contract.element,
      package: elementsManifest.name,
      version: elementsManifest.version,
      path: schemaPath,
      digest: digestFile(repoRoot, schemaPath),
    });
    digestless.delivery = orderDeliveries(deliveries);
    digestless.contract = {
      contractId: schema.$id,
      version: contract.contractVersion,
      contractSource: "published",
      schemaDigest: digestFile(repoRoot, schemaPath),
    };
  }
  return finalizeEntry(digestless);
}

function tokensEntry(
  repoRoot: string,
  overlayEntry: {
    componentId: string;
    displayName: string;
    description: { fr: string; en: string };
  },
): Entry {
  const tokensManifest = readManifest(join(repoRoot, "packages/tokens/package.json"));
  const themesManifest = readManifest(join(repoRoot, "packages/themes/package.json"));
  const deliveries: Delivery[] = [];
  for (const repoPath of TOKEN_SOURCE_FILES) {
    if (!existsSync(join(repoRoot, repoPath))) {
      throw new Error(`emit: tokens source missing: ${repoPath}`);
    }
    deliveries.push({
      channel: "tokens",
      package: tokensManifest.name,
      version: tokensManifest.version,
      path: repoPath,
      digest: digestFile(repoRoot, repoPath),
    });
  }
  for (const theme of HOUSE_THEMES) {
    const repoPath = `packages/themes/css/${theme}.css`;
    if (!existsSync(join(repoRoot, repoPath))) {
      throw new Error(`emit: house theme CSS missing: ${repoPath}`);
    }
    deliveries.push({
      channel: "tokens",
      package: themesManifest.name,
      version: themesManifest.version,
      path: repoPath,
      digest: digestFile(repoRoot, repoPath),
    });
  }
  const parity: ParityMap = {
    svelte: "no-counterpart",
    react: "no-counterpart",
    vue: "no-counterpart",
    angular: "no-counterpart",
  };
  return finalizeEntry({
    format: FORMAT_ENTRY,
    producerId: PRODUCER_ID,
    componentId: overlayEntry.componentId,
    displayName: overlayEntry.displayName,
    description: { ...overlayEntry.description },
    frameworks: [],
    renderable: "doc-only",
    scope: SCOPE_DEFAULT,
    visibility: VISIBILITY_DEFAULT,
    parity,
    dataClass: DATA_CLASS_DEFAULT,
    delivery: orderDeliveries(deliveries),
  });
}

export interface BuildOverrides {
  sourceCommit?: string;
}

/** Regenerate every artifact in memory (no writes; the CLI writes). */
export function buildArtifacts(
  repoRoot: string,
  packageDir: string,
  overrides: BuildOverrides = {},
): BuiltArtifacts {
  const log: BuildLog = { lines: [], exclusions: [] };
  const rows = parseCatalogueFile(join(repoRoot, "apps/docs/src/lib/components-catalog.ts"));
  const slugs = new Set(rows.map((row) => row.slug));
  const identifiers = new Set(rows.map((row) => stripDatavizMarker(row.name)));

  const barrels = new Map<string, ParsedBarrel>();
  const manifests = new Map<string, Manifest>();
  for (const framework of FRAMEWORK_ORDER) {
    const barrelPath = COMPONENT_BARREL_PATHS[framework];
    const parsed = parseBarrelFile(join(repoRoot, barrelPath));
    assertNoEditorialMetadata(parsed, barrelPath);
    barrels.set(framework, parsed);
    manifests.set(framework, readManifest(join(repoRoot, `packages/components-${framework}/package.json`)));
    const datavizKey = `dataviz-${framework}`;
    const datavizPath = DATAVIZ_BARREL_PATHS[framework];
    const datavizParsed = parseBarrelFile(join(repoRoot, datavizPath));
    assertNoEditorialMetadata(datavizParsed, datavizPath);
    barrels.set(datavizKey, datavizParsed);
    manifests.set(datavizKey, readManifest(join(repoRoot, `packages/${datavizKey}/package.json`)));
  }

  const presence = new Map<string, Presence>();
  for (const row of rows) {
    const identifier = stripDatavizMarker(row.name);
    const component = FRAMEWORK_ORDER.map(
      (framework) => barrels.get(framework)?.values.has(identifier) ?? false,
    );
    const dataviz = FRAMEWORK_ORDER.some(
      (framework) => barrels.get(`dataviz-${framework}`)?.values.has(identifier) ?? false,
    );
    presence.set(row.slug, { component, dataviz });
  }

  const { contracts: baselineElementsContracts } = readElementsContracts(repoRoot);
  checkBaseline(rows, presence, barrels, identifiers, loadBaseline(packageDir), baselineElementsContracts);

  const overlay: Overlay = loadOverlay(join(packageDir, "catalog-overlay.json"));
  for (const row of overlay.entries) {
    if (slugs.has(row.componentId)) {
      throw new Error(`emit: overlay "${row.componentId}" collides with a catalogue slug`);
    }
  }
  for (const row of overlay.excluded) {
    log.exclusions.push(`excluded: ${row.componentId} (${row.reason})`);
  }

  const { contracts: elementsContracts, manifest: elementsManifest } = readElementsContracts(repoRoot);
  const overlayIds = new Set(overlay.entries.map((row) => row.componentId));
  const excludedIds = new Set(overlay.excluded.map((row) => row.componentId));
  for (const contract of elementsContracts.values()) {
    const slug = kebabCase(contract.component);
    const inCatalogue = [...identifiers].includes(contract.component);
    // Rows already recorded in overlay.excluded are logged once, from the
    // reviewed overlay text — never duplicated here.
    if (!inCatalogue && !overlayIds.has(slug) && !excludedIds.has(slug)) {
      log.exclusions.push(
        `excluded: ${slug} (no overlay row: missing source; ` +
          `Elements contract "${contract.component}" has no bilingual copy)`,
      );
    }
  }

  // Conductor Q8: geo-map is OUT of K1a (branch feat/geo-adapter-svelte not
  // landed). A present package is an ambiguous disposition: stop, never guess.
  const geoDir = join(repoRoot, "packages/components-geo-svelte");
  if (existsSync(geoDir)) {
    throw new Error(
      'emit: geo package present but K1a generates without geo-map (conductor Q8 OUT); stop and report',
    );
  }
  if (!overlay.excluded.some((row) => row.componentId === "geo-map")) {
    log.exclusions.push("excluded: geo-map (missing source: branch not landed)");
  }

  const entries: Entry[] = [];
  let stubs = 0;
  for (const row of rows) {
    if (row.status !== "documented") {
      stubs += 1;
      log.lines.push(`stub skipped (no entry): ${row.slug}`);
      continue;
    }
    const seen = presence.get(row.slug);
    if (seen === undefined) throw new Error(`emit: no presence for "${row.slug}"`);
    entries.push(catalogueEntry(repoRoot, row, seen, barrels, manifests, elementsContracts, elementsManifest));
  }
  for (const row of overlay.entries) {
    if (row.componentId === "design-tokens") {
      // The tokens entry is global infrastructure: it carries no catalogue
      // editorial fields in K1a. Reject them loudly instead of ignoring them.
      for (const key of ["category", "status", "groupSlug", "scope", "tenant", "visibility", "scopePolicyRef", "dataClass"] as const) {
        if ((row as unknown as Record<string, unknown>)[key] !== undefined) {
          throw new Error(`emit: design-tokens overlay row must not carry "${key}" in K1a`);
        }
      }
      entries.push(tokensEntry(repoRoot, row));
      continue;
    }
    throw new Error(`emit: overlay "${row.componentId}" has no emission rule in K1a`);
  }

  entries.sort((a, b) => (a.componentId < b.componentId ? -1 : a.componentId > b.componentId ? 1 : 0));
  const indexRows = entries.map((entry) => {
    const channels = [...new Set(entry.delivery.map((delivery) => delivery.channel))].sort(
      (a, b) => (DELIVERY_CHANNEL_RANK[a] ?? 99) - (DELIVERY_CHANNEL_RANK[b] ?? 99),
    );
    const row: Record<string, unknown> = {
      producerId: entry.producerId,
      componentId: entry.componentId,
      digest: entry.digest,
      renderable: entry.renderable,
      scope: entry.scope,
      visibility: entry.visibility,
      parity: entry.parity,
      dataClass: entry.dataClass,
      frameworks: entry.frameworks ?? [],
      deliveryChannels: channels,
      path: `entries/${entry.componentId}.json`,
    };
    if (entry.scopePolicyRef !== undefined) row["scopePolicyRef"] = entry.scopePolicyRef;
    if (entry.category !== undefined) row["category"] = entry.category;
    if (entry.status !== undefined) row["status"] = entry.status;
    // GEN assertion: index rows copy entry fields verbatim (frozen §4.2).
    for (const [key, source] of [
      ["producerId", entry.producerId],
      ["componentId", entry.componentId],
      ["digest", entry.digest],
      ["renderable", entry.renderable],
      ["scope", entry.scope],
      ["visibility", entry.visibility],
      ["parity", entry.parity],
      ["dataClass", entry.dataClass],
      ["frameworks", entry.frameworks ?? []],
      ["category", entry.category],
      ["status", entry.status],
      ["deliveryChannels", channels],
    ] as const) {
      if (JSON.stringify(row[key]) !== JSON.stringify(source)) {
        throw new Error(`emit: index row "${entry.componentId}" field "${key}" differs from its entry`);
      }
    }
    return row;
  });

  const byRenderable = { mcp: 0, https: 0, "doc-only": 0 };
  for (const entry of entries) {
    if (entry.renderable !== "doc-only") throw new Error(`emit: non-doc-only entry "${entry.componentId}"`);
    byRenderable["doc-only"] += 1;
  }
  if (byRenderable["doc-only"] !== entries.length) throw new Error("emit: counts do not sum");

  let sourceCommit = overrides.sourceCommit;
  if (sourceCommit === undefined) {
    try {
      sourceCommit = execFileSync("git", ["-C", repoRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    } catch {
      throw new Error("emit: cannot resolve git HEAD for sourceCommit");
    }
  }
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) throw new Error("emit: sourceCommit must be a full SHA");

  const packageManifest = readJson(join(packageDir, "package.json")) as { version?: unknown };
  if (typeof packageManifest.version !== "string" || !EXACT_VERSION.test(packageManifest.version)) {
    throw new Error("emit: component-index package.json needs an exact version");
  }
  const index = {
    format: FORMAT_INDEX,
    producerId: PRODUCER_ID,
    registryRevision: indexRevision(indexRows, PRODUCER_ID),
    sourceCommit,
    generatedBy: { generator: GENERATOR_NAME, version: packageManifest.version },
    counts: { entries: entries.length, byRenderable },
    entries: indexRows,
  };

  // K1b derived population: every K1a entry without a published contract
  // that carries component props (at least one source delivery). Bar-chart
  // drops out via entry.contract, design-tokens via the no-source-delivery
  // rule; population stays 209 without hardcoding componentIds.
  const population = entries.filter(
    (entry) => entry.contract === undefined && entry.delivery.some((delivery) => delivery.channel === "source"),
  );
  const contractResult = buildContracts(
    repoRoot,
    packageDir,
    population.map((entry) => ({
      componentId: entry.componentId,
      digest: entry.digest,
      delivery: entry.delivery.map((delivery) => ({
        channel: delivery.channel,
        framework: delivery.framework,
        package: delivery.package,
        path: delivery.path,
      })),
    })),
  );
  const contractIndex = {
    format: FORMAT_CONTRACT_INDEX,
    producerId: PRODUCER_ID,
    contractsRevision: contractResult.index.contractsRevision,
    sourceCommit,
    generatedBy: { generator: GENERATOR_NAME, version: packageManifest.version },
    counts: contractResult.index.counts,
    entries: contractResult.index.entries,
    excluded: contractResult.index.excluded,
  };

  validateOutputs(packageDir, entries, index);
  validateContracts(packageDir, population, contractResult, contractIndex);
  const files: GeneratedFile[] = [
    { path: "generated/component-index.json", text: serializeDeterministic(index) },
    ...entries.map((entry) => ({
      path: `generated/entries/${entry.componentId}.json`,
      text: serializeDeterministic(entry),
    })),
    ...contractResult.contracts.map((contract) => ({
      path: `generated/contracts/${contract.componentId}.json`,
      text: serializeDeterministic(contract.document),
    })),
    { path: "generated/component-contract-index.json", text: serializeDeterministic(contractIndex) },
  ];
  const contractCounts = contractResult.index.counts.byFramework;
  log.lines.push(
    `catalogue rows: ${rows.length} (documented ${rows.length - stubs}, stubs ${stubs})`,
    `entries emitted: ${entries.length}`,
    `exclusions: ${log.exclusions.length}`,
    `contracts emitted: ${contractResult.contracts.length}`,
    `contract coverage: ${FRAMEWORK_ORDER.map((framework) => `${framework} ${contractCounts[framework].complete}c/${contractCounts[framework].partial}p/${contractCounts[framework].none}n`).join(" ")}`,
  );
  for (const row of contractResult.excluded) {
    log.exclusions.push(`contract excluded: ${row.componentId} (${row.reason})`);
  }
  return { files, log };
}

function validateOutputs(packageDir: string, entries: Entry[], index: unknown): void {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const entrySchema = readJson(join(packageDir, "schemas/component-entry.v1.json")) as AnySchema;
  const indexSchema = readJson(join(packageDir, "schemas/component-index.v1.json")) as AnySchema;
  const validateEntry = ajv.compile<Entry>(entrySchema);
  for (const entry of entries) {
    if (!validateEntry(entry)) {
      throw new Error(
        `emit: entry "${entry.componentId}" fails its schema: ${JSON.stringify(validateEntry.errors)}`,
      );
    }
    const { digest, ...digestless } = entry;
    void digest;
    if (entryDigest(digestless) !== entry.digest) {
      throw new Error(`emit: entry "${entry.componentId}" digest does not recompute`);
    }
  }
  const validateIndex = ajv.compile(indexSchema);
  if (!validateIndex(index)) {
    throw new Error(`emit: index fails its schema: ${JSON.stringify(validateIndex.errors)}`);
  }
  const raw = JSON.stringify(entries);
  if (raw.includes('"kind"')) throw new Error('emit: retired "kind" token in generated entries');
}

/**
 * K1b emit-side validation (spec sections 5, 8, 9): schema validity of
 * every contract and the index, digest recomputation, the props meta-schema
 * (every props is itself a valid JSON Schema), the entryDigest join, the
 * row↔document mirrors, and GEN-C4 (no published contract, ever).
 */
function validateContracts(
  packageDir: string,
  population: Entry[],
  contractResult: {
    contracts: { componentId: string; entryDigest: string; contractDigest: string; document: Record<string, unknown> }[];
    index: { contractsRevision: string; counts: unknown; entries: Record<string, unknown>[] };
  },
  contractIndex: unknown,
): void {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const contractSchema = readJson(join(packageDir, "schemas/component-contract.v1.json")) as AnySchema;
  const contractIndexSchema = readJson(join(packageDir, "schemas/component-contract-index.v1.json")) as AnySchema;
  const validateContract = ajv.compile(contractSchema);
  const entryById = new Map(population.map((entry) => [entry.componentId, entry]));
  const docById = new Map<string, Record<string, unknown>>();
  for (const contract of contractResult.contracts) {
    if (!validateContract(contract.document)) {
      throw new Error(
        `emit: contract "${contract.componentId}" fails its schema: ${JSON.stringify(validateContract.errors)}`,
      );
    }
    if (contract.document["contractSource"] !== "derived") {
      throw new Error(`emit: contract "${contract.componentId}" is not derived (GEN-C4)`);
    }
    const entry = entryById.get(contract.componentId);
    if (entry === undefined) throw new Error(`emit: contract "${contract.componentId}" has no K1a entry`);
    if (contract.entryDigest !== entry.digest) {
      throw new Error(`emit: contract "${contract.componentId}" entryDigest does not join its K1a entry`);
    }
    const { digest, ...digestless } = contract.document;
    void digest;
    if (contractDigest(digestless) !== contract.document["digest"]) {
      throw new Error(`emit: contract "${contract.componentId}" digest does not recompute`);
    }
    // Props meta-schema: every contract props must itself compile as a
    // JSON Schema (draft 2020-12).
    for (const framework of FRAMEWORK_ORDER) {
      const cell = (contract.document["frameworks"] as Record<string, Record<string, unknown>>)[framework];
      if (cell === undefined) throw new Error(`emit: contract "${contract.componentId}" misses ${framework}`);
      const props = cell["props"];
      if (props !== undefined) {
        try {
          ajv.compile(props as AnySchema);
        } catch {
          throw new Error(`emit: contract "${contract.componentId}" (${framework}) props is not a JSON Schema`);
        }
      }
    }
    docById.set(contract.componentId, contract.document);
  }
  const validateContractIndex = ajv.compile(contractIndexSchema);
  if (!validateContractIndex(contractIndex)) {
    throw new Error(`emit: contract index fails its schema: ${JSON.stringify(validateContractIndex.errors)}`);
  }
  for (const row of contractResult.index.entries) {
    const document = docById.get(row["componentId"] as string);
    if (document === undefined) throw new Error(`emit: contract index row has no document`);
    if (row["entryDigest"] !== document["entryDigest"]) {
      throw new Error(`emit: contract index row entryDigest mirror broken`);
    }
    if (row["contractDigest"] !== document["digest"]) {
      throw new Error(`emit: contract index row contractDigest mirror broken`);
    }
    const completeness = row["completeness"] as Record<string, string>;
    for (const framework of FRAMEWORK_ORDER) {
      const cell = (document["frameworks"] as Record<string, Record<string, unknown>>)[framework];
      if (cell === undefined) throw new Error(`emit: contract misses ${framework}`);
      if (completeness[framework] !== cell["status"]) {
        throw new Error(`emit: contract index row completeness mirror broken for ${framework}`);
      }
    }
  }
  const raw = JSON.stringify([...contractResult.contracts.map((contract) => contract.document)]);
  if (raw.includes('"contractSource": "published"') || raw.includes('"contractSource":"published"')) {
    throw new Error("emit: a generated contract claims the published source (GEN-C4)");
  }
  void FORMAT_CONTRACT;
}
