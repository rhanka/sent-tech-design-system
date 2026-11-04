import type * as ts from "typescript";

import type { Framework } from "../constants.js";

export type Completeness = "complete" | "partial" | "none";

export type LossKind =
  | "function"
  | "snippet"
  | "node"
  | "style-hook"
  | "generic"
  | "index-signature"
  | "other";

export interface Loss {
  name: string;
  kind: LossKind;
  sourceType: string;
  reason: string;
}

export interface Replacement {
  name: string;
  sourceType: string;
  replacement: string;
  reason: string;
}

export type JsonSchema = Record<string, unknown>;

export interface Slot {
  name: string;
  params?: JsonSchema;
  required?: boolean;
}

export interface ContractEvent {
  name: string;
  payload?: JsonSchema;
}

export interface ContractSource {
  package: string;
  version: string;
  declarationPath: string;
  declarationDigest: string;
  propsType: string;
}

export interface Passthrough {
  base: string;
  omitted: string[];
}

/** One framework cell of a component contract, before digest pinning. */
export interface FrameworkBody {
  status: Completeness;
  reason?: string;
  source: ContractSource;
  props?: JsonSchema;
  passthrough?: Passthrough;
  slots: Slot[];
  events: ContractEvent[];
  bindable: string[];
  dropped: Loss[];
  replaced: Replacement[];
  unresolved: Loss[];
  limitations: string[];
  warnings: string[];
}

export interface FrameworkInput {
  program: ts.Program;
  checker: ts.TypeChecker;
  /** Declaration file that carries the props type (or the component). */
  declFile: ts.SourceFile;
  /** Repo-relative posix path of the declaration file. */
  repoDeclPath: string;
  declarationDigest: string;
  packageName: string;
  packageVersion: string;
  /** Component identifier, for example "DataTable". */
  identifier: string;
  /** Baseline-reviewed expected slot names (Vue Q5 profile). */
  expectedSlots: string[] | undefined;
}

/** The K1b-Q5 profile limitation every framework contract carries. */
export const DEFAULTS_LIMITATION =
  "Defaults are not represented in declaration types and are not extracted (K1b-Q5 profile).";

/** The Vue slot-surface limitation (spec 7.4). */
export const VUE_SLOTS_LIMITATION =
  "Slot surface is not represented in Vue declaration types; slots list is declaration-derived only.";

/** The absent-cell limitation: no export means no extractable surface. */
export const ABSENT_LIMITATION =
  "No component declaration is exported for this framework; the none cell carries no extractable surface.";

/** The no-props limitation: the declaration names no extractable props type. */
export const NO_PROPS_LIMITATION =
  "No props type was found in the declaration; the none cell carries no extractable surface.";
