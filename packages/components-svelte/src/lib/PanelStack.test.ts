import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import PanelStackFixture from "./PanelStackFixture.svelte";

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
