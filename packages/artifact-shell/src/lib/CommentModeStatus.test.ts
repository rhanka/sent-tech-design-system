import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render } from "@testing-library/svelte";
import { compileTheme } from "@sentropic/design-system-themes";
import { compile } from "svelte/compiler";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import BlockCandidateList from "./BlockCandidateList.svelte";
import BlockHighlightOverlay from "./BlockHighlightOverlay.svelte";
import CommentModeStatus from "./CommentModeStatus.svelte";
import CommentModeToggle from "./CommentModeToggle.svelte";
import LassoLayer from "./LassoLayer.svelte";
import { makeBlocks, modeLabels, viewerThemes } from "./fixtures.js";
import type {
  BlockDisplay,
  BlockHighlightOverlayHostHandlers,
  LassoLayerHostHandlers,
  OpaqueKey
} from "./types.js";

// W-1.2 / W-1.3 / W-1.4 — CommentModeStatus witnesses (F-S1…F-S4, F-S2
// live-region discipline, F-K2 arrow scoping), plus the W-1.8 harness
// (F-K1 full keyboard trail §5.6 steps 1–7 with the adopted Q2 steps 4–5,
// staged Esc list → Armed → Off, cancel focus, and the H-1 host-handler
// half) and W-1.10 (F-A1 absence). Sentinels are non-real: every visible
// string round-trips from props.

const SOURCE = readFileSync(resolve("src/lib/CommentModeStatus.svelte"), "utf8");
const COMPILED_CSS = compile(SOURCE, { css: "external", filename: "CommentModeStatus.svelte" }).css?.code ?? "";

function renderInTheme(props: ComponentProps<typeof CommentModeStatus>) {
  const themeRoot = document.createElement("div");
  themeRoot.setAttribute("data-st-theme", "sent-tech");
  document.body.appendChild(themeRoot);
  return { ...render(CommentModeStatus, { props, target: themeRoot }), themeRoot };
}

function statusProps(labels = modeLabels(), overrides: Record<string, unknown> = {}) {
  return {
    visible: true,
    statusText: labels.statusText,
    announcementText: labels.announcementText,
    hintText: labels.hintText,
    candidates: makeBlocks(3),
    activeKey: null,
    ...overrides
  };
}

function statusEvents() {
  return {
    onExitRequest: vi.fn(),
    onCycleBlock: vi.fn(),
    onAnchor: vi.fn()
  };
}

describe("W-1.2 CommentModeStatus (F-S1 / F-S3 / F-S4)", () => {
  it("F-S1 Armed entry: root tabIndex=-1, no ARIA role, one polite live region holding exactly announcementText, status text outside it, focus lands on root, not inside any header", () => {
    const labels = modeLabels();
    const events = statusEvents();
    const { themeRoot } = renderInTheme({ ...statusProps(labels), ...events });

    const root = themeRoot.querySelector('[data-st-shell="comment-mode-status"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute("tabindex")).toBe("-1");
    // no ARIA role on the root (spec §5.2)
    expect(root.getAttribute("role")).toBeNull();

    // exactly one polite live region; its text is exactly announcementText
    const liveRegions = themeRoot.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBe(1);
    const live = liveRegions[0] as HTMLElement;
    expect(live.textContent).toBe(labels.announcementText);
    // status text renders OUTSIDE the live region
    expect(root.textContent).toContain(labels.statusText);
    expect(live.textContent).not.toContain(labels.statusText);

    // the harness focuses the root (mode-entry focus target, no extra prop)
    root.focus();
    expect(document.activeElement).toBe(root);

    // composed outside any header element (§5.2 placement)
    expect(root.closest("header")).toBeNull();
    expect(themeRoot.querySelector("header")).toBeNull();
  });

  it("F-S3 hint: hintText renders outside the live region; the live region is unchanged by the hint", async () => {
    const labels = modeLabels();
    const events = statusEvents();
    const { themeRoot, rerender } = renderInTheme({ ...statusProps(labels), ...events });

    const live = themeRoot.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live.textContent).toBe(labels.announcementText);
    expect(themeRoot.textContent).toContain(labels.hintText);
    expect(live.textContent).not.toContain(labels.hintText);

    // a new announcement prop renders into the live region; the hint stays out
    await rerender({ ...statusProps(labels), announcementText: "SENTINEL-ANNOUNCEMENT-2", ...events });
    expect(live.textContent).toBe("SENTINEL-ANNOUNCEMENT-2");
    expect(live.textContent).not.toContain(labels.hintText);
  });

  it("F-S4 hidden (Off): visible=false renders nothing", () => {
    const labels = modeLabels();
    const { themeRoot } = renderInTheme({
      ...statusProps(labels),
      visible: false,
      ...statusEvents()
    });
    expect(themeRoot.querySelector('[data-st-shell="comment-mode-status"]')).toBeNull();
    expect(themeRoot.querySelector("[aria-live]")).toBeNull();
    expect(themeRoot.childElementCount).toBe(0);
  });
});

describe("W-1.3 CommentModeStatus cycling + live-region discipline (F-S2)", () => {
  it("F-S2 clamped arrow cycling emits neighbour keys; null activeKey emits first (Down) / last (Up); empty candidates emit nothing", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = statusEvents();
    const { themeRoot, rerender } = renderInTheme({
      ...statusProps(labels, { candidates: blocks, activeKey: blocks[1].key }),
      ...events
    });
    const root = themeRoot.querySelector('[data-st-shell="comment-mode-status"]') as HTMLElement;

    // ArrowDown from the middle emits the next key, captured (preventDefault)
    expect(await fireEvent.keyDown(root, { key: "ArrowDown" })).toBe(false);
    expect(events.onCycleBlock).toHaveBeenLastCalledWith(blocks[2].key);
    // ArrowUp emits the previous key
    await fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(events.onCycleBlock).toHaveBeenLastCalledWith(blocks[0].key);
    expect(events.onCycleBlock).toHaveBeenCalledTimes(2);

    // clamp, no wrap: Down at the last candidate re-emits the last key
    await rerender({ ...statusProps(labels, { candidates: blocks, activeKey: blocks[2].key }), ...events });
    await fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(events.onCycleBlock).toHaveBeenLastCalledWith(blocks[2].key);
    // Up at the first candidate re-emits the first key
    await rerender({ ...statusProps(labels, { candidates: blocks, activeKey: blocks[0].key }), ...events });
    await fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(events.onCycleBlock).toHaveBeenLastCalledWith(blocks[0].key);

    // activeKey null: Down → first, Up → last
    await rerender({ ...statusProps(labels, { candidates: blocks, activeKey: null }), ...events });
    await fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(events.onCycleBlock).toHaveBeenLastCalledWith(blocks[0].key);
    await fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(events.onCycleBlock).toHaveBeenLastCalledWith(blocks[2].key);

    // empty candidates: arrows emit nothing
    await rerender({ ...statusProps(labels, { candidates: [], activeKey: null }), ...events });
    const before = events.onCycleBlock.mock.calls.length;
    await fireEvent.keyDown(root, { key: "ArrowDown" });
    await fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(events.onCycleBlock.mock.calls.length).toBe(before);
  });

  it("live-region discipline: sibling overlay hover churn produces zero announcement changes; each cycling step renders the new announcement exactly once", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = statusEvents();
    const themeRoot = document.createElement("div");
    themeRoot.setAttribute("data-st-theme", "sent-tech");
    document.body.appendChild(themeRoot);
    const status = render(CommentModeStatus, {
      target: themeRoot,
      props: { ...statusProps(labels, { candidates: blocks, activeKey: blocks[0].key }), ...events }
    });
    const overlay = render(BlockHighlightOverlay, {
      target: themeRoot,
      props: { hovered: blocks[0], selected: null, chipLabel: labels.chipLabel, onAnchor: vi.fn() }
    });

    const live = themeRoot.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live.textContent).toBe(labels.announcementText);

    // pointer-move prop churn on the sibling overlay: zero announcement changes
    await overlay.rerender({ hovered: blocks[1], selected: null, chipLabel: labels.chipLabel, onAnchor: vi.fn() });
    await overlay.rerender({ hovered: null, selected: null, chipLabel: labels.chipLabel, onAnchor: vi.fn() });
    expect(live.textContent).toBe(labels.announcementText);
    expect(events.onCycleBlock).not.toHaveBeenCalled();
    expect(events.onAnchor).not.toHaveBeenCalled();

    // each cycling step changes the announcement exactly once (prop-driven)
    await status.rerender({
      ...statusProps(labels, { candidates: blocks, activeKey: blocks[1].key }),
      announcementText: "SENTINEL-CYCLE-2",
      ...events
    });
    expect(live.textContent).toBe("SENTINEL-CYCLE-2");
    await status.rerender({
      ...statusProps(labels, { candidates: blocks, activeKey: blocks[2].key }),
      announcementText: "SENTINEL-CYCLE-3",
      ...events
    });
    expect(live.textContent).toBe("SENTINEL-CYCLE-3");

    // entry/exit announcements render from props
    await status.rerender({ ...statusProps(labels), announcementText: "SENTINEL-ENTRY", ...events });
    expect(live.textContent).toBe("SENTINEL-ENTRY");
    await status.rerender({ ...statusProps(labels), announcementText: "SENTINEL-EXIT", ...events });
    expect(live.textContent).toBe("SENTINEL-EXIT");
  });
});

describe("W-1.4 arrow scoping (F-K2 portion)", () => {
  it("arrows with focus outside the status emit nothing and are not preventDefault-ed; paging keys in the status are never captured", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = statusEvents();
    const themeRoot = document.createElement("div");
    themeRoot.setAttribute("data-st-theme", "sent-tech");
    document.body.appendChild(themeRoot);
    render(CommentModeStatus, {
      target: themeRoot,
      props: { ...statusProps(labels, { candidates: blocks, activeKey: null }), ...events }
    });
    const root = themeRoot.querySelector('[data-st-shell="comment-mode-status"]') as HTMLElement;

    // an outside focus holder (any chrome element stands in for the toggle)
    const outside = document.createElement("button");
    themeRoot.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    // ArrowDown with focus outside: no capture (dispatchEvent returns true),
    // no event emitted — the listener lives on the status root, never window
    expect(await fireEvent.keyDown(outside, { key: "ArrowDown" })).toBe(true);
    expect(await fireEvent.keyDown(document.body, { key: "ArrowUp" })).toBe(true);
    expect(events.onCycleBlock).not.toHaveBeenCalled();

    // paging/navigation keys inside the status: never captured, no event
    root.focus();
    for (const key of ["PageDown", "PageUp", "Home", "End"]) {
      expect(await fireEvent.keyDown(root, { key })).toBe(true);
    }
    expect(events.onCycleBlock).not.toHaveBeenCalled();
    expect(events.onAnchor).not.toHaveBeenCalled();
    expect(events.onExitRequest).not.toHaveBeenCalled();

    // arrows inside the status ARE captured (contrast assertion)
    expect(await fireEvent.keyDown(root, { key: "ArrowDown" })).toBe(false);
    expect(events.onCycleBlock).toHaveBeenCalledTimes(1);
    // Enter / Escape inside the status are captured
    expect(await fireEvent.keyDown(root, { key: "Enter" })).toBe(false);
    expect(events.onAnchor).toHaveBeenCalledTimes(1);
    expect(await fireEvent.keyDown(root, { key: "Escape" })).toBe(false);
    expect(events.onExitRequest).toHaveBeenCalledTimes(1);
  });
});

describe("W-1.2/W-1.3 F-X1 + F-R1 on CommentModeStatus", () => {
  it("F-X1 label swap: every visible/accessible string changes, zero residual sentinel", async () => {
    const labels = modeLabels();
    const events = statusEvents();
    const { themeRoot, rerender } = renderInTheme({ ...statusProps(labels), ...events });
    expect(themeRoot.innerHTML).toContain(labels.statusText);
    expect(themeRoot.innerHTML).toContain(labels.announcementText);
    expect(themeRoot.innerHTML).toContain(labels.hintText);

    const swapped = modeLabels({
      statusText: "SWAPPED-STATUS-TEXT",
      announcementText: "SWAPPED-ANNOUNCEMENT-TEXT",
      hintText: "SWAPPED-HINT-TEXT"
    });
    await rerender({ ...statusProps(swapped), ...events });
    const html = themeRoot.innerHTML;
    for (const old of [labels.statusText, labels.announcementText, labels.hintText]) {
      expect(html).not.toContain(old);
    }
    expect(html).toContain(swapped.statusText);
    expect(html).toContain(swapped.hintText);
    expect((themeRoot.querySelector('[aria-live="polite"]') as HTMLElement).textContent).toBe(swapped.announcementText);
  });

  it("F-R1 reduced motion: the compiled component ships a prefers-reduced-motion block with zero durations", () => {
    const media = COMPILED_CSS.slice(COMPILED_CSS.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(media).toContain("@media (prefers-reduced-motion: reduce)");
    expect(media).toContain("transition-duration: 0s");
    expect(media).toContain("animation-duration: 0s");
  });
});

// ---------------------------------------------------------------------------
// W-1.8 harness (F-K1): the five components composed with a minimal host shim
// (test-owned, never shipped) that owns mode state and moves focus as the
// viewer would (§5.6). The composer stub is harness-owned test code standing
// in for AS-3's CommentComposer.
// ---------------------------------------------------------------------------

type Mode = "off" | "armed" | "selected" | "composing";

function buildHarness() {
  const labels = modeLabels();
  const blocks = makeBlocks(3);
  const themeRoot = document.createElement("div");
  themeRoot.setAttribute("data-st-theme", "sent-tech");
  document.body.appendChild(themeRoot);

  const state = {
    mode: "off" as Mode,
    activeKey: null as OpaqueKey | null,
    selectedKey: null as OpaqueKey | null,
    listOpen: false,
    // §5.6 steps 5/7 record which stub button returned to Selected, and the
    // harness flags decide whether that button also opens the list — the
    // "when open, else …" branches are exercised both ways.
    via: null as "change" | "cancel" | null,
    openListOnChange: true,
    openListOnCancel: true,
    hovered: null as BlockDisplay | null,
    announcement: "",
    cycleStep: 0
  };

  const events = {
    toggle: vi.fn(() => {
      state.mode = state.mode === "off" ? "armed" : "off";
      state.via = null;
      if (state.mode === "armed") {
        state.activeKey = null;
        state.announcement = labels.announcementText;
      }
    }),
    status: {
      onExitRequest: vi.fn(() => {
        state.mode = "off";
      }),
      onCycleBlock: vi.fn((key: OpaqueKey) => {
        state.activeKey = key;
        state.cycleStep += 1;
        state.announcement = `${labels.announcementText} ${state.cycleStep}`;
      }),
      onAnchor: vi.fn(() => {
        // keyless anchor: the runtime anchors the current activeKey
        state.selectedKey = state.activeKey;
        state.mode = "composing";
      })
    },
    overlay: {
      onAnchor: vi.fn(() => {
        // the chip anchors the highlighted block; the harness hit layer
        // already set selectedKey via onBlockClick
        state.mode = "composing";
      })
    },
    list: {
      onPickBlock: vi.fn((key: OpaqueKey) => {
        state.selectedKey = key;
        state.mode = "composing";
      }),
      onActiveKeyChange: vi.fn((key: OpaqueKey) => {
        state.activeKey = key;
      }),
      onAnchor: vi.fn((key: OpaqueKey) => {
        state.selectedKey = key;
        state.mode = "composing";
      }),
      onClose: vi.fn(() => {
        state.listOpen = false;
        state.mode = "armed";
      })
    }
  };

  // Host hit/gesture layer (H-1): the harness owns these; the components never
  // emit them.
  const hostHandlers: BlockHighlightOverlayHostHandlers = {
    onHoverBlock: (key) => {
      state.hovered = key === null ? null : (blocks.find((b) => b.key === key) ?? null);
    },
    onBlockClick: (key) => {
      state.selectedKey = key;
      state.mode = "selected";
    }
  };
  const lassoHandlers: LassoLayerHostHandlers = {
    onLassoEnd: () => {},
    onLassoCancel: () => {}
  };

  const toggle = render(CommentModeToggle, {
    target: themeRoot,
    props: {
      pressed: false,
      label: labels.toggleLabel,
      shortcutLabel: labels.shortcutLabel,
      ariaKeyshortcuts: labels.ariaKeyshortcuts,
      labels: { tooltip: labels.tooltip },
      onToggle: events.toggle
    }
  });
  const status = render(CommentModeStatus, {
    target: themeRoot,
    props: {
      visible: false,
      statusText: labels.statusText,
      announcementText: "",
      hintText: labels.hintText,
      candidates: blocks,
      activeKey: null,
      ...events.status
    }
  });
  const overlay = render(BlockHighlightOverlay, {
    target: themeRoot,
    props: { hovered: null, selected: null, chipLabel: labels.chipLabel, onAnchor: events.overlay.onAnchor }
  });
  render(LassoLayer, { target: themeRoot, props: { active: false, rect: null } });
  const list = render(BlockCandidateList, {
    target: themeRoot,
    props: {
      open: false,
      candidates: blocks,
      activeKey: null,
      selectedKey: null,
      headingLabel: labels.headingLabel,
      ...events.list
    }
  });

  // Harness-owned composer stub (F-K1): a labelled textarea plus publish /
  // change-block / cancel buttons. Test code only — never exported.
  const composer = document.createElement("div");
  composer.setAttribute("data-st-shell", "composer-stub");
  const composerLabel = document.createElement("label");
  composerLabel.textContent = labels.composerLabel;
  const textarea = document.createElement("textarea");
  composerLabel.appendChild(textarea);
  const publishBtn = document.createElement("button");
  publishBtn.textContent = labels.publishLabel;
  const changeBtn = document.createElement("button");
  changeBtn.textContent = labels.changeBlockLabel;
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = labels.cancelLabel;
  composer.append(composerLabel, publishBtn, changeBtn, cancelBtn);
  composer.style.display = "none";
  themeRoot.appendChild(composer);
  publishBtn.addEventListener("click", () => {
    state.mode = "armed";
    state.via = null;
    state.announcement = labels.announcementText;
  });
  changeBtn.addEventListener("click", () => {
    // §5.6 step 5: "Change block" returns to Selected; the list opens only
    // when the harness flag says so (both branches asserted below)
    state.mode = "selected";
    state.via = "change";
    state.selectedKey = state.activeKey;
    state.listOpen = state.openListOnChange;
  });
  cancelBtn.addEventListener("click", () => {
    // §5.6 step 7: Cancel returns to Selected; same open/closed branching
    state.mode = "selected";
    state.via = "cancel";
    state.listOpen = state.openListOnCancel;
  });

  const selectedBlock = () =>
    state.selectedKey === null ? null : (blocks.find((b) => b.key === state.selectedKey) ?? null);

  async function sync() {
    await toggle.rerender({ pressed: state.mode !== "off" });
    await status.rerender({
      visible: state.mode !== "off",
      announcementText: state.announcement,
      activeKey: state.activeKey
    });
    await overlay.rerender({ hovered: state.hovered, selected: selectedBlock() });
    await list.rerender({ open: state.listOpen, activeKey: state.activeKey, selectedKey: state.selectedKey });
    composer.style.display = state.mode === "composing" ? "" : "none";
    // viewer focus management (the harness shim moves focus per §5.6)
    const statusRoot = themeRoot.querySelector('[data-st-shell="comment-mode-status"]') as HTMLElement | null;
    if (state.mode === "armed") {
      statusRoot?.focus();
    } else if (state.mode === "composing") {
      textarea.focus();
    } else if (state.mode === "selected") {
      if (state.listOpen && state.selectedKey !== null) {
        // §5.6 steps 5/7 open branch: focus on the candidate-list row of the
        // selected block
        const row = themeRoot.querySelector(`[role="option"][data-block-key="${state.selectedKey}"]`);
        if (row) (row as HTMLElement).focus();
        else statusRoot?.focus();
      } else if (state.via === "change") {
        // §5.6 step 5 closed-list fallback: CommentModeStatus root
        statusRoot?.focus();
      } else {
        // §5.6 step 7 closed-list fallback (scope F7): the toggle button
        (themeRoot.querySelector('[data-st-shell="comment-mode-toggle"] button') as HTMLElement | null)?.focus();
      }
    } else {
      (themeRoot.querySelector('[data-st-shell="comment-mode-toggle"] button') as HTMLElement | null)?.focus();
    }
  }

  const els = {
    toggleButton: () => themeRoot.querySelector('[data-st-shell="comment-mode-toggle"] button') as HTMLButtonElement,
    statusRoot: () => themeRoot.querySelector('[data-st-shell="comment-mode-status"]') as HTMLElement | null,
    live: () => themeRoot.querySelector('[aria-live="polite"]') as HTMLElement | null,
    row: (key: OpaqueKey) => themeRoot.querySelector(`[role="option"][data-block-key="${key}"]`) as HTMLElement | null
  };

  return { labels, blocks, themeRoot, state, events, hostHandlers, lassoHandlers, sync, els, textarea, publishBtn, changeBtn, cancelBtn };
}

describe("W-1.8 harness (F-K1) — full keyboard trail §5.6 steps 1–7", () => {
  it("steps 1–7: toggle → status → composer → publish → change-block → staged Esc → cancel, with the Q2 focus cells", async () => {
    const h = buildHarness();
    await h.sync();

    // Off: focus on the toggle
    expect(document.activeElement).toBe(h.els.toggleButton());
    expect(h.els.statusRoot()).toBeNull();

    // step 1 — toggle activated, host mounts Armed: focus on the status root
    await fireEvent.click(h.els.toggleButton());
    await h.sync();
    expect(h.state.mode).toBe("armed");
    expect(h.events.toggle).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(h.els.statusRoot());
    expect(h.els.statusRoot()?.getAttribute("tabindex")).toBe("-1");
    // composed outside any header
    expect(h.els.statusRoot()?.closest("header")).toBeNull();
    expect(h.themeRoot.querySelector("header")).toBeNull();
    // entry announcement renders in the live region
    expect(h.els.live()?.textContent).toBe(h.labels.announcementText);

    // step 2 — ArrowDown in status: cycling, focus stays on the status root,
    // announcement updates exactly once per step
    const statusRoot = h.els.statusRoot() as HTMLElement;
    const beforeCycle = h.els.live()?.textContent;
    expect(await fireEvent.keyDown(statusRoot, { key: "ArrowDown" })).toBe(false);
    await h.sync();
    expect(document.activeElement).toBe(h.els.statusRoot());
    expect(h.state.activeKey).toBe(h.blocks[0].key);
    expect(h.els.live()?.textContent).toBe(`${h.labels.announcementText} 1`);
    expect(h.els.live()?.textContent).not.toBe(beforeCycle);
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "ArrowDown" });
    await h.sync();
    expect(h.state.activeKey).toBe(h.blocks[1].key);
    expect(h.els.live()?.textContent).toBe(`${h.labels.announcementText} 2`);

    // step 3 — Enter in status anchors: focus moves to the composer stub field
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "Enter" });
    await h.sync();
    expect(h.events.status.onAnchor).toHaveBeenCalledTimes(1);
    expect(h.state.mode).toBe("composing");
    expect(document.activeElement).toBe(h.textarea);

    // step 4 — publish in the stub returns to Armed: focus back on the status
    // root (Q2 adopted answer)
    await fireEvent.click(h.publishBtn);
    await h.sync();
    expect(h.state.mode).toBe("armed");
    expect(document.activeElement).toBe(h.els.statusRoot());

    // step 5 — "Change block" in the stub returns to Selected with the list
    // open: focus on the BlockCandidateList row of the selected block (Q2)
    await fireEvent.click(h.changeBtn);
    await h.sync();
    expect(h.state.mode).toBe("selected");
    expect(h.state.listOpen).toBe(true);
    expect(h.state.selectedKey).toBe(h.blocks[1].key);
    const selectedRow = h.els.row(h.state.selectedKey as OpaqueKey) as HTMLElement;
    expect(selectedRow).toBeTruthy();
    expect(document.activeElement).toBe(selectedRow);

    // step 6 — staged Esc: the list stage closes first (onClose only, mode
    // stays Armed), then the status stage exits to Off and focus returns to
    // the toggle
    expect(await fireEvent.keyDown(selectedRow, { key: "Escape" })).toBe(false);
    await h.sync();
    expect(h.events.list.onClose).toHaveBeenCalledTimes(1);
    expect(h.events.status.onExitRequest).not.toHaveBeenCalled();
    expect(h.state.listOpen).toBe(false);
    expect(h.state.mode).toBe("armed");
    expect(document.activeElement).toBe(h.els.statusRoot());
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "Escape" });
    await h.sync();
    expect(h.events.status.onExitRequest).toHaveBeenCalledTimes(1);
    expect(h.state.mode).toBe("off");
    expect(document.activeElement).toBe(h.els.toggleButton());

    // step 7 — cancel from the stub: Selected with the list open, focus on
    // the candidate-list row of the selected block (scope F7)
    await fireEvent.click(h.els.toggleButton());
    await h.sync();
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "ArrowDown" });
    await h.sync();
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "Enter" });
    await h.sync();
    expect(h.state.mode).toBe("composing");
    expect(document.activeElement).toBe(h.textarea);
    await fireEvent.click(h.cancelBtn);
    await h.sync();
    expect(h.state.mode).toBe("selected");
    expect(h.state.listOpen).toBe(true);
    expect(h.state.selectedKey).toBe(h.blocks[0].key);
    expect(document.activeElement).toBe(h.els.row(h.blocks[0].key));
  });

  it("steps 5/7 closed-list fallbacks: \"Change block\" with the list closed focuses the status root; Cancel with the list closed focuses the toggle (§5.6)", async () => {
    const h = buildHarness();
    await h.sync();

    // drive to Composing via the keyboard trail (steps 1–3)
    await fireEvent.click(h.els.toggleButton());
    await h.sync();
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "ArrowDown" });
    await h.sync();
    await fireEvent.keyDown(h.els.statusRoot() as HTMLElement, { key: "Enter" });
    await h.sync();
    expect(h.state.mode).toBe("composing");
    expect(document.activeElement).toBe(h.textarea);

    // step 5 fallback: "Change block" with openListOnChange=false → Selected,
    // list closed, focus on the CommentModeStatus root
    h.state.openListOnChange = false;
    await fireEvent.click(h.changeBtn);
    await h.sync();
    expect(h.state.mode).toBe("selected");
    expect(h.state.listOpen).toBe(false);
    expect(h.state.selectedKey).toBe(h.blocks[0].key);
    expect(document.activeElement).toBe(h.els.statusRoot());

    // back to Composing, then step 7 fallback: Cancel with
    // openListOnCancel=false → Selected, list closed, focus on the toggle
    h.state.mode = "composing";
    h.state.openListOnCancel = false;
    await h.sync();
    expect(document.activeElement).toBe(h.textarea);
    await fireEvent.click(h.cancelBtn);
    await h.sync();
    expect(h.state.mode).toBe("selected");
    expect(h.state.listOpen).toBe(false);
    expect(document.activeElement).toBe(h.els.toggleButton());
  });

  it("H-1 host-handler half: the harness hit layer invokes onBlockClick directly → Selected; chip click → onAnchor → Composing; the overlay emits only onAnchor (rect clicks emit nothing)", async () => {
    const h = buildHarness();
    await h.sync();
    await fireEvent.click(h.els.toggleButton());
    await h.sync();
    expect(h.state.mode).toBe("armed");

    // the harness's own hit layer calls the HostHandler directly (§5.3a)
    h.hostHandlers.onBlockClick(h.blocks[1].key);
    await h.sync();
    expect(h.state.mode).toBe("selected");
    expect(h.state.selectedKey).toBe(h.blocks[1].key);

    const overlayRoot = h.themeRoot.querySelector('[data-st-shell="block-highlight-overlay"]') as HTMLElement;
    expect(overlayRoot).toBeTruthy();
    const rect = overlayRoot.querySelector(".st-blockHighlightOverlay__rect--selected") as HTMLElement;
    expect(rect).toBeTruthy();
    // rect elements carry no handlers: clicking the rect emits nothing
    await fireEvent.click(rect);
    expect(h.events.overlay.onAnchor).not.toHaveBeenCalled();

    // chip activation emits onAnchor — the only event the component emits
    const chip = overlayRoot.querySelector("button") as HTMLButtonElement;
    expect(chip).toBeTruthy();
    await fireEvent.click(chip);
    expect(h.events.overlay.onAnchor).toHaveBeenCalledTimes(1);
    await h.sync();
    expect(h.state.mode).toBe("composing");
    expect(document.activeElement).toBe(h.textarea);
  });
});

describe("W-1.10 absence (F-A1) — falsifiable: presence first, then absence", () => {
  const SHELL_SELECTORS = [
    '[data-st-shell="comment-mode-toggle"]',
    '[data-st-shell="comment-mode-status"]',
    '[data-st-shell="block-highlight-overlay"]',
    '[data-st-shell="lasso-layer"]',
    '[data-st-shell="block-candidate-list"]'
  ] as const;

  it("canComment=true mounts all five components; canComment=false mounts nothing — the absence half fails if any component renders", () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const themeRoot = document.createElement("div");
    themeRoot.setAttribute("data-st-theme", "sent-tech");
    document.body.appendChild(themeRoot);

    // canComment=true analogue: the host mounts all five components
    const mounted = [
      render(CommentModeToggle, {
        target: themeRoot,
        props: {
          pressed: true,
          label: labels.toggleLabel,
          shortcutLabel: labels.shortcutLabel,
          ariaKeyshortcuts: labels.ariaKeyshortcuts,
          labels: { tooltip: labels.tooltip },
          onToggle: vi.fn()
        }
      }),
      render(CommentModeStatus, {
        target: themeRoot,
        props: { ...statusProps(labels, { candidates: blocks }), ...statusEvents() }
      }),
      render(BlockHighlightOverlay, {
        target: themeRoot,
        props: { hovered: blocks[0], selected: null, chipLabel: labels.chipLabel, onAnchor: vi.fn() }
      }),
      render(LassoLayer, { target: themeRoot, props: { active: true, rect: { x: 0, y: 0, width: 10, height: 10 } } }),
      render(BlockCandidateList, {
        target: themeRoot,
        props: {
          open: true,
          candidates: blocks,
          activeKey: null,
          selectedKey: null,
          headingLabel: labels.headingLabel,
          onPickBlock: vi.fn(),
          onActiveKeyChange: vi.fn(),
          onAnchor: vi.fn(),
          onClose: vi.fn()
        }
      })
    ];
    // presence half: every shell root is in the DOM (this half proves the
    // selectors match real renders, so the absence half below is falsifiable)
    for (const selector of SHELL_SELECTORS) {
      expect(themeRoot.querySelector(selector), `present: ${selector}`).not.toBeNull();
    }
    expect(themeRoot.querySelector('[role="listbox"]')).not.toBeNull();

    // canComment=false analogue: the host unmounts everything
    for (const m of mounted) m.unmount();
    for (const selector of SHELL_SELECTORS) {
      expect(themeRoot.querySelector(selector), `absent: ${selector}`).toBeNull();
      expect(document.querySelector(selector), `absent document-wide: ${selector}`).toBeNull();
    }
    expect(themeRoot.querySelector('[role="listbox"]')).toBeNull();
    expect(themeRoot.querySelector("button")).toBeNull();
    expect(themeRoot.childElementCount).toBe(0);
    themeRoot.remove();
  });
});

describe("§5.4 fixture matrix — light and dark viewer themes", () => {
  it("the status renders in every viewer theme with the compiled theme variables scoped to the theme root", () => {
    const labels = modeLabels();
    for (const theme of Object.values(viewerThemes)) {
      const themeRoot = document.createElement("div");
      themeRoot.setAttribute("data-st-theme", theme.id);
      const style = document.createElement("style");
      style.textContent = compileTheme(theme);
      themeRoot.appendChild(style);
      document.body.appendChild(themeRoot);
      expect(style.textContent, theme.id).toContain("--st-semantic-surface-raised");

      const mounted = render(CommentModeStatus, {
        target: themeRoot,
        props: { ...statusProps(labels), ...statusEvents() }
      });
      const root = themeRoot.querySelector('[data-st-shell="comment-mode-status"]');
      expect(root, `theme ${theme.id}`).not.toBeNull();
      expect(root?.querySelector('[aria-live="polite"]')).not.toBeNull();

      mounted.unmount();
      expect(themeRoot.querySelector('[data-st-shell="comment-mode-status"]')).toBeNull();
      themeRoot.remove();
    }
  });
});
