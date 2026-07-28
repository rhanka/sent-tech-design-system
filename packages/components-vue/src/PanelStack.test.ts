import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, type PropType } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PanelStack, PANEL_STACK_MAX_SECTIONS, PRIMARY_MIN_BLOCK_SIZE_PX, type PanelStackShape } from "./PanelStack.js";
import { PanelSection } from "./PanelSection.js";

// ---------------------------------------------------------------------------
// Test-only fixture: a PanelStack wrapping real PanelSection children so the
// context wiring (shape, expansion, scroll ownership) can be exercised
// end-to-end. Mirrors PanelStackFixture.svelte. Not exported from the
// package.
// ---------------------------------------------------------------------------
type FixtureSection = { id: string; label: string; content?: string; action?: string; class?: string };

const Fixture = defineComponent({
  name: "PanelStackFixture",
  props: {
    shape: { type: String as PropType<PanelStackShape>, default: "sticky-item" },
    label: { type: String, default: "Fixture stack" },
    expanded: { type: String as PropType<string | null>, default: undefined },
    defaultExpanded: { type: String as PropType<string | null>, default: null },
    onExpandedChange: {
      type: Function as PropType<(id: string | null) => void>,
      default: undefined,
    },
    primary: { type: String, default: undefined },
    primaryMinHeight: { type: Number, default: undefined },
    sections: { type: Array as PropType<FixtureSection[]>, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () =>
      h(
        PanelStack,
        {
          shape: props.shape,
          label: props.label,
          expanded: props.expanded,
          defaultExpanded: props.defaultExpanded,
          onExpandedChange: props.onExpandedChange,
          primary: props.primary,
          primaryMinHeight: props.primaryMinHeight,
          class: props.class,
        },
        {
          default: () =>
            props.sections.map((section) =>
              h(
                PanelSection,
                { key: section.id, id: section.id, label: section.label, class: section.class },
                {
                  default: () =>
                    h("p", { "data-testid": `content-${section.id}` }, section.content ?? section.label),
                  ...(section.action
                    ? {
                        actions: () =>
                          h("button", { type: "button", "data-testid": `action-${section.id}` }, section.action),
                      }
                    : {}),
                },
              ),
            ),
        },
      );
  },
});

const sections: FixtureSection[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" },
];

// Section registration happens in each PanelSection's `onMounted` — AFTER
// PanelStack's own first render, since children mount bottom-up. That
// mutates `entries` (and, for split-primary, can resolve `effectivePrimary`)
// which schedules a re-render of any consumer that already read those
// computed values (PanelSection's own `isExpanded`/`isPrimary`/`isScrollOwner`
// calls). That re-render goes through Vue's normal component-update
// scheduler — deferred to a microtask — so it is NOT reflected in the DOM
// synchronously when `mount()` returns, unlike Svelte 5's effects (flushed
// synchronously by testing-library/svelte's `render()`). Same idiom as
// SelectableList.test.ts's roving-tabindex test ("Registration happens on
// mount; let the resulting re-render flush.").
async function mountFixture(props: Record<string, unknown>) {
  const wrapper = mount(Fixture, { props });
  await nextTick();
  return { wrapper, container: wrapper.element };
}

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

// `container` (`wrapper.element`) IS the `.st-panelStack` root itself in Vue
// Test Utils (there is no extra wrapper div the way testing-library/svelte's
// `render()` returns one) — `querySelector` only matches descendants, so a
// self-match must be handled explicitly here.
function stackRoot(container: Element): HTMLElement {
  return (container.matches(".st-panelStack") ? container : container.querySelector(".st-panelStack")) as HTMLElement;
}

async function click(el: Element | null) {
  if (!el) throw new Error("click(): target element not found");
  (el as HTMLElement).click();
  await nextTick();
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

/** Simulate a real layout measurement landing for `target`, then flush
 *  whatever reactive consequence it has (e.g. the auto-collapse decision
 *  watcher re-evaluating, and any resulting component re-render). */
async function fireResize(target: Element, height: number) {
  for (const instance of FakeResizeObserver.instances) instance.deliver(target, height);
  await nextTick();
}

// The two CSS-source-level checks below read the actual compiled stylesheet
// (there is no per-component scoped <style> block in this package — .ts
// render-function components share one styles.css) and keep only the rules
// belonging to this component pair, so the invariant is checked against exactly
// these two components and not the whole shared file.
//
// Selected BY SELECTOR, not by slicing from `.st-panelStack {` to end-of-file.
// A positional slice happens to work only while this pair is last in the
// stylesheet: the first component appended after it would be silently pulled
// into the scan, and an unrelated `overflow: auto` would fail this test with a
// message pointing at PanelStack. The pair's rules are flat (no @media nesting),
// so matching top-level blocks is sufficient.
//
// Comments are stripped first: one of this block's own comments explains the
// invariant using the words `overflow: auto`, and counting prose as CSS made the
// assertion see two occurrences where the stylesheet declares one.
function panelStyleSource(): string {
  const source = readFileSync(join(process.cwd(), "src/styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /(^|\n)([^{}@][^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(source)) !== null) {
    const selector = match[2].trim();
    if (/\.st-panelStack|\.st-panelSection/.test(selector)) {
      blocks.push(`${selector} {${match[3]}}`);
    }
  }
  return blocks.join("\n");
}

// ---------------------------------------------------------------------------
// The invariant this whole component pair exists to guarantee: AT ANY MOMENT,
// IN ANY STATE, EXACTLY ONE element inside the stack has `overflow: auto`, and
// the stack container itself never scrolls. We check this two ways: (1) at the
// CSS-source level — there is only one place in styles.css's PanelStack rules
// that can ever set `overflow: auto`, and the stack root is unconditionally
// `overflow: hidden` — and (2) at the DOM level, across every state reachable
// by clicking through both shapes.
// ---------------------------------------------------------------------------
describe("PanelStack / PanelSection — single scroll owner invariant", () => {
  it("the stack root style is unconditionally overflow: hidden and never overflow: auto", () => {
    const style = panelStyleSource();
    expect(style).toContain(".st-panelStack {");
    expect(style).toMatch(/\.st-panelStack\s*{[^}]*overflow:\s*hidden/);
    const stackRuleOnly = /\.st-panelStack\s*{[^}]*}/.exec(style)?.[0] ?? "";
    expect(stackRuleOnly).not.toContain("overflow: auto");
  });

  it("exactly one CSS rule across the whole component pair ever sets overflow: auto, and it is the scroll-owner body", () => {
    const style = panelStyleSource();
    const autoOccurrences = style.match(/overflow:\s*auto/g) ?? [];
    expect(autoOccurrences.length).toBe(1);
    expect(style).toMatch(/\.st-panelSection__body--scrollOwner\s*{[^}]*overflow:\s*auto/);
  });

  it("sticky-item: EXACTLY one scroll-owner body exists across every reachable click sequence (never 0, never 2)", async () => {
    const { container } = await mountFixture({ shape: "sticky-item", sections, defaultExpanded: "a" });
    // Walk every header, in every order, clicking twice each (open then a
    // no-op re-click on the same header) — after EVERY single click, assert
    // the invariant.
    for (const id of ["a", "b", "c", "b", "a", "c", "c"]) {
      await click(trigger(container, id));
      expect(scrollOwnerBodies(container).length).toBe(1);
      expect(stackRoot(container).classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    }
  });

  it("sticky-item: with no `expanded` and no `defaultExpanded`, the FIRST registered section is the scroll owner (never zero)", async () => {
    const { container } = await mountFixture({ shape: "sticky-item", sections });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("split-primary: EXACTLY one scroll-owner body (the primary) across every reachable secondary-toggle sequence", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    for (const id of ["b", "c", "b", "b", "c", "a" /* no-op: primary has no trigger */]) {
      const btn = trigger(container, id);
      if (btn) await click(btn);
      const owners = scrollOwnerBodies(container);
      expect(owners.length).toBe(1);
      expect(owners[0]).toBe(body(container, "a"));
    }
  });

  it("split-primary: with `primary` unset, the FIRST registered section owns the scroll (never zero)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("split-primary: with `primary` matching no section (typo), the FIRST registered section owns the scroll (never zero)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "does-not-exist" });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("dynamic sections (sticky-item): removing the current scroll owner leaves EXACTLY one owner — the next first section", async () => {
    const { wrapper, container } = await mountFixture({ shape: "sticky-item", sections, defaultExpanded: "b" });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "b"));

    // "b" (the current owner) is removed from the stack entirely.
    await wrapper.setProps({ sections: [sections[0], sections[2]] });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("dynamic sections (split-primary): removing the primary leaves EXACTLY one owner — the next first section", async () => {
    const { wrapper, container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));

    // "a" (the primary) is removed from the stack entirely.
    await wrapper.setProps({ sections: [sections[1], sections[2]] });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "b"));
  });

  it("every section body stays mounted (never removed) regardless of collapsed state", async () => {
    const { container } = await mountFixture({ shape: "sticky-item", sections, defaultExpanded: "a" });
    expect(bodies(container).length).toBe(sections.length);
    expect(collapsedBodies(container).length).toBe(sections.length - 1);
  });
});

describe("PanelStack — sticky-item shape (default)", () => {
  it("all headers stay visible, in document order, and are buttons", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a" });
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-panelSection__trigger"));
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("exactly one section expanded at a time (radio semantics) — opening b closes a", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a" });
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");

    await click(trigger(container, "b"));

    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "a")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);
  });

  it("clicking the already-expanded header is a no-op (no collapse-to-zero gesture)", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a" });
    await click(trigger(container, "a"));
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container).length).toBe(1);
  });

  it("uncontrolled: defaultExpanded seeds the initial state, then clicks own the state internally", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "b" });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    await click(trigger(container, "c"));
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("controlled: expanded prop is the source of truth — clicks fire onExpandedChange but do NOT move the DOM state on their own", async () => {
    const onExpandedChange = vi.fn();
    const { wrapper, container } = await mountFixture({ sections, expanded: "a", onExpandedChange });
    await click(trigger(container, "b"));
    expect(onExpandedChange).toHaveBeenCalledWith("b");
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    // Prop hasn't been updated by the consumer yet — DOM must still show "a".
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");

    // Consumer applies the callback's value -> DOM follows.
    await wrapper.setProps({ expanded: "b" });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("ARIA wiring: aria-controls points at an existing role=region, labelled back by the trigger", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a" });
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

  it("stack root exposes the accessible name via aria-label", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a", label: "Docked chat" });
    const root = stackRoot(container);
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Docked chat");
  });
});

describe("PanelStack — split-primary shape", () => {
  it("the primary section is always expanded and its header is a plain heading, NOT a button", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    const primaryTrigger = container.querySelector("#st-panelSection-trigger-a")!;
    expect(primaryTrigger.tagName).not.toBe("BUTTON");
    expect(primaryTrigger.hasAttribute("aria-expanded")).toBe(false);
    expect(body(container, "a")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);

    // Non-primary sections DO get a real disclosure button.
    const secondaryTrigger = trigger(container, "b");
    expect(secondaryTrigger?.tagName).toBe("BUTTON");
    expect(secondaryTrigger?.hasAttribute("aria-expanded")).toBe(true);
  });

  it("non-primary sections default closed (header only)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("false");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
  });

  it("several non-primary sections can be expanded at once, and neither becomes the scroll owner", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b"));
    await click(trigger(container, "c"));
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    // Only the primary ever owns the scroll.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("a non-primary section can be closed again independently of the others", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b"));
    await click(trigger(container, "c"));
    await click(trigger(container, "b"));
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("ARIA wiring holds for the primary heading too: region is role=region, labelled by the heading's id", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    const heading = container.querySelector("#st-panelSection-trigger-a")!;
    const region = container.querySelector("#st-panelSection-region-a")!;
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
  });
});

describe("PanelStack / PanelSection — mount-once content", () => {
  it("content survives a sticky-item collapse/expand round-trip: same DOM node instance, never remounted", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a" });
    const before = container.querySelector('[data-testid="content-a"]');
    expect(before).toBeTruthy();

    await click(trigger(container, "b")); // collapse "a"
    const whileCollapsed = container.querySelector('[data-testid="content-a"]');
    expect(whileCollapsed).toBe(before);

    await click(trigger(container, "a")); // re-expand "a"
    const after = container.querySelector('[data-testid="content-a"]');
    expect(after).toBe(before);
  });

  it("content survives a split-primary secondary collapse/expand round-trip: same DOM node instance", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    const before = container.querySelector('[data-testid="content-b"]');
    expect(before).toBeTruthy();

    await click(trigger(container, "b")); // expand
    expect(container.querySelector('[data-testid="content-b"]')).toBe(before);

    await click(trigger(container, "b")); // collapse again
    expect(container.querySelector('[data-testid="content-b"]')).toBe(before);
  });
});

describe("PanelStack / PanelSection — misc", () => {
  it("renders header-trailing actions for a section that provides them", async () => {
    const withAction = [...sections.slice(0, 2), { ...sections[2], action: "Clear" }];
    const { container } = await mountFixture({ sections: withAction, defaultExpanded: "a" });
    expect(container.querySelector('[data-testid="action-c"]')?.textContent).toBe("Clear");
  });

  it("forwards a custom class on both the stack root and a section root, alongside the base class", async () => {
    const withClass = [{ ...sections[0], class: "consumer-a" }, sections[1], sections[2]];
    const { container } = await mountFixture({ sections: withClass, defaultExpanded: "a", class: "consumer-stack" });
    const root = stackRoot(container);
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

  it("registering exactly the max (4) sections does not warn", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const four = [...sections, { id: "d", label: "Delta" }];
    const { container } = await mountFixture({ sections: four, defaultExpanded: "a" });
    expect(bodies(container).length).toBe(4);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("registering a 5th section warns once (dev visibility), but still renders ALL sections — never truncated", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const five = [...sections, { id: "d", label: "Delta" }, { id: "e", label: "Epsilon" }];
    const { container } = await mountFixture({ sections: five, defaultExpanded: "a" });

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
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b"));
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("tier 2: primary unset — opening ONE secondary makes IT the primary (first EXPANDED)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections });
    // Nothing expanded yet: last-resort tier (first registered) applies.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    await click(trigger(container, "b"));

    expect(scrollOwnerBodies(container)).toEqual([body(container, "b")]);
    // "a" was implicitly primary and is now demoted to an ordinary,
    // closed-by-default secondary with a real disclosure button.
    expect(container.querySelector("#st-panelSection-trigger-a")?.tagName).toBe("BUTTON");
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("tier 2: primary unset — DOM order breaks ties, not click order", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections });
    // Click "c" first, then "b" — DOM order is a, b, c.
    await click(trigger(container, "c"));
    await click(trigger(container, "b"));

    expect(scrollOwnerBodies(container)).toEqual([body(container, "b")]);
  });

  it("tier 2 beats tier 3: a `primary` matching no section (typo) still prefers the first EXPANDED over the first registered", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "does-not-exist" });
    await click(trigger(container, "c"));

    expect(scrollOwnerBodies(container)).toEqual([body(container, "c")]);
  });

  it("tier 3 (last resort): primary unset and nothing expanded — first registered section owns the scroll", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections });
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});

describe("PanelStack — split-primary auto-collapse (secondaries yield to the primary's floor)", () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("collapses the least-recently-expanded secondary when the primary would be squeezed below its floor, and stops as soon as it fits again (no avalanche)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b")); // opened first -> least recently expanded
    await click(trigger(container, "c")); // opened second

    const stackEl = stackRoot(container);
    const headerA = sectionHeaderEl(container, "a")!;
    const rootB = sectionRootEl(container, "b")!;
    const rootC = sectionRootEl(container, "c")!;

    await fireResize(stackEl, 400);
    await fireResize(headerA, 40);
    await fireResize(rootB, 150);
    // available = 400 - 40 - 150 = 210 >= 160: still fits, nothing collapses yet.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);

    await fireResize(rootC, 100);
    // available = 400 - 40 - (150 + 100) = 110 < 160: over budget -> collapse "b" (LRU).
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    // "c" — opened more recently — is left alone. This is the no-avalanche
    // assertion: the decision that collapsed "b" must NOT also collapse "c"
    // in the same pass using "b"'s now-stale (pre-collapse) measurement.
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // Simulate the real shrink that follows "b" actually collapsing.
    await fireResize(rootB, 40);
    // available = 400 - 40 - (40 + 100) = 220 >= 160: fits now — "c" must
    // remain untouched; the single earlier collapse was sufficient.
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("collapses MULTIPLE secondaries when one isn't enough, converges to a stable fixed point, and does not oscillate on repeated identical measurements", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b"));
    await click(trigger(container, "c"));

    const stackEl = stackRoot(container);
    const headerA = sectionHeaderEl(container, "a")!;
    const rootB = sectionRootEl(container, "b")!;
    const rootC = sectionRootEl(container, "c")!;

    await fireResize(stackEl, 250);
    await fireResize(headerA, 40);
    await fireResize(rootB, 150);
    await fireResize(rootC, 100);
    // available = 250 - 40 - (150 + 100) = -40 < 160 -> collapse "b" (LRU).
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);

    await fireResize(rootB, 40); // "b"'s real post-collapse (header-only) height.
    // available = 250 - 40 - (40 + 100) = 70 < 160 -> still short -> collapse "c" too.
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);

    await fireResize(rootC, 40); // "c"'s real post-collapse height.
    // available = 250 - 40 - (40 + 40) = 130 < 160: still under the floor, but
    // nothing left to collapse — the degenerate "pane too small even fully
    // collapsed" case. The algorithm must stop, not throw, not loop.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // Fire the SAME measurements again, several times: must be a no-op —
    // proof against oscillation (nothing flips back open, nothing new
    // collapses, the single-scroll-owner invariant never wavers).
    for (let i = 0; i < 5; i++) {
      await fireResize(stackEl, 250);
      await fireResize(headerA, 40);
      await fireResize(rootB, 40);
      await fireResize(rootC, 40);
      expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
      expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
      expect(scrollOwnerBodies(container).length).toBe(1);
      expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
    }
  });

  it("explicitly re-opening an auto-collapsed secondary clears its collapse immediately, and a later re-squeeze collapses the NEW least-recently-expanded one instead (the just-reopened section survives)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b")); // opened first
    await click(trigger(container, "c")); // opened second

    const stackEl = stackRoot(container);
    const headerA = sectionHeaderEl(container, "a")!;
    const rootB = sectionRootEl(container, "b")!;
    const rootC = sectionRootEl(container, "c")!;

    await fireResize(stackEl, 400);
    await fireResize(headerA, 40);
    await fireResize(rootB, 150);
    await fireResize(rootC, 100);
    // "b" (LRU) auto-collapses; single-owner invariant holds throughout.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // User explicitly re-opens "b" — clears the forced collapse right away,
    // before any new measurement, and makes "b" the MOST recently expanded.
    await click(trigger(container, "b"));
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    // A subsequent measurement reflecting "b" back at its natural size
    // re-triggers the same squeeze — this time "c" (now the LRU) must yield,
    // NOT "b" again.
    await fireResize(rootB, 150);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("never collapses anything when the pane comfortably fits everyone (no false positives)", async () => {
    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b"));
    await click(trigger(container, "c"));

    await fireResize(stackRoot(container), 1000);
    await fireResize(sectionHeaderEl(container, "a")!, 40);
    await fireResize(sectionRootEl(container, "b")!, 150);
    await fireResize(sectionRootEl(container, "c")!, 100);
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

    const { container } = await mountFixture({ shape: "split-primary", sections, primary: "a" });
    await click(trigger(container, "b"));
    await click(trigger(container, "c"));

    // No auto-collapse can possibly engage — both stay expanded as requested.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});

// ---------------------------------------------------------------------------
// Consumer-lane change 1: `primaryMinHeight` is the single source of truth
// for BOTH the JS auto-collapse threshold and the CSS floor — emitted as an
// inline `--st-component-panelStack-primaryMinBlockSize` custom property on
// the stack root, defaulting to PRIMARY_MIN_BLOCK_SIZE_PX (160).
// ---------------------------------------------------------------------------
describe("PanelStack — primaryMinHeight prop", () => {
  it("emits the inline custom property on the stack root, defaulting to PRIMARY_MIN_BLOCK_SIZE_PX", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a" });
    const root = stackRoot(container);
    expect(root.style.getPropertyValue("--st-component-panelStack-primaryMinBlockSize")).toBe(
      `${PRIMARY_MIN_BLOCK_SIZE_PX}px`,
    );
  });

  it("emits the inline custom property matching a custom primaryMinHeight, driving both JS and CSS from one value", async () => {
    const { container } = await mountFixture({ sections, defaultExpanded: "a", primaryMinHeight: 320 });
    const root = stackRoot(container);
    expect(root.style.getPropertyValue("--st-component-panelStack-primaryMinBlockSize")).toBe("320px");
  });

  describe("drives the auto-collapse threshold (split-primary)", () => {
    beforeEach(() => {
      FakeResizeObserver.instances = [];
      vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("a lower custom floor tolerates a squeeze that the default 160px floor would have collapsed", async () => {
      const { container } = await mountFixture({
        shape: "split-primary",
        sections,
        primary: "a",
        primaryMinHeight: 100,
      });
      await click(trigger(container, "b"));
      await click(trigger(container, "c"));

      const stackEl = stackRoot(container);
      const headerA = sectionHeaderEl(container, "a")!;
      const rootB = sectionRootEl(container, "b")!;
      const rootC = sectionRootEl(container, "c")!;

      await fireResize(stackEl, 400);
      await fireResize(headerA, 40);
      await fireResize(rootB, 150);
      await fireResize(rootC, 100);
      // available = 400 - 40 - (150 + 100) = 110: would collapse under the
      // DEFAULT 160px floor (see the sibling describe block above using the
      // very same numbers), but comfortably clears this stack's custom
      // 100px floor — nothing collapses.
      expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
      expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
      expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
    });

    it("raising primaryMinHeight at runtime re-evaluates the decision and can newly trigger an auto-collapse off the SAME measurements", async () => {
      const { wrapper, container } = await mountFixture({
        shape: "split-primary",
        sections,
        primary: "a",
        primaryMinHeight: 100,
      });
      await click(trigger(container, "b"));
      await click(trigger(container, "c"));

      const stackEl = stackRoot(container);
      const headerA = sectionHeaderEl(container, "a")!;
      const rootB = sectionRootEl(container, "b")!;
      const rootC = sectionRootEl(container, "c")!;

      await fireResize(stackEl, 400);
      await fireResize(headerA, 40);
      await fireResize(rootB, 150);
      await fireResize(rootC, 100);
      // available = 110 >= the custom 100px floor: fits, nothing collapses yet.
      expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);

      await wrapper.setProps({ primaryMinHeight: 200 });
      // No new measurement lands — only the floor itself rose above the
      // already-known `available` (110 < 200): the decision watcher must
      // re-run off the PROP change alone and collapse the LRU secondary ("b").
      expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
      expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
      expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
      expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
    });
  });
});

// ---------------------------------------------------------------------------
// Consumer-lane change 2: a controlled `expanded` is never overridden — the
// prop is never written and `expandedChange` never fires on the consumer's
// behalf — but the "never zero scroll owners" invariant still has to hold,
// so an id that matches no registered section resolves a scroll owner via
// the existing first-registered fallback, and warns once. In sticky-item,
// "expanded" and "scroll owner" are the same thing by definition, so that
// fallback section must ALSO be reported as expanded (aria-expanded=true,
// body carries --scrollOwner and never --collapsed) — anything else is a
// screen reader announcing "collapsed" for content that is visibly, still
// scrolling on screen. An explicit `expanded: null` is a distinct,
// deliberate "everything collapsed" and is honored as-is (zero scroll
// owners is correct there — nothing is unreachable, so nothing is
// misdescribed either).
// ---------------------------------------------------------------------------
describe("PanelStack — sticky-item: controlled expanded pointing at a non-existent id", () => {
  it("the fallback (first registered) section is reported as expanded — aria-expanded matches what's actually rendered", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = await mountFixture({ sections, expanded: "does-not-exist" });

    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("false");
    warn.mockRestore();
  });

  it("the fallback section's body carries --scrollOwner and never --collapsed, consistent with aria-expanded=true", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = await mountFixture({ sections, expanded: "does-not-exist" });

    expect(body(container, "a")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);
    expect(body(container, "a")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    warn.mockRestore();
  });

  it("still resolves exactly one scroll owner internally — the first registered section — never zero", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = await mountFixture({ sections, expanded: "does-not-exist" });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
    warn.mockRestore();
  });

  it("the controlled prop is left untouched by the fallback: no expandedChange is emitted merely from mounting/resolving it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onExpandedChange = vi.fn();
    const { wrapper } = await mountFixture({ sections, expanded: "does-not-exist", onExpandedChange });

    // The consumer's own prop value is never rewritten by the component —
    // Vue props are one-way regardless, but this also confirms no code path
    // attempted to "fix" it by emitting a change on the consumer's behalf.
    expect(wrapper.props("expanded")).toBe("does-not-exist");
    expect(onExpandedChange).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("warns once, following the [PanelStack] convention, naming the offending value", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await mountFixture({ sections, expanded: "does-not-exist" });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("[PanelStack]");
    expect(warn.mock.calls[0][0]).toContain("does-not-exist");
    warn.mockRestore();
  });

  it("does NOT warn for a valid controlled expanded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await mountFixture({ sections, expanded: "a" });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does NOT warn for split-primary (expanded is a sticky-item-only control there)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await mountFixture({ shape: "split-primary", sections, primary: "a", expanded: "does-not-exist" });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("explicit expanded: null is a deliberate 'everything collapsed' — honored as-is, zero scroll owners, no warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = await mountFixture({ sections, expanded: null });

    expect(warn).not.toHaveBeenCalled();
    for (const id of ["a", "b", "c"]) {
      expect(trigger(container, id)?.getAttribute("aria-expanded")).toBe("false");
    }
    expect(scrollOwnerBodies(container).length).toBe(0);
    warn.mockRestore();
  });
});
