import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import SelectableListFixture from "./SelectableListFixture.svelte";

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
});
