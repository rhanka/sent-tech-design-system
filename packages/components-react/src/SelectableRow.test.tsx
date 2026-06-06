import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SelectableRow } from "./SelectableRow.js";

afterEach(cleanup);

describe("SelectableRow", () => {
  it("renders with role=button and the row class (standalone default)", () => {
    const { container } = render(<SelectableRow>Documents</SelectableRow>);
    const row = screen.getByRole("button");
    expect(row).toBeTruthy();
    expect(row.className).toContain("st-selectableRow");
    expect(container.textContent).toContain("Documents");
  });

  it("selected applies aria-pressed=true and the selected class (standalone button role)", () => {
    render(<SelectableRow selected>Documents</SelectableRow>);
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(row.className).toContain("st-selectableRow--selected");
  });

  it("is not selected by default (aria-pressed=false, no selected class)", () => {
    render(<SelectableRow>Documents</SelectableRow>);
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("false");
    expect(row.className).not.toContain("st-selectableRow--selected");
  });

  it("click calls onSelect with the toggled state (controlled)", () => {
    const onSelect = vi.fn();
    render(<SelectableRow onSelect={onSelect}>Documents</SelectableRow>);
    const row = screen.getByRole("button");
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("click on a selected row calls onSelect(false)", () => {
    const onSelect = vi.fn();
    render(
      <SelectableRow selected onSelect={onSelect}>
        Documents
      </SelectableRow>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenLastCalledWith(false);
  });

  it("reflects controlled selected updates and stays in sync with onSelect", () => {
    function Controlled() {
      const [selected, setSelected] = React.useState(false);
      return (
        <SelectableRow selected={selected} onSelect={setSelected}>
          Documents
        </SelectableRow>
      );
    }
    render(<Controlled />);
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(row);
    expect(row.getAttribute("aria-pressed")).toBe("true");
    expect(row.className).toContain("st-selectableRow--selected");
    fireEvent.click(row);
    expect(row.getAttribute("aria-pressed")).toBe("false");
  });

  it("Enter key selects (calls onSelect)", () => {
    const onSelect = vi.fn();
    render(<SelectableRow onSelect={onSelect}>Documents</SelectableRow>);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("Space key selects (calls onSelect)", () => {
    const onSelect = vi.fn();
    render(<SelectableRow onSelect={onSelect}>Documents</SelectableRow>);
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenLastCalledWith(true);
  });

  it("disabled does not emit onSelect on click or key, and exposes aria-disabled", () => {
    const onSelect = vi.fn();
    render(
      <SelectableRow disabled onSelect={onSelect}>
        Documents
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(row.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(row);
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is focusable (tabindex 0) when not disabled", () => {
    render(<SelectableRow>Documents</SelectableRow>);
    expect(screen.getByRole("button").getAttribute("tabindex")).toBe("0");
  });

  it("exposes value as data-value", () => {
    render(<SelectableRow value="docs">Documents</SelectableRow>);
    expect(screen.getByRole("button").getAttribute("data-value")).toBe("docs");
  });

  it("renders leading and trailing content", () => {
    const { container } = render(
      <SelectableRow
        leading={<span data-testid="lead">L</span>}
        trailing={<span data-testid="trail">T</span>}
      >
        Documents
      </SelectableRow>,
    );
    expect(container.querySelector(".st-selectableRow__leading")).toBeTruthy();
    expect(container.querySelector(".st-selectableRow__trailing")).toBeTruthy();
    expect(screen.getByTestId("lead")).toBeTruthy();
    expect(screen.getByTestId("trail")).toBeTruthy();
  });

  // Two-signal default: tinted surface + accented text, NO accent bar class.
  it("does not add the accentBar class by default", () => {
    render(<SelectableRow selected>Documents</SelectableRow>);
    expect(screen.getByRole("button").className).not.toContain(
      "st-selectableRow--accentBar",
    );
  });

  it("accentBar opt-in adds the accentBar modifier class", () => {
    render(
      <SelectableRow accentBar selected>
        Documents
      </SelectableRow>,
    );
    expect(screen.getByRole("button").className).toContain(
      "st-selectableRow--accentBar",
    );
  });

  it("standalone role defaults to button (aria-pressed) but can be overridden to option (aria-selected)", () => {
    const { rerender } = render(<SelectableRow>Documents</SelectableRow>);
    expect(screen.getByRole("button")).toBeTruthy();
    rerender(<SelectableRow role="option">Documents</SelectableRow>);
    const row = screen.getByRole("option");
    expect(row).toBeTruthy();
    // aria-selected is only emitted for the option role.
    expect(row.getAttribute("aria-selected")).toBe("false");
    // aria-pressed is not emitted for option role.
    expect(row.getAttribute("aria-pressed")).toBeNull();
  });

  it("standalone role can be overridden to menuitemradio", () => {
    render(<SelectableRow role="menuitemradio">Documents</SelectableRow>);
    const row = screen.getByRole("menuitemradio");
    expect(row).toBeTruthy();
    // aria-selected is only emitted for the option role.
    expect(row.getAttribute("aria-selected")).toBeNull();
    // aria-pressed is only emitted for the button role.
    expect(row.getAttribute("aria-pressed")).toBeNull();
  });
});
