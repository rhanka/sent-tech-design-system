import { describe, expect, it } from "vitest";
import type {
  BlockCandidateListEvents,
  BlockCandidateListProps,
  BlockDisplay,
  BlockHighlightOverlayEvents,
  BlockHighlightOverlayHostHandlers,
  BlockHighlightOverlayProps,
  CommentModeStatusEvents,
  CommentModeStatusProps,
  CommentModeToggleEvents,
  CommentModeToggleProps,
  DsTone,
  LassoLayerEvents,
  LassoLayerHostHandlers,
  LassoLayerProps,
  OpaqueKey,
  PinDisplay,
  RectDisplay
} from "./types.js";
import { makeBlock, makeBlocks, modeLabels, pageBackgrounds } from "./fixtures.js";

// W-0.2 — type-level witnesses for the F-1 freeze surface (src/lib/types.ts).
//
// The compile-time half is enforced by `svelte-check` (the package `check`
// script): every `@ts-expect-error` below must be a real error, and an unused
// directive fails the check. The no-runtime-import property of types.ts is
// enforced mechanically by import-graph.test.ts (types.ts must have zero
// import specifiers). The runtime half asserts the fixture factories' shapes.

// Closed tone union: an out-of-union string is a compile error.
// @ts-expect-error "critical" is not in the closed DsTone union
const badTone: DsTone = "critical";
const neutralTone: DsTone = "neutral";

// SA-1: candidates and activeKey are required on CommentModeStatusProps.
// @ts-expect-error missing required candidates and activeKey
const missingStatusFields: CommentModeStatusProps = {
  visible: true,
  statusText: "s",
  announcementText: "a"
};

// Event ownership (H-1): BlockHighlightOverlay declares only onAnchor; hover
// and click live in the separate host-handler type wired by the AC-9 host.
const overlayEvents: BlockHighlightOverlayEvents = { onAnchor: () => {} };
// @ts-expect-error the overlay emits only onAnchor, never onHoverBlock
const overlayHoverEvent: BlockHighlightOverlayEvents = { onHoverBlock: (_key: OpaqueKey | null) => {} };
const overlayHostHandlers: BlockHighlightOverlayHostHandlers = {
  onHoverBlock: (_key: OpaqueKey | null) => {},
  onBlockClick: (_key: OpaqueKey) => {}
};

// LassoLayer is render-only in AS-1: its event type admits no event at all.
// @ts-expect-error LassoLayerEvents = Record<string, never> admits no event
const lassoEvent: LassoLayerEvents = { onLassoEnd: (_rect: RectDisplay) => {} };
const lassoHostHandlers: LassoLayerHostHandlers = {
  onLassoEnd: (_rect: RectDisplay) => {},
  onLassoCancel: () => {}
};

// Positive shapes that must keep compiling (frozen §3.3 surface).
const toggleProps: CommentModeToggleProps = {
  pressed: false,
  label: "l",
  shortcutLabel: "s",
  ariaKeyshortcuts: "Alt+Shift+Z",
  labels: { tooltip: "t" }
};
const toggleEvents: CommentModeToggleEvents = { onToggle: () => {} };
const statusEvents: CommentModeStatusEvents = {
  onExitRequest: () => {},
  onCycleBlock: (_key: OpaqueKey) => {},
  onAnchor: () => {}
};
const statusProps: CommentModeStatusProps = {
  visible: true,
  statusText: "s",
  announcementText: "a",
  candidates: [],
  activeKey: null
};
const overlayProps: BlockHighlightOverlayProps = { hovered: null, selected: null, chipLabel: "c" };
const lassoProps: LassoLayerProps = { active: false, rect: null };
const listProps: BlockCandidateListProps = {
  open: true,
  candidates: [],
  activeKey: null,
  selectedKey: null,
  headingLabel: "h"
};
const listEvents: BlockCandidateListEvents = {
  onPickBlock: (_key: OpaqueKey) => {},
  onActiveKeyChange: (_key: OpaqueKey) => {},
  onAnchor: (_key: OpaqueKey) => {},
  onClose: () => {}
};
const pin: PinDisplay = {
  id: "k",
  rect: { x: 0, y: 0, width: 1, height: 1 },
  label: "l",
  unread: false,
  resolved: false,
  selected: false
};

// OpaqueKey passthrough: a generic echo returns the value unchanged.
function echo<T>(value: T): T {
  return value;
}

describe("W-0.2 display-model types and fixture factories", () => {
  it("DsTone is the closed five-value union (compile-time half above)", () => {
    expect(neutralTone).toBe("neutral");
    expect(badTone).toBe("critical"); // runtime echo of the rejected literal
  });

  it("OpaqueKey passes through a generic echo unchanged", () => {
    const key: OpaqueKey = "sentinel-opaque-key";
    expect(echo(key)).toBe(key);
  });

  it("makeBlock returns exactly the BlockDisplay keys with a RectDisplay rect", () => {
    const block: BlockDisplay = makeBlock();
    expect(Object.keys(block).sort()).toEqual(["key", "kindLabel", "label", "rect", "threadCount"]);
    expect(Object.keys(block.rect).sort()).toEqual(["height", "width", "x", "y"]);
    expect(typeof block.key).toBe("string");
    expect(typeof block.label).toBe("string");
    expect(typeof block.kindLabel).toBe("string");
    expect(typeof block.threadCount).toBe("number");
  });

  it("makeBlock applies overrides", () => {
    const block = makeBlock({ label: "SENTINEL-OVERRIDE", threadCount: 3, rect: { x: 1, y: 2, width: 3, height: 4 } });
    expect(block.label).toBe("SENTINEL-OVERRIDE");
    expect(block.threadCount).toBe(3);
    expect(block.rect).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });

  it("makeBlocks(n) returns n blocks in reading order with distinct keys", () => {
    const blocks = makeBlocks(3);
    expect(blocks).toHaveLength(3);
    expect(new Set(blocks.map((b) => b.key)).size).toBe(3);
    expect(blocks.map((b) => b.label)).toEqual([
      blocks[0].label,
      blocks[1].label,
      blocks[2].label
    ]);
    for (const b of blocks) {
      expect(Object.keys(b.rect).sort()).toEqual(["height", "width", "x", "y"]);
    }
  });

  it("modeLabels returns the full label set with the shortcut inside the tooltip", () => {
    const labels = modeLabels();
    expect(Object.keys(labels).sort()).toEqual([
      "announcementText",
      "ariaKeyshortcuts",
      "chipLabel",
      "headingLabel",
      "hintText",
      "shortcutLabel",
      "statusText",
      "toggleLabel",
      "tooltip"
    ]);
    expect(labels.tooltip).toContain(labels.shortcutLabel);
    const overridden = modeLabels({ statusText: "SENTINEL-STATUS" });
    expect(overridden.statusText).toBe("SENTINEL-STATUS");
    expect(overridden.toggleLabel).toBe(labels.toggleLabel);
  });

  it("pageBackgrounds exposes the light-page and dark-page fixture backgrounds", () => {
    expect(typeof pageBackgrounds.pageLight.background).toBe("string");
    expect(typeof pageBackgrounds.pageDark.background).toBe("string");
    expect(pageBackgrounds.pageLight.background).not.toBe(pageBackgrounds.pageDark.background);
  });
});
