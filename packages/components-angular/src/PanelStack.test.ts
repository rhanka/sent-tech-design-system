import "@angular/compiler";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ElementRef } from "@angular/core";

import {
  PANEL_STACK_MAX_SECTIONS,
  PanelStack,
  computePanelStackAutoCollapse,
  resolvePanelStackExpanded,
  resolvePanelStackPrimary,
} from "../dist/PanelStack.js";
import { PanelSection } from "../dist/PanelSection.js";

// ---------------------------------------------------------------------------
// This package's test environment is Node — no jsdom, no DOM, no
// ResizeObserver. `register()`/`toggle()`/the getters below are plain,
// DOM-agnostic bookkeeping, so bare `new PanelStack()` + fake element
// objects (identity-compared only, never touched otherwise) exercise the
// exact same code paths a real browser would.
// ---------------------------------------------------------------------------

function fakeHost(): { ref: ElementRef<HTMLElement>; el: HTMLElement } {
  const el = {} as HTMLElement;
  return { ref: { nativeElement: el } as ElementRef<HTMLElement>, el };
}

function newStack(): PanelStack {
  return new PanelStack(fakeHost().ref);
}

function fakeEl(label: string): HTMLElement {
  // A unique, inert object — only ever compared by identity (===) or handed
  // to ResizeObserver.observe/unobserve, both of which this suite fully
  // controls via FakeResizeObserver below.
  return { toString: () => label } as unknown as HTMLElement;
}

// ---------------------------------------------------------------------------
// Minimal ResizeObserver stand-in, mirroring PanelStack.test.ts's (Svelte)
// FakeResizeObserver: Node has no ResizeObserver at all (not even a jsdom
// stub), so we install one via vi.stubGlobal and simulate real measurement
// deliveries landing on whichever target the test cares about.
// ---------------------------------------------------------------------------
type FakeResizeEntry = { target: object; contentRect: { height: number } };

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observed = new Set<object>();
  disconnected = false;
  constructor(private readonly callback: (entries: FakeResizeEntry[]) => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(target: object) {
    this.observed.add(target);
  }
  unobserve(target: object) {
    this.observed.delete(target);
  }
  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }
  deliver(target: object, height: number) {
    if (this.observed.has(target)) this.callback([{ target, contentRect: { height } }]);
  }
}

function fireResize(target: object, height: number) {
  for (const instance of FakeResizeObserver.instances) instance.deliver(target, height);
}

describe("PANEL_STACK_MAX_SECTIONS", () => {
  it("is 4", () => {
    expect(PANEL_STACK_MAX_SECTIONS).toBe(4);
  });

  it("registering exactly the max (4) sections does not warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    for (const id of ["a", "b", "c", "d"]) {
      stack.register(id, fakeEl(id), fakeEl(`${id}-header`));
    }
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("registering a 5th section warns once (dev visibility), but never truncates — all 5 stay registered", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    for (const id of ["a", "b", "c", "d", "e"]) {
      stack.register(id, fakeEl(id), fakeEl(`${id}-header`));
    }
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("[PanelStack]");
    expect(warn.mock.calls[0][0]).toContain("4");
    // sticky-item default: the FIRST registered section is still the owner —
    // the bound is advisory, every section still participates normally.
    expect(stack.effectiveExpandedId).toBe("a");
    warn.mockRestore();
  });

  it("a 6th registration warns again (once per registration past the bound, not once ever)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    for (const id of ["a", "b", "c", "d", "e", "f"]) {
      stack.register(id, fakeEl(id), fakeEl(`${id}-header`));
    }
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});

describe("PanelStack — sticky-item shape (default)", () => {
  it("defaults to sticky-item", () => {
    expect(newStack().shape).toBe("sticky-item");
  });

  it("with no expanded/defaultExpanded, the FIRST registered section is the scroll owner (never zero)", () => {
    const stack = newStack();
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    expect(stack.effectiveExpandedId).toBe("a");
    expect(stack.isExpanded("a")).toBe(true);
    expect(stack.isScrollOwner("a")).toBe(true);
    expect(stack.isExpanded("b")).toBe(false);
    expect(stack.isScrollOwner("b")).toBe(false);
  });

  it("defaultExpanded seeds the initial state via ngOnInit (one-time, not a live binding)", () => {
    const stack = newStack();
    stack.defaultExpanded = "b";
    stack.ngOnInit();
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    expect(stack.effectiveExpandedId).toBe("b");
  });

  it("exactly one scroll-owner across every reachable click sequence, including a no-op re-click", () => {
    const stack = newStack();
    stack.defaultExpanded = "a";
    stack.ngOnInit();
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));

    for (const id of ["a", "b", "c", "b", "a", "c", "c"]) {
      stack.toggle(id);
      const owners = ["a", "b", "c"].filter((x) => stack.isScrollOwner(x));
      expect(owners.length).toBe(1);
    }
  });

  it("clicking the already-expanded header is a no-op (no collapse-to-zero gesture)", () => {
    const stack = newStack();
    stack.defaultExpanded = "a";
    stack.ngOnInit();
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    stack.toggle("a");
    expect(stack.effectiveExpandedId).toBe("a");
  });

  it("uncontrolled: toggling moves the expanded id, radio semantics (opening b closes a)", () => {
    const stack = newStack();
    stack.defaultExpanded = "a";
    stack.ngOnInit();
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    stack.toggle("b");
    expect(stack.effectiveExpandedId).toBe("b");
    expect(stack.isExpanded("a")).toBe(false);
  });

  it("controlled: `expanded` is the source of truth — toggling fires callbacks but does not move state on its own", () => {
    const onExpandedChange = vi.fn();
    const stack = newStack();
    stack.expanded = "a";
    stack.onExpandedChange = onExpandedChange;
    const emitted: Array<string | null> = [];
    stack.expandedChange.subscribe((v) => emitted.push(v));
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));

    stack.toggle("b");
    expect(onExpandedChange).toHaveBeenCalledWith("b");
    expect(emitted).toEqual(["b"]);
    // The consumer hasn't fed the callback's value back through `expanded` —
    // state must still read "a".
    expect(stack.effectiveExpandedId).toBe("a");

    stack.expanded = "b";
    expect(stack.effectiveExpandedId).toBe("b");
  });

  it("an explicit `expanded: null` still counts as controlled (undefined-vs-set, same idiom as AppShell.panelWidths); it is a deliberate 'everything collapsed', so it is honoured with ZERO scroll owners and no warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    stack.expanded = null;
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    expect(stack.controlled).toBe(true);
    expect(stack.effectiveExpandedId).toBe(null);
    expect(["a", "b"].filter((id) => stack.isScrollOwner(id))).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("dynamic: unregistering the current owner leaves EXACTLY one owner — the next first section", () => {
    const stack = newStack();
    stack.defaultExpanded = "b";
    stack.ngOnInit();
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    const unregisterB = stack.register("b", fakeEl("b"), fakeEl("b-h"));
    stack.register("c", fakeEl("c"), fakeEl("c-h"));
    expect(stack.effectiveExpandedId).toBe("b");

    unregisterB();

    expect(stack.effectiveExpandedId).toBe("a");
  });
});

describe("PanelStack — controlled `expanded` pointing at a non-existent id (ratified cross-framework rule)", () => {
  it("leaves the controlled value untouched, resolves exactly one scroll owner (first registered), reports that SAME section as expanded (sticky-item: expanded and scroll owner are the same thing), and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    stack.expanded = "does-not-exist";
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    stack.register("c", fakeEl("c"), fakeEl("c-h"));

    // Invariant holds: exactly one scroll owner, resolved via the same
    // first-registered fallback as the uncontrolled/unset case.
    const owners = ["a", "b", "c"].filter((id) => stack.isScrollOwner(id));
    expect(owners).toEqual(["a"]);

    // The fallback section must also report `isExpanded === true` — its body
    // is rendered as the scroll owner (visible, overflow:auto), so
    // `aria-expanded` must NOT lie and say "collapsed". sticky-item's
    // expanded id and scroll-owner id are the same thing by definition.
    expect(stack.isExpanded("a")).toBe(true);
    expect(stack.isExpanded("b")).toBe(false);
    expect(stack.isExpanded("c")).toBe(false);

    // The controlled value itself is NEVER rewritten — reading it back off
    // the instance still shows exactly what the consumer passed in.
    expect(stack.expanded).toBe("does-not-exist");

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("[PanelStack]");
    expect(warn.mock.calls[0][0]).toContain("does-not-exist");
    warn.mockRestore();
  });

  it("does not fire onExpandedChange/expandedChange on its own — healing the scroll owner is purely an internal read, never a synthetic change notification", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onExpandedChange = vi.fn();
    const stack = newStack();
    stack.expanded = "does-not-exist";
    stack.onExpandedChange = onExpandedChange;
    const emitted: Array<string | null> = [];
    stack.expandedChange.subscribe((v) => emitted.push(v));

    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    // Read state repeatedly — must never itself trigger a change output.
    for (let i = 0; i < 3; i++) {
      stack.isExpanded("a");
      stack.isScrollOwner("a");
    }

    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(emitted).toEqual([]);
    warn.mockRestore();
  });

  it("does not re-warn on repeated reads (isScrollOwner/isExpanded checked across every section, several times)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    stack.expanded = "does-not-exist";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));

    for (let i = 0; i < 5; i++) {
      for (const id of ["a", "b", "c"]) {
        stack.isScrollOwner(id);
        stack.isExpanded(id);
      }
    }

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("a click still fires onExpandedChange/expandedChange (the controlled contract is intact) but does not move the resolved scroll owner", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onExpandedChange = vi.fn();
    const stack = newStack();
    stack.expanded = "does-not-exist";
    stack.onExpandedChange = onExpandedChange;
    stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));

    stack.toggle("b");

    expect(onExpandedChange).toHaveBeenCalledWith("b");
    expect(stack.expanded).toBe("does-not-exist");
    expect(["a", "b"].filter((id) => stack.isScrollOwner(id))).toEqual(["a"]);
    warn.mockRestore();
  });

  it("does not warn before any section has registered (nothing to fall back to yet)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stack = newStack();
    stack.expanded = "does-not-exist";
    // No `register()` calls at all — reading state must not warn prematurely.
    expect(stack.effectiveExpandedId).toBe("does-not-exist");
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("PanelStack — split-primary primary fallback chain (integration, via register/toggle)", () => {
  it("tier 1: a valid designated primary always wins, regardless of what's expanded", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    stack.toggle("b");
    expect(stack.effectivePrimary).toBe("a");
    expect(stack.isScrollOwner("a")).toBe(true);
  });

  it("tier 2: primary unset — opening ONE secondary makes it the primary (first EXPANDED)", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    // Nothing expanded yet: last-resort tier (first registered) applies.
    expect(stack.effectivePrimary).toBe("a");

    stack.toggle("b");

    expect(stack.effectivePrimary).toBe("b");
    // "a" is demoted to an ordinary, closed-by-default secondary.
    expect(stack.isPrimary("a")).toBe(false);
    expect(stack.isExpanded("a")).toBe(false);
  });

  it("tier 2: registration order breaks ties, not click/toggle order", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    stack.toggle("c");
    stack.toggle("b");
    expect(stack.effectivePrimary).toBe("b");
  });

  it("tier 2 beats tier 3: a primary matching no section (typo) still prefers the first EXPANDED over the first registered", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "does-not-exist";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    stack.toggle("c");
    expect(stack.effectivePrimary).toBe("c");
  });

  it("tier 3 (last resort): primary unset and nothing expanded — first registered section owns the scroll", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    expect(stack.effectivePrimary).toBe("a");
  });
});

describe("PanelStack — split-primary shape mechanics", () => {
  it("the primary is always expanded and IS the scroll owner; toggling it is a no-op (guard — it has no disclosure)", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    for (const id of ["a", "b"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    stack.toggle("a");
    expect(stack.isExpanded("a")).toBe(true);
    expect(stack.isScrollOwner("a")).toBe(true);
  });

  it("non-primary sections default closed", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    expect(stack.isExpanded("b")).toBe(false);
    expect(stack.isExpanded("c")).toBe(false);
  });

  it("several non-primary sections can be expanded at once, and neither becomes the scroll owner", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    stack.toggle("b");
    stack.toggle("c");
    expect(stack.isExpanded("b")).toBe(true);
    expect(stack.isExpanded("c")).toBe(true);
    expect(stack.isScrollOwner("b")).toBe(false);
    expect(stack.isScrollOwner("c")).toBe(false);
    expect(["a", "b", "c"].filter((id) => stack.isScrollOwner(id))).toEqual(["a"]);
  });

  it("a non-primary section can be closed again independently of the others", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));
    stack.toggle("b");
    stack.toggle("c");
    stack.toggle("b");
    expect(stack.isExpanded("b")).toBe(false);
    expect(stack.isExpanded("c")).toBe(true);
  });

  it("dynamic: unregistering the primary leaves EXACTLY one owner — the next first section", () => {
    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    const unregisterA = stack.register("a", fakeEl("a"), fakeEl("a-h"));
    stack.register("b", fakeEl("b"), fakeEl("b-h"));
    stack.register("c", fakeEl("c"), fakeEl("c-h"));
    expect(stack.effectivePrimary).toBe("a");

    unregisterA();

    expect(stack.effectivePrimary).toBe("b");
    expect(stack.isScrollOwner("b")).toBe(true);
  });
});

describe("resolvePanelStackPrimary — pure fallback-chain resolver", () => {
  it("tier 1: designated primary wins when registered", () => {
    expect(resolvePanelStackPrimary("b", ["a", "b", "c"], new Set())).toBe("b");
  });

  it("tier 1 is ignored when the designated id isn't registered", () => {
    expect(resolvePanelStackPrimary("z", ["a", "b", "c"], new Set(["b"]))).toBe("b");
  });

  it("tier 2: first expanded id in orderedIds order, not Set insertion order", () => {
    expect(resolvePanelStackPrimary(undefined, ["a", "b", "c"], new Set(["c", "b"]))).toBe("b");
  });

  it("tier 3: first registered id when nothing is designated or expanded", () => {
    expect(resolvePanelStackPrimary(undefined, ["a", "b", "c"], new Set())).toBe("a");
  });

  it("returns null when there are no registered ids at all", () => {
    expect(resolvePanelStackPrimary(undefined, [], new Set())).toBe(null);
    expect(resolvePanelStackPrimary("a", [], new Set())).toBe(null);
  });
});

describe("resolvePanelStackExpanded — pure resolver for sticky-item's healed expanded/scroll-owner id", () => {
  it("a valid, registered id is returned as-is", () => {
    expect(resolvePanelStackExpanded("b", ["a", "b", "c"])).toBe("b");
  });

  it("a non-null id naming no registered section (a mistake) falls back to the first registered id", () => {
    expect(resolvePanelStackExpanded("does-not-exist", ["a", "b", "c"])).toBe("a");
  });

  it("explicit null (deliberate 'everything collapsed') is returned as-is — no fallback", () => {
    expect(resolvePanelStackExpanded(null, ["a", "b", "c"])).toBe(null);
  });

  it("a non-null invalid id with no registered sections at all resolves to null (nothing to fall back to)", () => {
    expect(resolvePanelStackExpanded("does-not-exist", [])).toBe(null);
  });
});

describe("computePanelStackAutoCollapse — pure decision function", () => {
  const base = {
    primaryId: "a",
    stackHeight: 400,
    primaryHeaderHeight: 40,
    secondaryIds: ["b", "c"],
    rootHeights: new Map([
      ["b", 150],
      ["c", 100],
    ]),
    openSecondary: new Set(["b", "c"]),
    autoCollapsed: new Set<string>(),
    expansionOrder: ["b", "c"],
  };

  it("returns null when stackHeight is 0 (not measured yet)", () => {
    expect(computePanelStackAutoCollapse({ ...base, stackHeight: 0 })).toBe(null);
  });

  it("returns null when everything comfortably fits (no false positives)", () => {
    // available = 400 - 40 - (150+100) = 110 < 160 in `base`; widen the stack
    // so it genuinely fits: 1000 - 40 - 250 = 710 >= 160.
    expect(computePanelStackAutoCollapse({ ...base, stackHeight: 1000 })).toBe(null);
  });

  it("returns the LEAST-recently-expanded (first in expansionOrder) candidate when squeezed", () => {
    // available = 400 - 40 - 250 = 110 < 160.
    expect(computePanelStackAutoCollapse(base)).toBe("b");
  });

  it("never returns the primary, even if it were (by misconfiguration) present in expansionOrder/openSecondary", () => {
    const result = computePanelStackAutoCollapse({
      ...base,
      expansionOrder: ["a", "b", "c"],
      openSecondary: new Set(["a", "b", "c"]),
    });
    expect(result).toBe("b");
  });

  it("skips ids already in autoCollapsed and picks the next candidate", () => {
    expect(computePanelStackAutoCollapse({ ...base, autoCollapsed: new Set(["b"]) })).toBe("c");
  });

  it("returns null (degenerate case) when everything eligible is already collapsed — never throws", () => {
    expect(computePanelStackAutoCollapse({ ...base, autoCollapsed: new Set(["b", "c"]) })).toBe(null);
  });

  it("ignores ids in expansionOrder that aren't in openSecondary (closed, not a live candidate)", () => {
    expect(computePanelStackAutoCollapse({ ...base, openSecondary: new Set(["c"]) })).toBe("c");
  });

  it("accepts a custom floor (floorPx) instead of the default 160", () => {
    // available = 400 - 40 - 250 = 110: fits a floor of 100, doesn't fit 160.
    expect(computePanelStackAutoCollapse(base, 100)).toBe(null);
    expect(computePanelStackAutoCollapse(base, 160)).toBe("b");
  });

  it("is a pure, side-effect-free read: identical input objects produce identical output across repeated calls (no oscillation at the function level)", () => {
    const first = computePanelStackAutoCollapse(base);
    const second = computePanelStackAutoCollapse(base);
    const third = computePanelStackAutoCollapse(base);
    expect([first, second, third]).toEqual(["b", "b", "b"]);
  });

  it("floor constant used by PanelStack's own wiring matches the documented 160px", () => {
    // available = stackHeight - primaryHeaderHeight(40) - secondaryTotal(250).
    // Sanity check that the integration scenarios below (which assume 160px)
    // are exercising the real default and not a coincidence of chosen
    // numbers: 1px under the floor collapses, exactly at the floor fits.
    expect(computePanelStackAutoCollapse({ ...base, stackHeight: 40 + 250 + 159 })).toBe("b");
    expect(computePanelStackAutoCollapse({ ...base, stackHeight: 40 + 250 + 160 })).toBe(null);
  });
});

describe("PanelStack — primaryMinHeight drives the CSS floor via an inline custom property, and the JS threshold", () => {
  it("defaults the resolved floor and the host's custom property to 160px (PRIMARY_MIN_BLOCK_SIZE_PX) when primaryMinHeight is unset", () => {
    const stack = newStack();
    expect(stack.resolvedPrimaryMinHeight).toBe(160);
    expect(stack.primaryMinHeightStyle).toBe("160px");
  });

  it("a custom primaryMinHeight is the single source of truth for BOTH the resolved JS floor and the host's inline custom property", () => {
    const stack = newStack();
    stack.primaryMinHeight = 220;
    expect(stack.resolvedPrimaryMinHeight).toBe(220);
    expect(stack.primaryMinHeightStyle).toBe("220px");
  });

  describe("a custom primaryMinHeight changes WHEN auto-collapse triggers, not just the CSS floor", () => {
    beforeEach(() => {
      FakeResizeObserver.instances = [];
      vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("collapses a secondary at a gap that comfortably fits the default 160px floor but not a custom, higher one", () => {
      const host = fakeHost();
      const stack = new PanelStack(host.ref);
      stack.shape = "split-primary";
      stack.primary = "a";
      stack.primaryMinHeight = 300;
      const headerA = fakeEl("a-header");
      const rootB = fakeEl("b-root");
      stack.register("a", fakeEl("a-root"), headerA);
      stack.register("b", rootB, fakeEl("b-header"));
      stack.ngAfterViewInit();

      stack.toggle("b");

      fireResize(host.el, 400);
      fireResize(headerA, 40);
      fireResize(rootB, 100);
      // available = 400 - 40 - 100 = 260: >= the default 160px floor (would
      // NOT collapse there) but < the custom 300px floor set above — proof
      // `runAutoCollapseDecision` actually reads the input, not a fixed
      // constant.
      expect(stack.isExpanded("b")).toBe(false);
      expect(stack.isScrollOwner("a")).toBe(true);
    });

    it("the SAME gap does NOT collapse anything under the default 160px floor (control case)", () => {
      const host = fakeHost();
      const stack = new PanelStack(host.ref);
      stack.shape = "split-primary";
      stack.primary = "a";
      const headerA = fakeEl("a-header");
      const rootB = fakeEl("b-root");
      stack.register("a", fakeEl("a-root"), headerA);
      stack.register("b", rootB, fakeEl("b-header"));
      stack.ngAfterViewInit();

      stack.toggle("b");

      fireResize(host.el, 400);
      fireResize(headerA, 40);
      fireResize(rootB, 100);
      // available = 260 >= 160 (default): fits, nothing collapses.
      expect(stack.isExpanded("b")).toBe(true);
    });
  });
});

describe("PanelStack — split-primary auto-collapse, integration via register()/toggle() + FakeResizeObserver", () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("collapses the least-recently-expanded secondary when the primary would be squeezed below its floor, and stops as soon as it fits again (no avalanche)", () => {
    const host = fakeHost();
    const stack = new PanelStack(host.ref);
    stack.shape = "split-primary";
    stack.primary = "a";
    const headerA = fakeEl("a-header");
    const rootB = fakeEl("b-root");
    const rootC = fakeEl("c-root");
    stack.register("a", fakeEl("a-root"), headerA);
    stack.register("b", rootB, fakeEl("b-header"));
    stack.register("c", rootC, fakeEl("c-header"));
    stack.ngAfterViewInit(); // observes the stack host

    stack.toggle("b"); // opened first -> least recently expanded
    stack.toggle("c"); // opened second

    fireResize(host.el, 400);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    // available = 400 - 40 - 150 = 210 >= 160: still fits, nothing collapses yet.
    expect(stack.isExpanded("b")).toBe(true);

    fireResize(rootC, 100);
    // available = 400 - 40 - (150+100) = 110 < 160: over budget -> collapse "b" (LRU).
    expect(stack.isExpanded("b")).toBe(false);
    // "c" — opened more recently — is left alone: no same-tick avalanche off
    // "b"'s now-stale (pre-collapse) measurement.
    expect(stack.isExpanded("c")).toBe(true);
    expect(stack.isScrollOwner("a")).toBe(true);

    // Simulate the real shrink that follows "b" actually collapsing.
    fireResize(rootB, 40);
    // available = 400 - 40 - (40+100) = 220 >= 160: fits now — "c" stays untouched.
    expect(stack.isExpanded("c")).toBe(true);
  });

  it("collapses MULTIPLE secondaries when one isn't enough, converges to a stable fixed point, and does not oscillate on repeated identical measurements", () => {
    const host = fakeHost();
    const stack = new PanelStack(host.ref);
    stack.shape = "split-primary";
    stack.primary = "a";
    const headerA = fakeEl("a-header");
    const rootB = fakeEl("b-root");
    const rootC = fakeEl("c-root");
    stack.register("a", fakeEl("a-root"), headerA);
    stack.register("b", rootB, fakeEl("b-header"));
    stack.register("c", rootC, fakeEl("c-header"));
    stack.ngAfterViewInit();

    stack.toggle("b");
    stack.toggle("c");

    fireResize(host.el, 250);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    fireResize(rootC, 100);
    // available = 250 - 40 - 250 = -40 < 160 -> collapse "b" (LRU).
    expect(stack.isExpanded("b")).toBe(false);

    fireResize(rootB, 40); // "b"'s real post-collapse (header-only) height.
    // available = 250 - 40 - (40+100) = 70 < 160 -> still short -> collapse "c" too.
    expect(stack.isExpanded("c")).toBe(false);

    fireResize(rootC, 40); // "c"'s real post-collapse height.
    // available = 250 - 40 - (40+40) = 130 < 160: still under the floor, but
    // nothing left to collapse — degenerate case: must stop, not throw/loop.
    expect(stack.isScrollOwner("a")).toBe(true);

    // Fire the SAME measurements again, several times: must be a no-op — no
    // oscillation (nothing flips back open, nothing new collapses).
    for (let i = 0; i < 5; i++) {
      fireResize(host.el, 250);
      fireResize(headerA, 40);
      fireResize(rootB, 40);
      fireResize(rootC, 40);
      expect(stack.isExpanded("b")).toBe(false);
      expect(stack.isExpanded("c")).toBe(false);
      expect(["a", "b", "c"].filter((id) => stack.isScrollOwner(id))).toEqual(["a"]);
    }
  });

  it("explicitly re-opening an auto-collapsed secondary clears its collapse immediately, and a later re-squeeze collapses the NEW least-recently-expanded one instead (the just-reopened section survives)", () => {
    const host = fakeHost();
    const stack = new PanelStack(host.ref);
    stack.shape = "split-primary";
    stack.primary = "a";
    const headerA = fakeEl("a-header");
    const rootB = fakeEl("b-root");
    const rootC = fakeEl("c-root");
    stack.register("a", fakeEl("a-root"), headerA);
    stack.register("b", rootB, fakeEl("b-header"));
    stack.register("c", rootC, fakeEl("c-header"));
    stack.ngAfterViewInit();

    stack.toggle("b"); // opened first
    stack.toggle("c"); // opened second

    fireResize(host.el, 400);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    fireResize(rootC, 100);
    // "b" (LRU) auto-collapses.
    expect(stack.isExpanded("b")).toBe(false);
    expect(stack.isScrollOwner("a")).toBe(true);

    // User explicitly re-opens "b" — clears the forced collapse right away,
    // before any new measurement, and makes "b" the MOST recently expanded.
    stack.toggle("b");
    expect(stack.isExpanded("b")).toBe(true);

    // A subsequent measurement reflecting "b" back at its natural size
    // re-triggers the same squeeze — this time "c" (now the LRU) must yield,
    // NOT "b" again.
    fireResize(rootB, 150);
    expect(stack.isExpanded("c")).toBe(false);
    expect(stack.isExpanded("b")).toBe(true);
    expect(stack.isScrollOwner("a")).toBe(true);
  });

  it("never collapses anything when the pane comfortably fits everyone (no false positives)", () => {
    const host = fakeHost();
    const stack = new PanelStack(host.ref);
    stack.shape = "split-primary";
    stack.primary = "a";
    const headerA = fakeEl("a-header");
    const rootB = fakeEl("b-root");
    const rootC = fakeEl("c-root");
    stack.register("a", fakeEl("a-root"), headerA);
    stack.register("b", rootB, fakeEl("b-header"));
    stack.register("c", rootC, fakeEl("c-header"));
    stack.ngAfterViewInit();

    stack.toggle("b");
    stack.toggle("c");

    fireResize(host.el, 1000);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    fireResize(rootC, 100);

    expect(stack.isExpanded("b")).toBe(true);
    expect(stack.isExpanded("c")).toBe(true);
    expect(stack.isScrollOwner("a")).toBe(true);
  });

  it("ngOnDestroy disconnects the ResizeObserver — no leaked observation", () => {
    const host = fakeHost();
    const stack = new PanelStack(host.ref);
    stack.shape = "split-primary";
    stack.primary = "a";
    stack.register("a", fakeEl("a-root"), fakeEl("a-header"));
    stack.ngAfterViewInit();
    expect(FakeResizeObserver.instances.length).toBe(1);
    expect(FakeResizeObserver.instances[0].disconnected).toBe(false);

    stack.ngOnDestroy();

    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
  });
});

describe("PanelStack — auto-collapse is a no-throw no-op when ResizeObserver is unavailable", () => {
  it("split-primary with several secondaries opened renders normally, without throwing, and keeps the single-scroll-owner invariant — this package's Node test environment has no ResizeObserver by default", () => {
    expect(typeof ResizeObserver).toBe("undefined");

    const stack = newStack();
    stack.shape = "split-primary";
    stack.primary = "a";
    for (const id of ["a", "b", "c"]) stack.register(id, fakeEl(id), fakeEl(`${id}-h`));

    expect(() => {
      stack.toggle("b");
      stack.toggle("c");
      stack.ngAfterViewInit();
    }).not.toThrow();

    // No auto-collapse can possibly engage — both stay expanded as requested.
    expect(stack.isExpanded("b")).toBe(true);
    expect(stack.isExpanded("c")).toBe(true);
    expect(stack.isScrollOwner("a")).toBe(true);
  });

  it("ngOnDestroy is a no-throw no-op too", () => {
    const stack = newStack();
    expect(() => stack.ngOnDestroy()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// PanelSection — presentational getters/defaults. `isPrimary`/`expanded`/
// `scrollOwner` are plain @Input()s here (see PanelSection.ts's class-level
// doc): a bare, un-synced instance keeps its declared defaults, which mirror
// PanelSection.svelte's own "no context" fallback exactly.
// ---------------------------------------------------------------------------
describe("PanelSection", () => {
  function newSection(): PanelSection {
    const section = new PanelSection({ nativeElement: {} as HTMLElement } as ElementRef<HTMLElement>);
    section.id = "a";
    section.label = "Alpha";
    return section;
  }

  it("standalone defaults mirror PanelSection.svelte's no-context fallback: expanded, scroll-owning, non-primary", () => {
    const section = newSection();
    expect(section.isPrimary).toBe(false);
    expect(section.expanded).toBe(true);
    expect(section.scrollOwner).toBe(true);
  });

  it("computes stable trigger/region ids from `id`", () => {
    const section = newSection();
    expect(section.triggerId).toBe("st-panelSection-trigger-a");
    expect(section.regionId).toBe("st-panelSection-region-a");
  });

  it("hostClass carries the scrollOwner modifier only when scrollOwner is true, plus any consumer class", () => {
    const section = newSection();
    section.classInput = "consumer-a";
    expect(section.hostClass).toBe("st-panelSection st-panelSection--scrollOwner consumer-a");
    section.scrollOwner = false;
    expect(section.hostClass).toBe("st-panelSection consumer-a");
  });

  it("bodyClasses: scrollOwner wins over collapsed; collapsed only applies when not scrollOwner and not expanded", () => {
    const section = newSection();
    expect(section.bodyClasses).toBe("st-panelSection__body st-panelSection__body--scrollOwner");

    section.scrollOwner = false;
    expect(section.bodyClasses).toBe("st-panelSection__body"); // expanded, non-owner: plain body.

    section.expanded = false;
    expect(section.bodyClasses).toBe("st-panelSection__body st-panelSection__body--collapsed");
  });

  it("iconClass toggles the --expanded modifier off expanded", () => {
    const section = newSection();
    expect(section.iconClass).toBe("st-panelSection__icon st-panelSection__icon--expanded");
    section.expanded = false;
    expect(section.iconClass).toBe("st-panelSection__icon");
  });

  it("onTriggerClick emits toggleRequested with this section's id", () => {
    const section = newSection();
    const received: string[] = [];
    section.toggleRequested.subscribe((id) => received.push(id));
    section.onTriggerClick();
    expect(received).toEqual(["a"]);
  });

  it("rootElement is the injected host's native element", () => {
    const el = {} as HTMLElement;
    const section = new PanelSection({ nativeElement: el } as ElementRef<HTMLElement>);
    expect(section.rootElement).toBe(el);
  });

  it("headerElement is undefined before the view has rendered (bare instance, no ViewChild resolution)", () => {
    const section = newSection();
    expect(section.headerElement).toBeUndefined();
  });
});
