/**
 * K1a frozen values (k1a-spec-frozen.md section 2).
 *
 * Every value below is FROZEN. The generator imports them from here only.
 * K2-only projections (FILTER_FRAMEWORKS, ORIGIN_VALUES) are recorded here
 * so K1a fields support them; no K1a code mints a `js` or `origin` value.
 */

export const PRODUCER_ID = "sentropic-ds";

export const FORMAT_ENTRY = "component-entry/v1" as const;
export const FORMAT_INDEX = "component-index/v1" as const;

export const SCHEMA_ID_BASE = "https://design-system.sent-tech.ca/catalogs/components/v1/";

export const SCOPE_VALUES = ["generic", "producer"] as const;
export type Scope = (typeof SCOPE_VALUES)[number];

export const VISIBILITY_VALUES = ["public", "tenant", "workspace"] as const;
export type Visibility = (typeof VISIBILITY_VALUES)[number];

export const PARITY_STATUSES = ["match", "source-of-truth", "no-counterpart", "missing"] as const;
export type ParityStatus = (typeof PARITY_STATUSES)[number];
export type ParityMap = Record<string, ParityStatus>;

export const DATA_CLASS_VALUES = ["public-safe", "tenant-private", "workspace-private"] as const;
export type DataClass = (typeof DATA_CLASS_VALUES)[number];

// DS emission defaults: every K1a DS entry carries these values.
export const SCOPE_DEFAULT = "generic" as const;
export const VISIBILITY_DEFAULT = "public" as const;
export const DATA_CLASS_DEFAULT = "public-safe" as const;

export const FRAMEWORK_ORDER = ["svelte", "react", "vue", "angular"] as const;
export type Framework = (typeof FRAMEWORK_ORDER)[number];

// K2 only: five build targets (joint-spec 7.1). Never an entry value.
export const FILTER_FRAMEWORKS = ["svelte", "react", "vue", "angular", "js"] as const;

// K2 projection only: never a stored entry field, never an entry value.
export const ORIGIN_VALUES = ["ds-elements", "ds-native", "ds-geo", "producer"] as const;

export const OVERLAY_FILENAME = "catalog-overlay.json";

export const HOUSE_THEMES = ["sent-tech", "forge", "entropic"] as const;

// Digest domain tags (unchanged by the freeze).
export const ENTRY_DIGEST_TAG = "sentropic.ds.component-entry/v1";
export const INDEX_DIGEST_TAG = "sentropic.ds.component-index/v1";

// Delivery channel rank (spec section 6.4): source-by-framework,
// then element, css-classes, tokens, esm.
export const DELIVERY_CHANNEL_RANK: Record<string, number> = {
  source: 0,
  element: 1,
  "css-classes": 2,
  tokens: 3,
  esm: 4,
};

// Generator identity recorded in `generatedBy` (outside the revision
// preimage, spec section 4.2: a generator note never forges a revision).
export const GENERATOR_NAME = "@sentropic/design-system-component-index";
