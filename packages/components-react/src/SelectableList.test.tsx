import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SelectableList } from "./SelectableList.js";
import { SelectableRow } from "./SelectableRow.js";

afterEach(cleanup);

function Rows() {
  return (
    <>
      <SelectableRow value="a">Alpha</SelectableRow>
      <SelectableRow value="b">Beta</SelectableRow>
      <SelectableRow value="c">Gamma</SelectableRow>
    </>
  );
}

describe("SelectableList", () => {
  it("renders a listbox with its option rows", () => {
    render(
      <SelectableList label="Items">
        <Rows />
      </SelectableList>,
    );
    expect(screen.getByRole("listbox", { name: "Items" })).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("rows are option (role forced) and aria-multiselectable reflects multiple", () => {
    const { rerender } = render(
      <SelectableList label="Items">
        <Rows />
      </SelectableList>,
    );
    expect(
      screen.getByRole("listbox").getAttribute("aria-multiselectable"),
    ).toBeNull();
    rerender(
      <SelectableList label="Items" multiple>
        <Rows />
      </SelectableList>,
    );
    expect(
      screen.getByRole("listbox").getAttribute("aria-multiselectable"),
    ).toBe("true");
  });

  it("roving tabindex: first row tabbable, rest -1", () => {
    render(
      <SelectableList label="Items">
        <Rows />
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    expect(opts[0].getAttribute("tabindex")).toBe("0");
    expect(opts[1].getAttribute("tabindex")).toBe("-1");
    expect(opts[2].getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowDown moves the roving tab stop and focus", () => {
    render(
      <SelectableList label="Items">
        <Rows />
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    opts[0].focus();
    fireEvent.keyDown(opts[0], { key: "ArrowDown" });
    expect(opts[1].getAttribute("tabindex")).toBe("0");
    expect(opts[0].getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(opts[1]);
  });

  it("Home / End jump to the first / last row (no wrap)", () => {
    render(
      <SelectableList label="Items">
        <Rows />
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    opts[0].focus();
    fireEvent.keyDown(opts[0], { key: "End" });
    expect(opts[2].getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(opts[2]);
    fireEvent.keyDown(opts[2], { key: "Home" });
    expect(opts[0].getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(opts[0]);
  });

  it("ArrowUp at the top stays put (clamped, no wrap)", () => {
    render(
      <SelectableList label="Items">
        <Rows />
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    opts[0].focus();
    fireEvent.keyDown(opts[0], { key: "ArrowUp" });
    expect(opts[0].getAttribute("tabindex")).toBe("0");
    expect(document.activeElement).toBe(opts[0]);
  });

  it("Space toggles selection (single-select) and fires onChange", () => {
    const onChange = vi.fn();
    render(
      <SelectableList label="Items" onChange={onChange}>
        <Rows />
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    fireEvent.keyDown(opts[1], { key: " " });
    expect(onChange).toHaveBeenLastCalledWith("b");
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
    // Single-select: selecting another deselects the first.
    fireEvent.keyDown(opts[2], { key: " " });
    expect(onChange).toHaveBeenLastCalledWith("c");
    expect(opts[1].getAttribute("aria-selected")).toBe("false");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
  });

  it("Enter activates the row too", () => {
    const onChange = vi.fn();
    render(
      <SelectableList label="Items" onChange={onChange}>
        <Rows />
      </SelectableList>,
    );
    fireEvent.keyDown(screen.getAllByRole("option")[0], { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("single-select toggles off when re-activating the selected row", () => {
    const onChange = vi.fn();
    render(
      <SelectableList label="Items" onChange={onChange}>
        <Rows />
      </SelectableList>,
    );
    const opt = screen.getAllByRole("option")[0];
    fireEvent.click(opt);
    expect(onChange).toHaveBeenLastCalledWith("a");
    fireEvent.click(opt);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("multiple allows several selected and emits an array", () => {
    const onChange = vi.fn();
    render(
      <SelectableList label="Items" multiple onChange={onChange}>
        <Rows />
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    fireEvent.click(opts[0]);
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
    fireEvent.click(opts[2]);
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
    // Toggling one off keeps the other.
    fireEvent.click(opts[0]);
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
  });

  it("controlled value drives the selected row", () => {
    function Controlled() {
      const [value, setValue] = React.useState<string | null>("b");
      return (
        <SelectableList
          label="Items"
          value={value}
          onChange={(v) => setValue(v as string | null)}
        >
          <Rows />
        </SelectableList>
      );
    }
    render(<Controlled />);
    const opts = screen.getAllByRole("option");
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.click(opts[0]);
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
    expect(opts[1].getAttribute("aria-selected")).toBe("false");
  });

  it("a disabled row is skipped from the registry (not a tab stop)", () => {
    render(
      <SelectableList label="Items">
        <SelectableRow value="a" disabled>
          Alpha
        </SelectableRow>
        <SelectableRow value="b">Beta</SelectableRow>
      </SelectableList>,
    );
    const opts = screen.getAllByRole("option");
    // The disabled row is always tabindex -1; the first ENABLED row is the stop.
    expect(opts[0].getAttribute("tabindex")).toBe("-1");
    expect(opts[1].getAttribute("tabindex")).toBe("0");
  });
});
