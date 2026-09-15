/**
 * Bookmark / URL serialisation of dashboard state.
 *
 * `serializeFilters` produces a compact, URL-safe string; `deserializeFilters`
 * parses it back into a {@link FilterState}, dropping any entry that does not
 * reference a known dimension or whose spec is malformed. The round-trip of a
 * valid state is guaranteed.
 *
 * `serializeState` / `deserializeState` cover the complete shared state used by
 * bookmarks: filters, selections and drill paths. The legacy filter/drill
 * helpers stay available as smaller channels for callers that already use them.
 *
 * Encoding: JSON payload, then `encodeURIComponent`. Plain and
 * robust; the result is safe to drop into a query string. (We avoid base64 so
 * the value stays human-inspectable and dependency-free.)
 */

import type { DataModel } from './model.js';
import { findDimension } from './model.js';
import type {
  DashboardState,
  DrillState,
  FilterSpec,
  FilterState,
  SelectionState,
} from './store.js';
import { isFilterSpec } from './store.js';

const INVALID_DASHBOARD_STATE = 'Invalid serialized dashboard state';

/** Normalise a spec into a minimal, stable object for serialisation. */
function normaliseSpec(spec: FilterSpec): FilterSpec {
  if (spec.kind === 'include' || spec.kind === 'exclude') {
    return { kind: spec.kind, values: [...spec.values] };
  }
  const out: FilterSpec = { kind: 'range' };
  if (spec.min !== undefined) out.min = spec.min;
  if (spec.max !== undefined) out.max = spec.max;
  return out;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseJsonPayload(encoded: string): unknown {
  if (!encoded) return {};
  try {
    return JSON.parse(encoded);
  } catch {
    // Fall through to the established URL-safe encoded representation.
  }
  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch {
    throw new TypeError(INVALID_DASHBOARD_STATE);
  }
}

function normaliseFilterState(raw: unknown, model?: DataModel): FilterState {
  if (raw === undefined) return {};
  if (!isPlainRecord(raw)) return {};

  const result: FilterState = {};
  for (const [dimensionId, spec] of Object.entries(raw)) {
    if (model && !findDimension(model, dimensionId)) continue;
    if (!isFilterSpec(spec)) continue;
    result[dimensionId] = normaliseSpec(spec);
  }
  return result;
}

function normaliseSelectionState(raw: unknown): SelectionState {
  if (raw === undefined) return {};
  if (!isPlainRecord(raw)) return {};

  const result: SelectionState = {};
  for (const [viewId, keys] of Object.entries(raw)) {
    if (!isStringArray(keys) || keys.length === 0) continue;
    result[viewId] = [...keys];
  }
  return result;
}

function serialiseFilterState(filters: FilterState | undefined): FilterState {
  const normalised: FilterState = {};
  for (const key of Object.keys(filters ?? {}).sort()) {
    const spec = filters![key]!;
    if (!isFilterSpec(spec)) {
      throw new TypeError(`Cannot serialize malformed filter spec for dimension ${key}`);
    }
    normalised[key] = normaliseSpec(spec);
  }
  return normalised;
}

/**
 * Serialise the filter portion of a state to a URL-safe string.
 * This preserves the legacy filters-only bookmark channel; use
 * {@link serializeState} when bookmarks must include selections and drill.
 */
export function serializeFilters(state: { filters: FilterState }): string {
  const normalised = serialiseFilterState(state.filters);
  return encodeURIComponent(JSON.stringify(normalised));
}

/**
 * Parse a serialised filter string back to a {@link FilterState}, validating
 * against the model. Unknown dimensions and malformed specs are dropped. Any
 * parse error yields an empty state (never throws).
 */
export function deserializeFilters(encoded: string, model: DataModel): FilterState {
  if (!encoded) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return {};
  }
  if (typeof raw !== 'object' || raw === null) return {};

  const result: FilterState = {};
  for (const [dimensionId, spec] of Object.entries(raw as Record<string, unknown>)) {
    if (!findDimension(model, dimensionId)) continue; // unknown dimension
    if (!isFilterSpec(spec)) continue; // malformed spec
    result[dimensionId] = normaliseSpec(spec);
  }
  return result;
}

function isDrillPath(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string');
}

function normaliseDrillPath(path: readonly string[]): string[] {
  return [...path];
}

function normaliseDrillState(raw: unknown, model?: DataModel): DrillState {
  if (raw === undefined) return {};
  if (!isPlainRecord(raw)) return {};

  const result: DrillState = {};
  for (const [viewId, path] of Object.entries(raw)) {
    if (!isDrillPath(path)) continue;
    if (model && !path.every((dimensionId) => findDimension(model, dimensionId))) continue;
    result[viewId] = normaliseDrillPath(path);
  }
  return result;
}

/**
 * Serialise the drill portion of a state to a URL-safe string.
 * Filters keep their existing bookmark channel; drill is separate so callers
 * can opt in when bookmark semantics include drill navigation.
 */
export function serializeDrill(state: { drill: DrillState }): string {
  const normalised: DrillState = {};
  for (const key of Object.keys(state.drill).sort()) {
    const path = state.drill[key]!;
    if (!isDrillPath(path)) {
      throw new TypeError(`Cannot serialize malformed drill path for view ${key}`);
    }
    normalised[key] = normaliseDrillPath(path);
  }
  return encodeURIComponent(JSON.stringify(normalised));
}

/**
 * Parse a serialised drill string back to a {@link DrillState}, validating
 * dimensions against the model. Unknown dimensions and malformed paths are
 * dropped. Any parse error yields an empty state.
 */
export function deserializeDrill(encoded: string, model: DataModel): DrillState {
  if (!encoded) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return {};
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};

  const result: DrillState = {};
  for (const [viewId, path] of Object.entries(raw as Record<string, unknown>)) {
    if (!isDrillPath(path)) continue;
    if (!path.every((dimensionId) => findDimension(model, dimensionId))) continue;
    result[viewId] = normaliseDrillPath(path);
  }
  return result;
}

function serialiseSelectionState(selections: SelectionState | undefined): SelectionState {
  const normalised: SelectionState = {};
  for (const key of Object.keys(selections ?? {}).sort()) {
    const keys = selections![key]!;
    if (!isStringArray(keys)) {
      throw new TypeError(`Cannot serialize malformed selection keys for view ${key}`);
    }
    if (keys.length > 0) {
      normalised[key] = [...keys];
    }
  }
  return normalised;
}

function serialiseDrillState(drill: DrillState | undefined): DrillState {
  const normalised: DrillState = {};
  for (const key of Object.keys(drill ?? {}).sort()) {
    const path = drill![key]!;
    if (!isDrillPath(path)) {
      throw new TypeError(`Cannot serialize malformed drill path for view ${key}`);
    }
    normalised[key] = normaliseDrillPath(path);
  }
  return normalised;
}

/**
 * Serialise the complete dashboard state to a URL-safe bookmark string.
 */
export function serializeState(state: Partial<DashboardState>): string {
  const normalised: DashboardState = {
    filters: serialiseFilterState(state.filters),
    selections: serialiseSelectionState(state.selections),
    drill: serialiseDrillState(state.drill),
  };
  return encodeURIComponent(JSON.stringify(normalised));
}

/**
 * Parse a complete dashboard bookmark state. Malformed entries inside valid
 * sections are dropped; invalid JSON/root payloads throw a clear error.
 */
export function deserializeState(encoded: string, model?: DataModel): DashboardState {
  const raw = parseJsonPayload(encoded);
  if (!isPlainRecord(raw)) {
    throw new TypeError(INVALID_DASHBOARD_STATE);
  }
  return {
    filters: normaliseFilterState(raw.filters, model),
    selections: normaliseSelectionState(raw.selections),
    drill: normaliseDrillState(raw.drill, model),
  };
}
