import { fireEvent, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import SelectableListFixture from "./SelectableListFixture.svelte";
import SelectableRow from "./lib/SelectableRow.svelte";

const items = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" }
];

function rows(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(".st-selectableRow"));
}

describe("SelectableList", () => {
  it("renders a listbox with option children", () => {
    const { container } = render(SelectableListFixture, { props: { items } });
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeTruthy();
    expect(listbox.getAttribute("aria-label")).toBe("Fixture list");
    expect(screen.getAllByRole("option").length).toBe(3);
    // Single-select: no aria-multiselectable.
    expect(listbox.getAttribute("aria-multiselectable")).toBeNull();
    expect(rows(container).length).toBe(3);
  });

  it("sets aria-multiselectable when multiple", () => {
    render(SelectableListFixture, { props: { items, multiple: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");
  });

  // --- Roving tabindex -------------------------------------------------------
  it("makes only the first row the initial tab stop (roving tabindex)", () => {
    const { container } = render(SelectableListFixture, { props: { items } });
    const r = rows(container);
    expect(r[0].getAttribute("tabindex")).toBe("0");
    expect(r[1].getAttribute("tabindex")).toBe("-1");
    expect(r[2].getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowDown moves the roving tab stop and focus to the next row", async () => {
    const { container } = render(SelectableListFixture, { props: { items } });
    const r = rows(container);
    r[0].focus();
    await fireEvent.keyDown(r[0], { key: "ArrowDown" });
    expect(r[1].getAttribute("tabindex")).toBe("0");
    expect(r[0].getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(r[1]);
  });

  it("ArrowUp moves to the previous row (clamped at the top)", async () => {
    const { container } = render(SelectableListFixture, { props: { items } });
    const r = rows(container);
    r[1].focus();
    await fireEvent.keyDown(r[1], { key: "ArrowUp" });
    expect(document.activeElement).toBe(r[0]);
    // Clamp: ArrowUp at the top stays put.
    await fireEvent.keyDown(r[0], { key: "ArrowUp" });
    expect(document.activeElement).toBe(r[0]);
  });

  it("Home and End jump to the first/last row", async () => {
    const { container } = render(SelectableListFixture, { props: { items } });
    const r = rows(container);
    r[0].focus();
    await fireEvent.keyDown(r[0], { key: "End" });
    expect(document.activeElement).toBe(r[2]);
    await fireEvent.keyDown(r[2], { key: "Home" });
    expect(document.activeElement).toBe(r[0]);
  });

  // --- Selection (single, uncontrolled) -------------------------------------
  it("Space toggles selection (single-select, uncontrolled) and emits the value", async () => {
    const onchange = vi.fn();
    const { container } = render(SelectableListFixture, { props: { items, onchange } });
    const r = rows(container);
    await fireEvent.keyDown(r[0], { key: " " });
    expect(onchange).toHaveBeenLastCalledWith("a");
    expect(r[0].getAttribute("aria-selected")).toBe("true");
    // Selecting another row replaces the selection in single mode.
    await fireEvent.click(r[1]);
    expect(onchange).toHaveBeenLastCalledWith("b");
    expect(r[0].getAttribute("aria-selected")).toBe("false");
    expect(r[1].getAttribute("aria-selected")).toBe("true");
  });

  it("Enter selects (single-select)", async () => {
    const onchange = vi.fn();
    const { container } = render(SelectableListFixture, { props: { items, onchange } });
    const r = rows(container);
    await fireEvent.keyDown(r[2], { key: "Enter" });
    expect(onchange).toHaveBeenLastCalledWith("c");
    expect(r[2].getAttribute("aria-selected")).toBe("true");
  });

  it("re-activating the selected row toggles it off (single-select)", async () => {
    const onchange = vi.fn();
    const { container } = render(SelectableListFixture, { props: { items, onchange } });
    const r = rows(container);
    await fireEvent.click(r[0]);
    expect(onchange).toHaveBeenLastCalledWith("a");
    await fireEvent.click(r[0]);
    expect(onchange).toHaveBeenLastCalledWith(null);
    expect(r[0].getAttribute("aria-selected")).toBe("false");
  });

  // --- Selection (multiple) --------------------------------------------------
  it("multiple mode toggles rows independently and emits an array", async () => {
    const onchange = vi.fn();
    const { container } = render(SelectableListFixture, {
      props: { items, multiple: true, onchange }
    });
    const r = rows(container);
    await fireEvent.click(r[0]);
    expect(onchange).toHaveBeenLastCalledWith(["a"]);
    await fireEvent.click(r[2]);
    expect(onchange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(r[0].getAttribute("aria-selected")).toBe("true");
    expect(r[2].getAttribute("aria-selected")).toBe("true");
    // Toggle the first back off.
    await fireEvent.click(r[0]);
    expect(onchange).toHaveBeenLastCalledWith(["c"]);
    expect(r[0].getAttribute("aria-selected")).toBe("false");
  });

  // --- Controlled value ------------------------------------------------------
  it("respects a controlled single value (string) and reflects it as selected", () => {
    const { container } = render(SelectableListFixture, {
      props: { items, value: "b" }
    });
    const r = rows(container);
    expect(r[0].getAttribute("aria-selected")).toBe("false");
    expect(r[1].getAttribute("aria-selected")).toBe("true");
  });

  it("respects a controlled multiple value (array)", () => {
    const { container } = render(SelectableListFixture, {
      props: { items, multiple: true, value: ["a", "c"] }
    });
    const r = rows(container);
    expect(r[0].getAttribute("aria-selected")).toBe("true");
    expect(r[1].getAttribute("aria-selected")).toBe("false");
    expect(r[2].getAttribute("aria-selected")).toBe("true");
  });

  it("controlled list still emits onchange but does not self-update without a new value", async () => {
    const onchange = vi.fn();
    const { container } = render(SelectableListFixture, {
      props: { items, value: "a", onchange }
    });
    const r = rows(container);
    await fireEvent.click(r[1]);
    // Emits the intended next value...
    expect(onchange).toHaveBeenLastCalledWith("b");
    // ...but the selection is owned by the (unchanged) prop → still "a".
    expect(r[0].getAttribute("aria-selected")).toBe("true");
    expect(r[1].getAttribute("aria-selected")).toBe("false");
  });

  // --- Disabled rows ---------------------------------------------------------
  it("disabled rows are not focusable (tabindex -1) and do not select", async () => {
    const onchange = vi.fn();
    const withDisabled = [
      { value: "a", label: "Alpha", disabled: true },
      { value: "b", label: "Beta" },
      { value: "c", label: "Gamma" }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withDisabled, onchange }
    });
    const r = rows(container);
    // The disabled first row is not a tab stop; the next enabled row is.
    expect(r[0].getAttribute("tabindex")).toBe("-1");
    expect(r[0].getAttribute("aria-disabled")).toBe("true");
    await fireEvent.click(r[0]);
    expect(onchange).not.toHaveBeenCalled();
    expect(r[0].getAttribute("aria-selected")).toBe("false");
  });

  it("a disabled row does not register as a navigation/tab stop target", () => {
    const withDisabled = [
      { value: "a", label: "Alpha", disabled: true },
      { value: "b", label: "Beta" }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withDisabled }
    });
    const r = rows(container);
    // First enabled row (b) is the default roving stop.
    expect(r[1].getAttribute("tabindex")).toBe("0");
  });

  // --- Arrow navigation skips disabled rows (a11y fix) -----------------------
  it("ArrowDown skips a disabled row and lands on the next enabled row", async () => {
    // Layout: Alpha(enabled) → Beta(disabled) → Gamma(enabled)
    const withMidDisabled = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta", disabled: true },
      { value: "c", label: "Gamma" }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withMidDisabled }
    });
    const r = rows(container);
    r[0].focus();
    await fireEvent.keyDown(r[0], { key: "ArrowDown" });
    // Beta is disabled; focus should land on Gamma (index 2).
    expect(document.activeElement).toBe(r[2]);
  });

  it("ArrowUp skips a disabled row and lands on the previous enabled row", async () => {
    const withMidDisabled = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta", disabled: true },
      { value: "c", label: "Gamma" }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withMidDisabled }
    });
    const r = rows(container);
    r[2].focus();
    await fireEvent.keyDown(r[2], { key: "ArrowUp" });
    // Beta is disabled; focus should land on Alpha (index 0).
    expect(document.activeElement).toBe(r[0]);
  });

  it("Home skips leading disabled rows and goes to first enabled row", async () => {
    const withLeadingDisabled = [
      { value: "a", label: "Alpha", disabled: true },
      { value: "b", label: "Beta" },
      { value: "c", label: "Gamma" }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withLeadingDisabled }
    });
    const r = rows(container);
    r[2].focus();
    await fireEvent.keyDown(r[2], { key: "Home" });
    // Alpha is disabled; Home should land on Beta (index 1).
    expect(document.activeElement).toBe(r[1]);
  });

  it("End skips trailing disabled rows and goes to last enabled row", async () => {
    const withTrailingDisabled = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
      { value: "c", label: "Gamma", disabled: true }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withTrailingDisabled }
    });
    const r = rows(container);
    r[0].focus();
    await fireEvent.keyDown(r[0], { key: "End" });
    // Gamma is disabled; End should land on Beta (index 1).
    expect(document.activeElement).toBe(r[1]);
  });

  it("ArrowDown stays put when all following rows are disabled", async () => {
    const withTailDisabled = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta", disabled: true }
    ];
    const { container } = render(SelectableListFixture, {
      props: { items: withTailDisabled }
    });
    const r = rows(container);
    r[0].focus();
    await fireEvent.keyDown(r[0], { key: "ArrowDown" });
    // No enabled row after Alpha; focus must stay on Alpha.
    expect(document.activeElement).toBe(r[0]);
  });
});

describe("SelectableList — focus transfer quand une row devient disabled", () => {
  it("a11y invariant: le focus est transféré vers la prochaine row enabled si la row focusée devient disabled", async () => {
    const initialItems = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
      { value: "c", label: "Gamma" }
    ];
    const { container, rerender } = render(SelectableListFixture, {
      props: { items: initialItems }
    });
    const rBefore = rows(container);
    // Focus sur la première row (Alpha).
    rBefore[0].focus();
    expect(document.activeElement).toBe(rBefore[0]);
    // Rendre Alpha disabled → le focus doit être transféré vers Beta (prochaine enabled).
    await rerender({ items: [
      { value: "a", label: "Alpha", disabled: true },
      { value: "b", label: "Beta" },
      { value: "c", label: "Gamma" }
    ]});
    // tick() force le flush des $effect Svelte 5 après le rerender.
    await tick();
    // Capturer les rows APRÈS rerender (les nœuds DOM peuvent avoir été recréés).
    const rAfter = rows(container);
    // Invariant : le focus est sur Beta (prochaine row enabled, index 1).
    expect(document.activeElement).toBe(rAfter[1]);
  });
});

describe("SelectableRow standalone", () => {
  it("a11y invariant: role par défaut est 'button' (pas 'option') hors listbox", () => {
    const { container } = render(SelectableRow, { props: {} });
    const row = container.querySelector(".st-selectableRow") as HTMLElement;
    expect(row.getAttribute("role")).toBe("button");
  });

  it("a11y invariant: role='option' explicite est respecté si passé", () => {
    const { container } = render(SelectableRow, { props: { role: "option" } });
    const row = container.querySelector(".st-selectableRow") as HTMLElement;
    expect(row.getAttribute("role")).toBe("option");
  });

  it("a11y invariant: aria-selected n'est pas exposé en mode 'button' (invalide sur button)", () => {
    const { container } = render(SelectableRow, { props: {} });
    const row = container.querySelector(".st-selectableRow") as HTMLElement;
    // aria-selected n'a de sens que sur option/gridcell/row/treeitem.
    expect(row.getAttribute("aria-selected")).toBeNull();
  });

  it("a11y invariant: role='option' dans une liste → aria-selected exposé", () => {
    const items = [{ value: "x", label: "X" }];
    const { container } = render(SelectableListFixture, { props: { items } });
    const row = container.querySelector(".st-selectableRow") as HTMLElement;
    // Dans une SelectableList, le role est forcé à "option".
    expect(row.getAttribute("role")).toBe("option");
    expect(row.getAttribute("aria-selected")).not.toBeNull();
  });
});
