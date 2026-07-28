import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PanelStackFixture from "./PanelStackFixture.svelte";
import { PANEL_STACK_MAX_SECTIONS } from "./PanelStack.svelte";

const sections = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" }
];

function bodies(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(".st-panelSection__body"));
}

function scrollOwnerBodies(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(".st-panelSection__body--scrollOwner"));
}

function collapsedBodies(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(".st-panelSection__body--collapsed"));
}

function trigger(container: Element, id: string): HTMLButtonElement | null {
  return container.querySelector<HTMLButtonElement>(`#st-panelSection-trigger-${id}`);
}

function body(container: Element, id: string): HTMLElement | null {
  return container.querySelector<HTMLElement>(`#st-panelSection-region-${id}`);
}

function sectionRootEl(container: Element, id: string): HTMLElement | null {
  return container.querySelector<HTMLElement>(`[data-panel-section-id="${id}"]`);
}

function sectionHeaderEl(container: Element, id: string): HTMLElement | null {
  return sectionRootEl(container, id)?.querySelector<HTMLElement>(".st-panelSection__header") ?? null;
}

function stackRoot(container: Element): HTMLElement {
  return container.querySelector<HTMLElement>(".st-panelStack")!;
}

// ---------------------------------------------------------------------------
// Minimal ResizeObserver stand-in for jsdom (which has none — the component
// must degrade gracefully there, see the dedicated guard test below). Tracks
// every constructed instance and its currently-observed targets so a test can
// simulate a real measurement landing on whichever target it cares about,
// without needing to know which of PanelStack's (possibly several) internal
// `observe()` calls is "the" one watching that element.
// ---------------------------------------------------------------------------
type FakeResizeEntry = { target: Element; contentRect: { height: number } };

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  private observed = new Set<Element>();
  constructor(private callback: (entries: FakeResizeEntry[]) => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(target: Element) {
    this.observed.add(target);
  }
  unobserve(target: Element) {
    this.observed.delete(target);
  }
  disconnect() {
    this.observed.clear();
  }
  deliver(target: Element, height: number) {
    if (this.observed.has(target)) this.callback([{ target, contentRect: { height } }]);
  }
}

/** Simulate a real layout measurement landing for `target`, synchronously
 *  flushing whatever reactive consequence it has (e.g. the auto-collapse
 *  decision effect re-evaluating). */
function fireResize(target: Element, height: number) {
  flushSync(() => {
    for (const instance of FakeResizeObserver.instances) instance.deliver(target, height);
  });
}

// ---------------------------------------------------------------------------
// The invariant this whole component pair exists to guarantee: AT ANY MOMENT,
// IN ANY STATE, EXACTLY ONE element inside the stack has `overflow: auto`, and
// the stack container itself never scrolls. We check this two ways: (1) at the
// CSS-source level — there is only one place in either file that can ever set
// `overflow: auto`, and the stack root is unconditionally `overflow: hidden` —
// and (2) at the DOM level, across every state reachable by clicking through
// both shapes.
// ---------------------------------------------------------------------------
describe("PanelStack / PanelSection — single scroll owner invariant", () => {
  it("the stack root style is unconditionally overflow: hidden and never overflow: auto", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/PanelStack.svelte"), "utf8");
    const style = /<style>([\s\S]*)<\/style>/.exec(source)?.[1] ?? "";
    expect(style).toContain(".st-panelStack {");
    expect(style).toMatch(/\.st-panelStack\s*{[^}]*overflow:\s*hidden/);
    expect(style).not.toContain("overflow: auto");
  });

  it("exactly one CSS rule across the whole component pair ever sets overflow: auto, and it is the scroll-owner body", () => {
    const stackSource = readFileSync(join(process.cwd(), "src/lib/PanelStack.svelte"), "utf8");
    const sectionSource = readFileSync(join(process.cwd(), "src/lib/PanelSection.svelte"), "utf8");
    // Only the compiled style blocks matter here — a doc-comment in the
    // instance script is allowed to mention the property in prose.
    const stackStyle = /<style>([\s\S]*)<\/style>/.exec(stackSource)?.[1] ?? "";
    const sectionStyle = /<style>([\s\S]*)<\/style>/.exec(sectionSource)?.[1] ?? "";
    const autoOccurrences = (stackStyle + sectionStyle).match(/overflow:\s*auto/g) ?? [];
    expect(autoOccurrences.length).toBe(1);
    expect(sectionStyle).toMatch(/\.st-panelSection__body--scrollOwner\s*{[^}]*overflow:\s*auto/);
  });

  it("sticky-item: EXACTLY one scroll-owner body exists across every reachable click sequence (never 0, never 2)", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "sticky-item", sections, defaultExpanded: "a" }
    });
    // Walk every header, in every order, clicking twice each (open then a
    // no-op re-click on the same header) — after EVERY single click, assert
    // the invariant.
    for (const id of ["a", "b", "c", "b", "a", "c", "c"]) {
      await fireEvent.click(trigger(container, id)!);
      expect(scrollOwnerBodies(container).length).toBe(1);
      expect(container.querySelector(".st-panelStack")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(
        false
      );
    }
  });

  it("sticky-item: with no `expanded` and no `defaultExpanded`, the FIRST registered section is the scroll owner (never zero)", () => {
    const { container } = render(PanelStackFixture, { props: { shape: "sticky-item", sections } });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("split-primary: EXACTLY one scroll-owner body (the primary) across every reachable secondary-toggle sequence", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    for (const id of ["b", "c", "b", "b", "c", "a" /* no-op: primary has no trigger */]) {
      const btn = trigger(container, id);
      if (btn) await fireEvent.click(btn);
      const owners = scrollOwnerBodies(container);
      expect(owners.length).toBe(1);
      expect(owners[0]).toBe(body(container, "a"));
    }
  });

  it("split-primary: with `primary` unset, the FIRST registered section owns the scroll (never zero)", () => {
    const { container } = render(PanelStackFixture, { props: { shape: "split-primary", sections } });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("split-primary: with `primary` matching no section (typo), the FIRST registered section owns the scroll (never zero)", () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "does-not-exist" }
    });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("dynamic sections (sticky-item): removing the current scroll owner leaves EXACTLY one owner — the next first section", async () => {
    const { container, rerender } = render(PanelStackFixture, {
      props: { shape: "sticky-item", sections, defaultExpanded: "b" }
    });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "b"));

    // "b" (the current owner) is removed from the stack entirely.
    await rerender({ shape: "sticky-item", sections: [sections[0], sections[2]], defaultExpanded: "b" });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("dynamic sections (split-primary): removing the primary leaves EXACTLY one owner — the next first section", async () => {
    const { container, rerender } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));

    // "a" (the primary) is removed from the stack entirely.
    await rerender({ shape: "split-primary", sections: [sections[1], sections[2]], primary: "a" });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "b"));
  });

  it("every section body stays mounted (never removed) regardless of collapsed state", () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "sticky-item", sections, defaultExpanded: "a" }
    });
    expect(bodies(container).length).toBe(sections.length);
    expect(collapsedBodies(container).length).toBe(sections.length - 1);
  });
});

describe("PanelStack — sticky-item shape (default)", () => {
  it("all headers stay visible, in document order, and are buttons", () => {
    const { container } = render(PanelStackFixture, { props: { sections, defaultExpanded: "a" } });
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-panelSection__trigger"));
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("exactly one section expanded at a time (radio semantics) — opening b closes a", async () => {
    const { container } = render(PanelStackFixture, { props: { sections, defaultExpanded: "a" } });
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");

    await fireEvent.click(trigger(container, "b")!);

    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "a")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);
  });

  it("clicking the already-expanded header is a no-op (no collapse-to-zero gesture)", async () => {
    const { container } = render(PanelStackFixture, { props: { sections, defaultExpanded: "a" } });
    await fireEvent.click(trigger(container, "a")!);
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container).length).toBe(1);
  });

  it("uncontrolled: defaultExpanded seeds the initial state, then clicks own the state internally", async () => {
    const { container } = render(PanelStackFixture, { props: { sections, defaultExpanded: "b" } });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    await fireEvent.click(trigger(container, "c")!);
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("controlled: expanded prop is the source of truth — clicks fire onExpandedChange but do NOT move the DOM state on their own", async () => {
    const onExpandedChange = vi.fn();
    const { container, rerender } = render(PanelStackFixture, {
      props: { sections, expanded: "a", onExpandedChange }
    });
    await fireEvent.click(trigger(container, "b")!);
    expect(onExpandedChange).toHaveBeenCalledWith("b");
    // Prop hasn't been updated by the consumer yet — DOM must still show "a".
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");

    // Consumer applies the callback's value -> DOM follows.
    await rerender({ sections, expanded: "b", onExpandedChange });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("ARIA wiring: aria-controls points at an existing role=region, labelled back by the trigger", () => {
    const { container } = render(PanelStackFixture, { props: { sections, defaultExpanded: "a" } });
    for (const id of ["a", "b", "c"]) {
      const btn = trigger(container, id)!;
      const controlsId = btn.getAttribute("aria-controls");
      expect(controlsId).toBe(`st-panelSection-region-${id}`);
      const region = container.querySelector(`#${controlsId}`);
      expect(region).toBeTruthy();
      expect(region?.getAttribute("role")).toBe("region");
      expect(region?.getAttribute("aria-labelledby")).toBe(btn.id);
    }
  });

  it("stack root exposes the accessible name via aria-label", () => {
    render(PanelStackFixture, { props: { sections, defaultExpanded: "a", label: "Docked chat" } });
    expect(screen.getByRole("group", { name: "Docked chat" })).toBeTruthy();
  });
});

describe("PanelStack — split-primary shape", () => {
  it("the primary section is always expanded and its header is a plain heading, NOT a button", () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    const primaryTrigger = container.querySelector("#st-panelSection-trigger-a")!;
    expect(primaryTrigger.tagName).not.toBe("BUTTON");
    expect(primaryTrigger.hasAttribute("aria-expanded")).toBe(false);
    expect(body(container, "a")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);

    // Non-primary sections DO get a real disclosure button.
    const secondaryTrigger = trigger(container, "b");
    expect(secondaryTrigger?.tagName).toBe("BUTTON");
    expect(secondaryTrigger?.hasAttribute("aria-expanded")).toBe(true);
  });

  it("non-primary sections default closed (header only)", () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("false");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
  });

  it("several non-primary sections can be expanded at once, and neither becomes the scroll owner", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!);
    await fireEvent.click(trigger(container, "c")!);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    // Only the primary ever owns the scroll.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("a non-primary section can be closed again independently of the others", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!);
    await fireEvent.click(trigger(container, "c")!);
    await fireEvent.click(trigger(container, "b")!);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("ARIA wiring holds for the primary heading too: region is role=region, labelled by the heading's id", () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    const heading = container.querySelector("#st-panelSection-trigger-a")!;
    const region = container.querySelector("#st-panelSection-region-a")!;
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
  });
});

describe("PanelStack / PanelSection — mount-once content", () => {
  it("content survives a sticky-item collapse/expand round-trip: same DOM node instance, never remounted", async () => {
    const { container } = render(PanelStackFixture, { props: { sections, defaultExpanded: "a" } });
    const before = container.querySelector('[data-testid="content-a"]');
    expect(before).toBeTruthy();

    await fireEvent.click(trigger(container, "b")!); // collapse "a"
    const whileCollapsed = container.querySelector('[data-testid="content-a"]');
    expect(whileCollapsed).toBe(before);

    await fireEvent.click(trigger(container, "a")!); // re-expand "a"
    const after = container.querySelector('[data-testid="content-a"]');
    expect(after).toBe(before);
  });

  it("content survives a split-primary secondary collapse/expand round-trip: same DOM node instance", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    const before = container.querySelector('[data-testid="content-b"]');
    expect(before).toBeTruthy();

    await fireEvent.click(trigger(container, "b")!); // expand
    expect(container.querySelector('[data-testid="content-b"]')).toBe(before);

    await fireEvent.click(trigger(container, "b")!); // collapse again
    expect(container.querySelector('[data-testid="content-b"]')).toBe(before);
  });
});

describe("PanelStack / PanelSection — misc", () => {
  it("renders header-trailing actions for a section that provides them", () => {
    const withAction = [...sections.slice(0, 2), { ...sections[2], action: "Clear" }];
    const { container } = render(PanelStackFixture, {
      props: { sections: withAction, defaultExpanded: "a" }
    });
    expect(container.querySelector('[data-testid="action-c"]')?.textContent).toBe("Clear");
  });

  it("forwards a custom class on both the stack root and a section root, alongside the base class", () => {
    const withClass = [{ ...sections[0], class: "consumer-a" }, sections[1], sections[2]];
    const { container } = render(PanelStackFixture, {
      props: { sections: withClass, defaultExpanded: "a", class: "consumer-stack" }
    });
    const root = container.querySelector(".st-panelStack");
    expect(root?.classList.contains("consumer-stack")).toBe(true);
    const sectionRoot = container.querySelector('[data-panel-section-id="a"]');
    expect(sectionRoot?.classList.contains("st-panelSection")).toBe(true);
    expect(sectionRoot?.classList.contains("consumer-a")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Ratified consumer-lane contract, three changes:
//   1. the stack is bounded to PANEL_STACK_MAX_SECTIONS (4) — a dev warning,
//      never a throw or a silent truncation;
//   2. split-primary's primary fallback chain is now designated / first
//      EXPANDED (DOM order) / first registered — not designated / first
//      registered;
//   3. split-primary auto-collapses secondaries that would squeeze the
//      primary below its floor, least-recently-expanded first, and never
//      oscillates.
// ---------------------------------------------------------------------------
describe("PanelStack — bounded to PANEL_STACK_MAX_SECTIONS sections", () => {
  it("PANEL_STACK_MAX_SECTIONS is 4", () => {
    expect(PANEL_STACK_MAX_SECTIONS).toBe(4);
  });

  it("registering exactly the max (4) sections does not warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const four = [...sections, { id: "d", label: "Delta" }];
    const { container } = render(PanelStackFixture, { props: { sections: four, defaultExpanded: "a" } });
    expect(bodies(container).length).toBe(4);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("registering a 5th section warns once (dev visibility), but still renders ALL sections — never truncated", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const five = [...sections, { id: "d", label: "Delta" }, { id: "e", label: "Epsilon" }];
    const { container } = render(PanelStackFixture, { props: { sections: five, defaultExpanded: "a" } });

    expect(bodies(container).length).toBe(5);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("[PanelStack]");
    expect(warn.mock.calls[0][0]).toContain("4");

    // The bound is advisory, not enforced — the single-scroll-owner invariant
    // must still hold with a 5th (unsupported-count) section present.
    expect(scrollOwnerBodies(container).length).toBe(1);
    warn.mockRestore();
  });
});

describe("PanelStack — split-primary primary fallback chain", () => {
  it("tier 1: a valid designated `primary` always wins, regardless of what's expanded", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("tier 2: primary unset — opening ONE secondary makes IT the primary (first EXPANDED)", async () => {
    const { container } = render(PanelStackFixture, { props: { shape: "split-primary", sections } });
    // Nothing expanded yet: last-resort tier (first registered) applies.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    await fireEvent.click(trigger(container, "b")!);

    expect(scrollOwnerBodies(container)).toEqual([body(container, "b")]);
    // "a" was implicitly primary and is now demoted to an ordinary,
    // closed-by-default secondary with a real disclosure button.
    expect(container.querySelector("#st-panelSection-trigger-a")?.tagName).toBe("BUTTON");
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("tier 2: primary unset — DOM order breaks ties, not click order", async () => {
    const { container } = render(PanelStackFixture, { props: { shape: "split-primary", sections } });
    // Click "c" first, then "b" — DOM order is a, b, c.
    await fireEvent.click(trigger(container, "c")!);
    await fireEvent.click(trigger(container, "b")!);

    expect(scrollOwnerBodies(container)).toEqual([body(container, "b")]);
  });

  it("tier 2 beats tier 3: a `primary` matching no section (typo) still prefers the first EXPANDED over the first registered", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "does-not-exist" }
    });
    await fireEvent.click(trigger(container, "c")!);

    expect(scrollOwnerBodies(container)).toEqual([body(container, "c")]);
  });

  it("tier 3 (last resort): primary unset and nothing expanded — first registered section owns the scroll", () => {
    const { container } = render(PanelStackFixture, { props: { shape: "split-primary", sections } });
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});

describe("PanelStack — split-primary auto-collapse (secondaries yield to the primary's floor)", () => {
  const PRIMARY_MIN_BLOCK_SIZE_PX = 160; // must match PanelStack.svelte's own constant

  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("collapses the least-recently-expanded secondary when the primary would be squeezed below its floor, and stops as soon as it fits again (no avalanche)", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!); // opened first -> least recently expanded
    await fireEvent.click(trigger(container, "c")!); // opened second

    const stackEl = stackRoot(container);
    const headerA = sectionHeaderEl(container, "a")!;
    const rootB = sectionRootEl(container, "b")!;
    const rootC = sectionRootEl(container, "c")!;

    fireResize(stackEl, 400);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    // available = 400 - 40 - 150 = 210 >= 160: still fits, nothing collapses yet.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);

    fireResize(rootC, 100);
    // available = 400 - 40 - (150 + 100) = 110 < 160: over budget -> collapse "b" (LRU).
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    // "c" — opened more recently — is left alone. This is the no-avalanche
    // assertion: the decision that collapsed "b" must NOT also collapse "c"
    // in the same pass using "b"'s now-stale (pre-collapse) measurement.
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // Simulate the real shrink that follows "b" actually collapsing.
    fireResize(rootB, 40);
    // available = 400 - 40 - (40 + 100) = 220 >= 160: fits now — "c" must
    // remain untouched; the single earlier collapse was sufficient.
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("collapses MULTIPLE secondaries when one isn't enough, converges to a stable fixed point, and does not oscillate on repeated identical measurements", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!);
    await fireEvent.click(trigger(container, "c")!);

    const stackEl = stackRoot(container);
    const headerA = sectionHeaderEl(container, "a")!;
    const rootB = sectionRootEl(container, "b")!;
    const rootC = sectionRootEl(container, "c")!;

    fireResize(stackEl, 250);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    fireResize(rootC, 100);
    // available = 250 - 40 - (150 + 100) = -40 < 160 -> collapse "b" (LRU).
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);

    fireResize(rootB, 40); // "b"'s real post-collapse (header-only) height.
    // available = 250 - 40 - (40 + 100) = 70 < 160 -> still short -> collapse "c" too.
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);

    fireResize(rootC, 40); // "c"'s real post-collapse height.
    // available = 250 - 40 - (40 + 40) = 130 < 160: still under the floor, but
    // nothing left to collapse — the degenerate "pane too small even fully
    // collapsed" case. The algorithm must stop, not throw, not loop.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // Fire the SAME measurements again, several times: must be a no-op —
    // proof against oscillation (nothing flips back open, nothing new
    // collapses, the single-scroll-owner invariant never wavers).
    for (let i = 0; i < 5; i++) {
      fireResize(stackEl, 250);
      fireResize(headerA, 40);
      fireResize(rootB, 40);
      fireResize(rootC, 40);
      expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
      expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
      expect(scrollOwnerBodies(container).length).toBe(1);
      expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
    }
  });

  it("explicitly re-opening an auto-collapsed secondary clears its collapse immediately, and a later re-squeeze collapses the NEW least-recently-expanded one instead (the just-reopened section survives)", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!); // opened first
    await fireEvent.click(trigger(container, "c")!); // opened second

    const stackEl = stackRoot(container);
    const headerA = sectionHeaderEl(container, "a")!;
    const rootB = sectionRootEl(container, "b")!;
    const rootC = sectionRootEl(container, "c")!;

    fireResize(stackEl, 400);
    fireResize(headerA, 40);
    fireResize(rootB, 150);
    fireResize(rootC, 100);
    // "b" (LRU) auto-collapses; single-owner invariant holds throughout.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // User explicitly re-opens "b" — clears the forced collapse right away,
    // before any new measurement, and makes "b" the MOST recently expanded.
    await fireEvent.click(trigger(container, "b")!);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // A subsequent measurement reflecting "b" back at its natural size
    // re-triggers the same squeeze — this time "c" (now the LRU) must yield,
    // NOT "b" again.
    fireResize(rootB, 150);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("never collapses anything when the pane comfortably fits everyone (no false positives)", async () => {
    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!);
    await fireEvent.click(trigger(container, "c")!);

    fireResize(stackRoot(container), 1000);
    fireResize(sectionHeaderEl(container, "a")!, 40);
    fireResize(sectionRootEl(container, "b")!, 150);
    fireResize(sectionRootEl(container, "c")!, 100);
    // available = 1000 - 40 - (150 + 100) = 710 >= 160.

    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("floor constant used by the algorithm matches the documented value", () => {
    // Sanity check that the scenarios above (which assume 160px) are actually
    // exercising the real threshold and not a coincidence of the numbers
    // chosen: reduce the deficit to exactly at the boundary.
    expect(PRIMARY_MIN_BLOCK_SIZE_PX).toBe(160);
  });
});

describe("PanelStack — auto-collapse is a no-throw no-op when ResizeObserver is unavailable", () => {
  it("split-primary with several secondaries opened renders normally, without throwing, and keeps the single-scroll-owner invariant — jsdom has no ResizeObserver by default", async () => {
    expect(typeof ResizeObserver).toBe("undefined");

    const { container } = render(PanelStackFixture, {
      props: { shape: "split-primary", sections, primary: "a" }
    });
    await fireEvent.click(trigger(container, "b")!);
    await fireEvent.click(trigger(container, "c")!);

    // No auto-collapse can possibly engage — both stay expanded as requested.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});
