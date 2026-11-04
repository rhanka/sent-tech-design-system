/**
 * Overlay loading (spec section 6.2): `catalog-overlay.json` carries the
 * non-catalogue entries (bpmn-canvas, decision-dossier, geo-map, tokens).
 *
 * The overlay is additive metadata: it can never override a catalogue row
 * (collision fails generation), and a non-excluded row missing a language
 * string fails loudly (`missing source`) instead of emitting a half entry.
 * Excluded rows carry no descriptions and are logged, never emitted.
 */
import { readFileSync } from "node:fs";

export interface OverlayEntry {
  componentId: string;
  displayName: string;
  description: { fr: string; en: string };
  category?: string;
  status?: string;
  groupSlug?: string;
  scope?: string;
  visibility?: string;
  scopePolicyRef?: string;
  dataClass?: string;
}

export interface OverlayExcluded {
  componentId: string;
  reason: string;
}

export interface Overlay {
  version: number;
  entries: OverlayEntry[];
  excluded: OverlayExcluded[];
}

const COMPONENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(holder: Record<string, unknown>, key: string, what: string): string {
  const value = holder[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`overlay: ${what} needs a non-empty "${key}" (missing source)`);
  }
  return value;
}

/** Parse and shape-check overlay text (fileName labels errors). */
export function parseOverlayText(sourceText: string, fileName: string): Overlay {
  let parsed: unknown;
  try {
    parsed = JSON.parse(sourceText);
  } catch {
    throw new Error(`overlay: ${fileName} is not valid JSON`);
  }
  if (!isRecord(parsed)) throw new Error(`overlay: ${fileName} root must be an object`);
  if (parsed["version"] !== 1) throw new Error(`overlay: ${fileName} version must be 1`);
  if (!Array.isArray(parsed["entries"]) || !Array.isArray(parsed["excluded"])) {
    throw new Error(`overlay: ${fileName} needs "entries" and "excluded" arrays`);
  }
  const entries: OverlayEntry[] = parsed["entries"].map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`overlay: entries[${index}] must be an object`);
    const componentId = requiredString(raw, "componentId", `entries[${index}]`);
    if (!COMPONENT_ID_PATTERN.test(componentId)) {
      throw new Error(`overlay: entries[${index}] componentId "${componentId}" is not kebab-case`);
    }
    const displayName = requiredString(raw, "displayName", `entries[${index}]`);
    if (!isRecord(raw["description"])) {
      throw new Error(`overlay: "${componentId}" misses its description object (missing source)`);
    }
    const description = raw["description"] as Record<string, unknown>;
    // A missing language fails loudly here (conductor: missing source).
    const fr = requiredString(description, "fr", `"${componentId}" description`);
    const en = requiredString(description, "en", `"${componentId}" description`);
    if (fr.length > 280 || en.length > 280) {
      throw new Error(`overlay: "${componentId}" description exceeds 280 chars (frozen Q6)`);
    }
    const entry: OverlayEntry = { componentId, displayName, description: { fr, en } };
    for (const key of ["category", "status", "groupSlug", "scope", "visibility", "scopePolicyRef", "dataClass"] as const) {
      const value = raw[key];
      if (value !== undefined) {
        if (typeof value !== "string" || value.length === 0) {
          throw new Error(`overlay: "${componentId}" field "${key}" must be a non-empty string`);
        }
        entry[key] = value;
      }
    }
    return entry;
  });
  const excluded: OverlayExcluded[] = parsed["excluded"].map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`overlay: excluded[${index}] must be an object`);
    return {
      componentId: requiredString(raw, "componentId", `excluded[${index}]`),
      reason: requiredString(raw, "reason", `excluded[${index}]`),
    };
  });
  const ids = new Set<string>();
  for (const row of [...entries, ...excluded]) {
    if (ids.has(row.componentId)) throw new Error(`overlay: duplicate row "${row.componentId}"`);
    ids.add(row.componentId);
  }
  return { version: 1, entries, excluded };
}

/** Load the committed overlay file. */
export function loadOverlay(overlayPath: string): Overlay {
  return parseOverlayText(readFileSync(overlayPath, "utf8"), overlayPath);
}
