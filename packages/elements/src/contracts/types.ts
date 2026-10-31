/**
 * Contract-module types (SPEC_EVOL_DS_JSON_RENDER_STANDARD §5.1).
 *
 * A contract module is the DECLARED reduction of one component's TypeScript
 * props type to its JSON subset. It names the source props type, lists every
 * excluded prop with a reason, declares an explicit replacement for every type
 * the generator cannot convert (never an implicit `any`), narrows complex
 * unions to their JSON form, maps each callback to an output intent (§4.6) and
 * carries the `x-sentropic` metadata (§5.2).
 *
 * The generator (src/generator) reads the props interface declared alongside
 * this metadata in the same module file and turns it into the catalogue entry.
 * The registry of every contract module lives in `./index.ts`.
 */

/** Output intents of §4.6. `null` marks a callback with no mapping. */
export type IntentName = "select" | "open" | "choose-option" | "comment";

/** One row per real callback, §4.6: mapped or explicitly unmapped. */
export interface CallbackIntentRow {
  /** The source component's callback name, e.g. `onSelect`. */
  readonly callback: string;
  /** The callback's TypeScript signature, for the reader. */
  readonly signature: string;
  /** The intent it maps to, or `null` when the callback stays local (hover). */
  readonly intent: IntentName | null;
  /** Where the intent's `target` comes from, when mapped. */
  readonly targetFrom?: string;
  /** Why this mapping (or why there is none). */
  readonly note: string;
}

/** Why a prop is excluded from the catalogue. The list is explicit, never inferred. */
export type ExcludedKind = "function" | "snippet" | "children" | "style-hook";

export interface ExcludedProp {
  readonly prop: string;
  readonly kind: ExcludedKind;
  readonly reason: string;
}

/**
 * A prop whose source type the generator cannot convert, replaced here by an
 * explicit declared type — the §5.1 rule: never an implicit `any`. Every entry
 * must correspond to a visible replacement type in the module, or to a schema
 * fragment the emitter substitutes.
 */
export interface ReplacedType {
  readonly prop: string;
  /** The source type that cannot pass through, e.g. `DataLabelsProp` with a function member. */
  readonly sourceType: string;
  /** The replacement that lands in the schema, e.g. the embedded focus v1 JSON Schema. */
  readonly replacement: string;
  readonly reason: string;
}

/** A complex union narrowed to its JSON form (§5.1, e.g. `dataLabels`). */
export interface NarrowedUnion {
  readonly prop: string;
  readonly sourceForm: string;
  readonly jsonForm: string;
  /** Members of the source form dropped because they are not JSON (e.g. `format`). */
  readonly dropped: readonly string[];
  readonly reason: string;
}

/** One framework implementation compared by the parity guard (§5.1). */
export type FrameworkName = "svelte" | "react" | "vue" | "angular";

export interface FrameworkSource {
  readonly framework: FrameworkName;
  /** Workspace-relative path of the file the guard reads. */
  readonly file: string;
  /** The public props type name in that framework. */
  readonly typeName: string;
  /**
   * - `source-of-truth`: the Svelte reference pilot the catalogue is derived
   *   from (not mechanically generatable — it lives inside a `.svelte` file).
   * - `compared`: mechanically compared by the guard.
   * - `no-counterpart`: this framework ships no such component.
   */
  readonly role: "source-of-truth" | "compared" | "no-counterpart";
  readonly note?: string;
}

/**
 * The pin of the owning runtime that validates the component's semantics
 * (§4.3 item 2). `document` is the prop carrying the semantic payload.
 */
export interface SemanticPin {
  readonly source: "focus" | "bpmn-canvas" | "diagram-core";
  /** The exact runtime package the pin was measured against. */
  readonly runtimePackage: string;
  /** Schema subpath inside that package, when it ships one. */
  readonly schemaSubpath?: string;
  /** `$id` of that schema, when it ships one. */
  readonly schemaId?: string;
  /** sha256 of the schema file, recorded so a changed file fails generation. */
  readonly sha256?: string;
  readonly reason: string;
}

/** The `x-sentropic` block of §5.2, minus `parity` and `schema` (generator-owned). */
export interface XSentropicCore {
  readonly contract: string;
  readonly element: string;
  /** "core" or "lazy:<chunk>" — the lazy chunk names the semantic owner too. */
  readonly engine: string;
  /** Intent names the component can emit (§4.6). */
  readonly events: readonly IntentName[];
  readonly fallback: "text" | "svg";
}

/** One catalogued component's declared contract (§5.1). */
export interface ContractModule {
  /** The A2UI component name, the `catalogue.components` key. */
  readonly component: string;
  /** The props interface name the generator reads from this module. */
  readonly propsTypeName: string;
  /** The source props type this module is derived from (§5.1). */
  readonly source: {
    readonly packageName: string;
    readonly file: string;
    readonly typeName: string;
    readonly note: string;
  };
  readonly excluded: readonly ExcludedProp[];
  readonly replacedTypes: readonly ReplacedType[];
  readonly narrowedUnions: readonly NarrowedUnion[];
  readonly callbacks: readonly CallbackIntentRow[];
  readonly frameworks: readonly FrameworkSource[];
  readonly metadata: XSentropicCore;
  /** The committed example: an A2UI component object (`id`, `component`, props). */
  readonly example: Record<string, unknown>;
  /** Present when a runtime owns this component's semantics (§4.3 item 2). */
  readonly semantic?: SemanticPin;
  /** §5.2 `x-sentropic.status` — placeholder entries only. */
  readonly status?: "unknown";
}
