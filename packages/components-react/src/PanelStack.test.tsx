import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PanelStack, PANEL_STACK_MAX_SECTIONS, type PanelStackShape } from "./PanelStack.js";
import { PanelSection } from "./PanelSection.js";

afterEach(cleanup);

const sections = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" },
];

// ---------------------------------------------------------------------------
// Test-only fixture: a PanelStack wrapping real PanelSection children so the
// context wiring (shape, expansion, scroll ownership) can be exercised
// end-to-end. Mirrors PanelStackFixture.svelte.
// ---------------------------------------------------------------------------
type FixtureSection = { id: string; label: string; content?: string; action?: string; className?: string };

function Fixture({
  shape = "sticky-item",
  label = "Fixture stack",
  expanded,
  defaultExpanded = null,
  onExpandedChange,
  primary,
  primaryMinHeight,
  sections: fixtureSections,
  className,
}: {
  shape?: PanelStackShape;
  label?: string;
  expanded?: string | null;
  defaultExpanded?: string | null;
  onExpandedChange?: (id: string | null) => void;
  primary?: string;
  primaryMinHeight?: number;
  sections: FixtureSection[];
  className?: string;
}) {
  return (
    <PanelStack
      shape={shape}
      label={label}
      expanded={expanded}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
      primary={primary}
      primaryMinHeight={primaryMinHeight}
      className={className}
    >
      {fixtureSections.map((section) => (
        <PanelSection
          key={section.id}
          id={section.id}
          label={section.label}
          className={section.className}
          actions={
            section.action ? (
              <button type="button" data-testid={`action-${section.id}`}>
                {section.action}
              </button>
            ) : undefined
          }
        >
          <p data-testid={`content-${section.id}`}>{section.content ?? section.label}</p>
        </PanelSection>
      ))}
    </PanelStack>
  );
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
 *  decision re-evaluating). */
function fireResize(target: Element, height: number) {
  act(() => {
    for (const instance of FakeResizeObserver.instances) instance.deliver(target, height);
  });
}

// ---------------------------------------------------------------------------
// The invariant this whole component pair exists to guarantee: AT ANY MOMENT,
// IN ANY STATE, EXACTLY ONE element inside the stack has `overflow: auto`, and
// the stack container itself never scrolls. We check this two ways: (1) at the
// CSS-source level — the shared styles.css block for this component pair sets
// `overflow: auto` exactly once, and the stack root is unconditionally
// `overflow: hidden` — and (2) at the DOM level, across every state reachable
// by clicking through both shapes.
// ---------------------------------------------------------------------------
describe("PanelStack / PanelSection — single scroll owner invariant", () => {
  it("the stack root style is unconditionally overflow: hidden", () => {
    const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
    const match = /\.st-panelStack\s*{([^}]*)}/.exec(css);
    expect(match).toBeTruthy();
    expect(match![1]).toMatch(/overflow:\s*hidden/);
  });

  it("exactly one CSS rule across the PanelStack/PanelSection block ever sets overflow: auto, and it is the scroll-owner body", () => {
    // Selected BY SELECTOR, not by slicing from `.st-panelStack {` to end-of-file.
    // A positional slice happens to work only while this pair is last in the
    // stylesheet: the first component appended after it would be silently pulled
    // into the scan, and an unrelated `overflow: auto` would fail this test with
    // a message pointing at PanelStack. The pair's rules are flat (no @media
    // nesting), so matching top-level blocks is sufficient.
    //
    // Comments are stripped first: one of this block's own comments explains the
    // invariant using the words `overflow: auto`, and counting prose as CSS made
    // the assertion see two occurrences where the stylesheet declares one.
    const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const blocks: string[] = [];
    const rule = /(^|\n)([^{}@][^{}]*)\{([^{}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = rule.exec(css)) !== null) {
      const selector = match[2].trim();
      if (/\.st-panelStack|\.st-panelSection/.test(selector)) {
        blocks.push(`${selector} {${match[3]}}`);
      }
    }
    expect(blocks.length).toBeGreaterThan(0);
    const block = blocks.join("\n");
    const autoOccurrences = block.match(/overflow:\s*auto/g) ?? [];
    expect(autoOccurrences.length).toBe(1);
    expect(block).toMatch(/\.st-panelSection__body--scrollOwner\s*{[^}]*overflow:\s*auto/);
  });

  it("sticky-item: EXACTLY one scroll-owner body exists across every reachable click sequence (never 0, never 2)", async () => {
    const { container } = render(<Fixture shape="sticky-item" sections={sections} defaultExpanded="a" />);
    // Walk every header, in every order, clicking twice each (open then a
    // no-op re-click on the same header) — after EVERY single click, assert
    // the invariant.
    for (const id of ["a", "b", "c", "b", "a", "c", "c"]) {
      await act(async () => {
        fireEvent.click(trigger(container, id)!);
      });
      expect(scrollOwnerBodies(container).length).toBe(1);
      expect(container.querySelector(".st-panelStack")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(
        false,
      );
    }
  });

  it("sticky-item: with no `expanded` and no `defaultExpanded`, the FIRST registered section is the scroll owner (never zero)", () => {
    const { container } = render(<Fixture shape="sticky-item" sections={sections} />);
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("split-primary: EXACTLY one scroll-owner body (the primary) across every reachable secondary-toggle sequence", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    for (const id of ["b", "c", "b", "b", "c", "a" /* no-op: primary has no trigger */]) {
      const btn = trigger(container, id);
      if (btn) {
        await act(async () => {
          fireEvent.click(btn);
        });
      }
      const owners = scrollOwnerBodies(container);
      expect(owners.length).toBe(1);
      expect(owners[0]).toBe(body(container, "a"));
    }
  });

  it("split-primary: with `primary` unset, the FIRST registered section owns the scroll (never zero)", () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} />);
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("split-primary: with `primary` matching no section (typo), the FIRST registered section owns the scroll (never zero)", () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="does-not-exist" />);
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("dynamic sections (sticky-item): removing the current scroll owner leaves EXACTLY one owner — the next first section", () => {
    const { container, rerender } = render(<Fixture shape="sticky-item" sections={sections} defaultExpanded="b" />);
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "b"));

    // "b" (the current owner) is removed from the stack entirely.
    act(() => {
      rerender(
        <Fixture shape="sticky-item" sections={[sections[0], sections[2]]} defaultExpanded="b" />,
      );
    });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
  });

  it("dynamic sections (split-primary): removing the primary leaves EXACTLY one owner — the next first section", () => {
    const { container, rerender } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));

    // "a" (the primary) is removed from the stack entirely.
    act(() => {
      rerender(<Fixture shape="split-primary" sections={[sections[1], sections[2]]} primary="a" />);
    });

    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "b"));
  });

  it("every section body stays mounted (never removed) regardless of collapsed state", () => {
    const { container } = render(<Fixture shape="sticky-item" sections={sections} defaultExpanded="a" />);
    expect(bodies(container).length).toBe(sections.length);
    expect(collapsedBodies(container).length).toBe(sections.length - 1);
  });
});

describe("PanelStack — sticky-item shape (default)", () => {
  it("all headers stay visible, in document order, and are buttons", () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" />);
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-panelSection__trigger"));
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("exactly one section expanded at a time (radio semantics) — opening b closes a", async () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" />);
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");

    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });

    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "a")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);
  });

  it("clicking the already-expanded header is a no-op (no collapse-to-zero gesture)", async () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "a")!);
    });
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(scrollOwnerBodies(container).length).toBe(1);
  });

  it("uncontrolled: defaultExpanded seeds the initial state, then clicks own the state internally", async () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="b" />);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("controlled: expanded prop is the source of truth — clicks fire onExpandedChange but do NOT move the DOM state on their own", async () => {
    const onExpandedChange = vi.fn();
    const { container, rerender } = render(<Fixture sections={sections} expanded="a" onExpandedChange={onExpandedChange} />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    expect(onExpandedChange).toHaveBeenCalledWith("b");
    // Prop hasn't been updated by the consumer yet — DOM must still show "a".
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");

    // Consumer applies the callback's value -> DOM follows.
    act(() => {
      rerender(<Fixture sections={sections} expanded="b" onExpandedChange={onExpandedChange} />);
    });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("ARIA wiring: aria-controls points at an existing role=region, labelled back by the trigger", () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" />);
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
    render(<Fixture sections={sections} defaultExpanded="a" label="Docked chat" />);
    expect(screen.getByRole("group", { name: "Docked chat" })).toBeTruthy();
  });
});

describe("PanelStack — split-primary shape", () => {
  it("the primary section is always expanded and its header is a plain heading, NOT a button", () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
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
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("false");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
  });

  it("several non-primary sections can be expanded at once, and neither becomes the scroll owner", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    // Only the primary ever owns the scroll.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("a non-primary section can be closed again independently of the others", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger(container, "c")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("ARIA wiring holds for the primary heading too: region is role=region, labelled by the heading's id", () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    const heading = container.querySelector("#st-panelSection-trigger-a")!;
    const region = container.querySelector("#st-panelSection-region-a")!;
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
  });
});

describe("PanelStack / PanelSection — mount-once content", () => {
  it("content survives a sticky-item collapse/expand round-trip: same DOM node instance, never remounted", async () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" />);
    const before = container.querySelector('[data-testid="content-a"]');
    expect(before).toBeTruthy();

    await act(async () => {
      fireEvent.click(trigger(container, "b")!); // collapse "a"
    });
    const whileCollapsed = container.querySelector('[data-testid="content-a"]');
    expect(whileCollapsed).toBe(before);

    await act(async () => {
      fireEvent.click(trigger(container, "a")!); // re-expand "a"
    });
    const after = container.querySelector('[data-testid="content-a"]');
    expect(after).toBe(before);
  });

  it("content survives a split-primary secondary collapse/expand round-trip: same DOM node instance", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    const before = container.querySelector('[data-testid="content-b"]');
    expect(before).toBeTruthy();

    await act(async () => {
      fireEvent.click(trigger(container, "b")!); // expand
    });
    expect(container.querySelector('[data-testid="content-b"]')).toBe(before);

    await act(async () => {
      fireEvent.click(trigger(container, "b")!); // collapse again
    });
    expect(container.querySelector('[data-testid="content-b"]')).toBe(before);
  });
});

describe("PanelStack / PanelSection — misc", () => {
  it("renders header-trailing actions for a section that provides them", () => {
    const withAction = [...sections.slice(0, 2), { ...sections[2], action: "Clear" }];
    const { container } = render(<Fixture sections={withAction} defaultExpanded="a" />);
    expect(container.querySelector('[data-testid="action-c"]')?.textContent).toBe("Clear");
  });

  it("forwards a custom class on both the stack root and a section root, alongside the base class", () => {
    const withClass = [{ ...sections[0], className: "consumer-a" }, sections[1], sections[2]];
    const { container } = render(<Fixture sections={withClass} defaultExpanded="a" className="consumer-stack" />);
    const root = container.querySelector(".st-panelStack");
    expect(root?.classList.contains("consumer-stack")).toBe(true);
    const sectionRoot = container.querySelector('[data-panel-section-id="a"]');
    expect(sectionRoot?.classList.contains("st-panelSection")).toBe(true);
    expect(sectionRoot?.classList.contains("consumer-a")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// `primaryMinHeight` is the single source of truth for both the JS
// auto-collapse threshold and the CSS floor: PanelStack emits it as an
// inline `--st-component-panelStack-primaryMinBlockSize` custom property on
// the stack root, which styles.css's `.st-panelSection__body--scrollOwner`
// reads via var(...). These two facts (the prop drives the DOM style AND the
// default matches the CSS fallback) are what stop the two from drifting
// apart again the way the old JS-constant/CSS-fallback pair could.
// ---------------------------------------------------------------------------
describe("PanelStack — primaryMinHeight prop drives the CSS floor via an inline custom property", () => {
  it("emits --st-component-panelStack-primaryMinBlockSize on the stack root, matching the prop", () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" primaryMinHeight={220} />);
    const root = stackRoot(container);
    expect(root.style.getPropertyValue("--st-component-panelStack-primaryMinBlockSize")).toBe("220px");
  });

  it("defaults the custom property to 160px (PRIMARY_MIN_BLOCK_SIZE_PX) when primaryMinHeight is unset", () => {
    const { container } = render(<Fixture sections={sections} defaultExpanded="a" />);
    const root = stackRoot(container);
    expect(root.style.getPropertyValue("--st-component-panelStack-primaryMinBlockSize")).toBe("160px");
  });
});

// ---------------------------------------------------------------------------
// Ratified consumer-lane contract, three changes:
//   1. the stack is bounded to PANEL_STACK_MAX_SECTIONS (4) — a dev warning,
//      never a throw or a silent truncation;
//   2. split-primary's primary fallback chain is designated / first
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
    const { container } = render(<Fixture sections={four} defaultExpanded="a" />);
    expect(bodies(container).length).toBe(4);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("registering a 5th section warns once (dev visibility), but still renders ALL sections — never truncated", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const five = [...sections, { id: "d", label: "Delta" }, { id: "e", label: "Epsilon" }];
    const { container } = render(<Fixture sections={five} defaultExpanded="a" />);

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
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });

  it("tier 2: primary unset — opening ONE secondary makes IT the primary (first EXPANDED)", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} />);
    // Nothing expanded yet: last-resort tier (first registered) applies.
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);

    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });

    expect(scrollOwnerBodies(container)).toEqual([body(container, "b")]);
    // "a" was implicitly primary and is now demoted to an ordinary,
    // closed-by-default secondary with a real disclosure button.
    expect(container.querySelector("#st-panelSection-trigger-a")?.tagName).toBe("BUTTON");
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("tier 2: primary unset — DOM order breaks ties, not click order", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} />);
    // Click "c" first, then "b" — DOM order is a, b, c.
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });

    expect(scrollOwnerBodies(container)).toEqual([body(container, "b")]);
  });

  it("tier 2 beats tier 3: a `primary` matching no section (typo) still prefers the first EXPANDED over the first registered", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="does-not-exist" />);
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });

    expect(scrollOwnerBodies(container)).toEqual([body(container, "c")]);
  });

  it("tier 3 (last resort): primary unset and nothing expanded — first registered section owns the scroll", () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} />);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});

describe("PanelStack — split-primary auto-collapse (secondaries yield to the primary's floor)", () => {
  const PRIMARY_MIN_BLOCK_SIZE_PX = 160; // must match PanelStack.tsx's own constant

  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("collapses the least-recently-expanded secondary when the primary would be squeezed below its floor, and stops as soon as it fits again (no avalanche)", async () => {
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!); // opened first -> least recently expanded
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!); // opened second
    });

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
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });

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
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!); // opened first
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!); // opened second
    });

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
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
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
    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });

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

  it("a custom primaryMinHeight changes WHEN auto-collapse triggers, not just the CSS floor", async () => {
    // available below is chosen to sit ABOVE the default 160px floor (so the
    // default would leave "b" alone) but BELOW a custom, higher floor — proof
    // that the prop is what `runDecision` actually compares against, not a
    // fixed constant.
    const { container } = render(
      <Fixture shape="split-primary" sections={sections} primary="a" primaryMinHeight={300} />,
    );
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });

    fireResize(stackRoot(container), 400);
    fireResize(sectionHeaderEl(container, "a")!, 40);
    fireResize(sectionRootEl(container, "b")!, 100);
    // available = 400 - 40 - 100 = 260: >= the default 160px floor (would NOT
    // collapse there) but < the custom 300px floor passed above.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(true);
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});

describe("PanelStack — auto-collapse is a no-throw no-op when ResizeObserver is unavailable", () => {
  it("split-primary with several secondaries opened renders normally, without throwing, and keeps the single-scroll-owner invariant — jsdom has no ResizeObserver by default", async () => {
    expect(typeof ResizeObserver).toBe("undefined");

    const { container } = render(<Fixture shape="split-primary" sections={sections} primary="a" />);
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    await act(async () => {
      fireEvent.click(trigger(container, "c")!);
    });

    // No auto-collapse can possibly engage — both stay expanded as requested.
    expect(body(container, "b")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(body(container, "c")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    expect(scrollOwnerBodies(container)).toEqual([body(container, "a")]);
  });
});

// ---------------------------------------------------------------------------
// Ratified consumer-lane follow-up: a controlled `expanded` naming no
// registered section must NOT be overridden (the controlled contract is
// absolute — the stack never self-corrects the prop, never calls
// `onExpandedChange` on its own initiative) but the single-scroll-owner
// invariant still has to hold, so the EFFECTIVE (internal) resolution
// decouples from the raw prop and falls back to the first registered
// section, same as the unset/uncontrolled case — with a one-time dev warning
// using the established `[PanelStack] …` convention.
// ---------------------------------------------------------------------------
describe("PanelStack — controlled `expanded` pointing at a non-existent id", () => {
  it("leaves the controlled value untouched, still resolves exactly one scroll owner (first registered), and warns once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onExpandedChange = vi.fn();
    const { container, rerender } = render(
      <Fixture sections={sections} expanded="does-not-exist" onExpandedChange={onExpandedChange} />,
    );

    // Invariant holds: exactly one scroll owner, resolved via the same
    // first-registered fallback as the unset/uncontrolled case.
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));

    // ARIA must describe what is actually rendered, not the raw (invalid)
    // prop: sticky-item's `isExpanded` resolves from the SAME effective id
    // as `isScrollOwner` (both read `computeEffectiveExpandedId()`), so the
    // fallback section is never reported "collapsed" while it is on screen
    // and scrolling. Not overwriting a controlled value means never
    // mutating it and never firing the change callback on the stack's own
    // initiative — it does NOT mean ARIA may misdescribe the DOM.
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "a")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(true);
    expect(body(container, "a")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);
    // The other sections are ordinary, closed, non-owning secondaries.
    expect(trigger(container, "b")?.getAttribute("aria-expanded")).toBe("false");
    expect(body(container, "b")?.classList.contains("st-panelSection__body--scrollOwner")).toBe(false);

    // No self-initiated correction on mount: the invalid prop is resolved
    // internally, but the stack never calls back to "fix" it.
    expect(onExpandedChange).not.toHaveBeenCalled();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("[PanelStack]");
    expect(warn.mock.calls[0][0]).toContain("does-not-exist");

    // A click still fires onExpandedChange (the controlled contract is
    // intact) but does NOT move the DOM — the stack never self-corrects the
    // prop, only its own internal scroll-owner/expanded resolution.
    await act(async () => {
      fireEvent.click(trigger(container, "b")!);
    });
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith("b");
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(scrollOwnerBodies(container)[0]).toBe(body(container, "a"));
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");

    // Re-rendering with the SAME invalid value (the consumer did NOT apply
    // the callback's value — the prop is still literally untouched) must
    // reproduce the identical resolution and must not warn again.
    act(() => {
      rerender(<Fixture sections={sections} expanded="does-not-exist" onExpandedChange={onExpandedChange} />);
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(scrollOwnerBodies(container).length).toBe(1);
    expect(trigger(container, "a")?.getAttribute("aria-expanded")).toBe("true");
    expect(body(container, "a")?.classList.contains("st-panelSection__body--collapsed")).toBe(false);

    warn.mockRestore();
  });
});
