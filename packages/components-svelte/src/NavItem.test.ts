import { render, fireEvent } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import NavItem from "./lib/NavItem.svelte";

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-navItem");
const row = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-selectableRow");

describe("NavItem", () => {
  it("renders the title inside the row (composed over SelectableRow)", () => {
    const { container } = render(NavItem, { props: { title: "Entities" } });
    expect(root(container)).toBeTruthy();
    // It reuses SelectableRow as its row anatomy.
    expect(row(container)).toBeTruthy();
    const title = container.querySelector(".st-navItem__title");
    expect(title?.textContent).toBe("Entities");
  });

  it("byte-identity: WITHOUT a caption the row stays single-line (no caption node)", () => {
    const { container } = render(NavItem, { props: { title: "Entities" } });
    // No NavItem caption AND no SelectableRow caption modifier.
    expect(container.querySelector(".st-navItem__caption")).toBeNull();
    expect(row(container)?.className).not.toContain("st-selectableRow--hasCaption");
  });

  it("renders the caption as a muted second line and stacks the row", () => {
    const { container } = render(NavItem, {
      props: { title: "Entities", caption: "243 records" }
    });
    const cap = container.querySelector(".st-navItem__caption");
    expect(cap?.textContent).toBe("243 records");
    // SelectableRow gets the caption → stacked column + hasCaption modifier.
    expect(row(container)?.className).toContain("st-selectableRow--hasCaption");
    expect(container.querySelector(".st-selectableRow__content--stacked")).toBeTruthy();
  });

  it("renders an arbitrary-color swatch via ColorSwatch (backgroundColor, not background)", () => {
    const { container } = render(NavItem, {
      props: { title: "Brand", swatch: { color: "#16a34a" } }
    });
    const chip = container.querySelector<HTMLElement>(".st-colorSwatch__chip");
    expect(chip).toBeTruthy();
    expect(chip?.style.backgroundColor).toContain("rgb(22, 163, 74)");
  });

  it("renders a toned swatch via StatusDot when no color is given", () => {
    const { container } = render(NavItem, {
      props: { title: "Online", swatch: { tone: "success" } }
    });
    const dot = container.querySelector<HTMLElement>(".st-statusDot__dot");
    expect(dot).toBeTruthy();
    expect(dot?.classList.contains("st-statusDot__dot--success")).toBe(true);
    // No ColorSwatch when there is no arbitrary color.
    expect(container.querySelector(".st-colorSwatch__chip")).toBeNull();
  });

  it("renders a count as a circle Badge with an explicit aria-label", () => {
    const { container } = render(NavItem, { props: { title: "Alerts", count: 12 } });
    const badge = container.querySelector<HTMLElement>(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains("st-badge--circle")).toBe(true);
    expect(badge?.classList.contains("st-badge--sm")).toBe(true);
    expect(badge?.textContent?.trim()).toBe("12");
    // Count is ambiguous to SR → aria-label "N title".
    expect(badge?.getAttribute("aria-label")).toBe("12 Alerts");
  });

  it("renders count 0 (does not drop a falsy-but-present count)", () => {
    const { container } = render(NavItem, { props: { title: "Empty", count: 0 } });
    const badge = container.querySelector<HTMLElement>(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe("0");
  });

  it("does not render a badge when count is undefined", () => {
    const { container } = render(NavItem, { props: { title: "No count" } });
    expect(container.querySelector(".st-badge")).toBeNull();
  });

  it("applies the depth modifier class and scale (default 0)", () => {
    const { container: d0 } = render(NavItem, { props: { title: "Root" } });
    expect(root(d0)?.classList.contains("st-navItem--depth0")).toBe(true);

    for (const depth of [0, 1, 2, 3] as const) {
      const { container } = render(NavItem, { props: { title: "X", depth } });
      expect(root(container)?.classList.contains(`st-navItem--depth${depth}`)).toBe(true);
    }
  });

  it("clamps an out-of-range depth into the [0..3] modifier set", () => {
    const { container } = render(NavItem, {
      props: { title: "X", depth: 9 as unknown as 0 }
    });
    expect(root(container)?.classList.contains("st-navItem--depth3")).toBe(true);
  });

  it("applies the semantic status modifier (error is a real state, not decoration)", () => {
    const { container } = render(NavItem, {
      props: { title: "HTTP 403", status: "error" }
    });
    expect(root(container)?.classList.contains("st-navItem--status-error")).toBe(true);
    // The badge tone follows the row status.
    const { container: counted } = render(NavItem, {
      props: { title: "HTTP 403", status: "error", count: 3 }
    });
    expect(
      counted.querySelector(".st-badge")?.classList.contains("st-badge--error")
    ).toBe(true);
  });

  it("does not add a status modifier for the neutral default", () => {
    const { container } = render(NavItem, { props: { title: "Plain" } });
    expect(root(container)?.className).not.toContain("st-navItem--status-");
  });

  it("renders an optional divider after the row, hidden from SR", () => {
    const { container: on } = render(NavItem, {
      props: { title: "X", divider: true }
    });
    const hr = on.querySelector<HTMLElement>(".st-navItem__divider");
    expect(hr).toBeTruthy();
    expect(hr?.getAttribute("aria-hidden")).toBe("true");

    const { container: off } = render(NavItem, { props: { title: "X" } });
    expect(off.querySelector(".st-navItem__divider")).toBeNull();
  });

  it("forwards selection to SelectableRow (selected → selected class + aria-pressed)", () => {
    const { container } = render(NavItem, {
      props: { title: "Selected", selected: true }
    });
    const r = row(container);
    expect(r?.className).toContain("st-selectableRow--selected");
    expect(r?.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles selection on click (standalone)", async () => {
    const { container } = render(NavItem, { props: { title: "Toggle" } });
    const r = row(container) as HTMLElement;
    expect(r.getAttribute("aria-pressed")).toBe("false");
    await fireEvent.click(r);
    expect(r.getAttribute("aria-pressed")).toBe("true");
  });

  it("disabled exposes aria-disabled and does not toggle", async () => {
    const { container } = render(NavItem, {
      props: { title: "Off", disabled: true }
    });
    const r = row(container) as HTMLElement;
    expect(r.getAttribute("aria-disabled")).toBe("true");
    await fireEvent.click(r);
    expect(r.getAttribute("aria-pressed")).toBe("false");
  });

  it("forwards value as data-value on the row", () => {
    const { container } = render(NavItem, {
      props: { title: "Keyed", value: "entities" }
    });
    expect(row(container)?.getAttribute("data-value")).toBe("entities");
  });

  it("merges a consumer class onto the wrapper", () => {
    const { container } = render(NavItem, {
      props: { title: "X", class: "x-extra" }
    });
    expect(root(container)?.classList.contains("x-extra")).toBe(true);
  });
});
