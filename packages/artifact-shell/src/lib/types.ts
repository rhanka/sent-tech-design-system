// F-1 freeze surface — display models for @sentropic/design-system-artifact-shell.
//
// These types are the contract the AC-9 adapter codes against. They are plain
// local shapes: strings, numbers, booleans, opaque keys, rectangles, and
// arrays/objects of those. No imported type appears on the right-hand side of
// any declaration in this file; it is a pure type module (the import-graph
// gate asserts zero import specifiers here). No type, import or string in
// this package references a Sentropic, immo, MCP or transport package, an
// anchor grammar, a block identity type, or a thread model.

// §3.1 Shared primitives

/** Opaque runtime key. The DS never parses, formats, compares for meaning,
 *  persists, or constructs one; it echoes the value back in events. */
export type OpaqueKey = string;

export type RectDisplay = {
  x: number;
  y: number;
  width: number;
  height: number;
  // CSS pixels in the viewer-chrome viewport coordinate space: origin at
  // the top-left of the viewer viewport, x right, y down, at the current
  // browser zoom and devicePixelRatio. Frame-viewport coordinates are
  // converted by the AC-9 adapter before props are set. On scroll, resize,
  // zoom, DPR change, header collapse, or release change the adapter
  // re-sends fresh rectangles (rAF-batched); the DS renders only the latest
  // props — it never caches, converts, scales, or maps rectangles to blocks
  // or anchors.
};

/** Closed DS tone union. The adapter maps every runtime tone into this
 *  union at the boundary (B3); a free string never reaches a component.
 *  `neutral` exists in the union; primitives without a neutral variant
 *  (Toast) never receive it (the adapter maps neutral to info there). */
export type DsTone = "info" | "success" | "warning" | "error" | "neutral";

export type BlockDisplay = {
  key: OpaqueKey;
  label: string;       // plain text, computed in-frame by the bridge
  rect: RectDisplay;
  kindLabel: string;   // localised kind text, e.g. "Heading", "Table cell"
  threadCount: number; // existing threads on this block
};

// §3.2 Provisions carried for later lots (defined now, unused by AS-1 rendering)

export type PinDisplay = {
  id: OpaqueKey;
  rect: RectDisplay;
  label: string;
  countLabel?: string;
  unread: boolean;
  resolved: boolean;
  selected: boolean;
  projectionLabel?: string; // runtime wording: exact / source-changed / unresolved
  // Optional adapter-supplied tone for the projection
  // label chip. The DS maps no projection value to a tone; absent renders
  // neutral. Text-only v1 leaves this unset. Adding a glanceable coding
  // later changes only AS-2/AS-4 rendering of this prop.
  projectionTone?: DsTone;
};

// `VersionDisplay` and any follow-latest shape are NOT defined here: the
// single place a "follow latest" affordance would appear is AS-2's
// `VersionSelect`; selecting-the-latest behaviour stays adapter-side.

// §3.3 AS-1 component prop/event types (frozen, F-1)
//
// Svelte components re-export their prop types from the `.svelte` file
// (repository pattern) and the barrel re-exports them; the shapes below are
// normative — a component file that narrows or widens one is a spec
// deviation. The named string props are the materialization of the generic
// `labels` member for the mode set: required strings, so a missing label
// stays a type error.

// CommentModeToggle
export type CommentModeToggleProps = {
  pressed: boolean;
  label: string;          // accessible name + tooltip text source (via labels)
  shortcutLabel: string;  // free display text for the tooltip, e.g. "Ctrl+Alt+M" / "Cmd+Option+M"; may differ from the attribute value
  ariaKeyshortcuts: string; // WAI-ARIA key-shortcut grammar only: modifiers Alt|AltGraph|Control|Meta|Shift (never Ctrl/Cmd/Option), "+" separators, then the ARIA key name (single printable characters uppercased, e.g. "M"); alternatives are space-separated. Exactly one variant per platform from host config, never hard-coded — Control+Alt+M on Windows/Linux/ChromeOS, Meta+Alt+M on macOS, never both space-joined in one value
  labels: { tooltip: string }; // tooltip text, host-supplied and required to contain shortcutLabel verbatim, rendered verbatim via tooltipContent; the accessible name stays `label`
};
export type CommentModeToggleEvents = { onToggle: () => void };

// CommentModeStatus
export type CommentModeStatusProps = {
  visible: boolean;
  statusText: string;
  announcementText: string; // the ONLY content of the polite live region
  hintText?: string;
  candidates: BlockDisplay[]; // reading order as supplied; cycling source
  activeKey: OpaqueKey | null;
};
export type CommentModeStatusEvents = {
  onExitRequest: () => void;               // final Esc stage while focus is in the status
  onCycleBlock: (key: OpaqueKey) => void;  // arrow cycling with focus in the status
  onAnchor: () => void;                    // Enter with focus in the status
};

// BlockHighlightOverlay
export type BlockHighlightOverlayProps = {
  hovered: BlockDisplay | null;
  selected: BlockDisplay | null;
  chipLabel: string; // "Comment on this block" wording arrives via labels; this prop is the rendered chip text
};
// Emitted by the component itself (chip activation only):
export type BlockHighlightOverlayEvents = { onAnchor: () => void };
// Wired by the AC-9 host hit/gesture layer; the component never emits these:
export type BlockHighlightOverlayHostHandlers = {
  onHoverBlock: (key: OpaqueKey | null) => void;
  onBlockClick: (key: OpaqueKey) => void;
};

// LassoLayer
export type LassoLayerProps = {
  active: boolean;
  rect: RectDisplay | null;
};
export type LassoLayerEvents = Record<string, never>; // render-only in AS-1; the component emits no event
// Owned by the AC-9 adapter gesture layer; the component never emits these:
export type LassoLayerHostHandlers = {
  onLassoEnd: (rect: RectDisplay) => void; // bare rect only; no candidate content
  onLassoCancel: () => void;
};

// BlockCandidateList
export type BlockCandidateListProps = {
  open: boolean;
  candidates: BlockDisplay[]; // reading order as supplied
  activeKey: OpaqueKey | null;
  selectedKey: OpaqueKey | null;
  headingLabel: string;
};
export type BlockCandidateListEvents = {
  onPickBlock: (key: OpaqueKey) => void;
  onActiveKeyChange: (key: OpaqueKey) => void;
  onAnchor: (key: OpaqueKey) => void;
  onClose: () => void;
};

// Mode vocabulary: the `mode` value itself (Off | Armed | Hover | Lassoing |
// Selected | Composing) is owned by the viewer and arrives per-component
// through the props above (`pressed`, `visible`, `hovered`, `selected`,
// `active`, `open`). No `mode` prop and no state-machine type is defined; a
// fixture names the state it renders without the components receiving the
// state name.
